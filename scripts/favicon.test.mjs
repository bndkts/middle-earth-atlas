import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {buildOutputs, root} from './generate-content.mjs';

const outputs = buildOutputs();

function assertPng(file, size) {
  const png = fs.readFileSync(path.join(root, file));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', file);
  assert.equal(png.readUInt32BE(16), size, `${file} width`);
  assert.equal(png.readUInt32BE(20), size, `${file} height`);
}

test('every HTML page advertises favicon formats supported by mobile browsers', () => {
  for (const [file, html] of outputs) {
    if (!file.endsWith('.html')) continue;
    assert.match(html, /<link rel="icon" href="\/favicon\.ico" sizes="any">/, file);
    assert.match(html, /<link rel="icon" href="\/assets\/favicon\.svg" type="image\/svg\+xml">/, file);
    assert.match(html, /<link rel="icon" href="\/assets\/favicon-32x32\.png" type="image\/png" sizes="32x32">/, file);
    assert.match(html, /<link rel="apple-touch-icon" href="\/assets\/apple-touch-icon\.png" sizes="180x180">/, file);
    assert.match(html, /<link rel="manifest" href="\/site\.webmanifest">/, file);
  }
});

test('raster icons and the conventional root favicon exist at their advertised sizes', () => {
  assertPng('assets/favicon-32x32.png', 32);
  assertPng('assets/apple-touch-icon.png', 180);
  assertPng('assets/icon-192x192.png', 192);
  assertPng('assets/icon-512x512.png', 512);

  const ico = fs.readFileSync(path.join(root, 'favicon.ico'));
  assert.equal(ico.toString('hex', 0, 4), '00000100');
});

test('the web app manifest points to installable PNG icons', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8'));
  assert.equal(manifest.name, 'Middle-earth Atlas');
  assert.deepEqual(manifest.icons.map(({src, sizes, type}) => ({src, sizes, type})), [
    {src: '/assets/icon-192x192.png', sizes: '192x192', type: 'image/png'},
    {src: '/assets/icon-512x512.png', sizes: '512x512', type: 'image/png'},
  ]);
});
