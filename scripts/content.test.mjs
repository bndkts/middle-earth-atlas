import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {buildOutputs, data, config, validatePublication, escapeHTML, root} from './generate-content.mjs';
const outputs = buildOutputs();
const c = {URLSearchParams};
vm.runInNewContext(fs.readFileSync(new URL('../src/url-state.js',import.meta.url),'utf8'),c);
const url = c.ATLAS_URL;

test('published content is readable HTML with consistent canonicals and resolvable local links',()=>{
  const sitemap = outputs.get('sitemap.xml');
  for (const [file,html] of outputs) {
    if (!file.endsWith('.html')) continue;
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`),file);
    for (const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (href.startsWith('#') || /^https?:/.test(href)) continue;
      const target = new URL(href.replaceAll('&amp;','&'),canonical);
      const dest = decodeURIComponent(target.pathname).slice(1)+(target.pathname.endsWith('/')?'index.html':'');
      assert.ok(outputs.has(dest)||fs.existsSync(path.join(root,dest)),`${file} links to missing ${dest}`);
      if (dest==='index.html' && target.search) assert.equal(url.parse(target.search,data).error,null,href);
    }
    for (const [,payload] of html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)) assert.ok(JSON.parse(payload)['@type']);
    if (file!=='index.html') { assert.ok(!html.includes('src/app.js')); assert.ok(!html.includes('<svg')); }
  }
});
test('publication rejects absent IDs and duplicate event identities',()=>{
  assert.throws(()=>validatePublication(data,{...config,places:['missing']}),/Missing places/);
  assert.throws(()=>validatePublication({...data,timeline:[data.timeline[0],data.timeline[0]]}),/Invalid event ID/);
  assert.equal(escapeHTML('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;');
});
test('exports preserve complete records, uncertainty, references and stable event links',()=>{
  for (const [name,records] of [['places',data.places],['journeys',data.journeys],['chapters',data.chapters],['events',data.timeline]]) {
    const payload=JSON.parse(outputs.get(`data/v1/${name}.json`));
    assert.equal(payload.records.length,records.length);
    assert.equal(payload.schemaVersion,1);
    assert.match(payload.revision,/^[a-f0-9]{64}$/);
    for (const [i,r] of payload.records.entries()) {
      assert.equal(r.id,records[i].id);
      assert.equal(url.parse(new URL(r.mapUrl).search,data).error,null,r.id);
      if(name==='events') assert.equal(r.dateUncertain,!!records[i].dateUncertain);
    }
  }
});
test('URL navigation round-trips entities, chapters and years including era boundaries',()=>{
  for (const y of [-9000,-4031,-4030,-3441,-3440,0,1,3021,3022,3141]) {
    const state={place:'rivendell',year:y};
    const parsed=url.parse(url.search(state),data);
    assert.equal(parsed.error,null); assert.equal(parsed.year,y); assert.equal(parsed.place,'rivendell');
  }
  const ev=data.timeline[0];
  assert.equal(url.parse('?event='+ev.id,data).year,ev.absoluteYear);
  assert.equal(url.parse('?journey=fellowship',data).journey,'fellowship');
  assert.equal(url.parse('?chapter=lotr-b1-c01',data).chapter,'lotr-b1-c01');
  assert.equal(url.search({chapter:'lotr-b6-c09'}),'?chapter=lotr-b6-c09');
  assert.equal(url.parse('',data).place,null);
});
test('invalid URL values cannot silently open a wrong entity or fictional date',()=>{
  for (const query of ['?place=missing','?chapter=missing','?place=rivendell&journey=fellowship','?place=rivendell&chapter=lotr-b1-c01','?chapter=lotr-b1-c01&age=TA&year=3018','?place=rivendell&place=moria','?year=3019','?age=TA','?age=TA&year=1.5','?age=TA&year=3022','?age=FA&year=591','?age=foo&year=1','?age=YT&year=1','?age=TA&year=-1']) assert.ok(url.parse(query,data).error,query);
});
test('generation is deterministic and sitemap contains no interactive query variants',()=>{
  assert.deepEqual([...buildOutputs()],[...outputs]);
  for (const [,loc] of outputs.get('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)) assert.equal(new URL(loc).search,'');
});

test('social preview is a real 1200 by 630 PNG referenced by page metadata',()=>{
  const png=fs.readFileSync(path.join(root,'assets/atlas-social.png'));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),1200); assert.equal(png.readUInt32BE(20),630);
  for(const [file,html] of outputs) if(file.endsWith('.html')) assert.ok(html.includes(config.baseUrl+'/assets/atlas-social.png'));
});

test('batched URL updates create a single navigable state and do not write during restoration',()=>{
  const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  const start=app.indexOf('const urlState ='),end=app.indexOf('function focusPanel(',start);
  const jobs=[],entries=[];
  const sandbox={window:{ATLAS_URL:url},queueMicrotask:fn=>jobs.push(fn),location:{pathname:'/',search:''},history:{pushState(_a,_b,target){entries.push(target);sandbox.location.search=new URL(target,'https://example.org').search;},replaceState(){throw Error('Unexpected replacement');}}};
  vm.createContext(sandbox);vm.runInContext(app.slice(start,end),sandbox);
  vm.runInContext("syncURL({place:'rivendell'})",sandbox);
  assert.equal(jobs.length,0,'initial restoration must not write history');
  vm.runInContext("restoringURL=false;syncURL({place:null,year:3019});syncURL({event:'sample-event'});",sandbox);
  jobs.splice(0).forEach(fn=>fn());
  assert.deepEqual(entries,['/?event=sample-event'],'intermediate year must not create extra entries');
});
