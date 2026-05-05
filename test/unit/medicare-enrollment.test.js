// spec-v4 §7 step v4.4: Medicare enrollment date math, >=5 scenarios.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialEnrollmentPeriod, generalEnrollmentPeriod, medicareEnrollment, SEP_SCENARIOS,
} from '../../lib/medicare-enrollment.js';

test('IEP: 7 months around 65th birthday in May', () => {
  const r = initialEnrollmentPeriod('1961-05-15');
  assert.equal(r.start, '2026-02-01');
  assert.equal(r.end, '2026-08-31');
  assert.equal(r.birthdayMonth, '2026-05-15');
});

test('IEP: birthday in January spans October prior to April current', () => {
  const r = initialEnrollmentPeriod('1961-01-10');
  assert.equal(r.start, '2025-10-01');
  assert.equal(r.end, '2026-04-30');
});

test('IEP: birthday in December spans September to March of following year', () => {
  const r = initialEnrollmentPeriod('1961-12-20');
  assert.equal(r.start, '2026-09-01');
  assert.equal(r.end, '2027-03-31');
});

test('IEP: birthday on Feb 29 in non-leap 65th year falls back to last day', () => {
  const r = initialEnrollmentPeriod('1960-02-29'); // turns 65 in 2025 (non-leap)
  assert.equal(r.start, '2024-11-01');
  assert.equal(r.end, '2025-05-31');
});

test('GEP: always Jan 1 - Mar 31 of given year', () => {
  assert.deepEqual(generalEnrollmentPeriod(2026), { start: '2026-01-01', end: '2026-03-31' });
  assert.deepEqual(generalEnrollmentPeriod(2030), { start: '2030-01-01', end: '2030-03-31' });
});

test('GEP: throws on non-integer year', () => {
  assert.throws(() => generalEnrollmentPeriod('2026'));
});

test('medicareEnrollment: losing-employer-coverage SEP attaches', () => {
  const r = medicareEnrollment({ dob: '1961-05-15', scenario: 'losing-employer-coverage', currentDate: '2026-06-01' });
  assert.equal(r.iep.birthdayMonth, '2026-05-15');
  assert.equal(r.gep.start, '2026-01-01');
  assert.equal(r.sep.lengthMonths, 8);
  assert.match(r.partDLEP, /Late Enrollment Penalty/);
});

test('medicareEnrollment: ESRD scenario returns ESRD-specific note', () => {
  const r = medicareEnrollment({ dob: '1990-01-01', scenario: 'esrd', currentDate: '2026-01-01' });
  assert.equal(r.sep, SEP_SCENARIOS.esrd);
  assert.match(r.sep.note, /ESRD/);
});

test('medicareEnrollment: unknown scenario returns null SEP', () => {
  const r = medicareEnrollment({ dob: '1961-05-15', scenario: 'no-such-thing', currentDate: '2026-01-01' });
  assert.equal(r.sep, null);
});
