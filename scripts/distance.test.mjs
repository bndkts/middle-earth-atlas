import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
function section(from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}
function harness(journeys = []) {
  const ctx = vm.createContext({ JOURNEYS: journeys });
  vm.runInContext(section('function routePoints(', 'function drawJourneys('), ctx);
  vm.runInContext(section('function distanceEligible(', 'let dirA ='), ctx);
  vm.runInContext(section('function journeyRoad(', 'function renderDirections('), ctx);
  vm.runInContext(section('function journeysThrough(', 'function renderPlace('), ctx);
  return ctx;
}
const town = (id, x = 0, y = 0) => ({ id, x, y, k: 1, t: 'town', _area: false });

test('explicit visits never leak to a neighbouring or co-located place', () => {
  const ctx = harness([{ legs: [{ placeId: 'a', x: 0, y: 0 }, { placeId: 'b', x: 30, y: 40 }] }]);
  assert.equal(ctx.journeyRoad(town('a'), town('b')).length, 1);
  assert.equal(ctx.journeyRoad(town('unvisited'), town('b')).length, 0);
  assert.equal(ctx.journeysThrough(town('unvisited')).length, 0);
  assert.equal(ctx.journeysThrough(town('a')).length, 1);
});

test('drawn route and length share intermediate geometry without spline overshoot', () => {
  const ctx = harness();
  const legs = [{ x: 0, y: 0 }, { x: 3, y: 4, via: [{ x: 3, y: 0 }] }];
  assert.equal(ctx.routePath(legs), 'M0,0 L3,0 L3,4');
  assert.equal(ctx.routeDistance(legs), 7);
  assert.equal(ctx.routeDistance(legs.slice(1)), 0, 'do not include arrival geometry before the selected start');
});

test('repeated visits use the shortest mapped segment and preserve chronology', () => {
  const ctx = harness([{ legs: [
    { placeId: 'a', x: 0, y: 0, date: 'first' },
    { placeId: 'b', x: 30, y: 0, date: 'second' },
    { placeId: 'a', x: 25, y: 0, date: 'third' },
  ] }]);
  const result = ctx.journeyRoad(town('a'), town('b'))[0];
  assert.equal(result[1], 5);
  assert.equal(result[2], 'second');
  assert.equal(result[3], 'third');
});

test('road scenarios include the advertised winding factor', () => {
  const ctx = harness();
  assert.equal(ctx.roadDays(90, 40), 3);
  assert.equal(ctx.roadDays(0, 18), 0);
});

test('area anchors and enlarged small sites cannot produce numerical distances', () => {
  const ctx = harness();
  assert.equal(ctx.distanceEligible(town('a')), true);
  for (const p of [{ ...town('a'), _area: true }, { ...town('a'), k: 4 }, { ...town('a'), t: 'hall' }, { ...town('a'), t: 'gate' }, { ...town('white-tower'), t: 'tower' }, { ...town('citadel'), t: 'fortress' }]) {
    assert.equal(ctx.distanceEligible(p), false);
    assert.equal(ctx.journeyRoad(p, town('b')).length, 0);
  }
  assert.equal(ctx.estimateLabel(226.124), '≈ 230');
});
