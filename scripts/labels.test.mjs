import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function run(expression){
  const context=vm.createContext({selected:{id:'chosen'}});
  const start=source.indexOf('function markerPriority(');
  assert.ok(start>=0,'A shared marker priority policy is required');
  vm.runInContext(source.slice(start,source.indexOf('function lodPass(',start)),context);
  return vm.runInContext(expression,context);
}
test('selected minor places precede stable major places, even in quick layout',()=>{
  assert.ok(run("markerPriority({p:{id:'chosen',t:'house'},k:4},true) < markerPriority({p:{id:'city',t:'city'},k:1,was:true},true)"));
});
test('settled town labels precede regions at the same detail rank',()=>{
  assert.ok(run("markerPriority({p:{id:'town',t:'town'},k:2},false) < markerPriority({p:{id:'region',t:'region',_area:true},k:2},false)"));
});
test('even major region lettering yields to a selected marker or major city',()=>{
  assert.equal(run('labelYieldsToMarker({major:true,size:40},{k:4,selected:true})'),true);
  assert.equal(run('labelYieldsToMarker({major:true,size:40},{k:1})'),true);
  assert.equal(run('labelYieldsToMarker({major:true,size:40},{k:3})'),false);
  assert.equal(run('labelYieldsToMarker({size:12},{k:2})'),true);
});
test('lettering hidden by a city no longer blocks a distant town in the same layout pass',()=>{
  const classes=()=>{const values=new Set();return {add:n=>values.add(n),remove:n=>values.delete(n),toggle:(n,on)=>on?values.add(n):values.delete(n),contains:n=>values.has(n)};};
  const marker=(id,x,k,t)=>({p:{id,x,y:100,k,t},w:35,el:{classList:classes()}});
  const city=marker('city',20,1,'city'),town=marker('town',180,2,'town');
  const label={on:true,major:true,size:40,boxes:[[0,95,60,105],[100,95,250,105]],el:{classList:classes()}};
  const context=vm.createContext({selected:null,activeCat:null,tlOn:false,gesturing:false,updateDetails(){},V:{s:1,tx:0,ty:0},viewport:{width:1200,height:800},MK:[city,town],RANK_MIN:{1:0,2:.65},LBL:[label],LBL_MEASURED:true,EV:[],placeMarkers(){},placeVisibleInTime:()=>true});
  vm.runInContext(source.slice(source.indexOf('function markerPriority('),source.indexOf('// Blink keeps')),context);
  vm.runInContext('lodPass(false)',context);
  assert.equal(label.el.classList.contains('hid'),true);
  assert.equal(town.el.classList.contains('off'),false,'Invisible region lettering must release every glyph obstacle immediately');
  assert.equal(town.shown,true);
});
