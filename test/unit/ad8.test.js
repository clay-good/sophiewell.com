// spec-v173 §2.2: AD8 informant dementia screen. Sum 0-8; 0-1 normal,
// >= 2 suggests cognitive impairment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ad8 } from '../../lib/ltcga-v173.js';

const KEYS = ['judgment', 'interest', 'repeating', 'learningTool', 'dateRecall', 'finances', 'appointments', 'dailyThinking'];
// Build an answer object with the first `n` items "yes" and the rest "no".
function withYes(n) {
  const o = {};
  KEYS.forEach((k, i) => { o[k] = i < n ? 'yes' : 'no'; });
  return o;
}

test('AD8 0/8 -> normal', () => {
  const r = ad8(withYes(0));
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.impaired, false);
  assert.match(r.band, /normal/);
});

test('AD8 1 -> normal and 2 -> impairment (the band flip at >= 2)', () => {
  const one = ad8(withYes(1));
  assert.equal(one.total, 1);
  assert.match(one.band, /normal/);
  const two = ad8(withYes(2));
  assert.equal(two.total, 2);
  assert.equal(two.impaired, true);
  assert.match(two.band, /suggests cognitive impairment/);
});

test('AD8 8/8 -> impairment', () => {
  const r = ad8(withYes(8));
  assert.equal(r.total, 8);
  assert.equal(r.impaired, true);
});

test('AD8 requires all 8 items answered', () => {
  const partial = withYes(2);
  delete partial.dailyThinking;
  assert.equal(ad8(partial).valid, false);
  assert.equal(ad8({}).valid, false);
});
