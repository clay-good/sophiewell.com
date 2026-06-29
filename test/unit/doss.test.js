// spec-v174 §2.2: DOSS (Delirium Observation Screening Scale), 13-item short
// form. Each item present(1)/absent(0); total 0-13; >= 3 suggests delirium.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doss } from '../../lib/ltcga-v174.js';

const KEYS = ['dozesOff', 'distracted', 'noAttention', 'unfinishedAnswers', 'mismatchedAnswers', 'slowReactions', 'thinksElsewhere', 'unknownTimeOfDay', 'noRecentRecall', 'restlessPicking', 'pullsTubes', 'suddenEmotion', 'seesHearsThings'];
function withPresent(n) {
  const o = {};
  KEYS.forEach((k, i) => { o[k] = i < n ? 1 : 0; });
  return o;
}

test('DOSS 0/13 (none present) -> below cut', () => {
  const r = doss(withPresent(0));
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.match(r.band, /below the delirium cut/);
});

test('DOSS 2 -> below cut and 3 -> suggests delirium (the >= 3 flip)', () => {
  const two = doss(withPresent(2));
  assert.equal(two.total, 2);
  assert.match(two.band, /below the delirium cut/);
  const three = doss(withPresent(3));
  assert.equal(three.total, 3);
  assert.equal(three.positive, true);
  assert.match(three.band, /suggests delirium/);
});

test('DOSS 13/13 (all present) -> suggests delirium', () => {
  const r = doss(withPresent(13));
  assert.equal(r.total, 13);
  assert.equal(r.positive, true);
});

test('DOSS rejects an unanswered item', () => {
  const o = withPresent(13);
  o.seesHearsThings = '';
  assert.equal(doss(o).valid, false);
  assert.equal(doss({}).valid, false);
});
