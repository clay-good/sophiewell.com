import test from 'node:test';
import assert from 'node:assert/strict';
import { measlesCaseDefinition as m, CLINICAL_CRITERIA, LABORATORY_EVIDENCE } from '../../lib/measles-case-def-v872.js';

const clinicalAll = { fever101: true, rashThreeDays: true, cccSymptom: true };

test('measles-case-def: the published component lists', () => {
  assert.deepEqual(CLINICAL_CRITERIA.map((i) => i.key), ['fever101', 'rashThreeDays', 'cccSymptom']);
  assert.deepEqual(LABORATORY_EVIDENCE.map((i) => i.key), ['virusDetected', 'igmPositive', 'iggSeroconversion']);
});

test('measles-case-def: suspect is any febrile rash illness, and nothing more', () => {
  const r = m({ febrileRashIllness: true });
  assert.equal(r.classification, 'suspect');
  assert.equal(r.abnormal, true);
  assert.match(r.rashDurationNote, /cannot yet meet them/);
  // The isolation sentence is the reason the tile exists, so it prints everywhere.
  for (const input of [{}, { febrileRashIllness: true }, { ...clinicalAll, virusDetected: true }]) {
    assert.match(m(input).isolationNote, /start on suspicion, not on classification/);
  }
});

test('measles-case-def: all three clinical criteria are needed for probable', () => {
  assert.equal(m(clinicalAll).classification, 'probable');
  for (const i of CLINICAL_CRITERIA) {
    const short = { ...clinicalAll, [i.key]: false };
    assert.notEqual(m(short).classification, 'probable', i.key);
  }
});

test('measles-case-def: any one laboratory result confirms, and so does an epidemiologic link', () => {
  for (const i of LABORATORY_EVIDENCE) {
    assert.equal(m({ fever101: true, rashThreeDays: true, [i.key]: true }).classification, 'confirmed', i.key);
  }
  assert.equal(m({ febrileRashIllness: true, epiLink: true }).classification, 'confirmed');
  // Confirmed asks only for an acute febrile rash illness, not the full clinical set.
  const r = m({ febrileRashIllness: true, virusDetected: true });
  assert.equal(r.classification, 'confirmed');
  assert.equal(r.clinical, false);
});

test('measles-case-def: a more likely diagnosis defeats the clinical route but not the laboratory one', () => {
  const r = m({ ...clinicalAll, moreLikelyDiagnosis: true });
  assert.notEqual(r.classification, 'probable');
  assert.match(r.moreLikelyNote, /begin by excluding one/);
  assert.equal(m({ ...clinicalAll, moreLikelyDiagnosis: true, virusDetected: true }).classification, 'confirmed');
});

test('measles-case-def: a vaccine-strain rash is not a case, and outranks everything', () => {
  const r = m({ ...clinicalAll, igmPositive: true, epiLink: true, vaccineStrainRash: true });
  assert.equal(r.classification, 'vaccine-reaction');
  assert.equal(r.abnormal, false);
  // But a vaccination history on its own is never what that means.
  assert.match(m({}).vaccineNote, /Vaccination does not exclude measles/);
  assert.match(m({}).vaccineNote, /a vaccination history on its own is not that/);
});

test('measles-case-def: the two IgM failure modes point in opposite directions', () => {
  // Drawn too early: printed whenever no positive IgM is recorded.
  assert.match(m(clinicalAll).igmEarlyNote, /first seventy-two hours after rash onset does not exclude/);
  assert.equal(m({ ...clinicalAll, igmPositive: true }).igmEarlyNote, null);
  // Poor positive predictive value: only when the IgM is standing alone.
  assert.match(m({ ...clinicalAll, igmPositive: true }).igmPpvNote, /not conclusive in a low-prevalence setting/);
  assert.equal(m({ ...clinicalAll, igmPositive: true, virusDetected: true }).igmPpvNote, null);
  assert.equal(m({ ...clinicalAll, igmPositive: true, epiLink: true }).igmPpvNote, null);
});

test('measles-case-def: nothing entered meets no tier', () => {
  const r = m({});
  assert.equal(r.classification, 'not-met');
  assert.equal(r.abnormal, false);
  assert.match(r.scopeNote, /does not decide isolation or reporting/);
});

test('measles-case-def: the documented example', () => {
  const r = m({ febrileRashIllness: true, ...clinicalAll });
  assert.equal(r.classification, 'probable');
  assert.equal(r.recordedNote, 'Recorded: 3 of 3 clinical criteria, 0 laboratory results, and no epidemiologic link.');
});
