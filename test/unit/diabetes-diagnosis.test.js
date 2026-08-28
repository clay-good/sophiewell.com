import test from 'node:test';
import assert from 'node:assert/strict';
import { diabetesDiagnosis as dx, A1C_DIABETES, FPG_DIABETES, OGTT_DIABETES } from '../../lib/diabetes-diagnosis-v841.js';

test('diabetes: ONE abnormal result is not a diagnosis', () => {
  // Confirmation is part of the definition and is routinely skipped.
  const one = dx({ a1c: 7.2 });
  assert.equal(one.verdict, 'Meets a diabetes threshold, not yet confirmed');
  assert.ok(one.confirmationNote.includes('TWO abnormal results'));
  assert.equal(dx({ fastingGlucose: 140 }).verdict, 'Meets a diabetes threshold, not yet confirmed');
});

test('diabetes: two different tests at the same time confirm it', () => {
  const r = dx({ a1c: 7.2, fastingGlucose: 140 });
  assert.equal(r.verdict, 'Diabetes');
  assert.equal(r.diabetesRangeTests.length, 2);
  assert.equal(r.confirmationNote, null);
  // Or the same test repeated.
  assert.equal(dx({ a1c: 7.2, confirmedOnRepeat: true }).verdict, 'Diabetes');
});

test('diabetes: the random-glucose route needs symptoms, and then needs no confirmation', () => {
  const withSymptoms = dx({ randomGlucose: 260, classicSymptoms: true });
  assert.equal(withSymptoms.verdict, 'Diabetes');
  assert.equal(withSymptoms.unequivocal, true);
  assert.ok(withSymptoms.randomNote.includes('needs no confirmation'));

  // Without symptoms it is not a diagnostic route at all.
  const without = dx({ randomGlucose: 260 });
  assert.notEqual(without.verdict, 'Diabetes');
  assert.ok(without.randomNote.includes('NOT a diagnostic route'));
  assert.equal(without.diabetesRangeTests.length, 0);
});

test('diabetes: the thresholds', () => {
  assert.equal(A1C_DIABETES, 6.5);
  assert.equal(FPG_DIABETES, 126);
  assert.equal(OGTT_DIABETES, 200);
  assert.equal(dx({ a1c: 6.5, fastingGlucose: 126 }).verdict, 'Diabetes');
  assert.equal(dx({ a1c: 6.4, fastingGlucose: 125 }).verdict, 'Prediabetes');
  assert.equal(dx({ a1c: 5.6, fastingGlucose: 99 }).verdict, 'Below the diagnostic thresholds');
});

test('diabetes: prediabetes bands', () => {
  assert.equal(dx({ a1c: 5.7 }).verdict, 'Prediabetes');
  assert.equal(dx({ a1c: 5.6 }).verdict, 'Below the diagnostic thresholds');
  assert.equal(dx({ fastingGlucose: 100 }).verdict, 'Prediabetes');
  assert.equal(dx({ twoHourGlucose: 140 }).verdict, 'Prediabetes');
  assert.equal(dx({ twoHourGlucose: 139 }).verdict, 'Below the diagnostic thresholds');
});

test('diabetes: a confounded A1C is SET ASIDE, not used', () => {
  const r = dx({ a1c: 7.2, a1cConfounder: true, fastingGlucose: 99 });
  assert.equal(r.diabetesRangeTests.length, 0);
  assert.equal(r.verdict, 'Below the diagnostic thresholds');
  assert.ok(r.a1cNote.includes('not used here'));
  // Without the confounder the same A1C counts.
  assert.equal(dx({ a1c: 7.2, fastingGlucose: 99 }).diabetesRangeTests.length, 1);
});

test('diabetes: a carbohydrate-restricted OGTT is set aside too', () => {
  const r = dx({ twoHourGlucose: 220, carbRestrictedBeforeOgtt: true });
  assert.equal(r.diabetesRangeTests.length, 0);
  assert.ok(r.ogttNote.includes('150 g of carbohydrate'));
  assert.equal(dx({ twoHourGlucose: 220 }).diabetesRangeTests.length, 1);
});

test('diabetes: empty and out-of-range input', () => {
  const empty = dx({});
  assert.equal(empty.valid, true);
  assert.equal(empty.verdict, null);
  assert.equal(empty.confirmationNote, null);
  assert.equal(dx({ a1c: -1 }).valid, false);
  assert.equal(dx({ fastingGlucose: 1e308 }).valid, false);
  assert.equal(dx().valid, true);
  assert.doesNotMatch(JSON.stringify(dx({ a1c: 7.2, fastingGlucose: 140 })), /NaN|Infinity/);
});
