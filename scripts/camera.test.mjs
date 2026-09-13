import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function camera(width,height,state='half'){
  const context=vm.createContext({viewport:{width,height,chromeTop:100},sheetState:state,isDesktop:()=>width>=900});
  const start=source.indexOf('function visibleBounds(');
  assert.ok(start>=0,'Camera must use the unobscured map rectangle');
  vm.runInContext(source.slice(start,source.indexOf('let anim =',start)),context);
  return vm.runInContext('({bounds:visibleBounds(),center:visibleCenter()})',context);
}
test('mobile half sheet excludes search, tools and the sheet from camera bounds',()=>{
  const {bounds:b,center:c}=camera(390,844);
  assert.equal(b.left,16);assert.equal(b.right,314);
  assert.equal(b.top,116);assert.equal(b.bottom,406);
  assert.equal(c[0],165);assert.equal(c[1],261);
});
test('desktop camera stays beside the panel and away from the toolbar',()=>{
  const {bounds:b}=camera(1200,800);
  assert.equal(b.left,432);assert.equal(b.right,1124);
  assert.ok(b.bottom>b.top);
});
test('peek gives more map space; full and short screens never produce negative bounds',()=>{
  assert.ok(camera(390,844,'peek').bounds.bottom>camera(390,844).bounds.bottom);
  for(const state of ['full','half','peek']){
    const {bounds:b}=camera(320,300,state);
    assert.ok(b.bottom>b.top);assert.ok(b.right>b.left);
  }
});
test('wide chapter views clamp to the free map area, not underneath a mobile sheet',()=>{
  const V={s:.33,tx:-100,ty:-150,min:.1,max:9};
  const context=vm.createContext({V,MAPW:2600,MAPH:2300,viewport:{width:390,height:844},isDesktop:()=>false,activeChapter:{id:'lotr-b6-c06'},visibleBounds:()=>({left:16,right:314,top:116,bottom:406})});
  vm.runInContext(source.slice(source.indexOf('function clamp(){'),source.indexOf('function zoomAt(')),context);
  vm.runInContext('clamp()',context);
  assert.equal(V.ty,-150,'Keep the chapter centred above the sheet even when the whole map is shorter than the screen');
});
