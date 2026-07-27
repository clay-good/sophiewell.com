// spec-v510: Banff grade of acute T cell-mediated rejection.
// Worked-example tests: every category, the v-dominates rule, the borderline boundaries on both sides,
// and the missing / out-of-range / non-integer guards. Criteria transcribed from the Banff 2019 Kidney
// Meeting Report (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { banffTcmr, LESIONS } from '../../lib/banff-tcmr-v510.js';

const cat = (i, t, v) => banffTcmr({ i, t, v }).category;

test('there are three lesion scores, each 0-3', () => {
  assert.deepEqual(LESIONS.map((l) => l.key), ['i', 't', 'v']);
  for (const l of LESIONS) assert.equal(l.options.length, 4);
});

test('i2 t2 v0 is grade IA (the META example)', () => {
  const r = banffTcmr({ i: 2, t: 2, v: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'IA');
  assert.equal(r.bandLabel, 'Grade IA');
  assert.match(r.band, /^i2 t2 v0: Grade IA/);
});

test('significant inflammation grades on the tubulitis score', () => {
  assert.equal(cat(2, 1, 0), 'borderline');
  assert.equal(cat(2, 2, 0), 'IA');
  assert.equal(cat(2, 3, 0), 'IB');
  assert.equal(cat(3, 2, 0), 'IA');
  assert.equal(cat(3, 3, 0), 'IB');
});

test('tubulitis with only minor inflammation is borderline at every t', () => {
  assert.equal(cat(0, 1, 0), 'borderline');
  assert.equal(cat(1, 2, 0), 'borderline');
  assert.equal(cat(1, 3, 0), 'borderline');
});

test('no tubulitis and no arteritis is not graded, however much inflammation', () => {
  assert.equal(cat(0, 0, 0), 'none');
  assert.equal(cat(3, 0, 0), 'none');
  assert.match(banffTcmr({ i: 3, t: 0, v: 0 }).bandLabel, /No acute T cell-mediated rejection/);
});

test('any arteritis dominates i and t', () => {
  assert.equal(cat(0, 0, 1), 'IIA');
  assert.equal(cat(0, 0, 2), 'IIB');
  assert.equal(cat(0, 0, 3), 'III');
  // The same v scores win even with i3 t3, which would otherwise read IB.
  assert.equal(cat(3, 3, 1), 'IIA');
  assert.equal(cat(3, 3, 2), 'IIB');
  assert.equal(cat(3, 3, 3), 'III');
});

test('string scores are accepted', () => {
  assert.equal(cat('2', '3', '0'), 'IB');
  assert.equal(cat('0', '0', '2'), 'IIB');
});

test('a missing score is invalid', () => {
  assert.equal(banffTcmr({}).valid, false);
  assert.equal(banffTcmr({ i: 2, t: 2 }).valid, false);
  assert.equal(banffTcmr({ i: 2, v: 0 }).valid, false);
});

test('out-of-range or non-integer scores are invalid', () => {
  assert.equal(banffTcmr({ i: 4, t: 2, v: 0 }).valid, false);
  assert.equal(banffTcmr({ i: -1, t: 2, v: 0 }).valid, false);
  assert.equal(banffTcmr({ i: 2, t: 2.5, v: 0 }).valid, false);
  assert.equal(banffTcmr({ i: 2, t: 2, v: 'x' }).valid, false);
});
