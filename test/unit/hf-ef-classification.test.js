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
