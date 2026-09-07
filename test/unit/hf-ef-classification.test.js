import test from 'node:test';
import assert from 'node:assert/strict';
import { hfEfClassification as hf, HFREF_MAX, HFPEF_MIN, IMPROVEMENT_POINTS } from '../../lib/hf-ef-classification-v840.js';

const S = { symptomaticHeartFailure: true };

test('hf: the three threshold categories', () => {
  assert.equal(hf({ ...S, currentLvef: 30 }).category, 'HFrEF');
  assert.equal(hf({ ...S, currentLvef: 40 }).category, 'HFrEF');
  assert.equal(hf({ ...S, currentLvef: 41 }).category, 'HFmrEF');
  assert.equal(hf({ ...S, currentLvef: 49 }).category, 'HFmrEF');
  assert.equal(hf({ ...S, currentLvef: 50 }).category, 'HFpEF');
  assert.equal(HFREF_MAX, 40);
  assert.equal(HFPEF_MIN, 50);
});

test('hf: HFimpEF needs ALL THREE conditions', () => {
  assert.equal(IMPROVEMENT_POINTS, 10);
  // Baseline 30 to 45: baseline low, 15-point rise, now above 40.
  assert.equal(hf({ ...S, currentLvef: 45, baselineLvef: 30 }).category, 'HFimpEF');
  // A baseline above 40 disqualifies it however big the rise.
  assert.equal(hf({ ...S, currentLvef: 60, baselineLvef: 45 }).category, 'HFpEF');
  // Still at or below 40 now, however big the rise.
  assert.equal(hf({ ...S, currentLvef: 40, baselineLvef: 25 }).category, 'HFrEF');
});

test('hf: crossing 40 without a 10-point rise is NOT HFimpEF', () => {
  // The simplification that gets this wrong.
  const r = hf({ ...S, currentLvef: 42, baselineLvef: 38 });
  assert.equal(r.category, 'HFmrEF');
  assert.ok(r.improvedNote.includes('4-point increase'));
  assert.ok(r.improvedNote.includes('all three conditions'));
  // Exactly 10 points does qualify.
  assert.equal(hf({ ...S, currentLvef: 48, baselineLvef: 38 }).category, 'HFimpEF');
  assert.equal(hf({ ...S, currentLvef: 47, baselineLvef: 38 }).category, 'HFmrEF');
});

test('hf: a single measurement cannot distinguish HFmrEF from HFimpEF', () => {
  const noBaseline = hf({ ...S, currentLvef: 45 });
  assert.equal(noBaseline.category, 'HFmrEF');
  assert.ok(noBaseline.singleMeasurementNote.includes('cannot settle this'));
  // The same number with a baseline is a different category.
  assert.equal(hf({ ...S, currentLvef: 45, baselineLvef: 30 }).category, 'HFimpEF');
  assert.equal(hf({ ...S, currentLvef: 45, baselineLvef: 30 }).singleMeasurementNote, null);
});

test('hf: HFimpEF is reported as NOT recovered', () => {
  const r = hf({ ...S, currentLvef: 45, baselineLvef: 30 });
  assert.ok(r.recoveredNote.includes('not recovered heart failure'));
  assert.ok(r.recoveredNote.includes('not a reason to stop treatment'));
  assert.equal(hf({ ...S, currentLvef: 45 }).recoveredNote, null);
});

test('hf: an ejection fraction alone classifies nothing', () => {
  const r = hf({ currentLvef: 30 });
  assert.equal(r.category, null);
  assert.ok(r.symptomNote.includes('requires symptomatic heart failure'));
  assert.ok(r.band.includes('requires symptomatic heart failure'));
});

test('hf: empty and out-of-range input', () => {
  const empty = hf({});
  assert.equal(empty.valid, true);
  assert.equal(empty.category, null);
  assert.equal(empty.symptomNote, null);
  assert.equal(hf({ currentLvef: 101 }).valid, false);
  assert.equal(hf({ baselineLvef: -1 }).valid, false);
  assert.equal(hf({ currentLvef: 1e308 }).valid, false);
  assert.equal(hf().valid, true);
  assert.doesNotMatch(JSON.stringify(hf({ ...S, currentLvef: 45, baselineLvef: 30 })), /NaN|Infinity/);
});

// spec-v1101: the single-measurement caveat fired for HFmrEF only.
//
// HFimpEF needs the current measurement merely to be ABOVE 40, which is the
// whole preserved range too -- so a baseline of 30 rising to 55 is HFimpEF, and
// with the baseline left out the tile called it HFpEF and said nothing, while
// the identical gap one band down was already spelled out.
//
// The file's own header says a tool classifying from a single ejection fraction
// "will silently call these patients HFmrEF". It silently called them HFpEF too.
test('spec-v1101: the missing baseline is named in every band that could be HFimpEF', () => {
  const mildly = hf({ currentLvef: 45, symptomaticHeartFailure: true });
  assert.equal(mildly.category, 'HFmrEF');
  assert.match(mildly.singleMeasurementNote, /With no baseline measurement this is HFmrEF/);

  const preserved = hf({ currentLvef: 55, symptomaticHeartFailure: true });
  assert.equal(preserved.category, 'HFpEF');
  assert.match(preserved.singleMeasurementNote, /With no baseline measurement this is HFpEF/,
    'the preserved range can be HFimpEF too, and was silent');
  assert.match(preserved.singleMeasurementNote, /would be HFimpEF/);

  // The trajectory the caveat exists for.
  assert.equal(hf({ currentLvef: 55, baselineLvef: 30, symptomaticHeartFailure: true }).category, 'HFimpEF');

  // A current measurement at or below 40 cannot be HFimpEF whatever the
  // baseline, so there is nothing to disclose.
  const reduced = hf({ currentLvef: 30, symptomaticHeartFailure: true });
  assert.equal(reduced.category, 'HFrEF');
  assert.equal(reduced.singleMeasurementNote, null);

  // With a baseline there is no gap.
  assert.equal(hf({ currentLvef: 55, baselineLvef: 52, symptomaticHeartFailure: true }).singleMeasurementNote, null);

  // The wording is built from `category` and the constants, so a later band
  // cannot fall out of it the way the preserved one did.
  assert.match(preserved.singleMeasurementNote, new RegExp(`at or below ${HFREF_MAX} percent`));
  assert.match(preserved.singleMeasurementNote, new RegExp(`at least ${IMPROVEMENT_POINTS} points`));
});
