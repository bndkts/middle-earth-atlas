import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Sample the absolute SVG curves used by the coastline and forest washes.
function outline(d) {
  const points = [];
  let current = [0, 0];
  for (const [, command, values] of d.matchAll(/([MCQLZ])([^MCQLZ]*)/g)) {
    const v = (values.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (command === 'Z') continue;
    if (command === 'M' || command === 'L') {
      current = v; points.push(current); continue;
    }
    const start = current;
    for (let step = 1; step <= 16; step++) {
      const t = step / 16, u = 1 - t;
      current = [0, 1].map(axis => command === 'C'
        ? u ** 3 * start[axis] + 3 * u ** 2 * t * v[axis] + 3 * u * t ** 2 * v[axis + 2] + t ** 3 * v[axis + 4]
        : u ** 2 * start[axis] + 2 * u * t * v[axis] + t ** 2 * v[axis + 2]);
      points.push(current);
    }
  }
  return points;
}

function inside([x, y], polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
}

test('Anduin reaches its delta without a protruding overlay connector', () => {
  const rivers = [...html.matchAll(/<path class="rv"[^>]* d="([^"]+)"/g)];
  const upstream = outline(rivers.find(([, d]) => d.startsWith('M1440.4,1458.2'))[1]);
  assert.ok(inside([1500, 1846], upstream), 'The main river must reach its delta branches');
  assert.ok(!inside([1504.3, 1833.5], upstream), 'Keep the original upstream bank free of the protrusion');
  assert.doesNotMatch(html, /data-join="anduin-delta"/, 'Do not layer a second, misaligned river over the junction');
});

test('river mouths retain channel-scale widths instead of triangular flares', () => {
  const mouths = [...html.matchAll(/class="river-mouth" fill="url\(#([^)]*)\)" d="([^"]+)"/g)];
  assert.equal(mouths.length, 12);
  for (const [, id, d] of mouths) {
    const v = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const inlet = Math.hypot(v[0] - v[16], v[1] - v[17]);
    const outlet = Math.hypot(v[6] - v[10], v[7] - v[11]);
    assert.ok(outlet <= inlet * 2, `Mouth at ${v.slice(0, 2)} flares from ${inlet} to ${outlet}`);
    const [, x, y] = html.match(new RegExp(`id="${id}"[^>]*x2="([\\d.]+)" y2="([\\d.]+)"`));
    assert.ok(Math.hypot((v[6] + v[10]) / 2 - x, (v[7] + v[11]) / 2 - y) < .02,
      `${id}: narrowing the flare must retain the mapped outlet and gradient alignment`);
  }
});

test('Eryn Vorn woodland and its shadow stay on the coastal landmass', () => {
  const coast = outline(html.match(/<path id="landp"[^>]* d="([^"]+)"/)[1]);
  const layers = [...html.matchAll(/<path id="eryn-vorn-[^"]+"[^>]*>/g)];
  assert.equal(layers.length, 7);
  for (const [element] of layers) {
    const [dx, dy] = element.match(/transform="translate\((\S+) (\S+)\)"/)?.slice(1).map(Number) || [0, 0];
    for (const [x, y] of outline(element.match(/ d="([^"]+)"/)[1])) {
      assert.ok(inside([x + dx, y + dy], coast), `Forest artwork spills into the sea at ${x},${y}`);
    }
  }
  const trees = html.split('\n').find(line => line.startsWith('<g id="eryn-vorn-trees"'));
  for (const [, x, y] of trees.matchAll(/translate\((\S+) (\S+)\)/g)) {
    assert.ok(inside([+x, +y], coast), 'Every tree must be rooted on land');
  }
  for (const [, bucket, content] of trees.matchAll(/data-b="([^"]+)"[^>]*>(.*?)<\/g>/g)) {
    for (const [, x, y] of content.matchAll(/translate\((\S+) (\S+)\)/g)) {
      assert.equal(bucket, `${Math.floor(x / 300)},${Math.floor(y / 300)}`, 'Moved trees must use the correct visibility bucket');
    }
  }
});

test('tree silhouettes render above hill and mountain fills but below rivers and landmarks', () => {
  const layers = [
    '<g class="forests">',
    '<g class="hills">',
    '<g class="mountains">',
    '<g id="forest-trees" class="forests">',
    '<g class="rivers">',
    '<g class="glyphs">',
    '<g class="decor">',
  ].map(marker => {
    const index = html.indexOf(marker);
    assert.ok(index >= 0, `Missing terrain layer: ${marker}`);
    return index;
  });
  assert.deepEqual(layers, [...layers].sort((a, b) => a - b));

  const trees = [...html.matchAll(/<g class="trees\b[^"]*"[^>]*>/g)];
  assert.ok(trees.length > 0, 'Tree artwork must remain present');
  for (const tree of trees) {
    assert.ok(tree.index > layers[3] && tree.index < layers[4],
      'Every tree group, including small copses, belongs above relief');
    assert.match(tree[0], /style="--tc:var\(--tree-[a-z]+\)"/,
      'Moving tree groups must preserve their regional palette');
  }
});
