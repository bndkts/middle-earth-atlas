import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

test('landing help starts expanded while discovery sections stay collapsible',()=>{
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const el={innerHTML:'',addEventListener(){}};
  const context=vm.createContext({$:()=>el,FEATURED:[],PLACES:[],TIMELINE:[],JOURNEYS:[],ico:()=>''});
  vm.runInContext(source.slice(source.indexOf('function renderExplore(){'),source.indexOf('function wander(){')),context);
  vm.runInContext('renderExplore()',context);
  assert.match(el.innerHTML,/<details class="atlas-help" open>/);
  assert.equal((el.innerHTML.match(/<details class="entry-section">/g)||[]).length,2);
});
