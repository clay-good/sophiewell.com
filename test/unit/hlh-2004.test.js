// spec-v582: the HLH-2004 diagnostic criteria.
//
// The load-bearing tests are the molecular bypass, the malignancy bullet that is not a criterion, and the
// separation of "pending" from "not met".

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hlh2004, CRITERIA_REQUIRED, CRITERIA_TOTAL, HB_THRESHOLD, HB_THRESHOLD_INFANT,
  PLT_THRESHOLD, ANC_THRESHOLD, TRIG_THRESHOLD, FIBRINOGEN_THRESHOLD,
  FERRITIN_THRESHOLD, SCD25_THRESHOLD,
} from '../../lib/hlh-2004-v582.js';

// Nothing met: normal everything.
const NONE = {
  molecularDiagnosis: 'no', fever: 'no', splenomegaly: 'no', hemophagocytosis: 'no',
  infantUnder4Weeks: 'no', hemoglobin: '14', platelets: '300', neutrophils: '5',
  triglycerides: '100', fibrinogen: '400', nkCellActivity: 'no',
  ferritin: '100', scd25: '100', scd25Status: 'resulted', noEvidenceOfMalignancy: 'yes',
};
const at = (over = {}) => hlh2004({ ...NONE, ...over });

test('the requirement is five of eight', () => {
  assert.equal(CRITERIA_REQUIRED, 5);
  assert.equal(CRITERIA_TOTAL, 8);
});

test('a patient meeting nothing does not meet the criteria', () => {
  const r = at();
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.meetsGuideline, false);
  assert.equal(r.band, 'Does not meet HLH-2004');
  assert.match(r.bandText, /does not exclude HLH/);
});

// THE molecular bypass.
test('a molecular diagnosis establishes HLH with zero criteria', () => {
  const r = at({ molecularDiagnosis: 'yes' });
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.molecularPathMet, true);
  assert.equal(r.criteriaPathMet, false);
  assert.equal(r.meetsGuideline, true);
  assert.equal(r.band, 'Meets HLH-2004 by the molecular path');
  assert.match(r.bandText, /ESTABLISHES the diagnosis ON ITS OWN/);
});

test('the molecular question is required and says why', () => {
  const r = hlh2004({ ...NONE, molecularDiagnosis: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /ALTERNATIVE PATH/);
});

// THE ninth bullet.
test('the malignancy answer does not change the criteria count', () => {
  const met = { fever: 'yes', splenomegaly: 'yes', hemophagocytosis: 'yes', ferritin: '900', scd25: '5000' };
  const clean = at({ ...met, noEvidenceOfMalignancy: 'yes' });
  const dirty = at({ ...met, noEvidenceOfMalignancy: 'no' });
  assert.equal(clean.criteriaMet, 5);
  assert.equal(dirty.criteriaMet, 5, 'the malignancy bullet is NOT a ninth criterion');
  assert.equal(clean.meetsGuideline, true);
  assert.equal(dirty.meetsGuideline, true);
  assert.match(dirty.bandText, /does not rule the diagnosis out/);
});

test('the malignancy bullet is explained as not counted in every result', () => {
  assert.match(at().bandText, /NOT one of the eight criteria/);
});

test('the maximum reachable count is eight, not nine', () => {
  const r = at({
    fever: 'yes', splenomegaly: 'yes', hemophagocytosis: 'yes', nkCellActivity: 'yes',
    hemoglobin: '5', platelets: '10', neutrophils: '0.2',
    triglycerides: '900', fibrinogen: '50', ferritin: '9000', scd25: '9000',
  });
  assert.equal(r.criteriaMet, CRITERIA_TOTAL);
});

// THE pending distinction.
test('pending send-out assays leave the diagnosis undecided, not negative', () => {
  const r = at({
    fever: 'yes', splenomegaly: 'yes', hemophagocytosis: 'yes', ferritin: '900',
    nkCellActivity: 'pending', scd25Status: 'pending',
  });
  assert.equal(r.criteriaMet, 4);
  assert.deepEqual(r.pendingCriteria, ['nkCellActivity', 'scd25']);
  assert.equal(r.meetsGuideline, false);
  assert.equal(r.undecided, true);
  assert.equal(r.band, 'Not yet decided - results pending');
  assert.match(r.bandText, /NOT a negative result/);
  assert.match(r.bandText, /rapidly fatal/);
});

test('pending is not treated as met either', () => {
  const r = at({ nkCellActivity: 'pending', scd25Status: 'pending' });
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.meetsGuideline, false);
});

test('too few criteria are reachable even with everything pending, so it is decided', () => {
  const r = at({ nkCellActivity: 'pending' });
  assert.equal(r.undecided, false, '1 reachable cannot reach 5');
  assert.equal(r.band, 'Does not meet HLH-2004');
});

// Compound criterion 1: cytopenias.
test('cytopenias are one criterion requiring two of three lineages', () => {
  const one = at({ hemoglobin: '8' });
  assert.equal(one.criteriaMet, 0, 'one low lineage is not the criterion');
  const two = at({ hemoglobin: '8', platelets: '50' });
  assert.equal(two.criteriaMet, 1);
  const three = at({ hemoglobin: '8', platelets: '50', neutrophils: '0.5' });
  assert.equal(three.criteriaMet, 1, 'three low lineages are still ONE criterion');
});

test('the lineage thresholds are the published ones', () => {
  assert.equal(at({ hemoglobin: String(HB_THRESHOLD), platelets: '50' }).criteriaMet, 0);
  assert.equal(at({ hemoglobin: String(HB_THRESHOLD - 0.1), platelets: '50' }).criteriaMet, 1);
  assert.equal(at({ platelets: String(PLT_THRESHOLD), neutrophils: '0.5' }).criteriaMet, 0);
  assert.equal(at({ platelets: String(PLT_THRESHOLD - 1), neutrophils: '0.5' }).criteriaMet, 1);
  assert.equal(at({ neutrophils: String(ANC_THRESHOLD), hemoglobin: '8' }).criteriaMet, 0);
});

test('infants under 4 weeks get the higher hemoglobin threshold', () => {
  const hb = String((HB_THRESHOLD + HB_THRESHOLD_INFANT) / 2); // 9.5: low only for the infant
  assert.equal(at({ hemoglobin: hb, platelets: '50' }).criteriaMet, 0);
  const infant = at({ hemoglobin: hb, platelets: '50', infantUnder4Weeks: 'yes' });
  assert.equal(infant.criteriaMet, 1);
  assert.equal(infant.infantHemoglobinThresholdApplied, true);
  assert.match(infant.bandText, /infant hemoglobin threshold/);
});

// Compound criterion 2: the OR.
test('triglycerides and fibrinogen share one criterion satisfied by either', () => {
  assert.equal(at({ triglycerides: String(TRIG_THRESHOLD) }).criteriaMet, 1);
  assert.equal(at({ fibrinogen: String(FIBRINOGEN_THRESHOLD) }).criteriaMet, 1);
  assert.equal(at({ triglycerides: '900', fibrinogen: '50' }).criteriaMet, 1, 'both is still one');
  assert.equal(at({ triglycerides: String(TRIG_THRESHOLD - 1), fibrinogen: String(FIBRINOGEN_THRESHOLD + 1) }).criteriaMet, 0);
});

test('one pending half of the OR does not block a criterion the other half already meets', () => {
  const r = at({ triglycerides: '900', fibrinogen: 'pending' });
  assert.equal(r.criteriaMet, 1);
  assert.deepEqual(r.pendingCriteria, []);
});

// The remaining thresholds.
test('ferritin and sCD25 use at-or-above thresholds', () => {
  assert.equal(at({ ferritin: String(FERRITIN_THRESHOLD) }).criteriaMet, 1);
  assert.equal(at({ ferritin: String(FERRITIN_THRESHOLD - 1) }).criteriaMet, 0);
  assert.equal(at({ scd25: String(SCD25_THRESHOLD) }).criteriaMet, 1);
  assert.equal(at({ scd25: String(SCD25_THRESHOLD - 1) }).criteriaMet, 0);
});


test('the sCD25 status control is what makes that criterion pending, not a magic number', () => {
  const r = at({ scd25Status: 'pending', scd25: '99999' });
  assert.deepEqual(r.pendingCriteria, ['scd25'], 'the number is ignored when the assay has not returned');
  assert.equal(r.criteriaMet, 0);
});

// Sourcing.
test('the absence of a published fever threshold is stated, not filled in', () => {
  assert.match(at().bandText, /NO temperature threshold/);
  assert.match(at().note, /38\.5 degrees C figure in many secondary tables is not in the source/);
});

test('NK-cell activity is deferred to the local laboratory', () => {
  assert.match(at().bandText, /according to local laboratory reference/);
});

// Input handling.
test('unanswered criteria are refused and the pending option is offered', () => {
  const r = hlh2004({ ...NONE, ferritin: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /ferritin/);
  assert.match(r.message, /pending is not the same as not met/);
});

test('the scope note separates the criteria from the treatment and from the HScore', () => {
  const r = at();
  assert.match(r.note, /not an instruction to start etoposide and dexamethasone/);
  assert.match(r.note, /do not identify the trigger/);
  assert.match(r.note, /Distinct from the HScore/);
});
