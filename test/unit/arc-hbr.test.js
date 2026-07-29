// spec-v594: the ARC-HBR criteria.
//
// The load-bearing tests are that two minor criteria alone qualify a patient, and that the banded variables
// contribute at most one tier each so they cannot be double-counted.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  arcHbr, MAJOR_BOOLEANS, MINOR_BOOLEANS, BLEEDING_OPTIONS, STROKE_OPTIONS,
  MAJOR_REQUIRED, MINOR_REQUIRED, HB_MAJOR_BELOW, HB_MINOR_MAX_MALE, HB_MINOR_MAX_FEMALE,
  EGFR_MAJOR_BELOW, EGFR_MINOR_BELOW, PLATELET_MAJOR_BELOW, AGE_MINOR_AT_LEAST,
  TARGET_BARC_RISK_PERCENT, TARGET_ICH_RISK_PERCENT,
} from '../../lib/arc-hbr-v594.js';

const CLEAN = {
  sex: 'male', age: '60', hemoglobin: '14', egfr: '90', platelets: '250',
  priorBleeding: 'none', priorStroke: 'none',
  ...Object.fromEntries(MAJOR_BOOLEANS.map((m) => [m.key, 'no'])),
  ...Object.fromEntries(MINOR_BOOLEANS.map((m) => [m.key, 'no'])),
};
const at = (over = {}) => arcHbr({ ...CLEAN, ...over });

test('a patient with no criteria is not at high bleeding risk', () => {
  const r = at();
  assert.equal(r.highBleedingRisk, false);
  assert.equal(r.majorCount, 0);
  assert.equal(r.minorCount, 0);
});

// THE combination rule.
test('one major criterion alone qualifies', () => {
  assert.equal(MAJOR_REQUIRED, 1);
  for (const m of MAJOR_BOOLEANS) {
    const r = at({ [m.key]: 'yes' });
    assert.equal(r.highBleedingRisk, true, m.key);
    assert.equal(r.majorCount, 1);
    assert.equal(r.qualifiesOnMinorsAlone, false);
  }
});

test('two minor criteria alone qualify, and one does not', () => {
  assert.equal(MINOR_REQUIRED, 2);
  const one = at({ age: '80' });
  assert.equal(one.minorCount, 1);
  assert.equal(one.highBleedingRisk, false, 'one minor is not enough');

  const two = at({ age: '80', egfr: '45' });
  assert.equal(two.minorCount, 2);
  assert.equal(two.majorCount, 0);
  assert.equal(two.highBleedingRisk, true);
  assert.equal(two.qualifiesOnMinorsAlone, true);
  assert.match(two.bandText, /QUALIFIES ON MINOR CRITERIA ALONE/);
});

test('the misquoted rule is called out on exactly the patients it would miss', () => {
  const minorsOnly = at({ age: '80', egfr: '45' });
  assert.match(minorsOnly.bandText, /summarizes the rule as "at least one major criterion"/);
  assert.equal(/QUALIFIES ON MINOR CRITERIA ALONE/.test(at({ longTermOac: 'yes' }).bandText), false);
});

// THE banding.
test('a banded variable contributes at most one tier', () => {
  const majorHb = at({ hemoglobin: '10' });
  assert.equal(majorHb.hemoglobinTier, 'major');
  assert.deepEqual(majorHb.majorCriteriaMet, ['hemoglobin']);
  assert.equal(majorHb.minorCriteriaMet.includes('hemoglobin'), false, 'never both');

  const minorHb = at({ hemoglobin: '12' });
  assert.equal(minorHb.hemoglobinTier, 'minor');
  assert.deepEqual(minorHb.minorCriteriaMet, ['hemoglobin']);
  assert.equal(minorHb.majorCriteriaMet.includes('hemoglobin'), false);
});

test('the eGFR bands sit where the source puts them', () => {
  assert.equal(at({ egfr: String(EGFR_MAJOR_BELOW - 1) }).egfrTier, 'major');
  assert.equal(at({ egfr: String(EGFR_MAJOR_BELOW) }).egfrTier, 'minor');
  assert.equal(at({ egfr: String(EGFR_MINOR_BELOW - 1) }).egfrTier, 'minor');
  assert.equal(at({ egfr: String(EGFR_MINOR_BELOW) }).egfrTier, null);
});

test('prior bleeding and prior stroke are single banded inputs, not two criteria each', () => {
  const majorBleed = at({ priorBleeding: 'within-6-months-or-recurrent' });
  assert.deepEqual(majorBleed.majorCriteriaMet, ['priorBleeding']);
  assert.equal(majorBleed.minorCriteriaMet.length, 0);

  const minorBleed = at({ priorBleeding: 'six-to-twelve-months' });
  assert.deepEqual(minorBleed.minorCriteriaMet, ['priorBleeding']);
  assert.equal(minorBleed.majorCriteriaMet.length, 0);

  assert.deepEqual(at({ priorStroke: 'moderate-severe-within-6-months' }).majorCriteriaMet, ['priorStroke']);
  assert.deepEqual(at({ priorStroke: 'other-ischemic-any-time' }).minorCriteriaMet, ['priorStroke']);
});

test('the banding explanation appears in every result', () => {
  assert.match(at().bandText, /the same patient cannot be both/);
  assert.match(at().bandText, /makes the usual double-counting impossible/);
});

// THE sex asymmetry.
test('the anemia minor band is sex-split and the major band is not', () => {
  assert.equal(at({ sex: 'male', hemoglobin: '10.5' }).hemoglobinTier, 'major');
  assert.equal(at({ sex: 'female', hemoglobin: '10.5' }).hemoglobinTier, 'major', 'major is sex-neutral');
  assert.equal(at({ sex: 'male', hemoglobin: '12' }).hemoglobinTier, 'minor');
  assert.equal(at({ sex: 'female', hemoglobin: '12' }).hemoglobinTier, null, 'above the female minor band');
  assert.equal(at({ sex: 'female', hemoglobin: String(HB_MINOR_MAX_FEMALE) }).hemoglobinTier, 'minor');
  assert.equal(at({ sex: 'male', hemoglobin: String(HB_MINOR_MAX_MALE) }).hemoglobinTier, 'minor');
  assert.ok(HB_MINOR_MAX_MALE > HB_MINOR_MAX_FEMALE);
});

test('the major anemia threshold is the published one', () => {
  assert.equal(HB_MAJOR_BELOW, 11);
  assert.equal(at({ hemoglobin: String(HB_MAJOR_BELOW) }).hemoglobinTier, 'minor', 'exactly 11 is not major');
});

// Remaining thresholds.
test('the platelet and age thresholds are the published ones', () => {
  assert.equal(at({ platelets: String(PLATELET_MAJOR_BELOW - 1) }).majorCriteriaMet.includes('platelets'), true);
  assert.equal(at({ platelets: String(PLATELET_MAJOR_BELOW) }).majorCriteriaMet.includes('platelets'), false);
  assert.equal(at({ age: String(AGE_MINOR_AT_LEAST) }).minorCriteriaMet.includes('age'), true);
  assert.equal(at({ age: String(AGE_MINOR_AT_LEAST - 1) }).minorCriteriaMet.includes('age'), false);
});

test('the intracranial haemorrhage criteria carry different windows', () => {
  const spontaneous = MAJOR_BOOLEANS.find((m) => m.key === 'spontaneousIchEver');
  const traumatic = MAJOR_BOOLEANS.find((m) => m.key === 'traumaticIch12Months');
  assert.match(spontaneous.text, /AT ANY TIME/);
  assert.match(traumatic.text, /within 12 months/);
  assert.match(at().bandText, /Six different timing windows/);
});

// Definition, not score.
test('the absolute-risk target is reported and the counts are called provenance', () => {
  const r = at();
  assert.equal(TARGET_BARC_RISK_PERCENT, 4);
  assert.equal(TARGET_ICH_RISK_PERCENT, 1);
  assert.match(r.bandText, /DEFINITION, not a score/);
  assert.match(r.bandText, /provenance for the verdict, not a severity measure/);
});

// Input handling and scope.
test('every item is required and the message states the rule', () => {
  assert.equal(arcHbr({}).valid, false);
  const r = arcHbr({ ...CLEAN, egfr: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /egfr/);
  assert.match(r.message, /MAJOR criterion OR/);
  assert.match(arcHbr({ ...CLEAN, sex: 'other' }).message, /male or female/);
});

test('the scope note refuses the therapy decision and names the ischemic counterweight', () => {
  const r = at();
  assert.match(r.note, /does not weigh it against ISCHEMIC risk/);
  assert.match(r.note, /not an instruction to shorten dual antiplatelet therapy/);
  assert.match(r.note, /does not predict bleeding in an individual/);
});
