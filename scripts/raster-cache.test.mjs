import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
const code=readFileSync(new URL('../src/raster-cache.js',import.meta.url),'utf8');
function harness(){
  const timers=new Map(),idle=new Map(),images=[],canvases=[],blobs=[],urls=new Set(),listeners={};
  let id=0,paused=false;
  const view={s:4,tx:-2500,ty:-3250,width:390,height:844,left:0,dpr:3};
  const layer={appendChild(c){c.attached=true;}};
  const document={hidden:false,addEventListener:(type,fn)=>listeners[type]=fn,
    createElement(){const c={style:{},dataset:{},width:0,height:0,attached:false,
      getContext:()=>({drawImage(){c.drawn=true;}}),remove(){c.attached=false;}};canvases.push(c);return c;},
  };
  const context=vm.createContext({document,performance:{now:()=>0},navigator:{},
    setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),
    requestIdleCallback(fn){idle.set(++id,fn);return id;},cancelIdleCallback:key=>idle.delete(key),
    Image:class{constructor(){images.push(this);}},Blob:class{constructor(parts){this.parts=parts;}},
    URL:{createObjectURL(blob){blobs.push(blob.parts.join(''));const url='blob:'+ ++id;urls.add(url);return url;},revokeObjectURL:url=>urls.delete(url)},
    XMLSerializer:class{serializeToString(){return '<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>';}}
  });
  vm.runInContext(code,context);
  const cache=context.ATLAS_RASTER.create({layer,getView:()=>view,paused:()=>paused,compact:()=>true});
  const run=(queue,arg)=>{const tasks=[...queue.values()];queue.clear();tasks.forEach(fn=>fn(arg));};
  const tick=(time=20)=>{run(timers);run(idle,{timeRemaining:()=>time});};
  const root={querySelectorAll:()=>[]};
  return {cache,context,view,images,canvases,blobs,urls,timers,idle,listeners,document,tick,
    pause(value){paused=value;},start(){cache.setSource(root,.8);tick();},
    complete(){const img=images.at(-1);if(img?.onload) img.onload();tick();}};
}
test('tile planning prioritizes full visible coverage, then a bounded surrounding ring',()=>{
  const h=harness();
  for(const [width,height] of [[390,844],[844,390],[1366,900],[3840,2160]]){
    for(const s of [.3,1,4,9]){
      const view={...h.view,width,height,s,tx:width/2-1100*s,ty:height/2-1100*s};
      const tiles=h.context.ATLAS_RASTER.plan(view,20);
      assert.ok(tiles.length<=20);
      assert.equal(new Set(tiles.map(t=>t.key)).size,tiles.length);
      let ring=false;
      for(const t of tiles){if(!t.visible) ring=true;else assert.equal(ring,false);}
      for(let y=0;y<height;y+=80)for(let x=0;x<width;x+=80){
        const mx=(x-view.tx)/s,my=(y-view.ty)/s;
        if(mx<0||mx>=2600||my<0||my>=2300)continue;
        assert.ok(tiles.some(t=>mx>=t.x&&mx<=t.x+t.span&&my>=t.y&&my<=t.y+t.span),'visible pixels must not be displaced by prefetch');
      }
    }
  }
});
test('idle renderer runs one decode at a time and defers work during gestures or busy frames',()=>{
  const h=harness();h.start();h.pause(true);h.tick();
  assert.equal(h.images.length,0);
  h.pause(false);h.tick(0);assert.equal(h.images.length,0);
  h.tick();assert.equal(h.images.length,1);
  for(let i=0;i<5;i++){h.cache.schedule();h.tick();}
  assert.equal(h.images.length,1);
  h.pause(true);h.complete();assert.equal(h.canvases.length,0,'mid-pinch decode must stay off the canvas');
  h.pause(false);h.tick();assert.equal(h.canvases.filter(c=>c.attached).length,1);
});
test('pan and zoom cache stays within its pixel budget and releases evicted canvases',()=>{
  const h=harness();h.start();h.tick();
  for(let i=0;i<65;i++){
    if(i===25)h.view.tx-=800;
    if(i===45)h.view.s=8;
    h.cache.schedule();h.complete();
    assert.ok(h.canvases.filter(c=>c.attached).length<=20);
    assert.ok(h.canvases.reduce((sum,c)=>sum+c.width*c.height*4,0)<=20*514*514*4);
    assert.ok(h.urls.size<=1);
  }
  assert.ok(h.canvases.some(c=>c.width===0),'eviction must free bitmap memory');
});
test('timeline invalidation discards pending decodes and background tabs stop the queue',()=>{
  const h=harness();h.start();h.tick();
  const stale=h.images[0].onload;
  h.cache.invalidate();stale();h.tick();
  assert.equal(h.canvases.length,0);assert.equal(h.urls.size,0);
  h.start();h.tick();h.document.hidden=true;h.listeners.visibilitychange();
  h.complete();assert.equal(h.canvases.length,0);assert.equal(h.timers.size,0);assert.equal(h.idle.size,0);
  h.document.hidden=false;h.listeners.visibilitychange();h.tick();
  assert.equal(h.canvases.filter(c=>c.attached).length,1);
});
test('a decode from a distant view is dropped and repeated scheduling stays coalesced',()=>{
  const h=harness();h.start();h.tick();h.view.tx=-7000;
  h.complete();assert.equal(h.canvases.length,0);
  for(let i=0;i<20;i++)h.cache.schedule();
  assert.equal(h.timers.size,1);
});

test('tile sources prune distant artwork while preserving layer classes and SVG dimensions',()=>{
  const h=harness();
  const nodes=[{xml:'<path id="near-art"/>',bounds:'500,650,600,600'},
    {xml:'<path id="far-art"/>',bounds:'2000,1800,100,100'}];
  for(const node of nodes){
    node.getAttribute=()=>node.bounds;node.removeAttribute=()=>{};
    node.replaceWith=comment=>node.xml='<!--'+comment.text+'-->';
  }
  const root={querySelectorAll:()=>nodes};
  h.context.document.createComment=text=>({text});
  h.context.XMLSerializer=class {serializeToString(node){return node===root?
    '<svg xmlns="http://www.w3.org/2000/svg" class="roads-off realms-on" width="2100" height="1800" viewBox="0 0 2600 2300">'+nodes.map(n=>n.xml).join('')+'</svg>':node.xml;}};
  h.cache.setSource(root,.8);h.tick();h.tick();
  const svg=h.blobs[0];
  assert.match(svg,/near-art/);assert.doesNotMatch(svg,/far-art/);
  assert.match(svg,/class="roads-off realms-on"/);
  assert.match(svg,/width="514" height="514"/);
  assert.doesNotMatch(svg,/viewBox="0 0 2600 2300"/);
});

test('Retina previews constrained by the memory budget never qualify as a sharp resting map',()=>{
  const h=harness();h.start();h.tick();
  for(let i=0;i<30;i++)h.complete();
  const visible=h.context.ATLAS_RASTER.plan(h.view,20).filter(t=>t.visible);
  assert.ok(visible.every(t=>h.canvases.some(c=>c.attached&&c.dataset.tile===t.key)));
  assert.ok(visible[0].density<h.view.s*h.view.dpr,'fixture must exercise the pixel-budget limit');
  assert.equal(h.cache.isSharp(),false,'complete low-resolution coverage is still only a preview');
});

test('a cache can replace vectors only after full display-resolution coverage is ready',()=>{
  const h=harness();h.view.width=180;h.view.height=250;h.start();h.tick();
  assert.equal(h.cache.isSharp(),false,'overview stretched onto a Retina display is insufficient');
  h.complete();assert.equal(h.cache.isSharp(),false,'partial sharp coverage must not expose blurry gaps');
  for(let i=0;i<25;i++)h.complete();
  assert.equal(h.cache.isSharp(),true,'small Retina views can fit sharp tiles without increasing the budget');
  h.view.tx-=1200;
  assert.equal(h.cache.isSharp(),false,'panning into uncached geography restores vectors immediately');
  h.cache.invalidate();assert.equal(h.cache.isSharp(),false);
});

test('overview sharpness uses the actual device pixel ratio',()=>{
  const h=harness();h.view.s=.4;h.view.dpr=1;h.start();
  assert.equal(h.cache.isSharp(),true);
  h.view.dpr=3;
  assert.equal(h.cache.isSharp(),false,'CSS-resolution checks must not hide Retina detail');
});
