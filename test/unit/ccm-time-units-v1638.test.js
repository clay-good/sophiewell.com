// spec-v1638 tool 17: CCM codes from minutes (CMS MLN909188, June 2025).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ccmTimeUnits } from '../../lib/ccm-time-units-v1638.js';

const staff = (staffMinutes, extra = {}) => ccmTimeUnits({ kind: 'non-complex-clinical-staff', staffMinutes, ...extra });

test('staff codes: 99490 at 20 minutes, 99439 for each further 20', () => {
  assert.deepEqual([staff(19).code, staff(19).minutesShort], [null, 1]);
  assert.deepEqual([staff(20).code, staff(20).addOnUnits], ['99490', 0]);
  assert.deepEqual([staff(39).addOnUnits, staff(40).addOnUnits, staff(60).addOnUnits], [0, 1, 2]);
  assert.deepEqual([staff(45).minutesUsed, staff(45).minutesToNextUnit], [40, 15]);
});

test('practitioner time counts toward the staff codes, and staff time never counts toward 99491', () => {
  assert.deepEqual([staff(15, { practitionerMinutes: 10 }).minutes, staff(15, { practitionerMinutes: 10 }).code], [25, '99490']);
  const p = ccmTimeUnits({ kind: 'non-complex-practitioner', practitionerMinutes: 29, staffMinutes: 200 });
  assert.deepEqual([p.code, p.minutes], [null, 29]);
  assert.deepEqual([ccmTimeUnits({ kind: 'non-complex-practitioner', practitionerMinutes: 60 }).code, ccmTimeUnits({ kind: 'non-complex-practitioner', practitionerMinutes: 60 }).addOnUnits], ['99491', 1]);
});

test('complex: 99487 at 60 minutes, 99489 for each further 30', () => {
  const c = (staffMinutes) => ccmTimeUnits({ kind: 'complex-ccm', staffMinutes });
  assert.equal(c(59).code, null);
  assert.deepEqual([c(60).code, c(89).addOnUnits, c(90).addOnUnits, c(120).addOnUnits], ['99487', 0, 1, 2]);
});

test('refusals, and who bills', () => {
  assert.match(ccmTimeUnits({}).message, /^Choose which codes are being reported/);
  assert.match(staff('').message, /^Enter the clinical staff minutes/);
  assert.match(ccmTimeUnits({ kind: 'non-complex-practitioner' }).message, /^Enter the minutes the billing practitioner personally spent/);
  assert.match(staff(20).note, /The pharmacist does not bill these codes/);
});
