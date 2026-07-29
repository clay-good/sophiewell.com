// spec-v588: the ESHRE Bologna criteria for poor ovarian response.
//
// The load-bearing tests are that the published cutoffs are ranges rather than numbers -- so the same
// patient flips classification across permissible cutoffs -- and that the maximal-stimulation override
// qualifies a patient who meets only one headline criterion.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bolognaPor, ADVANCED_AGE, PREVIOUS_POR_OOCYTES, CRITERIA_REQUIRED, OVERRIDE_EPISODES,
  AFC_CUTOFF_RANGE, AMH_CUTOFF_RANGE,
} from '../../lib/bologna-por-v588.js';

const NONE = {
  age: '32', otherRiskFactor: 'no', previousPorConventional: 'no',
  maximalStimulationPorEpisodes: '0',
  afc: '12', afcCutoff: String(AFC_CUTOFF_RANGE.high),
  amh: '2.5', amhCutoff: String(AMH_CUTOFF_RANGE.high),
};
const at = (over = {}) => bolognaPor({ ...NONE, ...over });

test('the rule is at least two of three', () => {
  assert.equal(CRITERIA_REQUIRED, 2);
  assert.equal(at().criteriaMet, 0);
  assert.equal(at().poorResponder, false);
  assert.equal(at({ age: '41' }).criteriaMet, 1);
  assert.equal(at({ age: '41' }).poorResponder, false, 'one criterion is not enough by the count');
  assert.equal(at({ age: '41', previousPorConventional: 'yes' }).poorResponder, true);
});

// THE choice the source declined to make.
test('the same patient flips classification across the published cutoff range', () => {
  const patient = { afc: '6', age: '41' };   // one other criterion already met
  const strict = at({ ...patient, afcCutoff: String(AFC_CUTOFF_RANGE.low) });   // 6 is normal
  const lenient = at({ ...patient, afcCutoff: String(AFC_CUTOFF_RANGE.high) }); // 6 is abnormal
  assert.equal(strict.ortAbnormalByAfc, false);
  assert.equal(lenient.ortAbnormalByAfc, true);
  assert.equal(strict.poorResponder, false);
  assert.equal(lenient.poorResponder, true, 'the SAME patient, both cutoffs permissible');
});

test('a value inside the published range is flagged as cutoff-sensitive', () => {
  const r = at({ afc: '6' });
  assert.equal(r.cutoffSensitive, true);
  assert.match(r.bandText, /DEPENDS ON A CHOICE THE SOURCE DECLINED TO MAKE/);
  assert.equal(at({ afc: '12' }).cutoffSensitive, false);
  assert.equal(at({ amh: String(AMH_CUTOFF_RANGE.low + 0.1) }).cutoffSensitive, true);
});

test('neither cutoff is defaulted', () => {
  for (const key of ['afcCutoff', 'amhCutoff']) {
    const r = bolognaPor({ ...NONE, [key]: '' });
    assert.equal(r.valid, false, key);
    assert.match(r.message, /IT DOES NOT PICK A NUMBER/);
  }
});

test('a cutoff outside the published range is used but reported as no longer Bologna', () => {
  const r = at({ afcCutoff: '10' });
  assert.equal(r.cutoffsOutsidePublishedRange.length, 1);
  assert.match(r.bandText, /no longer a Bologna cutoff/);
});

// THE override.
test('two maximal-stimulation episodes qualify a patient meeting only one criterion', () => {
  const r = at({ previousPorConventional: 'yes', maximalStimulationPorEpisodes: String(OVERRIDE_EPISODES) });
  assert.equal(r.criteriaMet, 1, 'only the previous-response criterion');
  assert.equal(r.poorResponder, true);
  assert.equal(r.qualifiedByOverride, true);
  assert.match(r.bandText, /qualifies through the OVERRIDE, not the count/);
});

test('the override is blocked when advanced age or an abnormal reserve test is present', () => {
  const r = at({ age: '41', maximalStimulationPorEpisodes: String(OVERRIDE_EPISODES) });
  assert.equal(r.qualifiedByOverride, false);
  assert.equal(r.overrideBlocked, true);
  assert.equal(r.poorResponder, false, 'one criterion, and the override cannot rescue it');
  assert.match(r.bandText, /does NOT apply here/);
});

test('one maximal-stimulation episode does not trigger the override', () => {
  const r = at({ previousPorConventional: 'yes', maximalStimulationPorEpisodes: '1' });
  assert.equal(r.poorResponder, false);
  assert.equal(r.qualifiedByOverride, false);
});

// The open-ended and protocol-conditional criteria.
test('any other risk factor satisfies criterion one at any age', () => {
  const young = at({ age: '25', otherRiskFactor: 'yes' });
  assert.equal(young.criteria.advancedAgeOrRiskFactor, true);
  assert.match(young.bandText, /open-ended clause with no list attached/);
});

test('the age threshold is inclusive', () => {
  assert.equal(at({ age: String(ADVANCED_AGE) }).criteria.advancedAgeOrRiskFactor, true);
  assert.equal(at({ age: String(ADVANCED_AGE - 1) }).criteria.advancedAgeOrRiskFactor, false);
});

test('the protocol condition on the previous-response criterion is stated', () => {
  assert.match(at().bandText, new RegExp(`${PREVIOUS_POR_OOCYTES} or fewer oocytes after a CONVENTIONAL`));
  assert.match(at().bandText, /over-diagnoses poor response/);
});

// Ovarian reserve is a single criterion satisfied by either marker.
test('either marker alone makes the reserve test abnormal', () => {
  assert.equal(at({ afc: '3' }).criteria.abnormalOvarianReserve, true);
  assert.equal(at({ amh: '0.2' }).criteria.abnormalOvarianReserve, true);
  assert.equal(at({ afc: '3', amh: '0.2' }).criteriaMet, 1, 'both markers are still ONE criterion');
});

// Input handling and scope.
test('every field is required', () => {
  assert.equal(bolognaPor({}).valid, false);
  assert.match(bolognaPor({ ...NONE, age: 'x' }).message, /must be a number/);
});

test('the scope note refuses the treatment decision and names the successor', () => {
  const r = at();
  assert.match(r.note, /not a treatment decision/);
  assert.match(r.note, /not a reason to decline treatment or to advise donor oocytes/);
  assert.match(r.note, /POSEIDON classification was proposed/);
});
