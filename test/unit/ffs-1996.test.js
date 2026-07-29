// spec-v590: the original 1996 Five-Factor Score.
//
// The load-bearing tests are that only one factor is shared with the 2011 revision, that the renal
// threshold window is detected, and that the five-year mortality is always null.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ffs1996, FACTORS, FFS_MAX, CREATININE_THRESHOLD_UMOL, CREATININE_THRESHOLD_MGDL,
  REVISION_CREATININE_UMOL, REVISION_ONLY_FACTORS, OUT_OF_DERIVATION, DERIVED_DISEASES,
} from '../../lib/ffs-1996-v590.js';

const NONE = Object.fromEntries(FACTORS.map((f) => [f.key, 'no']));
const at = (over = {}) => ffs1996({ ...NONE, ...over });

test('there are five factors each worth one point', () => {
  assert.equal(FACTORS.length, FFS_MAX);
  assert.equal(at().total, 0);
  assert.equal(ffs1996(Object.fromEntries(FACTORS.map((f) => [f.key, 'yes']))).total, FFS_MAX);
});

test('the bands are 0, 1, and 2 or more', () => {
  assert.equal(at().band, 'FFS 0');
  assert.equal(at({ cns: 'yes' }).band, 'FFS 1');
  assert.equal(at({ cns: 'yes', cardiomyopathy: 'yes' }).band, 'FFS 2 or more');
  assert.equal(at({ cns: 'yes', cardiomyopathy: 'yes', gastrointestinal: 'yes' }).band, 'FFS 2 or more');
});

// THE overlap.
test('exactly one factor survived unchanged into the revision', () => {
  const unchanged = FACTORS.filter((f) => /ONLY FACTOR THAT SURVIVED UNCHANGED/.test(f.fate));
  assert.equal(unchanged.length, 1);
  assert.equal(unchanged[0].key, 'gastrointestinal');
});

test('two factors were dropped by the revision', () => {
  const dropped = FACTORS.filter((f) => /DROPPED/.test(f.fate)).map((f) => f.key);
  assert.deepEqual(dropped.sort(), ['cns', 'proteinuria']);
});

test('the revision added factors that do not exist here', () => {
  assert.equal(REVISION_ONLY_FACTORS.length, 2);
  assert.equal(FACTORS.some((f) => /\bage\b/i.test(f.text)), false, 'no age factor in 1996');
  assert.equal(FACTORS.some((f) => /absence/i.test(f.text)), false, 'no absence factor in 1996');
  assert.match(at().bandText, /every factor here counts something being PRESENT/);
});

test('the shared name and range are flagged as not meaning the same thing', () => {
  assert.match(at().bandText, /An identical number from the two scores does not mean the same thing/);
});

// THE crossover window.
test('the ten micromol window where the two scores disagree is detected', () => {
  assert.equal(REVISION_CREATININE_UMOL - CREATININE_THRESHOLD_UMOL, 10);
  const inside = at({ creatinineUmol: '145' });
  assert.equal(inside.renalThresholdCrossover, true);
  assert.match(inside.bandText, /does NOT score on the revision/);
});

test('the window is exclusive at both ends', () => {
  assert.equal(at({ creatinineUmol: String(CREATININE_THRESHOLD_UMOL) }).renalThresholdCrossover, false);
  assert.equal(at({ creatinineUmol: String(CREATININE_THRESHOLD_UMOL + 1) }).renalThresholdCrossover, true);
  assert.equal(at({ creatinineUmol: String(REVISION_CREATININE_UMOL) }).renalThresholdCrossover, false);
});

test('the creatinine is optional and does not itself score', () => {
  const r = at({ creatinineUmol: '400' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0, 'the renal factor is answered separately');
});

test('the millimolar and mass-unit thresholds are the published pair', () => {
  assert.equal(CREATININE_THRESHOLD_UMOL, 140);
  assert.equal(CREATININE_THRESHOLD_MGDL, 1.58);
});

// THE withheld number.
test('the five-year mortality is always null and the reason is given', () => {
  for (const n of [0, 1, 2, 3]) {
    const keys = FACTORS.slice(0, n).map((f) => f.key);
    const r = at(Object.fromEntries(keys.map((k) => [k, 'yes'])));
    assert.equal(r.fiveYearMortalityPercent, null, `score ${n}`);
  }
  assert.match(at().bandText, /could not be confirmed from two independent sources/);
  assert.match(at().bandText, /attach one cohort/);
});

// The derivation cohort.
test('granulomatosis with polyangiitis is marked as outside the derivation', () => {
  const r = at({ disease: 'granulomatosis-with-polyangiitis' });
  assert.equal(r.outsideDerivationCohort, true);
  assert.match(r.bandText, /outside the setting in which the 1996 score was validated/);
  assert.equal(DERIVED_DISEASES.includes(OUT_OF_DERIVATION), false);
});

test('the derived diseases are not flagged', () => {
  for (const d of ['polyarteritis-nodosa', 'egpa', 'microscopic-polyangiitis']) {
    assert.equal(at({ disease: d }).outsideDerivationCohort, false, d);
  }
  assert.equal(at().outsideDerivationCohort, false, 'omitted is not flagged');
});

// Input handling and scope.
test('every factor is required', () => {
  assert.equal(ffs1996({}).valid, false);
  assert.match(ffs1996({ ...NONE, cns: '' }).message, /cns/);
});

test('the scope note separates prognosis from diagnosis, classification and activity', () => {
  const r = at();
  assert.match(r.note, /does not diagnose vasculitis/);
  assert.match(r.note, /does not measure disease activity/);
  assert.match(r.note, /score of 0 is not a reason to withhold treatment/);
});
