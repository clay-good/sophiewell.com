// spec-v96 2.2: Hamilton Anxiety Rating Scale (HAM-A, 14-item; Hamilton 1959).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hama } from '../../lib/psych-v96.js';

function items14(total) {
  // distribute `total` over 14 items each 0-4.
  const a = new Array(14).fill(0);
  let rem = total;
  for (let i = 0; i < 14 && rem > 0; i += 1) { const v = Math.min(4, rem); a[i] = v; rem -= v; }
  return a;
}

test('severity bands across the source structure', () => {
  assert.equal(hama({ items: items14(10) }).bandLabel, 'mild');               // <= 17
  assert.equal(hama({ items: items14(17) }).bandLabel, 'mild');               // 17 edge
  assert.equal(hama({ items: items14(18) }).bandLabel, 'mild to moderate');   // 18
  assert.equal(hama({ items: items14(24) }).bandLabel, 'mild to moderate');   // 24
  assert.equal(hama({ items: items14(25) }).bandLabel, 'moderate to severe'); // 25
  assert.equal(hama({ items: items14(30) }).bandLabel, 'moderate to severe'); // 30
  assert.equal(hama({ items: items14(31) }).bandLabel, 'severe');             // 31
});

test('all 2s totals 28 (moderate to severe)', () => {
  const r = hama({ items: new Array(14).fill(2) });
  assert.equal(r.total, 28);
  assert.equal(r.bandLabel, 'moderate to severe');
});

test('a blank item withholds the band; out-of-range rejected', () => {
  const a = new Array(14).fill(0); a[3] = null;
  assert.equal(hama({ items: a }).band, '(complete all 14 items)');
  const b = new Array(14).fill(0); b[0] = 5;
  assert.equal(hama({ items: b }).valid, false);
});
