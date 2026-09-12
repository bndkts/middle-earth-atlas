import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function setup(){
  const listeners={},bodyListeners={},grabListeners={};let captures=0;
  const style={setProperty(key,value){this[key]=value;}};
  const sheet={style,classList:{add(){},remove(){}},getBoundingClientRect:()=>({top:400})};
  const body={scrollTop:175,addEventListener:(key,fn)=>bodyListeners[key]=fn,setPointerCapture:()=>captures++};
  const grab={addEventListener:(key,fn)=>grabListeners[key]=fn,setPointerCapture:()=>captures++};
  const context={sheet,body,viewport:{height:800},isDesktop:()=>false,window:{addEventListener:(key,fn)=>listeners[key]=fn},document:{documentElement:{style:{setProperty(){}}}},$:()=>grab,performance:{now:()=>1}};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("let sheetState = 'peek';"),source.indexOf('function mode(id){')),context);
  return {context,sheet,body,listeners,bodyListeners,captures:()=>captures,run:code=>vm.runInContext(code,context)};
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
