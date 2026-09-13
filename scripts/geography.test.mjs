import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../src/data.js',import.meta.url),'utf8'),context);
const byId=new Map(context.window.ATLAS_DATA.places.map(p=>[p.id,p]));
const p=id=>{assert.ok(byId.has(id),id);return byId.get(id);};
test('reviewed placement notes distinguish reconstruction from display separation',()=>{
  assert.equal(p('bag-end').position?.kind,'display-offset');
  assert.equal(p('wellinghall').position?.kind,'text-reconstruction');
  assert.equal(p('belegost').position?.kind,'historical-reconstruction');
  for(const place of byId.values()) if(place.position){
    assert.ok(['display-offset','text-reconstruction','historical-reconstruction','area-anchor'].includes(place.position.kind));
    assert.ok(place.position.note.length>30);
  }
});
test('Eriador: wooded cape and barrow preserve their reviewed relative positions',()=>{
  assert.ok(p('eryn-vorn').x>p('mouths-of-baranduin').x);
  assert.ok(p('eryn-vorn').y>p('mouths-of-baranduin').y);
  assert.ok(p('great-barrow').x>p('tom-bombadils-house').x);
});
test('Blue Mountains: First Age projections stay on the appropriate side of Dolmed',()=>{
  assert.ok(p('belegost').y<p('mount-dolmed').y);
  assert.ok(p('nogrod').y>p('mount-dolmed').y);
});
test('Rohan: Wellinghall remains anchored to the flanks of Methedras',()=>{
  assert.ok(Math.hypot(p('wellinghall').x-p('methedras').x,p('wellinghall').y-p('methedras').y)<15);
});
test('Gondor and Mordor: the west-east city sequence is preserved',()=>{
  assert.ok(p('minas-tirith').x<p('osgiliath').x);
  assert.ok(p('osgiliath').x<p('minas-morgul').x);
  assert.ok(p('minas-morgul').x<p('barad-dur').x);
  assert.ok(p('grey-wood').y>p('amon-din').y);
  assert.ok(p('grey-wood').y<p('mount-mindolluin').y);
});
