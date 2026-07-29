// spec-v601: the Pollock-Flickinger radiosurgery-based AVM score.
//
// The load-bearing tests are that the modification shifts the score by exactly the location coefficient for
// every site except frontal and temporal, and that intraventricular has no modified tier at all.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pollockFlickinger, SITES, OUTCOME_BANDS,
  VOLUME_COEFFICIENT, AGE_COEFFICIENT, LOCATION_COEFFICIENT, DIVERGENT_LOCATION_COEFFICIENT,
} from '../../lib/pollock-flickinger-v601.js';

const at = (volume, age, site) => pollockFlickinger({ volume, age, site });

test('the coefficients are the published ones and are shared by both versions', () => {
  assert.equal(VOLUME_COEFFICIENT, 0.1);
  assert.equal(AGE_COEFFICIENT, 0.02);
  assert.equal(LOCATION_COEFFICIENT, 0.3);
  assert.notEqual(LOCATION_COEFFICIENT, DIVERGENT_LOCATION_COEFFICIENT);
  // A frontal AVM has location tier 0 in both, so the score is the bare base.
  const r = at(5, 40, 'frontal');
  assert.equal(r.original, Number((0.1 * 5 + 0.02 * 40).toFixed(2)));
  assert.equal(r.modified, r.original);
});

// THE constant shift.
test('the modified score is exactly the location coefficient lower for every site except frontal and temporal', () => {
  for (const s of SITES) {
    if (s.modifiedTier === null) continue;
    const r = at(5, 40, s.value);
    const expected = ['frontal', 'temporal'].includes(s.value) ? 0 : LOCATION_COEFFICIENT;
    assert.equal(r.difference, expected, s.value);
  }
});

test('frontal and temporal are the only unchanged sites', () => {
  const unchanged = SITES.filter((s) => s.modifiedTier !== null && s.originalTier === s.modifiedTier)
    .map((s) => s.value);
  assert.deepEqual(unchanged.sort(), ['frontal', 'temporal']);
});

test('the two ladders drop each site by exactly one tier where they differ', () => {
  for (const s of SITES) {
    if (s.modifiedTier === null) continue;
    assert.ok(s.originalTier - s.modifiedTier <= 1, s.value);
  }
  assert.equal(SITES.find((s) => s.value === 'parietal').originalTier, 1);
  assert.equal(SITES.find((s) => s.value === 'parietal').modifiedTier, 0);
  assert.equal(SITES.find((s) => s.value === 'basal-ganglia').originalTier, 2);
  assert.equal(SITES.find((s) => s.value === 'basal-ganglia').modifiedTier, 1);
});

// THE band crossing.
test('the constant shift can move a patient a whole outcome band', () => {
  const r = at(8, 40, 'basal-ganglia');
  assert.equal(r.original, 2.2);
  assert.equal(r.modified, 1.9);
  assert.equal(r.bandChanged, true);
  assert.equal(r.originalBand, '2.00 or more');
  assert.equal(r.modifiedBand, '1.51 to 2.00');
  assert.match(r.bandText, /DIFFERENT OUTCOME BANDS/);
  assert.match(r.bandText, /46 percent against 64 percent/);
});

test('a site that does not shift cannot change band', () => {
  assert.equal(at(8, 40, 'frontal').bandChanged, false);
});

// THE source hole.
test('intraventricular has no modified tier and no modified score', () => {
  const r = at(5, 40, 'intraventricular');
  assert.equal(r.modifiedAvailable, false);
  assert.equal(r.modified, null);
  assert.equal(r.difference, null);
  assert.equal(r.modifiedBand, null);
  assert.match(r.bandText, /CANNOT BE COMPUTED for this site/);
  assert.match(r.bandText, /reported rather than filled by analogy/);
});

test('intraventricular is the only site with that hole, and it exists in the original', () => {
  const holes = SITES.filter((s) => s.modifiedTier === null).map((s) => s.value);
  assert.deepEqual(holes, ['intraventricular']);
  assert.equal(SITES.find((s) => s.value === 'intraventricular').originalTier, 1);
});

// Outcome bands and their overlap.
test('the outcome bands are the published ones', () => {
  assert.deepEqual(OUTCOME_BANDS.map((b) => b.obliterationWithoutDeficit), [89, 70, 64, 46]);
  assert.deepEqual(OUTCOME_BANDS.map((b) => b.mrsDecline), [0, 13, 20, 36]);
  assert.equal(at(1, 40, 'frontal').obliterationWithoutDeficitPercent, 89);
});

test('the overlap at exactly 2.00 is flagged and resolved upward', () => {
  const r = at(12, 40, 'frontal');   // 1.2 + 0.8 = 2.0
  assert.equal(r.modified, 2);
  assert.equal(r.atOverlapBoundary, true);
  assert.equal(r.modifiedBand, '1.51 to 2.00');
  assert.match(r.bandText, /OVERLAP at exactly 2\.00/);
});

// It is continuous.
test('the score is continuous with no maximum', () => {
  assert.equal('max' in at(5, 40, 'frontal'), false);
  assert.ok(at(100, 80, 'brainstem').original > 10, 'unbounded');
  assert.match(at(5, 40, 'frontal').bandText, /CONTINUOUS score, not a grade/);
});

// The disclosed divergence.
test('the divergent coefficient rendering is named and not applied', () => {
  assert.match(at(5, 40, 'frontal').bandText, new RegExp(`states the modified coefficient as ${DIVERGENT_LOCATION_COEFFICIENT}`));
  assert.match(at(5, 40, 'frontal').bandText, /both primary abstracts state 0\.3/i);
});

// Input handling and scope.
test('the inputs are validated', () => {
  assert.equal(pollockFlickinger({}).valid, false);
  assert.match(pollockFlickinger({}).message, /scored differently by the two versions/);
  assert.match(at(5, 40, 'pons').message, /Site must be one of/);
});

test('the scope note refuses the modality choice and names ARUBA', () => {
  const r = at(5, 40, 'frontal');
  assert.match(r.note, /does not choose between radiosurgery, microsurgery, embolization and observation/);
  assert.match(r.note, /ARUBA trial/);
  assert.match(r.note, /not by itself an indication to treat/);
});
