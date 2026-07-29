// spec-v589: the Sternbach criteria for serotonin syndrome.
//
// The load-bearing tests are that three features are necessary and not sufficient, that the neuroleptic
// requirement is a hard negative, and that the disputed eleventh feature is flagged rather than counted.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sternbach, FEATURES, REQUIREMENTS, FEATURES_REQUIRED, DISPUTED_FEATURE,
  SENSITIVITY, SPECIFICITY,
} from '../../lib/sternbach-v589.js';

const BASE = {
  ...Object.fromEntries(FEATURES.map((f) => [f.key, 'no'])),
  ...Object.fromEntries(REQUIREMENTS.map((r) => [r.key, 'yes'])),
  rigidity: 'no',
};
const at = (over = {}) => sternbach({ ...BASE, ...over });
const withFeatures = (n, over = {}) => at({
  ...Object.fromEntries(FEATURES.slice(0, n).map((f) => [f.key, 'yes'])), ...over,
});

test('there are ten features and three are required', () => {
  assert.equal(FEATURES.length, 10);
  assert.equal(FEATURES_REQUIRED, 3);
  assert.equal(REQUIREMENTS.length, 3);
});

test('the feature threshold is where the source puts it', () => {
  assert.equal(withFeatures(2).meetsCriteria, false);
  assert.equal(withFeatures(3).meetsCriteria, true);
  assert.equal(withFeatures(3).featureCount, 3);
});

// THE necessary-not-sufficient rule.
test('every requirement can defeat a met feature count on its own', () => {
  for (const r of REQUIREMENTS) {
    const res = withFeatures(FEATURES.length, { [r.key]: 'no' });
    assert.equal(res.featuresMet, true, r.key);
    assert.equal(res.meetsCriteria, false, `${r.key} must defeat all ten features`);
    assert.deepEqual(res.unmetRequirements, [r.key]);
    assert.match(res.bandText, /necessary and NOT sufficient/);
  }
});

test('the neuroleptic requirement is called out when it is the one that fails', () => {
  const r = withFeatures(5, { noNeurolepticStartedOrIncreased: 'no' });
  assert.equal(r.meetsCriteria, false);
  assert.match(r.bandText, /neuroleptic malignant syndrome is the differential/);
});

// THE disputed eleventh feature.
test('rigidity is not counted toward the ten', () => {
  const r = withFeatures(2, { rigidity: 'yes' });
  assert.equal(r.featureCount, 2, 'rigidity does not add to the count');
  assert.equal(r.meetsCriteria, false);
});

test('rigidity is flagged exactly when counting it would flip the verdict', () => {
  assert.equal(withFeatures(2, { rigidity: 'yes' }).verdictDependsOnDisputedFeature, true);
  assert.equal(withFeatures(1, { rigidity: 'yes' }).verdictDependsOnDisputedFeature, false, 'still short');
  assert.equal(withFeatures(3, { rigidity: 'yes' }).verdictDependsOnDisputedFeature, false, 'already met');
  assert.equal(withFeatures(2, { rigidity: 'no' }).verdictDependsOnDisputedFeature, false);
  assert.match(withFeatures(2, { rigidity: 'yes' }).bandText, /DEPENDS ON WHICH PUBLISHED LIST IS USED/);
});

test('rigidity is not one of the ten', () => {
  assert.equal(FEATURES.some((f) => f.key === DISPUTED_FEATURE), false);
});

// The contested comparison.
test('the successor comparison is reported with the challenge to it', () => {
  const r = withFeatures(3);
  assert.match(r.bandText, new RegExp(`${SENSITIVITY.hunter} percent against Sternbach ${SENSITIVITY.sternbach}`));
  assert.match(r.bandText, /overlapped substantially with its validation data/);
  assert.match(r.bandText, /received wisdom, not a settled finding/);
  assert.equal(SPECIFICITY.hunter > SPECIFICITY.sternbach, true);
});

// The known weakness.
test('the non-specificity of the features is stated in every result', () => {
  assert.match(at().bandText, /febrile gastroenteritis can reach 3 of 10/);
  assert.match(at().bandText, /built around clonus, a specific sign/);
});

// Input handling.
test('every feature and requirement is required, and the message says why', () => {
  assert.equal(sternbach({}).valid, false);
  const r = sternbach({ ...BASE, fever: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /fever/);
  assert.match(r.message, /NOT symptoms, and one of them is a negative/);
});

test('the scope note refuses to rule the diagnosis out or to select treatment', () => {
  const r = at();
  assert.match(r.note, /DOES NOT EXCLUDE SEROTONIN SYNDROME/);
  assert.match(r.note, /does not decide on cyproheptadine/);
  assert.match(r.note, /rather than a reliable way to tell them apart/);
});
