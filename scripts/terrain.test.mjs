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
