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
  for(const file of ['/maps/moria/','/src/submap.mjs?v=moria-3','/src/submap-camera.mjs?v=moria-3','/src/submap.css?v=moria-3','/'+plate.d+'?v=moria-3']) assert.ok(worker.includes(JSON.stringify(file)),file);
});

test('the Moria reading page offers a direct link to the regional map', async () => {
  const {buildOutputs}=await import('./generate-content.mjs');
  assert.ok(buildOutputs().get('places/moria/index.html').includes('href="/maps/moria/"'));
});

test('history restores the viewed place, centre and zoom after visiting another hall', async () => {
  const {captureView,restoreView,fitCamera,zoomCamera,panCamera}=await import('../src/submap-camera.mjs');
  const camera=panCamera(zoomCamera(fitCamera(900,600),3,650,300,900,600),-100,-80,900,600);
  const saved=captureView(camera,{width:900,height:600},'mazarbul');
  assert.equal(saved.place,'mazarbul');
  const restored=restoreView(saved,900,600);
  for(const key of ["x","y","scale"]) assert.ok(Math.abs(restored[key]-camera[key])<1e-9);
  const phone=restoreView(saved,390,500);
  assert.ok(Math.abs(phone.scale/fitCamera(390,500).scale-3)<1e-9);
  assert.equal(restoreView({zoom:NaN},900,600),null);
});

test('map names stay within the viewport and do not cover each other or neighbouring pins', async () => {
  const {layoutLabels}=await import('../src/submap-camera.mjs');
  const points=[{id:'gate',x:15,y:100,width:100,height:20},{id:'hall',x:200,y:200,width:100,height:20},{id:'bridge',x:238,y:206,width:95,height:20},{id:'east',x:382,y:130,width:70,height:20}];
  const labels=layoutLabels(points,390,300,'bridge');
  assert.ok(labels.find(l=>l.id==='bridge'));
  const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  for(const a of labels){
    assert.ok(a.x>=4&&a.y>=4&&a.x+a.width<=386&&a.y+a.height<=296);
    for(const b of labels)if(a!==b)assert.ok(!overlaps(a,b),a.id+' / '+b.id);
    for(const p of points)assert.ok(!overlaps(a,{x:p.x-13,y:p.y-13,width:26,height:26}),a.id+' covers '+p.id);
  }
});

test('a zoom command cancels an in-progress drag before changing the camera', async () => {
  const source=readFileSync(new URL('../src/submap.mjs',import.meta.url),'utf8');
  const {fitCamera,zoomCamera}=await import('../src/submap-camera.mjs');
  const calls=[];
  const c=vm.createContext({size:{width:900,height:600},camera:fitCamera(900,600),zoomCamera,
    resetGesture(){calls.push('cancel');},saveHistory(){calls.push('save');},paint(){calls.push('paint');}});
  vm.runInContext(source.slice(source.indexOf('function zoom('),source.indexOf("document.querySelector('#zoom-in').onclick")),c);
  c.zoom(2);
  assert.deepEqual(calls,['cancel','save','paint']);
  assert.equal(c.camera.scale,1.2);
});

test('new Moria pages cannot pair new markup with the previous cached viewer or artwork', () => {
  const html=readFileSync(new URL('../maps/moria/index.html',import.meta.url),'utf8');
  for(const asset of ['submap.css','submap.mjs','moria-section.svg'])assert.ok(html.includes(asset+'?v='),asset);
  const source=readFileSync(new URL('../src/submap.mjs',import.meta.url),'utf8');
  assert.match(source,/submap-camera\.mjs\?v=/);
});

test('bridge label can sit below its marker to leave the Balrog vignette visible', async () => {
  const {layoutLabels}=await import('../src/submap-camera.mjs');
  const [label]=layoutLabels([{id:'bridge',x:250,y:250,width:100,height:23,side:'below'}],500,500,'bridge');
  assert.ok(label.y>250,'Place the label below the encounter, not over the figures');
});
