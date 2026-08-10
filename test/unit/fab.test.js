// spec-v699: Frontal Assessment Battery (FAB).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fab } from '../../lib/fab-v699.js';

const ALL = (n) => ({ conceptualization: n, flexibility: n, motorProgramming: n, interference: n, inhibitory: n, autonomy: n });

test('all-3 -> 18, normal', () => {
  const r = fab(ALL('3'));
  assert.equal(r.valid, true);
  assert.equal(r.score, 18);
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('all-0 -> 0, impaired', () => {
  const r = fab(ALL('0'));
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'impaired');
  assert.equal(r.abnormal, true);
});

test('cut-point is < 12: 11 impaired, 12 normal', () => {
  // 11 = 2+2+2+2+2+1
  const eleven = fab({ conceptualization: '2', flexibility: '2', motorProgramming: '2', interference: '2', inhibitory: '2', autonomy: '1' });
  assert.equal(eleven.score, 11);
  assert.equal(eleven.tier, 'impaired');
  const twelve = fab(ALL('2'));
  assert.equal(twelve.score, 12);
  assert.equal(twelve.tier, 'normal');
  assert.equal(twelve.abnormal, false);
});

test('worked example sums to 10 (impaired)', () => {
  const r = fab({ conceptualization: '2', flexibility: '2', motorProgramming: '2', interference: '2', inhibitory: '1', autonomy: '1' });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'impaired');
  assert.match(r.band, /FAB 10 of 18/);
});

test('subtests require an integer 0-3; required', () => {
  assert.equal(fab({}).valid, false);
  assert.equal(fab({}).code, 'MISSING_INPUT');
  assert.equal(fab({ ...ALL('2'), inhibitory: '4' }).valid, false);
  const partial = ALL('2'); delete partial.autonomy;
  assert.equal(fab(partial).field, 'autonomy');
});
