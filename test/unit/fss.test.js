// spec-v732: Fatigue Severity Scale (FSS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fss } from '../../lib/fss-v732.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v, q7: v, q8: v, q9: v });

test('all sevens -> mean 7.00, significant', () => {
  const r = fss(all('7'));
  assert.equal(r.valid, true);
  assert.equal(r.sum, 63);
  assert.equal(r.meanText, '7.00');
  assert.equal(r.tier, 'significant-fatigue');
  assert.equal(r.abnormal, true);
});

test('worked example mean 5.00 -> significant', () => {
  const r = fss(all('5'));
  assert.equal(r.sum, 45);
  assert.equal(r.meanText, '5.00');
  assert.equal(r.tier, 'significant-fatigue');
  assert.match(r.band, /FSS mean 5.00 of 7/);
});

test('the mean-4 cut: 3.89 below, 4.00 significant', () => {
  const below = fss({ q1: '4', q2: '4', q3: '4', q4: '4', q5: '4', q6: '4', q7: '4', q8: '4', q9: '3' }); // sum 35, mean 3.888...
  assert.equal(below.sum, 35);
  assert.equal(below.meanText, '3.89');
  assert.equal(below.tier, 'low-fatigue');
  assert.equal(below.abnormal, false);
  const at = fss(all('4')); // sum 36, mean 4.00
  assert.equal(at.sum, 36);
  assert.equal(at.meanText, '4.00');
  assert.equal(at.tier, 'significant-fatigue');
  assert.equal(at.abnormal, true);
});

test('all ones -> mean 1.00, low fatigue', () => {
  const r = fss(all('1'));
  assert.equal(r.sum, 9);
  assert.equal(r.meanText, '1.00');
  assert.equal(r.tier, 'low-fatigue');
  assert.equal(r.abnormal, false);
});

test('items require an integer 1-7; all required', () => {
  assert.equal(fss({}).valid, false);
  assert.equal(fss({}).code, 'MISSING_INPUT');
  assert.equal(fss({ ...all('4'), q9: '8' }).valid, false);
  assert.equal(fss({ ...all('4'), q9: '0' }).valid, false);
  assert.equal(fss({ q1: '4', q2: '4', q3: '4', q4: '4', q5: '4', q6: '4', q7: '4', q8: '4' }).field, 'q9');
});
