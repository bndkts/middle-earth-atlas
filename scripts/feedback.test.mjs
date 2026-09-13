import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context=vm.createContext({});
context.window=context;
for(const file of ['src/data.js','src/chapters.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const {places,characters,chapters}=context.ATLAS_DATA;
const placeById=new Map(places.map(place=>[place.id,place]));

test('Eryn Vorn is mapped on the Minhiriath side of the Brandywine mouth',()=>{
  const forest=placeById.get('eryn-vorn');
  const mouth=placeById.get('mouths-of-baranduin');
  assert.ok(forest.x>mouth.x,'Eryn Vorn must be east of the Baranduin mouth on this map');
  assert.ok(forest.y>mouth.y,'The wooded cape must extend south of the river mouth');
  assert.ok(forest.x<720,'The woodland belongs on the existing coastal promontory');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const label=html.match(/<text class="ml ml-forest" x="(\d+)" y="(\d+)"[^>]*>ERYN VORN<\/text>/);
  assert.ok(label,'Eryn Vorn map label is required');
  assert.equal(Number(label[1]),forest.x);
  assert.equal(Number(label[2]),forest.y);
  const artwork=html.match(/<g id="eryn-vorn-trees"[^>]*>(.*?)<\/g><\/g>/s);
  assert.ok(artwork,'The forest artwork needs an identifiable tree group');
  const trees=[...artwork[1].matchAll(/translate\(([\d.]+) ([\d.]+)\)/g)];
  assert.ok(trees.length>50,'Preserve the full woodland, not just its marker');
  for(const [,x,y] of trees){
    assert.ok(+x>mouth.x && +x<830,'Trees must lie between the Baranduin and Greyflood');
    assert.ok(Math.abs(+x-forest.x)<50 && Math.abs(+y-forest.y)<50,'Trees must surround the place marker');
  }
  for(const layer of ['shadow','wash','wash-inner','wash-middle','wash-core','canopy','canopy-detail']){
    const element=html.match(new RegExp(`<path id="eryn-vorn-${layer}"[^>]* d="([^"]+)"`));
    assert.ok(element,`Missing relocated forest layer: ${layer}`);
    const coords=element[1].match(/-?\d+(?:\.\d+)?/g).map(Number);
    for(let i=0;i<coords.length;i+=2) assert.ok(coords[i]>mouth.x && coords[i]<830,`${layer} must move with the trees`);
  }
});

test('the lower Brandywine reaches the northwestern side of the wooded cape',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const mouth=placeById.get('mouths-of-baranduin');
  const forest=placeById.get('eryn-vorn');
  const labelPath=html.match(/id="rvl-brandywine"[^>]* d="([^"]+)"/)[1];
  const coordinates=labelPath.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const [x,y]=coordinates.slice(-2);
  assert.ok(Math.hypot(x-mouth.x,y-mouth.y)<12,'The mouth marker must match the drawn river endpoint');
  assert.ok(x<forest.x && y<forest.y,'The river must empty northwest of Eryn Vorn');
  const river=html.match(/id="river-baranduin"[^>]* d="([^"]+)"/);
  assert.ok(river,'Identify the filled river geometry as well as its label');
  const points=river[1].match(/-?\d+(?:\.\d+)?/g).map(Number);
  for(let i=0;i<points.length;i+=2){
    if(points[i+1]>mouth.y-15) assert.ok(points[i]<forest.x-30,'No old river branch may remain east of the cape');
  }
  const gradient=html.match(/id="river-mouth-6"[^>]*x2="([\d.]+)" y2="([\d.]+)"/);
  assert.ok(gradient);
  assert.ok(Math.hypot(+gradient[1]-mouth.x,+gradient[2]-mouth.y)<15,'The estuary shading must reach the same mouth');
});

test('all 62 Lord of the Rings chapters have validated character locations',()=>{
  assert.deepEqual(chapters.reduce((counts,chapter)=>{
    counts[chapter.book]=(counts[chapter.book]||0)+1;
    return counts;
  },{}),{1:12,2:10,3:11,4:10,5:10,6:9});
  assert.equal(new Set(chapters.map(chapter=>chapter.id)).size,62);
  const characterIds=new Set(characters.map(character=>character.id));
  assert.equal(characterIds.size,characters.length);
  for(const chapter of chapters){
    assert.match(chapter.id,new RegExp(`^lotr-b${chapter.book}-c${String(chapter.chapter).padStart(2,'0')}$`));
    assert.ok(chapter.title);
    assert.ok(chapter.locations.length,chapter.id);
    for(const location of chapter.locations){
      assert.ok(placeById.has(location.placeId),`${chapter.id}: ${location.placeId}`);
      assert.ok(location.characters.length,`${chapter.id}: ${location.placeId}`);
      assert.equal(new Set(location.characters).size,location.characters.length);
      for(const id of location.characters) assert.ok(characterIds.has(id),`${chapter.id}: ${id}`);
    }
  }
});

test('chapter geography follows the books rather than film shortcuts',()=>{
  const chapter=id=>chapters.find(item=>item.id===id);
  const locations=id=>new Map(chapter(id).locations.map(location=>[location.placeId,location]));

  const flight=locations('lotr-b1-c12');
  assert.ok(!flight.has('rivendell'),'Flight to the Ford ends at the Ford, before Frodo wakes in Rivendell');
  assert.deepEqual(Array.from(flight.get('ford-of-bruinen').characters),['frodo','sam','merry','pippin','aragorn']);

  const helmsDeep=locations('lotr-b3-c07');
  assert.ok(helmsDeep.get('helms-deep').characters.includes('eomer'),'Book Éomer fights at Helm’s Deep');
  assert.ok(!helmsDeep.has('westfold'),'Éomer must not be placed with Gandalf’s returning riders');

  const greyCompany=locations('lotr-b5-c02');
  assert.ok(greyCompany.has('helms-deep'),'The Grey Company meets Aragorn at Helm’s Deep');

  const partings=locations('lotr-b6-c06');
  assert.ok(partings.get('dunland').characters.includes('saruman'),'The travellers meet Saruman on the road through Dunland');
  assert.ok(!partings.get('isengard').characters.includes('saruman'),'Saruman has already left Isengard');
});

test('place cards keep every information section visible when lore is absent',()=>{
  const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  assert.match(app,/No recorded period/);
  assert.match(app,/No peoples recorded/);
  assert.match(app,/No dated events recorded/);
  assert.match(app,/No mapped journey passes through/);
});
