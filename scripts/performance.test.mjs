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
  const element = () => {
    const classes = new Set();
    return {
    listeners: {}, style: {}, classList: {
      add(...names) { names.forEach(n => classes.add(n)); },
      remove(...names) { names.forEach(n => classes.delete(n)); },
      toggle(name, on = !classes.has(name)) { if (on) classes.add(name); else classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute() {}, setPointerCapture() {}, closest() { return null; },
    };
  };
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
  h.run(section('const viewport =', 'const reduceMotion ='));
  h.context.window.innerWidth = 1200;
  assert.equal(h.run('viewport.width'), 390);
  assert.equal(h.run('isDesktop()'), false);
  h.run('measureViewport()');
  assert.equal(h.run('viewport.width'), 1200);
  assert.equal(h.run('isDesktop()'), true);
  h.context.window.matchMedia = () => ({ matches: false });
  h.run(section('const coarsePointer =', 'let snapReady ='));
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

test('moving the bitmap only changes its compositor transform', () => {
  const h = harness();
  h.context.snapCv = h.element();
  h.context.V = { tx: 20, ty: -30, s: 2 };
  h.run(section('function drawSnap(){', '// ---------- transform ----------'));
  // No canvas context is supplied: this must not draw/scale/copy pixels per frame.
  h.run('drawSnap()');
  assert.equal(h.context.snapCv.style.transform, 'translate3d(20.00px,-30.00px,0) scale(2)');
});

test('raster restoration fades after paint and a new gesture cancels stale cleanup', () => {
  const h = harness(), map = h.element();
  Object.assign(h.context, {
    mapEl: map, snapReady: true, V: { s: 2, tx: 0, ty: 0 }, lastLodS: 0, lastLodRun: 0,
    lodTimer: null, lastPosS: 2, mkLayer: h.element(),
    applyBase() {}, svgLabelLOD() {}, lodPass() {}, reduceMotion: false,
  });
  h.run(section('let gestureT =', 'let lodTimer ='));
  h.run('startGesture(); rastering = true; mapEl.classList.add("rastered"); endGesture()');
  h.settle();
  assert.ok(map.classList.contains('restoring'));
  assert.ok(!map.classList.contains('fading'));
  h.frame(); h.frame();
  assert.ok(map.classList.contains('fading'));
  h.run('startGesture()');
  assert.ok(!map.classList.contains('fading'));
  assert.ok(!map.classList.contains('restoring'));
  h.settle();
  assert.ok(map.classList.contains('rastered'), 'old fade must not hide the new gesture');
  h.run('endGesture()'); h.settle(); h.frame(); h.frame(); h.settle();
  assert.ok(!map.classList.contains('rastered'));
  assert.ok(!map.classList.contains('fading'));
  h.context.reduceMotion = true;
  h.run('startGesture(); rastering = true; mapEl.classList.add("rastered"); endGesture()');
  h.settle(); h.frame(); h.frame();
  assert.ok(!map.classList.contains('rastered'));
  assert.equal(h.timers.size, 0, 'reduced motion skips the fade timer');
});

test('gestures transform the marker layer without per-marker layout or collision work', () => {
  const h = harness(), calls = [];
  Object.assign(h.context, {
    V: { s: 4, tx: 20, ty: -30 }, world: h.element(), mkLayer: h.element(),
    mapEl: h.element(), gesturing: true, gestureScale: 2, snapReady: true,
    rastering: false, lastLodS: 2, lastLodRun: 0, lodTimer: null,
    placeMarkers: () => calls.push('markers'), lodPass: () => calls.push('collisions'),
    svgLabelLOD: () => calls.push('labels'), applyBase: () => calls.push('base'),
    drawSnap: () => calls.push('bitmap'), updateScale() {},
  });
  h.run(section('function apply(){', 'function clamp(){'));
  h.run('apply(); V.s = 5; apply()');
  assert.deepEqual(calls, ['bitmap', 'bitmap']);
  assert.equal(h.context.mkLayer.style.transform, 'translate3d(20.00px,-30.00px,0) scale(2.5)');
  assert.equal(h.timers.size, 0);
  h.run('gesturing = false; apply()');
  assert.equal(h.context.mkLayer.style.transform, 'translate3d(20.00px,-30.00px,0)');
  h.settle();
  assert.deepEqual(calls.slice(2), ['markers', 'base', 'labels', 'collisions']);
});

test('collision passes from other UI callbacks also defer until the gesture ends', () => {
  const h = harness();
  h.context.gesturing = true;
  h.run(section('function lodPass(quick){', '// Blink keeps charging'));
  // MK and all collision-layout dependencies are intentionally unavailable.
  h.run('lodPass(); lodPass(true)');
});

test('snapshot includes overlay artwork and rejects stale or mid-gesture decodes', () => {
  const h = harness(), images = [], removed = [], appended = [], drawn = [];
  const clone = {
    removeAttribute() {}, setAttribute() {}, classList: { toggle() {} },
    querySelectorAll: () => [], appendChild: child => appended.push(child),
    insertBefore() {}, firstChild: null,
  };
  const overlay = { querySelectorAll: selector => {
    assert.equal(selector, '.mlabels, #dyn');
    return [{ remove: () => removed.push('live content') }];
  }};
  Object.assign(h.context, {
    snapBusy: false, snapDirty: true, snapReady: false, snapVersion: 1, snapBudget: 4e6,
    gesturing: false, rastering: false, MAPW: 2600, MAPH: 2300,
    baseEl: { cloneNode: () => clone }, terrainEl: { cloneNode: () => overlay },
    mapEl: h.element(), snapCv: {}, snapCtx: { drawImage: () => drawn.push(true) },
    document: { createElementNS: () => ({ textContent: '' }) },
    Blob: class {}, XMLSerializer: class { serializeToString() { return '<svg/>'; } },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    Image: class { constructor() { images.push(this); } },
    snapCss: () => '', scheduleSnapshot() {}, finishRaster() {},
  });
  h.run(section('function buildSnapshot(){', 'function scheduleSnapshot('));
  h.run('buildSnapshot()');
  assert.equal(appended[0], overlay);
  assert.deepEqual(removed, ['live content']);
  h.run('snapVersion++');
  images[0].onload();
  assert.equal(drawn.length, 0, 'outdated timeline must not reach the canvas');
  h.run('buildSnapshot(); gesturing = true');
  images[1].onload();
  assert.equal(drawn.length, 0, 'a decode must not replace the moving bitmap');
  h.run('gesturing = false; buildSnapshot()');
  images[2].onload();
  assert.equal(drawn.length, 1);
  assert.equal(h.context.snapReady, true);
  h.run('gesturing = true; buildSnapshot()');
  assert.equal(images.length, 3, 'do not even serialize SVG during gestures');
});

test('timeline and layer changes invalidate the snapshot only when artwork changes', () => {
  const h = harness(), map = h.element(), node = { className: 'deco' };
  let scheduled = 0;
  Object.assign(h.context, {
    mapEl: map, snapState: '', snapVersion: 0, snapReady: true,
    rastering: false, gesturing: false, applyBase() {}, finishRaster() {},
    $$: () => [{ getAttribute: () => node.className }],
    scheduleSnapshot: () => scheduled++,
  });
  h.run(section('function invalidateSnapshot(){', 'function snapCss(){'));
  h.run('invalidateSnapshot(); invalidateSnapshot()');
  assert.equal(scheduled, 1);
  node.className = 'deco hid';
  h.run('invalidateSnapshot()');
  assert.equal(scheduled, 2);
  map.classList.add('roads-off');
  h.run('invalidateSnapshot()');
  assert.equal(scheduled, 3);
  assert.equal(h.context.snapReady, false);
  assert.equal(h.context.snapVersion, 3);
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
    window: { ATLAS_URL: { dateFromYear: y => ({age:'TA',year:y}) } }, syncURL() {},
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
