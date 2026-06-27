// spec-v160 2.1: RAPID3 (Pincus 2008). FN (MDHAQ 0-30 ÷3) + pain + global,
// range 0-30. Categories: near-remission <=3, low 3.1-6, moderate 6.1-12, high >12.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rapid3 } from '../../lib/rheum-v160.js';

test('tile example: high severity', () => {
  // FN 18/3 = 6 ; + pain 4 + global 5 = 15 -> high (>12)
  const r = rapid3({ fnRaw: 18, pain: 4, global: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 15);
  assert.equal(r.fn, 6);
  assert.equal(r.bandLabel, 'High severity');
});

test('the MDHAQ ÷3 transform makes function 0-10', () => {
  // FN raw 30 -> 10 ; with pain/global 0 -> RAPID3 10 (moderate band 6.1-12)
  const r = rapid3({ fnRaw: 30, pain: 0, global: 0 });
  assert.equal(r.fn, 10);
  assert.equal(r.score, 10);
});

test('category boundaries 3/3.1, 6/6.1, 12', () => {
  assert.equal(rapid3({ fnRaw: 9, pain: 0, global: 0 }).bandLabel, 'Near-remission'); // 3.0
  assert.equal(rapid3({ fnRaw: 0, pain: 3.1, global: 0 }).bandLabel, 'Low severity'); // 3.1
  assert.equal(rapid3({ fnRaw: 0, pain: 6, global: 0 }).bandLabel, 'Low severity'); // 6.0
  assert.equal(rapid3({ fnRaw: 0, pain: 6.1, global: 0 }).bandLabel, 'Moderate severity'); // 6.1
  assert.equal(rapid3({ fnRaw: 0, pain: 10, global: 2 }).bandLabel, 'Moderate severity'); // 12.0
  assert.equal(rapid3({ fnRaw: 30, pain: 1.1, global: 1 }).bandLabel, 'High severity'); // 12.1
});

test('blanks / out-of-range fall back', () => {
  assert.equal(rapid3({ fnRaw: 31, pain: 4, global: 5 }).valid, false); // FN > 30
  assert.equal(rapid3({ fnRaw: 18, pain: 11, global: 5 }).valid, false); // pain > 10
  assert.equal(rapid3({ fnRaw: 18, pain: 4 }).valid, false); // no global
  assert.equal(rapid3({}).valid, false);
});
