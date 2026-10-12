// spec-v1636 tool 16: C. difficile LabID event categories under the NHSN protocol.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdiLabidCategory } from '../../lib/cdi-labid-category-v1636.js';

const base = { specimenDate: '2026-03-20', location: 'inpatient-location', admissionDate: '2026-03-17', priorDischarge: 'no-earlier-discharge', priorPositive: 'no-earlier-positive' };
const c = (i) => cdiLabidCategory({ ...base, ...i });
const got = (r) => [r.onset, r.assay];

test('onset: hospital day 4 is healthcare facility-onset; days 1 to 3 are community-onset', () => {
  assert.deepEqual([c({}).hospitalDay, ...got(c({}))], [4, 'HO', 'incident']);
  assert.deepEqual([c({ admissionDate: '2026-03-18' }).hospitalDay, c({ admissionDate: '2026-03-18' }).onset], [3, 'CO']);
  assert.deepEqual([c({ admissionDate: '2026-03-20' }).hospitalDay, c({ admissionDate: '2026-03-20' }).onset], [1, 'CO']);
  assert.equal(c({ location: 'ambulatory-location', admissionDate: '' }).onset, 'CO');
});

test('a discharge 28 days or fewer before makes a community-onset event facility-associated; 29 does not', () => {
  const early = { admissionDate: '2026-03-18', priorDischarge: 'earlier-discharge' };
  assert.equal(c({ ...early, dischargeDate: '2026-02-20' }).onset, 'CO-HCFA');
  assert.equal(c({ ...early, dischargeDate: '2026-02-19' }).onset, 'CO');
  assert.equal(c({ location: 'ambulatory-location', admissionDate: '', priorDischarge: 'earlier-discharge', dischargeDate: '2026-03-01' }).onset, 'CO-HCFA');
  // On or after hospital day 4 the event is facility-onset whatever the earlier discharge.
  assert.equal(c({ priorDischarge: 'earlier-discharge', dischargeDate: '2026-03-10' }).onset, 'HO');
  assert.match(c({ ...early, dischargeDate: '2026-02-20' }).notes.join(' '), /states no day-1 convention for this window/);
});

test('the earlier specimen is day 1: duplicate through day 14, an event from day 15', () => {
  const same = (priorPositiveDate) => c({ priorPositive: 'earlier-positive-here', priorPositiveDate });
  // 13 calendar days earlier is day 14: a duplicate. 14 calendar days earlier is day 15: an event.
  assert.deepEqual([same('2026-03-07').flag, same('2026-03-07').dayFromPrior], ['duplicate', 14]);
  assert.deepEqual([same('2026-03-06').dayFromPrior, same('2026-03-06').assay], [15, 'recurrent']);
  // The protocol's own example: positives on January 16 and January 31 make two events.
  assert.notEqual(cdiLabidCategory({ ...base, admissionDate: '2026-01-01', specimenDate: '2026-01-31', priorPositive: 'earlier-positive-here', priorPositiveDate: '2026-01-16' }).flag, 'duplicate');
  assert.equal(cdiLabidCategory({ ...base, admissionDate: '2026-01-01', specimenDate: '2026-01-16', priorPositive: 'earlier-positive-here', priorPositiveDate: '2026-01-04' }).flag, 'duplicate');
});

test('recurrent through day 56, incident from day 57', () => {
  const same = (priorPositiveDate) => c({ priorPositive: 'earlier-positive-here', priorPositiveDate });
  assert.deepEqual([same('2026-01-24').dayFromPrior, same('2026-01-24').assay], [56, 'recurrent']);
  assert.deepEqual([same('2026-01-23').dayFromPrior, same('2026-01-23').assay], [57, 'incident']);
  assert.equal(c({}).assay, 'incident');
});

test('a previous positive in another location is not a duplicate, and is unassigned at 14 days or fewer', () => {
  const r = c({ priorPositive: 'earlier-positive-elsewhere', priorPositiveDate: '2026-03-10' });
  assert.deepEqual([r.flag, r.assay, r.dayFromPrior], ['healthcare-facility-onset', 'unassigned', 11]);
  assert.match(r.notes.join(' '), /same-location duplicate rule does not apply/);
});

test('the rate panel: events per 10,000 patient days, only when both numbers are entered', () => {
  assert.equal(c({ events: 4, patientDays: 5200 }).ratePer10000, 7.69);
  assert.equal(c({}).ratePer10000, null);
  assert.match(c({ events: 4 }).message, /^Enter the patient days/);
});

test('nothing is defaulted, and impossible date orders are refused', () => {
  assert.match(cdiLabidCategory({}).message, /^Enter the specimen collection date/);
  assert.match(cdiLabidCategory({ specimenDate: '2026-03-20' }).message, /^Choose where the specimen was collected/);
  assert.match(c({ admissionDate: '' }).message, /^Enter the admission date/);
  assert.match(c({ priorDischarge: '' }).message, /^Choose whether the patient had an earlier inpatient discharge/);
  assert.match(c({ priorDischarge: 'earlier-discharge' }).message, /^Enter the date of that inpatient discharge/);
  assert.match(c({ priorPositive: '' }).message, /^Choose whether the patient has a previous/);
  assert.match(c({ priorPositive: 'earlier-positive-here' }).message, /^Enter the collection date of the most recent previous positive/);
  assert.match(c({ admissionDate: '2026-03-21' }).message, /admission date is after the specimen date/);
  assert.match(c({ priorPositive: 'earlier-positive-here', priorPositiveDate: '2026-03-20' }).message, /must be before this specimen/);
  assert.equal(cdiLabidCategory(null).valid, false);
});
