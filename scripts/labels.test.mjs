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
