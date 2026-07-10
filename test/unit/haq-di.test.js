// spec-v280: worked examples for the HAQ-DI (Fries 1980). Scoring spec-v97
// cross-verified: 8 categories each 0-3 (highest item); aids/devices or help raise
// a category scored 0 or 1 to 2; HAQ-DI = mean of answered categories, computable
// only with >= 6 of 8 answered; range 0-3. Bands: <= 1 mild-moderate, > 1 to 2
// moderate-severe, > 2 severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haqDi } from '../../lib/rheum-fn-v280.js';

test('haq-di: all-1 gives mean 1 (mild-to-moderate)', () => {
  const r = haqDi({ dressing: 1, arising: 1, eating: 1, walking: 1, hygiene: 1, reach: 1, grip: 1, activities: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.equal(r.band, 'mild-to-moderate difficulty');
  assert.equal(r.abnormal, false);
  assert.equal(r.answered, 8);
});

test('haq-di: aids/devices adjustment raises a category from 1 to 2 (tile example)', () => {
  // 6 categories answered; dressing 1 + aid -> 2. Sum 2+2+2+2+2+2 = 12 / 6 = 2.0.
  const r = haqDi({ dressing: 1, dressingAid: true, arising: 2, eating: 2, walking: 2, hygiene: 2, reach: 2 });
  assert.equal(r.answered, 6);
  assert.equal(r.aidApplied, 1);
  assert.equal(r.score, 2);
  assert.equal(r.band, 'moderate-to-severe disability');
  assert.ok(r.detail.includes('HAQ-DI 2/3'));
  assert.ok(r.detail.includes('aids/devices adjustment'));
});

test('haq-di: aid does NOT change a category already scored 2 or 3', () => {
  // dressing 3 + aid stays 3; rest 0. Sum 3 / 8 = 0.375.
  const r = haqDi({ dressing: 3, dressingAid: true, arising: 0, eating: 0, walking: 0, hygiene: 0, reach: 0, grip: 0, activities: 0 });
  assert.equal(r.aidApplied, 0);
  assert.equal(r.score, 0.375);
});

test('haq-di: 6-of-8 completeness rule', () => {
  assert.equal(haqDi({ dressing: 2, arising: 2, eating: 2, walking: 2, hygiene: 2 }).valid, false); // 5 answered
  assert.equal(haqDi({ dressing: 3, arising: 3, eating: 3, walking: 3, hygiene: 3, reach: 3 }).valid, true); // 6 answered
  assert.equal(haqDi({ dressing: 3, arising: 3, eating: 3, walking: 3, hygiene: 3, reach: 3 }).score, 3);
  assert.equal(haqDi({ dressing: 3, arising: 3, eating: 3, walking: 3, hygiene: 3, reach: 3 }).band, 'severe disability');
});

test('haq-di: empty / too-few inputs are invalid (no NaN)', () => {
  assert.equal(haqDi({}).valid, false);
  assert.equal(haqDi().valid, false);
});
