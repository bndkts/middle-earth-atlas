import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../src/images.js',import.meta.url),'utf8'),context);
const images=context.window.IMG;

function dimensions(file){
  const b=readFileSync(new URL('../'+file,import.meta.url));
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  for(let offset=12;offset+8<b.length;){
    const kind=b.toString('ascii',offset,offset+4),size=b.readUInt32LE(offset+4),start=offset+8;
    if(kind==='VP8 ')return [b.readUInt16LE(start+6)&0x3fff,b.readUInt16LE(start+8)&0x3fff];
    if(kind==='VP8L'){const bits=b.readUInt32LE(start+1);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];}
    if(kind==='VP8X')return [b.readUIntLE(start+4,3)+1,b.readUIntLE(start+7,3)+1];
    offset=start+size+(size%2);
  }
  throw new Error('No WebP dimensions: '+file);
}

test('Hobbiton uses the detailed original rather than its 280px preview',()=>{
  assert.ok(dimensions(images.hobbiton.d)[0]>=1000);
});

test('artwork dimensions match the delivered files and never upscale the source',()=>{
  for(const [id,image] of Object.entries(images)){
    const [width,height]=dimensions(image.d);
    assert.deepEqual([image.w,image.h],[width,height],id);
    assert.ok(width<=1200 && height<=1600,id);
    assert.ok(width<=image.sourceWidth && height<=image.sourceHeight,id);
  }
});
