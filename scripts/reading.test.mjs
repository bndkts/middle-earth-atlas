import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
function reader(){
  const file=new URL('../src/reading.js',import.meta.url);
  assert.ok(existsSync(file),'Reading state policy is required');
  const c={window:{}};vm.runInNewContext(readFileSync(file,'utf8'),c);return c.window.ATLAS_READING;
}
const chapters=[{id:'one',title:'First'},{id:'two',title:'Secret title'},{id:'three',title:'Last'}];
test('reading progress resumes only valid chapters and tolerates corrupt storage',()=>{
  const r=reader();
  for(const value of [null,[],{},'bad',{chapterId:'missing',guard:'false'}])assert.equal(r.restore(value,chapters).chapterId,'one');
  assert.equal(r.restore({chapterId:'two',guard:true},chapters).chapterId,'two');
  assert.equal(r.restore({chapterId:'two',guard:'false'},chapters).guard,false);
});
test('guard hides unread chapter titles, leaving earlier titles and current title visible',()=>{
  const r=reader(),state={chapterId:'one',guard:true};
  assert.equal(r.title(chapters[1],state,chapters),'Unread chapter');
  assert.equal(r.title(chapters[0],state,chapters),'First');
  assert.equal(r.title(chapters[1],{...state,guard:false},chapters),'Secret title');
});
test('character colours are stable and nearby pins stay separate without moving anchors',()=>{
  const r=reader();assert.equal(r.color('frodo'),r.color('frodo'));assert.match(r.color('sam'),/^#[a-f0-9]{6}$/);
  const points=[{x:10,y:10},{x:12,y:11},{x:10,y:10},{x:200,y:200}];
  const before=JSON.stringify(points),out=r.spread(points);
  assert.equal(JSON.stringify(points),before);
  for(let i=0;i<out.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(out[i].x-out[j].x,out[i].y-out[j].y)>=36);
  assert.equal(out[3].x,200);assert.equal(out[3].y,200);
});
