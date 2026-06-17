// spec-v96 2.3: Montgomery-Asberg Depression Rating Scale (MADRS; Montgomery 1979).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { madrs } from '../../lib/psych-v96.js';

function items10(total) {
  const a = new Array(10).fill(0);
  let rem = total;
  for (let i = 0; i < 10 && rem > 0; i += 1) { const v = Math.min(6, rem); a[i] = v; rem -= v; }
  return a;
}

test('severity band edges 6/7, 19/20, 34/35', () => {
  assert.equal(madrs({ items: items10(6) }).bandLabel, 'normal / symptom absent'); // 6
  assert.equal(madrs({ items: items10(7) }).bandLabel, 'mild');                     // 7
  assert.equal(madrs({ items: items10(19) }).bandLabel, 'mild');                    // 19
  assert.equal(madrs({ items: items10(20) }).bandLabel, 'moderate');                // 20
  assert.equal(madrs({ items: items10(34) }).bandLabel, 'moderate');                // 34
  assert.equal(madrs({ items: items10(35) }).bandLabel, 'severe');                  // 35
});

test('all 2s totals 20 (moderate)', () => {
  const r = madrs({ items: new Array(10).fill(2) });
  assert.equal(r.total, 20);
  assert.equal(r.bandLabel, 'moderate');
});

test('a blank item withholds the band; out-of-range rejected', () => {
  const a = new Array(10).fill(0); a[2] = null;
  assert.equal(madrs({ items: a }).band, '(complete all 10 items)');
  const b = new Array(10).fill(0); b[0] = 7;
  assert.equal(madrs({ items: b }).valid, false);
});
