import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('the atlas registers a root-scoped service worker',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/src="\/src\/offline\.js"/);
  const client=fs.readFileSync(path.join(root,'src/offline.js'),'utf8');
  assert.match(client,/serviceWorker\.register\('\/service-worker\.js'/);
});

test('the service worker precaches the complete interactive shell',()=>{
  const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  for(const asset of ['/', '/offline.html', '/src/data.js?v=atlas-3', '/src/chapters.js', '/src/app.js?v=atlas-3', '/src/details.mjs', '/src/styles.css', '/src/map.css', '/src/images.js', '/assets/texture.png']){
    assert.ok(worker.includes(JSON.stringify(asset)),asset);
  }
  assert.match(worker,/request\.method !== 'GET'/);
  assert.match(worker,/url\.origin !== self\.location\.origin/);
  assert.match(worker,/SKIP_WAITING/);
});

test('offline root artifacts are included in the production image',()=>{
  const docker=fs.readFileSync(path.join(root,'Dockerfile'),'utf8');
  for(const file of ['service-worker.js','offline.html','site.webmanifest']) assert.ok(docker.includes(file),file);
  const nginx=fs.readFileSync(path.join(root,'nginx.conf'),'utf8');
  assert.match(nginx,/location = \/service-worker\.js/);
});
