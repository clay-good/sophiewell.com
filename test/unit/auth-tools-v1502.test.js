// spec-v1502 tools 3-5: authorization run-out, units to request, and quantity limits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { authRunout as ar } from '../../lib/auth-runout-v1502.js';
import { authUnitsRequest as au } from '../../lib/auth-units-request-v1502.js';
import { quantityLimitCheck as ql } from '../../lib/quantity-limit-check-v1502.js';

const A = { startDate: '2026-06-01', endDate: '2026-11-30', perDose: '1', intervalDays: '56', leadDays: '14' };

test('auth-runout: the units run out before the end date', () => {
  const r = ar({ ...A, approved: '2', used: '1', nextDose: '2026-07-20' });
  assert.equal(r.limitedBy, 'units');
  assert.equal(r.needBy, '2026-09-14');
  assert.equal(r.submitBy, '2026-08-31');
});

test('auth-runout: the end date comes first, and both together', () => {
  const r = ar({ ...A, approved: '10', used: '0', nextDose: '2026-07-20' });
  assert.equal(r.limitedBy, 'end date');
  assert.equal(r.needBy, '2027-01-04');
  assert.equal(ar({ ...A, approved: '4', used: '1', nextDose: '2026-07-20' }).limitedBy, 'both');
});

test('auth-runout: a blank used-units field asks instead of assuming zero; a blank lead time is disclosed', () => {
  const r = ar({ ...A, approved: '4', used: '', nextDose: '2026-07-20' });
  assert.equal(r.valid, false);
  assert.match(r.message, ASKING);
  assert.match(ar({ ...A, leadDays: '', approved: '4', used: '1', nextDose: '2026-07-20' }).notes[0], DISCLOSING);
  assert.equal(ar({ ...A, approved: '2', used: '3', nextDose: '2026-07-20' }).valid, false);
});

test('auth-units-request: a partial billing unit rounds up per administration, not over the total', () => {
  const r = au({ basis: 'mg', dose: '355', unitMg: '10', intervalDays: '28', firstDose: '2026-07-01', periodEnd: '2026-09-30', loadingCount: '0' });
  // 4 administrations (Jul 1, Jul 29, Aug 26, Sep 23) of 35.5 units: 36 each = 144, not ceil(142) = 142.
  assert.equal(r.units, 144);
  assert.equal(r.administrations, 4);
});

test('auth-units-request: weight-based dosing with loading doses', () => {
  const r = au({ basis: 'mg-per-kg', dose: '5', weightKg: '72', unitMg: '10', intervalDays: '56', firstDose: '2026-07-01', periodEnd: '2026-12-31', loadingCount: '2', loadingDose: '5' });
  assert.equal(r.units, 216);
  assert.match(au({ basis: 'mg', dose: '100', unitMg: '10', intervalDays: '28', firstDose: '2026-07-01', periodEnd: '2026-07-31' }).notes[0], DISCLOSING);
  assert.match(au({ basis: 'mg-per-kg', dose: '5', unitMg: '10', intervalDays: '56', firstDose: '2026-07-01', periodEnd: '2026-12-31' }).message, ASKING);
});

test('quantity-limit-check: fits, fits at the other strength, or needs an exception', () => {
  assert.equal(ql({ unitsPerDose: '1', dosesPerDay: '1', strength: '20', limitQty: '30', limitDays: '30' }).bandLabel, 'Fits the limit');
  assert.equal(ql({ unitsPerDose: '2', dosesPerDay: '1', strength: '20', limitQty: '30', limitDays: '30', otherStrength: '40' }).bandLabel, 'Fits with the other strength');
  const r = ql({ unitsPerDose: '2', dosesPerDay: '2', strength: '20', limitQty: '60', limitDays: '30' });
  assert.equal(r.bandLabel, 'Needs a quantity-limit exception');
  assert.equal(r.excess, 60);
  assert.equal(ql({ unitsPerDose: '3', dosesPerDay: '1', strength: '20', limitQty: '30', limitDays: '30', otherStrength: '40' }).bandLabel, 'Needs a quantity-limit exception');
  assert.match(ql({}).message, ASKING);
});
