// spec-v1505 backfill: ndc-hcpcs-units from an NDC through the CMS ASP NDC-HCPCS crosswalk.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ndcUnits as u, parseDosage, normalizeNdc } from '../../lib/ndc-crosswalk.js';

const avastin = { ndc: '50242006001', codes: [{ code: 'J9035', labeler: 'Genentech, Inc.', drug: 'Avastin', dosage: '10 MG', pkgSize: 4, pkgQty: 1, billUnits: 10, billUnitsPkg: 10 }] };
const retacrit = { ndc: '00069130510', codes: [
  { code: 'Q5105', drug: 'Retacrit', dosage: '100 UNITS', pkgSize: 1, pkgQty: 10, billUnits: 20, billUnitsPkg: 200 },
  { code: 'Q5106', drug: 'Retacrit', dosage: '1000 UNITS', pkgSize: 1, pkgQty: 10, billUnits: 2, billUnitsPkg: 20 },
] };
const at = (rec) => ({ status: 'found', rec, edition: '2026 Q4' });

test('a 10-digit NDC in each of the three segment patterns converts to the 11-digit code the crosswalk lists', () => {
  assert.equal(normalizeNdc('50242-060-01').ndc, '50242006001', '5-3-2');
  assert.equal(normalizeNdc('50242-0060-1').ndc, '50242006001', '5-4-1');
  assert.equal(normalizeNdc('0069-1305-10').ndc, '00069130510', '4-4-2');
  for (const ndc of ['50242-060-01', '50242-0060-1']) {
    const r = u({ ndc, dose: '400', doseUnit: 'mg', lookup: at(avastin) });
    assert.equal(r.ndc, '50242-0060-01');
    assert.equal(r.code, 'J9035');
    assert.equal(r.billingUnits, 40);
  }
  assert.equal(u({ ndc: '0069-1305-10', code: 'Q5106', dose: '10000', doseUnit: 'units', lookup: at(retacrit) }).ndc, '00069-1305-10');
});

test('the unit comes from the code\'s dosage; the package\'s billable units are shown', () => {
  const r = u({ ndc: '50242-0060-01', dose: '35', doseUnit: 'mg', lookup: at(avastin) });
  assert.equal(r.billingUnits, 4);
  assert.equal(r.isCleanMultiple, false);
  assert.ok(r.notes.some((n) => /package holds 10 billing units/.test(n)));
  assert.ok(r.notes.some((n) => /Report the NDC on the claim as 50242-0060-01/.test(n)));
});

test('an NDC under two codes asks which; the chosen code sets the unit', () => {
  assert.match(u({ ndc: '00069-1305-10', dose: '10000', doseUnit: 'units', lookup: at(retacrit) }).message, /more than one code: Q5105 \(100 UNITS per unit\) or Q5106 \(1000 UNITS per unit\)/);
  assert.equal(u({ ndc: '00069-1305-10', code: 'q5105', dose: '10000', doseUnit: 'units', lookup: at(retacrit) }).billingUnits, 100);
});

test('a dosage the converter cannot read asks for the unit size; IU and cc are read and disclosed', () => {
  const odd = { ndc: '12345678901', codes: [{ code: 'J9999', drug: 'X', dosage: 'UP TO 0.50 MG', pkgSize: 1, pkgQty: 1, billUnits: 1, billUnitsPkg: 1 }] };
  assert.match(u({ ndc: '12345-6789-01', dose: '1', doseUnit: 'mg', lookup: at(odd) }).message, /billing unit reads "UP TO 0\.50 MG".*Enter the billing-unit size/);
  assert.equal(u({ ndc: '12345-6789-01', dose: '1', doseUnit: 'mg', unitSize: '0.5', unitUnit: 'mg', lookup: at(odd) }).billingUnits, 2);
  assert.deepEqual(parseDosage('150 IU'), { size: 150, unit: 'units', read: 'IU read as units' });
  assert.equal(parseDosage('1 MEQ'), null);
});

test('not listed, not loaded and lapsed all fall back to the unit size', () => {
  assert.match(u({ ndc: '99999-9999-99', dose: '1', doseUnit: 'mg', lookup: { status: 'not-listed', edition: '2026 Q4' } }).message, /not in the CMS ASP NDC-HCPCS crosswalk \(2026 Q4\)/);
  assert.match(u({ ndc: '99999-9999-99', dose: '1', doseUnit: 'mg' }).message, /could not be loaded/);
  assert.match(u({ ndc: '99999-9999-99', dose: '1', doseUnit: 'mg', lookup: { status: 'expired' } }).message, /passed its review date/);
  assert.match(u({ ndc: '9999999999', lookup: at(avastin) }).message, /10-digit NDC without hyphens/);
});
