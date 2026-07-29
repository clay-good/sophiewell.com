// spec-v598: the Japan Thyroid Association thyroid-storm criteria.
//
// The load-bearing tests are the CNS privilege (one feature with it, three without) and the TS2
// no-laboratory route, where the same clinical picture drops a grade on lab availability alone.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  jtaThyroidStorm, NON_CNS_FEATURES, TS1_FEATURES_WITH_CNS, TS1_FEATURES_WITHOUT_CNS, TS2_FEATURES,
  FEVER_THRESHOLD_C, TACHYCARDIA_THRESHOLD, BILIRUBIN_THRESHOLD, GCS_THRESHOLD,
} from '../../lib/jta-thyroid-storm-v598.js';

const BASE = {
  thyrotoxicosis: 'confirmed', clinicalThyroidDisease: 'yes',
  cnsManifestation: 'no', alternativeCauseExcluded: 'yes',
  ...Object.fromEntries(NON_CNS_FEATURES.map((f) => [f.key, 'no'])),
};
const at = (over = {}) => jtaThyroidStorm({ ...BASE, ...over });
const withFeatures = (n, over = {}) => at({
  ...Object.fromEntries(NON_CNS_FEATURES.slice(0, n).map((f) => [f.key, 'yes'])), ...over,
});

test('there are four non-privileged features', () => {
  assert.equal(NON_CNS_FEATURES.length, 4);
  assert.equal(at().grade, 'Neither TS1 nor TS2');
});

// THE privilege.
test('with a CNS manifestation one other feature reaches TS1', () => {
  assert.equal(TS1_FEATURES_WITH_CNS, 1);
  assert.equal(withFeatures(1, { cnsManifestation: 'yes' }).grade, 'TS1');
});

test('without a CNS manifestation three other features are required', () => {
  assert.equal(TS1_FEATURES_WITHOUT_CNS, 3);
  assert.equal(withFeatures(1).grade, 'Neither TS1 nor TS2');
  assert.equal(withFeatures(2).grade, 'TS2');
  assert.equal(withFeatures(3).grade, 'TS1');
});

test('the same two features are TS2 without CNS and TS1 with it', () => {
  const without = withFeatures(2);
  const with_ = withFeatures(2, { cnsManifestation: 'yes' });
  assert.equal(without.grade, 'TS2');
  assert.equal(with_.grade, 'TS1');
  assert.equal(without.otherFeatureCount, with_.otherFeatureCount);
  assert.match(without.bandText, /a single CNS manifestation would have made the same patient TS1/);
});

test('no other feature carries that privilege', () => {
  // Swapping which two of the four are present never changes the grade.
  for (let a = 0; a < NON_CNS_FEATURES.length; a += 1) {
    for (let b = a + 1; b < NON_CNS_FEATURES.length; b += 1) {
      const r = at({ [NON_CNS_FEATURES[a].key]: 'yes', [NON_CNS_FEATURES[b].key]: 'yes' });
      assert.equal(r.grade, 'TS2', `${NON_CNS_FEATURES[a].key} + ${NON_CNS_FEATURES[b].key}`);
    }
  }
});

test('the privilege is explained in every result', () => {
  assert.match(at().bandText, /PRIVILEGED and nothing else is/);
});

// THE prerequisite.
test('thyrotoxicosis recorded absent blocks both grades however many features', () => {
  const r = at({ thyrotoxicosis: 'absent', cnsManifestation: 'yes', ...Object.fromEntries(NON_CNS_FEATURES.map((f) => [f.key, 'yes'])) });
  assert.equal(r.otherFeatureCount, 4);
  assert.equal(r.grade, 'Neither TS1 nor TS2');
  assert.match(r.bandText, /PREREQUISITE and is recorded as absent/);
});

// THE no-labs route.
test('the TS1 pattern without laboratory confirmation becomes TS2', () => {
  const confirmed = withFeatures(1, { cnsManifestation: 'yes' });
  const noLabs = withFeatures(1, { cnsManifestation: 'yes', thyrotoxicosis: 'labs-unavailable' });
  assert.equal(confirmed.grade, 'TS1');
  assert.equal(noLabs.grade, 'TS2', 'the same clinical picture drops a grade');
  assert.equal(noLabs.viaNoLabsRoute, true);
  assert.equal(confirmed.viaNoLabsRoute, false);
  assert.match(noLabs.bandText, /NO-LABORATORY ROUTE, NOT THROUGH THE FEATURE COUNT/);
});

test('the no-labs route needs clinical evidence of thyroid disease', () => {
  const r = withFeatures(1, {
    cnsManifestation: 'yes', thyrotoxicosis: 'labs-unavailable', clinicalThyroidDisease: 'no',
  });
  assert.equal(r.grade, 'Neither TS1 nor TS2');
  assert.equal(r.viaNoLabsRoute, false);
});

test('the no-labs route requires the TS1 pattern, not merely the TS2 count', () => {
  const r = withFeatures(TS2_FEATURES, { thyrotoxicosis: 'labs-unavailable' });
  assert.equal(r.grade, 'Neither TS1 nor TS2', 'two features without CNS is not the TS1 pattern');
});

// Grades are certainty, not severity.
test('the grades are described as certainty rather than severity', () => {
  assert.match(withFeatures(2).bandText, /SUSPECTED thyroid storm/);
  assert.match(withFeatures(3).bandText, /DEFINITE thyroid storm/);
  assert.match(at().bandText, /grades of diagnostic CERTAINTY, not of severity/);
});

// Thresholds and definitions.
test('the published thresholds are carried', () => {
  assert.equal(FEVER_THRESHOLD_C, 38);
  assert.equal(TACHYCARDIA_THRESHOLD, 130);
  assert.equal(BILIRUBIN_THRESHOLD, 3.0);
  assert.equal(GCS_THRESHOLD, 14);
  assert.match(at().bandText, /NOT any heart failure/);
  assert.match(at().bandText, /differing only at exactly 3/);
});

// The non-mechanical exclusion.
test('the exclusion question is reported, not decided', () => {
  assert.match(at({ alternativeCauseExcluded: 'no' }).bandText, /HAS NOT BEEN EXCLUDED/);
  assert.match(at().bandText, /may themselves TRIGGER thyroid storm/);
  assert.match(at().bandText, /asks the question and reports the answer; it does not decide it/);
  // The answer never changes the grade -- it is reported alongside.
  assert.equal(withFeatures(3, { alternativeCauseExcluded: 'no' }).grade, 'TS1');
});

// Input handling and scope.
test('every item is required and the prerequisite is named', () => {
  assert.equal(jtaThyroidStorm({}).valid, false);
  assert.match(jtaThyroidStorm({}).message, /PREREQUISITE, not a scored item/);
  assert.match(jtaThyroidStorm({ ...BASE, thyrotoxicosis: 'maybe' }).message, /confirmed, labs-unavailable, absent/);
});

test('the scope note refuses treatment and does not exclude the diagnosis', () => {
  const r = at();
  assert.match(r.note, /do not select or sequence thionamides/);
  assert.match(r.note, /Failing the criteria does not exclude thyroid storm/);
  assert.match(r.note, /cannot be converted into a grade/);
});
