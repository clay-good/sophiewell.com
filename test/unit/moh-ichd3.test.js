import test from 'node:test';
import assert from 'node:assert/strict';
import { mohIchd3 } from '../../lib/moh-ichd3-v816.js';

const base = { headacheDays: 20, overuseMonths: 6, noBetterExplanation: true };

test('moh: a triptan on 10 days a month is overuse', () => {
  const r = mohIchd3({ ...base, triptanDays: 10 });
  assert.equal(r.criteriaMet, true);
  assert.ok(r.subtypes[0].includes('8.2.2'));
  assert.equal(mohIchd3({ ...base, triptanDays: 9 }).criteriaMet, false);
});

test('moh: the threshold is 10 for some classes and 15 for others', () => {
  // The trap. Twelve days of ibuprofen is NOT overuse; twelve days of a triptan is.
  const nsaid = mohIchd3({ ...base, nsaidDays: 12 });
  assert.equal(nsaid.criteriaMet, false);
  assert.ok(nsaid.thresholdNote.includes('NOT overuse'));

  const triptan = mohIchd3({ ...base, triptanDays: 12 });
  assert.equal(triptan.criteriaMet, true);

  // And 15 days of the same NSAID is.
  assert.equal(mohIchd3({ ...base, nsaidDays: 15 }).criteriaMet, true);
  assert.equal(mohIchd3({ ...base, paracetamolDays: 14 }).criteriaMet, false);
  assert.equal(mohIchd3({ ...base, paracetamolDays: 15 }).criteriaMet, true);
});

test('moh: 8.2.6 catches the patient who overuses nothing individually', () => {
  // Triptan on 6 days and ibuprofen on 6 days is neither triptan-overuse nor
  // analgesic-overuse, and is still medication-overuse headache.
  const r = mohIchd3({ ...base, triptanDays: 6, nsaidDays: 6, totalMedicationDays: 12 });
  assert.equal(r.criteriaMet, true);
  assert.equal(r.multiClassMet, true);
  assert.deepEqual(r.overusedClasses, []);
  assert.ok(r.subtypes[0].includes('8.2.6'));
});

test('moh: 8.2.6 needs two or more classes and 10 or more total days', () => {
  // One class below its own threshold is not 8.2.6, however many days.
  assert.equal(mohIchd3({ ...base, nsaidDays: 12, totalMedicationDays: 12 }).multiClassMet, false);
  // Two classes totalling under 10 is not either.
  assert.equal(mohIchd3({ ...base, triptanDays: 4, nsaidDays: 4, totalMedicationDays: 8 }).multiClassMet, false);
  assert.equal(mohIchd3({ ...base, triptanDays: 5, nsaidDays: 5, totalMedicationDays: 10 }).multiClassMet, true);
});

test('moh: 8.2.6 counts DAYS, so an entered total overrides the sum of the classes', () => {
  // Both drugs on the same 6 days is 6 days, not 12, and falls under the threshold.
  const r = mohIchd3({ ...base, triptanDays: 6, nsaidDays: 6, totalMedicationDays: 6 });
  assert.equal(r.totalMedicationDays, 6);
  assert.equal(r.multiClassMet, false);
  assert.ok(r.totalNote.includes('counts DAYS'));
  // With no total given, the sum is the only available estimate.
  assert.equal(mohIchd3({ ...base, triptanDays: 6, nsaidDays: 6 }).totalMedicationDays, 12);
});

test('moh: headache must be on 15 or more days a month', () => {
  assert.equal(mohIchd3({ ...base, headacheDays: 14, triptanDays: 12 }).criteria.a, false);
  assert.equal(mohIchd3({ ...base, headacheDays: 15, triptanDays: 12 }).criteria.a, true);
});

test('moh: the overuse must have run for MORE than 3 months', () => {
  assert.equal(mohIchd3({ ...base, overuseMonths: 3, triptanDays: 12 }).criteriaMet, false);
  assert.equal(mohIchd3({ ...base, overuseMonths: 4, triptanDays: 12 }).criteriaMet, true);
});

test('moh: several classes overused are all reported', () => {
  const r = mohIchd3({ ...base, triptanDays: 12, opioidDays: 11 });
  assert.equal(r.overusedClasses.length, 2);
  assert.equal(r.subtypes.length, 2);
});

test('moh: empty and invalid input', () => {
  const empty = mohIchd3({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.thresholdNote, null);
  assert.equal(empty.totalNote, null);
  assert.equal(mohIchd3({ headacheDays: -1 }).valid, false);
  assert.equal(mohIchd3({ triptanDays: -1 }).valid, false);
  assert.equal(mohIchd3().valid, true);
});

test('moh: day counts are bounded by the length of a month', () => {
  // Not defensive padding: "days per month" cannot exceed 31, and without the bound the
  // 8.2.6 total overflowed to Infinity on extreme input and printed it. Caught by the MCP
  // fuzz suite, not by the cases above.
  assert.equal(mohIchd3({ ...base, triptanDays: 31 }).valid, true);
  assert.equal(mohIchd3({ ...base, triptanDays: 32 }).valid, false);
  assert.equal(mohIchd3({ headacheDays: 32 }).valid, false);
  assert.equal(mohIchd3({ totalMedicationDays: 32 }).valid, false);
  assert.equal(mohIchd3({ overuseMonths: 1e308 }).valid, false);

  const extreme = { headacheDays: 1e308, overuseMonths: 1e308, triptanDays: 1e308, nsaidDays: 1e308, totalMedicationDays: 1e308, noBetterExplanation: true };
  const r = mohIchd3(extreme);
  assert.equal(r.valid, false);
  assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
});
