import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
// Exercise the actual IIFE sections without adding browser dependencies or test exports.
function section(from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start, `Missing app section: ${from}`);
  return source.slice(start, end);
}
function harness() {
  const frames = new Map(), timers = new Map(), elements = new Map();
  let id = 0;
  const element = () => ({
    listeners: {}, style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setPointerCapture() {}, closest() { return null; },
  });
  const context = vm.createContext({
    $: selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    setTimeout: fn => { timers.set(++id, fn); return id; },
    clearTimeout: key => timers.delete(key),
    performance: { now: () => 100 },
  });
  const run = code => vm.runInContext(code, context);
  const tick = queue => { const jobs = [...queue.values()]; queue.clear(); jobs.forEach(fn => fn(100)); };
  return { context, run, element, frames, timers, frame: () => tick(frames), settle: () => tick(timers) };
}

test('viewport dimensions are cached until explicitly refreshed', () => {
  const h = harness();
  h.context.window = { innerWidth: 390, innerHeight: 844 };
  h.context.mapEl = { clientWidth: 390, clientHeight: 844 };
  h.run(section('const viewport =', 'const reduceMotion ='));
  h.context.window.innerWidth = h.context.mapEl.clientWidth = 1200;
  assert.equal(h.run('viewport.width'), 390);
  assert.equal(h.run('isDesktop()'), false);
  h.run('measureViewport()');
  assert.equal(h.run('viewport.mapWidth'), 1200);
  assert.equal(h.run('isDesktop()'), true);
  h.context.window.matchMedia = () => ({ matches: false });
  h.run(section('const coarsePointer =', 'let snapBmp ='));
  assert.equal(h.run('snapshotBudget()'), 12.5e6);
  h.run('coarsePointer.matches = true');
  assert.equal(h.run('snapshotBudget()'), 4e6, 'large touch screens keep the mobile budget');
  h.run('coarsePointer.matches = false; viewport.width = 390');
  assert.equal(h.run('snapshotBudget()'), 4e6);
});

test('panning does not rewrite the scale indicator', () => {
  const h = harness();
  h.context.V = { s: 1 };
  h.run(section('const scaleBar =', '// ---------- pointer handling'));
  let writes = 0;
  Object.defineProperty(h.run('scaleText'), 'textContent', { set() { writes++; } });
  h.run('updateScale(); V.tx = 50; updateScale(); updateScale()');
  assert.equal(writes, 1);
  h.run('V.s = 2; updateScale()');
  assert.equal(writes, 2);
});

test('touch moves batch, pinch transitions flush, and cancellation does not tap', () => {
  const h = harness(), map = h.element();
  let renders = 0, taps = 0;
  Object.assign(h.context, {
    mapEl: map, V: { s: 1, tx: 0, ty: 0, min: 0.1, max: 9 }, anim: null,
    apply: () => renders++, clamp() {}, startGesture() {}, endGesture() {}, lodPass() {},
    reduceMotion: true, sheet: h.element(), selectPlace: () => taps++, MK: [{ p: {} }],
  });
  h.run(section('(function pointer(){', '  // Wheel / trackpad:') + '\n})();');
  const emit = (type, pointerId, clientX, clientY = 100) => map.listeners[type]({
    type, pointerId, clientX, clientY, pointerType: 'touch', target: map,
  });
  emit('pointerdown', 1, 100);
  emit('pointermove', 1, 110); emit('pointermove', 1, 130);
  assert.equal(renders, 0);
  assert.equal(h.frames.size, 1);
  h.frame(); assert.equal(renders, 1);
  assert.equal(h.context.V.tx, 30);
  emit('pointerdown', 2, 230);
  emit('pointermove', 1, 120); emit('pointermove', 2, 240);
  assert.equal(h.frames.size, 1);
  assert.equal(h.context.V.s, 1.2);
  emit('pointerup', 2, 240);
  assert.equal(renders, 2); assert.equal(h.frames.size, 0);
  emit('pointermove', 1, 130);
  emit('pointerup', 1, 130);
  assert.equal(renders, 3); assert.equal(h.frames.size, 0);
  map.closest = selector => selector === '.mk' ? { dataset: { i: 0 } } : null;
  emit('pointerdown', 3, 100); emit('pointercancel', 3, 100);
  assert.equal(taps, 0);
});

test('timeline batches the latest year and cancels stale panels on commit or close', () => {
  const h = harness(), tl = h.element(), panels = [];
  Object.assign(h.context, {
    tl, tlOn: true, tlYear: 3019, TIMELINE: [], EV: [], mapEl: h.element(), sheetState: 'half',
    esc: x => x, ageLabel: y => String(y), updateRealms() {}, svgLabelLOD() {}, lodPass() {},
    renderTimeline: y => panels.push(y), mode() {}, setSheet() {},
  });
  h.run(section('let timelineFrame =', 'function renderTimeline('));
  tl.value = 600; tl.listeners.input(); tl.value = 900; tl.listeners.input();
  assert.equal(h.frames.size, 1);
  h.frame();
  assert.equal(h.context.tlYear, h.run('sliderToYear(900)'));
  assert.equal(panels.length, 0);
  h.settle(); assert.equal(panels.length, 1);
  tl.value = 950; tl.listeners.input(); h.frame();
  tl.listeners.change();
  assert.equal(h.timers.size, 0);
  assert.equal(panels.length, 2);
  tl.value = 800; tl.listeners.input(); h.frame();
  h.run('setYear(3019)'); // A preset/event selection must supersede deferred scrubbing.
  h.settle(); assert.deepEqual(panels.slice(-1), [3019]);
  tl.listeners.input(); h.run('setTimeline(false)');
  h.frame(); h.settle(); assert.equal(panels.length, 3);
});
