// spec-v96 2.5: Yale-Brown Obsessive Compulsive Scale (Y-BOCS, 10-item; Goodman 1989).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ybocs } from '../../lib/psych-v96.js';

function items10(total) {
  const a = new Array(10).fill(0);
  let rem = total;
  for (let i = 0; i < 10 && rem > 0; i += 1) { const v = Math.min(4, rem); a[i] = v; rem -= v; }
  return a;
}

test('severity band edges 7/8, 15/16, 23/24, 31/32', () => {
  assert.equal(ybocs({ items: items10(7) }).bandLabel, 'subclinical'); // 7
  assert.equal(ybocs({ items: items10(8) }).bandLabel, 'mild');        // 8
  assert.equal(ybocs({ items: items10(15) }).bandLabel, 'mild');       // 15
  assert.equal(ybocs({ items: items10(16) }).bandLabel, 'moderate');   // 16
  assert.equal(ybocs({ items: items10(23) }).bandLabel, 'moderate');   // 23
  assert.equal(ybocs({ items: items10(24) }).bandLabel, 'severe');     // 24
  assert.equal(ybocs({ items: items10(31) }).bandLabel, 'severe');     // 31
  assert.equal(ybocs({ items: items10(32) }).bandLabel, 'extreme');    // 32
});

test('reports obsession and compulsion subtotals', () => {
  // obsessions (items 1-5) = 2 each = 10; compulsions (6-10) = 2 each = 10.
  const r = ybocs({ items: new Array(10).fill(2) });
  assert.equal(r.total, 20);
  assert.equal(r.obsession, 10);
  assert.equal(r.compulsion, 10);
  assert.equal(r.bandLabel, 'moderate');
});

test('a blank item withholds the band; out-of-range rejected', () => {
  const a = new Array(10).fill(0); a[4] = null;
  assert.equal(ybocs({ items: a }).band, '(complete all 10 items)');
  const b = new Array(10).fill(0); b[0] = 5;
  assert.equal(ybocs({ items: b }).valid, false);
});
