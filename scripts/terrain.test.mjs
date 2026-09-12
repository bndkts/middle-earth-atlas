import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
