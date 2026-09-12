import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const data = { window: {} };
vm.runInNewContext(readFileSync(new URL('../src/data.js', import.meta.url), 'utf8'), data);
const { timeline, places } = data.window.ATLAS_DATA;
function section(from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}
function harness() {
  const elements = new Map();
  const element = () => ({ value: 0, innerHTML: '', textContent: '',
    classList: { toggle() {}, contains() { return false; } },
    addEventListener() {}, insertAdjacentHTML() {},
  });
  const c = vm.createContext({
    TIMELINE: timeline, PLACES: places, EV: [], tl: element(), tlOn: true,
    $: id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    tlYear: 3019, mapEl: element(), sheetState: 'half',
    updateRealms() {}, svgLabelLOD() {}, lodPass() {}, renderTimeline() {}, mode() {},
    ageLabel: String, esc: String, setSheet() {}, TG: 'https://tolkiengateway.net/wiki/',
    clearTimeout() {}, cancelAnimationFrame() {}, V: { s: 1 },
    flyTo(x, y) { c.destination = [x, y]; },
  });
  vm.runInContext(section('let timelineFrame =', 'function renderTimeline('), c);
  return c;
}
test('every event has independent time and in-bounds geographical coordinates', () => {
  for (const e of timeline) {
    assert.ok(Number.isFinite(e.absoluteYear), e.title);
    assert.ok(e.x >= 0 && e.x <= 2600 && e.y >= 0 && e.y <= 2300, e.title);
    if (e.placeId) {
      const p = places.find(p => p.id === e.placeId);
      assert.ok(p, e.title);
      assert.equal(e.x, p.x, e.title);
      assert.equal(e.y, p.y, e.title);
    }
  }
});
test('selecting Caradhras uses its map position while retaining 3019 as the year', () => {
  const c = harness();
  vm.runInContext(section('function showEvent(ev){', '// ---------- toast'), c);
  c.event = timeline.find(e => e.title === 'Defeat on Caradhras');
  vm.runInContext('showEvent(event)', c);
  assert.equal(c.tlYear, 3019);
  assert.deepEqual(c.destination, [c.event.x, c.event.y]);
  assert.notEqual(c.destination[1], c.tlYear);
});
test('busy years include every event instead of hiding entries after the first fourteen', () => {
  const c = harness();
  const count = timeline.filter(e => e.absoluteYear === 3019).length;
  assert.ok(count > 14);
  assert.equal(vm.runInContext('nearEvents(3019).length', c), count);
});
test('slider reaches the last record and round-trips all dated event years', () => {
  const c = harness();
  assert.equal(vm.runInContext('sliderToYear(1000)', c), Math.max(3141, ...timeline.map(e => e.absoluteYear)));
  for (const e of timeline) {
    c.year = e.absoluteYear;
    assert.equal(vm.runInContext('sliderToYear(yearToSlider(year))', c), e.absoluteYear);
  }
});
