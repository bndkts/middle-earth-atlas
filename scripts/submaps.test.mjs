import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
function selectHarness(overrides = {}) {
  const calls = [];
  const c = vm.createContext({activeChapter:null, reading:{guard:false}, restoringURL:false,
    clearTimeout(){}, qTimer:null, dirPick:null, selected:null, MK:[],
    saveView(){calls.push('saved');}, location:{assign(url){calls.push(url);}},
    ringEl:{classList:{add(){}}}, renderPlace(){calls.push('place');}, mode(){},
    syncURL(){}, focusPanel(){}, sheetState:'half', lodPass(){},
    setDirSlot(slot,p){calls.push([slot,p.id]);}, ...overrides});
  vm.runInContext(app.slice(app.indexOf('function selectPlace('), app.indexOf('function nearby(')), c);
  c.selectPlace({id:'moria'});
  return calls;
}
test('clicking Moria loads its own map after saving the world viewport', () => {
  assert.deepEqual(selectHarness(), ['saved','/maps/moria/']);
});
test('restoring a world-map URL and choosing a directions endpoint do not redirect', () => {
  assert.deepEqual(selectHarness({restoringURL:true}), ['place']);
  assert.deepEqual(selectHarness({dirPick:'to'}), [['to','moria']]);
});

test('submap camera preserves the zoom anchor, bounds pans and handles resize', async () => {
  const { fitCamera, zoomCamera, panCamera } = await import('../src/submap-camera.mjs');
  const fit = fitCamera(900,600);
  assert.equal(fit.scale, .6);
  const zoom = zoomCamera(fit,2,450,300,900,600);
  assert.equal((450-zoom.x)/zoom.scale, (450-fit.x)/fit.scale);
  assert.equal((300-zoom.y)/zoom.scale, (300-fit.y)/fit.scale);
  const edge = panCamera(zoom,10000,-10000,900,600);
  assert.equal(edge.x,0);
  assert.equal(edge.y,600-1000*edge.scale);
  const minimum = zoomCamera(zoom,0.001,450,300,900,600);
  assert.deepEqual(minimum, fit);
  const phone = panCamera(zoom,0,0,390,500);
  assert.ok(phone.x <= 0 && phone.y <= 0);
  assert.ok(Number.isFinite(fitCamera(0,0).scale));
});

test('Moria index remains readable without JavaScript and every landmark is addressable', () => {
  const html=readFileSync(new URL('../maps/moria/index.html',import.meta.url),'utf8');
  const articles=[...html.matchAll(/<article id="([^"]+)" data-x="([^"]+)" data-y="([^"]+)"/g)];
  assert.equal(articles.length,9);
  assert.equal(new Set(articles.map(a=>a[1])).size,9);
  for(const [,id,x,y] of articles){
    assert.ok(+x>0 && +x<100 && +y>0 && +y<100);
    assert.ok(html.includes(`href="#${id}"`));
  }
  assert.ok(html.includes('href="/"'));
  assert.ok(html.includes('connecting passages, architecture and relative scale are reconstructed'));
  assert.ok(!/<article[^>]*\bhidden\b/.test(html));
});

test('the vector plate is self-contained, reproducible and shipped with the submap', async () => {
  const { drawMoria } = await import('./draw-moria.mjs');
  const svg = drawMoria();
  assert.equal(svg,drawMoria());
  assert.ok(svg.includes('viewBox="0 0 1500 1000"'));
  assert.ok(svg.includes('<title'));
  assert.ok(!/<image|<script|<foreignObject|<filter/.test(svg));
  assert.ok(Buffer.byteLength(svg)<600000, 'Keep the vector plate below 600 KB');
  assert.ok(readFileSync(new URL('../Dockerfile',import.meta.url),'utf8').includes('COPY maps /usr/share/nginx/html/maps'));
});

test('production serves both submap ES modules as JavaScript', () => {
  const nginx=readFileSync(new URL('../nginx.conf',import.meta.url),'utf8');
  for(const file of ['submap.mjs','submap-camera.mjs']){
    assert.ok(nginx.includes(`location = /src/${file} {\n    types { application/javascript mjs; }`),file);
  }
});

test('the original SVG has provenance and the offline shell includes its dependencies', () => {
  const c={window:{}};
  vm.runInNewContext(readFileSync(new URL('../src/images.js',import.meta.url),'utf8'),c);
  const plate=c.window.ATLAS_MAP_IMAGES.moria;
  for(const key of ['creator','source','rights','attribution']) assert.ok(plate[key]);
  assert.ok(readFileSync(new URL('../'+plate.d,import.meta.url),'utf8').startsWith('<svg'));
  const worker=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
  for(const file of ['/maps/moria/','/src/submap.mjs','/src/submap-camera.mjs','/src/submap.css','/'+plate.d]) assert.ok(worker.includes(JSON.stringify(file)),file);
});

test('the Moria reading page offers a direct link to the regional map', async () => {
  const {buildOutputs}=await import('./generate-content.mjs');
  assert.ok(buildOutputs().get('places/moria/index.html').includes('href="/maps/moria/"'));
});
