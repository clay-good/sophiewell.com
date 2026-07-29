// spec-v611: the Fried frailty phenotype.
//
// The load-bearing tests are that the grip cut-point RISES with BMI (it reads backwards and is correct), and
// that the walk criterion varies by sex only through the height threshold, never through the time.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  friedFrailty, gripCutoffKg, walkCutoffSeconds, CRITERIA, GRIP_CUTOFFS, BANDS,
  WALK_SECONDS_SHORTER, WALK_SECONDS_TALLER, WALK_HEIGHT_THRESHOLD_CM, ACTIVITY_KCAL_PER_WEEK,
} from '../../lib/fried-frailty-v611.js';

function at(metKeys = []) {
  const input = {};
  for (const c of CRITERIA) input[c.key] = metKeys.includes(c.key) ? 'yes' : 'no';
  return friedFrailty(input);
}

test('the phenotype is five criteria', () => {
  assert.equal(CRITERIA.length, 5);
  assert.equal(new Set(CRITERIA.map((c) => c.key)).size, 5);
});

test('none is robust, one or two is pre-frail, three or more is frail', () => {
  assert.equal(at([]).band, 'Robust');
  assert.equal(at(['weightLoss']).band, 'Pre-frail');
  assert.equal(at(['weightLoss', 'exhaustion']).band, 'Pre-frail');
  assert.equal(at(['weightLoss', 'exhaustion', 'weakness']).band, 'Frail');
  assert.equal(at(CRITERIA.map((c) => c.key)).band, 'Frail');
  assert.deepEqual(BANDS.map((b) => b.max), [0, 2, 5]);
});

// THE counterintuitive direction.
test('the grip cut-point RISES with BMI - a heavier person must squeeze harder', () => {
  for (const sex of ['male', 'female']) {
    const cutoffs = GRIP_CUTOFFS[sex].map((r) => r.kg);
    for (let i = 1; i < cutoffs.length; i++) {
      assert.ok(cutoffs[i] >= cutoffs[i - 1], `${sex} band ${i} must not fall below the band below it`);
    }
    assert.ok(cutoffs[cutoffs.length - 1] > cutoffs[0], `${sex} highest BMI band cuts higher than the lowest`);
  }
});

test('the published grip cut-points are carried exactly', () => {
  assert.equal(gripCutoffKg('male', 24), 29);
  assert.equal(gripCutoffKg('male', 25), 30);
  assert.equal(gripCutoffKg('male', 27), 30);
  assert.equal(gripCutoffKg('male', 29), 32);
  assert.equal(gripCutoffKg('female', 23), 17);
  assert.equal(gripCutoffKg('female', 25), 17.3);
  assert.equal(gripCutoffKg('female', 28), 18);
  assert.equal(gripCutoffKg('female', 30), 21);
});

test('the men table has four BMI bands but only three distinct cut-points', () => {
  const male = GRIP_CUTOFFS.male.map((r) => r.kg);
  assert.equal(male.length, 4);
  assert.equal(new Set(male).size, 3);
  assert.equal(gripCutoffKg('male', 25), gripCutoffKg('male', 27), '24.1-26 and 26.1-28 both cut at 30 kg');
});

test('women have four distinct cut-points, unlike men', () => {
  assert.equal(new Set(GRIP_CUTOFFS.female.map((r) => r.kg)).size, 4);
});

// THE walk criterion.
test('the walk times are identical for both sexes - only the height threshold differs', () => {
  assert.equal(WALK_SECONDS_SHORTER, 7);
  assert.equal(WALK_SECONDS_TALLER, 6);
  assert.notEqual(WALK_HEIGHT_THRESHOLD_CM.male, WALK_HEIGHT_THRESHOLD_CM.female);
  assert.equal(WALK_HEIGHT_THRESHOLD_CM.male, 173);
  assert.equal(WALK_HEIGHT_THRESHOLD_CM.female, 159);
  // At their own thresholds both sexes get the same time.
  assert.equal(walkCutoffSeconds('male', 173), walkCutoffSeconds('female', 159));
  assert.equal(walkCutoffSeconds('male', 174), walkCutoffSeconds('female', 160));
});

test('a height between the two thresholds is read differently by sex', () => {
  assert.equal(walkCutoffSeconds('female', 165), WALK_SECONDS_TALLER);
  assert.equal(walkCutoffSeconds('male', 165), WALK_SECONDS_SHORTER);
});

test('the result keeps the walk criterion as a time, never a speed', () => {
  const t = at().bandText;
  assert.match(t, /A TIME OVER 15 feet, NOT A SPEED/);
  assert.doesNotMatch(t, /m\/s/);
});

// The remaining criteria.
test('weight loss carries both alternative definitions', () => {
  assert.match(at().bandText, /TWO ALTERNATIVE DEFINITIONS AND EITHER ONE SATISFIES IT/);
  assert.match(CRITERIA[0].text, /10 pounds/);
  assert.match(CRITERIA[0].text, /5%/);
});

test('the activity numbers are presented as cohort-specific, not universal', () => {
  assert.equal(ACTIVITY_KCAL_PER_WEEK.male, 383);
  assert.equal(ACTIVITY_KCAL_PER_WEEK.female, 270);
  assert.match(at().bandText, /LOWEST QUINTILE BY SEX/);
  assert.match(at().bandText, /cohort-specific rather than universal/);
});

test('the result says three of five criteria need equipment or a questionnaire', () => {
  assert.match(at().bandText, /THREE OF THE FIVE CRITERIA NEED EQUIPMENT/);
  assert.match(at().bandText, /not a bedside checklist/);
});

test('the criteria met are named back', () => {
  const r = at(['weakness', 'slowness']);
  assert.deepEqual(r.criteriaMet, ['weakness', 'slowness']);
  assert.match(r.bandText, /Criteria met: Weakness, Slowness\./);
  assert.doesNotMatch(at([]).bandText, /Criteria met:/);
});

test('the inputs are validated', () => {
  assert.equal(friedFrailty({}).valid, false);
  assert.match(friedFrailty({}).message, /5 still unanswered/);
  assert.match(friedFrailty({ weightLoss: 'sometimes' }).message, /must be yes or no/);
  assert.equal(gripCutoffKg('other', 25), null, 'an unreadable sex returns null rather than throwing');
  assert.equal(walkCutoffSeconds('other', 170), null);
  assert.equal(gripCutoffKg('male', 'tall'), null);
  assert.equal(walkCutoffSeconds('male', 'short'), null);
});

test('the scope note separates the phenotype from disease, disability and clearance', () => {
  const r = at();
  assert.match(r.note, /does not diagnose any disease/);
  assert.match(r.note, /disability or comorbidity/);
  assert.match(r.note, /distinct from frailty/);
  assert.match(r.note, /does not decide whether someone can have an operation/);
});
