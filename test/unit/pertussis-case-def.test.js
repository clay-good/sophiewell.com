import test from 'node:test';
import assert from 'node:assert/strict';
import { pertussisCaseDefinition as p, SYMPTOMS, LAB_RESULTS } from '../../lib/pertussis-case-def-v868.js';

const clinical = { age: 'older', coughWeeks: 3, paroxysms: true };

test('pertussis-case-def: the four accepted signs and the three lab options', () => {
  assert.deepEqual(SYMPTOMS.map((s) => s.key), ['paroxysms', 'whoop', 'postTussiveVomiting', 'apnea']);
  assert.deepEqual(LAB_RESULTS.map((l) => l.value), ['none', 'culture', 'pcr']);
});

test('pertussis-case-def: clinical criteria alone are probable', () => {
  const r = p(clinical);
  assert.equal(r.classification, 'probable');
  assert.equal(r.clinical, true);
  // Any one of the three age-independent signs satisfies it.
  for (const key of ['paroxysms', 'whoop', 'postTussiveVomiting']) {
    assert.equal(p({ age: 'older', coughWeeks: 2, [key]: true }).classification, 'probable', key);
  }
});

test('pertussis-case-def: the three confirmation routes', () => {
  assert.equal(p({ ...clinical, lab: 'pcr' }).classification, 'confirmed');
  assert.equal(p({ ...clinical, epiLink: true }).classification, 'confirmed');
  // Culture takes a cough illness of ANY duration and does not need the clinical criteria.
  const culture = p({ age: 'older', coughWeeks: 1, lab: 'culture' });
  assert.equal(culture.classification, 'confirmed');
  assert.equal(culture.clinical, false);
  // ...but it does need a cough illness.
  assert.equal(p({ age: 'older', coughWeeks: 0, lab: 'culture' }).classification, 'not-met');
});

test('pertussis-case-def: PCR and an epidemiologic link do not confirm on their own', () => {
  // Both routes are conjunctive with the clinical criteria.
  assert.equal(p({ age: 'older', coughWeeks: 1, lab: 'pcr' }).classification, 'not-met');
  assert.equal(p({ age: 'older', coughWeeks: 3, epiLink: true }).classification, 'not-met');
});

test('pertussis-case-def: a more likely diagnosis defeats the clinical criteria', () => {
  const r = p({ ...clinical, moreLikelyDiagnosis: true });
  assert.equal(r.classification, 'not-met');
  assert.match(r.shortfallNote, /begin by excluding one/);
  // But a positive culture still confirms; the exclusion sits in the clinical criteria.
  assert.equal(p({ ...clinical, moreLikelyDiagnosis: true, lab: 'culture' }).classification, 'confirmed');
});

test('pertussis-case-def: apnea counts only under one year', () => {
  assert.equal(p({ age: 'infant', coughWeeks: 2, apnea: true }).classification, 'probable');
  const older = p({ age: 'older', coughWeeks: 2, apnea: true });
  assert.equal(older.classification, 'not-met');
  assert.equal(older.apneaDiscounted, true);
  assert.match(older.apneaNote, /only in an infant under one year/);
  assert.match(older.apneaNote, /remains a reason to escalate care/);
  assert.equal(p({ age: 'infant', coughWeeks: 2, apnea: true }).apneaNote, null);
});

test('pertussis-case-def: two weeks is the clinical floor', () => {
  assert.equal(p({ age: 'older', coughWeeks: 1.9, paroxysms: true }).classification, 'not-met');
  assert.equal(p({ age: 'older', coughWeeks: 2, paroxysms: true }).classification, 'probable');
});

test('pertussis-case-def: it is a surveillance definition, not a treatment threshold', () => {
  // The reason the tile exists, so it prints on every result.
  for (const input of [{}, clinical, { ...clinical, lab: 'pcr' }]) {
    assert.match(p(input).notATreatmentNote, /not a treatment threshold/);
    assert.match(p(input).notATreatmentNote, /do not wait for a case to be classified/);
    assert.match(p(input).serologyNote, /no branch/);
  }
});

test('pertussis-case-def: a negative test does not move a case out of probable', () => {
  assert.match(p(clinical).negativeTestNote, /does not move a case out of probable/);
  assert.match(p({}).negativeTestNote, /three to four weeks/);
  // Nothing to say once the case is already confirmed.
  assert.equal(p({ ...clinical, lab: 'pcr' }).negativeTestNote, null);
});

test('pertussis-case-def: an out-of-range cough duration is rejected', () => {
  assert.equal(p({ coughWeeks: -1 }).valid, false);
  assert.equal(p({ coughWeeks: 105 }).valid, false);
  assert.equal(p({ coughWeeks: '' }).valid, true);
  assert.equal(p({ coughWeeks: 'abc' }).coughWeeks, null);
});

test('pertussis-case-def: the result echoes what it was read from', () => {
  // Otherwise a classification stands alone with no sign of which duration or age branch
  // produced it.
  assert.match(p({ age: 'older', coughWeeks: 3, lab: 'none' }).readNote, /3 weeks, at one year and older, with no positive test/);
  assert.match(p({ age: 'infant', coughWeeks: 1, lab: 'culture' }).readNote, /1 week, in an infant under one year, with a positive culture/);
  assert.match(p({ coughWeeks: 5, lab: 'pcr', epiLink: true }).readNote, /a positive PCR and an epidemiologic link/);
  assert.match(p({}).readNote, /no stated duration/);
});

test('pertussis-case-def: the documented example', () => {
  const r = p({ age: 'older', coughWeeks: '3', paroxysms: true, lab: 'none' });
  assert.equal(r.classification, 'probable');
  assert.match(r.band, /^Probable pertussis/);
  assert.match(r.countedNote, /paroxysms of coughing/);
  assert.match(r.readNote, /3 weeks/);
});
