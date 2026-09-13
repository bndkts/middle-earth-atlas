import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function setup(){
  const listeners={},bodyListeners={},grabListeners={},frames=new Map();let captures=0,reads=0,writes=0,id=0;
  const style={setProperty(key,value){writes++;this[key]=value;}};
  const sheet={style,classList:{add(){},remove(){}},getBoundingClientRect:()=>{reads++;return {top:400};}};
  const body={scrollTop:175,addEventListener:(key,fn)=>bodyListeners[key]=fn,setPointerCapture:()=>captures++};
  const grab={addEventListener:(key,fn)=>grabListeners[key]=fn,setPointerCapture:()=>captures++};
  const classes=new Set(),mapEl={classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n)}};
  const context={sheet,body,mapEl,snapReady:true,gesturing:false,rastering:false,drawSnap(){},viewport:{height:800},isDesktop:()=>false,window:{addEventListener:(key,fn)=>listeners[key]=fn},document:{documentElement:{style:{setProperty(){}}}},$:()=>grab,performance:{now:()=>1},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("let sheetState = 'peek';"),source.indexOf('function mode(id){')),context);
  return {context,sheet,body,listeners,bodyListeners,grabListeners,frames,reads:()=>reads,writes:()=>writes,frame:()=>{const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn());},captures:()=>captures,run:code=>vm.runInContext(code,context)};
}
test('sheet offset follows its snap position and resize retains reading position',()=>{
  const h=setup();h.run("setSheet('half')");
  assert.equal(h.sheet.style['--sheet-offset'],'400px');
  h.body.scrollTop=175;h.context.viewport.height=600;h.listeners.resize();
  assert.equal(h.sheet.style['--sheet-offset'],'300px');assert.equal(h.body.scrollTop,175);
  h.run("setSheet('full')");assert.equal(h.sheet.style['--sheet-offset'],'56px');
});
test('expanded sheet content leaves pointer scrolling to the browser',()=>{
  const h=setup();const event={clientY:500,pointerId:1,target:{closest:()=>null}};
  for(const state of ['half','full']){h.run(`setSheet('${state}')`);h.bodyListeners.pointerdown(event);assert.equal(h.captures(),0);}
  h.run("setSheet('peek')");h.bodyListeners.pointerdown(event);assert.ok(h.captures()>0);
});
test('sheet movement batches transforms without resizing content or reading layout on release',()=>{
  const h=setup();h.run("setSheet('half')");
  h.grabListeners.pointerdown({clientY:410,pointerId:1});
  const reads=h.reads(),writes=h.writes(),transform=h.sheet.style.transform;
  h.grabListeners.pointermove({clientY:310,pointerId:1});
  h.grabListeners.pointermove({clientY:210,pointerId:1});
  assert.equal(h.sheet.style.transform,transform,'movement waits for the animation frame');
  assert.equal(h.frames.size,1);
  h.frame();assert.equal(h.sheet.style.transform,'translateY(200px)');
  assert.equal(h.writes(),writes,'content height stays fixed throughout dragging');
  h.grabListeners.pointermove({clientY:110,pointerId:1});
  h.grabListeners.pointerup({pointerId:1,type:'pointerup'});
  assert.equal(h.frames.size,0,'release cancels pending movement');
  assert.equal(h.reads(),reads,'snap uses the latest input, without a forced layout');
  assert.equal(h.sheet.style['--sheet-offset'],'64px');
});
test('unrelated fingers and cancelled sheet drags cannot fling or leave pending frames',()=>{
  const h=setup();h.run("setSheet('half')");
  h.grabListeners.pointerdown({clientY:410,pointerId:1});
  h.grabListeners.pointermove({clientY:710,pointerId:2});
  assert.equal(h.frames.size,0);
  h.grabListeners.pointermove({clientY:400,pointerId:1});
  h.grabListeners.pointercancel({pointerId:1,type:'pointercancel'});
  assert.equal(h.frames.size,0);
  assert.equal(h.sheet.style['--sheet-offset'],'400px','cancellation ignores flick velocity');
});
test('resize cancels a queued drag and keeps the reading position',()=>{
  const h=setup();h.run("setSheet('half')");h.body.scrollTop=175;
  h.grabListeners.pointerdown({clientY:410,pointerId:1});
  h.grabListeners.pointermove({clientY:110,pointerId:1});
  h.context.viewport.height=600;h.listeners.resize();h.frame();
  assert.equal(h.sheet.style.transform,'translateY(300px)');
  assert.equal(h.body.scrollTop,175);
  assert.equal(h.frames.size,0);
});
test('sheet drags reuse the ready map preview and release it on cancellation',()=>{
  const h=setup();h.grabListeners.pointerdown({clientY:410,pointerId:1});
  assert.ok(h.context.mapEl.classList.contains('sheet-preview'));
  h.grabListeners.pointercancel({pointerId:1,type:'pointercancel'});
  assert.ok(!h.context.mapEl.classList.contains('sheet-preview'));
  h.context.snapReady=false;h.grabListeners.pointerdown({clientY:410,pointerId:2});
  assert.ok(!h.context.mapEl.classList.contains('sheet-preview'),'unavailable previews never hide the map');
});
test('collapsing the sheet restores its title preview',()=>{
  const h=setup();h.run("setSheet('full')");h.body.scrollTop=175;
  h.grabListeners.pointerdown({clientY:410,pointerId:1});
  h.grabListeners.pointermove({clientY:710,pointerId:1});
  h.grabListeners.pointerup({pointerId:1,type:'pointerup'});
  assert.equal(h.body.scrollTop,0);
});
