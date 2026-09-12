import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { DETAILS, visibleDetails, createDetailLayer } from '../src/details.mjs';

const shire = { s:5, tx:195-700*5, ty:390-915*5, width:390, height:844 };

test('close-up artwork is gated by zoom, viewport, layer preference and historical year', () => {
  assert.equal(visibleDetails({ ...shire, s:1 }).length, 0);
  assert.equal(visibleDetails(shire, null, false).length, 0);
  assert.ok(visibleDetails(shire).some(d => d.id === 'thinking-fox'));
  assert.ok(!visibleDetails(shire, 3019).some(d => d.id === 'thinking-fox'));
  assert.ok(visibleDetails(shire, 3018).some(d => d.id === 'thinking-fox'));
  assert.ok(visibleDetails(shire).length <= 3, 'a phone mounts its local miniatures, not the whole map');
  assert.equal(visibleDetails({ ...shire, tx:0, ty:0 }).length, 0);
  const erebor = { ...shire, tx:195-1606*5, ty:390-626*5 };
  assert.ok(visibleDetails(erebor, 2941).some(d => d.id === 'thrush'));
  assert.ok(!visibleDetails(erebor, 2942).some(d => d.id === 'thrush'));
});

test('miniatures reference existing places and stay within a small vector budget', () => {
  const context = { window:{} };
  vm.runInNewContext(readFileSync(new URL('../src/data.js', import.meta.url), 'utf8'), context);
  const places = new Set(context.window.ATLAS_DATA.places.map(p => p.id));
  assert.equal(new Set(DETAILS.map(d => d.id)).size, DETAILS.length);
  for (const d of DETAILS) {
    assert.ok(places.has(d.place), d.place);
    assert.ok(d.x > 0 && d.x < 2600 && d.y > 0 && d.y < 2300);
    assert.ok((d.art.match(/<(?:path|ellipse|g)\b/g) || []).length <= 26, d.id);
    assert.ok(!/<(?:image|filter|animate|script)\b/.test(d.art));
  }
});

test('panning reuses visible DOM and removes departed, disabled and zoomed-out details', () => {
  let created = 0;
  const children = new Set();
  const layer = {
    addEventListener() {}, appendChild(node) { children.add(node); },
    ownerDocument: { createElementNS() { created++; return {
      dataset:{}, setAttribute() {}, remove() { children.delete(this); },
    }; } },
  };
  const renderer = createDetailLayer(layer, () => {});
  renderer.update(shire, null, true);
  const count = children.size;
  assert.ok(count > 0);
  renderer.update(shire, null, true);
  renderer.update({ ...shire, tx:shire.tx+1 }, null, true);
  assert.equal(created, count, 'settled pans must not rebuild unchanged miniatures');
  renderer.update({ ...shire, tx:0, ty:0 }, null, true);
  assert.equal(children.size, 0);
  renderer.update(shire, null, true);
  renderer.update(shire, null, false);
  assert.equal(children.size, 0);
  renderer.update(shire, null, true);
  renderer.update({ ...shire, s:0.5 }, null, true);
  assert.equal(children.size, 0);
});

test('gesture callbacks never load or update the detail renderer', () => {
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const section = source.slice(source.indexOf('function updateDetails(){'), source.indexOf('function openDiscovery('));
  const context = vm.createContext({ gesturing:true });
  // Other dependencies deliberately absent: the gesture guard must run first.
  vm.runInContext(section + '\nupdateDetails();', context);
  context.gesturing = false;
  Object.assign(context, { LAYERS:{}, V:{s:1}, detailLayer:null, detailFailed:true });
  vm.runInContext('updateDetails();', context);
  assert.equal(context.detailFailed, false, 'overview permits retry without starting a download');
});
