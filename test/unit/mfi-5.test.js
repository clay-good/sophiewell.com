// spec-v143 2.1: Modified 5-Item Frailty Index (Subramaniam 2018). Count 0-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mfi5 } from '../../lib/frailty-v143.js';

test('no deficits -> 0, not frail', () => {
  const r = mfi5({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('the >= 2 frailty threshold flips at 2', () => {
  assert.equal(mfi5({ diabetes: 1 }).abnormal, false);            // 1
  assert.equal(mfi5({ diabetes: 1, chf: 1 }).abnormal, true);     // 2
});

test('two deficits names which were counted', () => {
  const r = mfi5({ diabetes: 1, chf: 1 });
  assert.equal(r.score, 2);
  assert.deepEqual(r.counted, ['diabetes mellitus', 'congestive heart failure']);
  assert.match(r.band, /2\/5/);
});

test('all five deficits -> 5, frail', () => {
  const r = mfi5({ diabetes: 1, hypertension: 1, copd: 1, chf: 1, dependent: 1 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
