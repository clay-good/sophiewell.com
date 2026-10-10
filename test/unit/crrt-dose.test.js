import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crrtDose } from '../../lib/scoring-v4.js';

test('crrt-dose: a prescription inside 20-25 mL/kg/h is not called within target (KDIGO range is delivered)', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 22.5);
  assert.ok(r.banners.some((b) => b.startsWith('Prescribed within 20-25') && b.includes('delivered dose')));
});

test('crrt-dose: below target -> banner suggests increase', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1200 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 15);
  assert.ok(r.banners.some((b) => b.startsWith('Prescribed below')));
});

test('crrt-dose: above the delivered range -> not told to reduce', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 2400 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 30);
  assert.ok(r.banners.some((b) => b.startsWith('Prescribed above') && !/reduc/.test(b)));
});

test('crrt-dose: post-filter iCa at or above 0.35 triggers the banner; there is no lower bound', () => {
  const hi = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, postFilterIonisedCa: 0.5 });
  assert.ok(hi.banners.some((b) => b.includes('Post-filter ionized Ca 0.5 ')));
  assert.ok(crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, postFilterIonisedCa: 0.35 }).banners.some((b) => b.includes('Post-filter')));
  // Davenport 2009 titrates to "<0.35"; 0.2 is on target, not out of range.
  assert.ok(!crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, postFilterIonisedCa: 0.2 }).banners.some((b) => b.includes('Post-filter')));
});

test('crrt-dose: systemic iCa outside 0.95-1.2 triggers the banner', () => {
  const at = (v) => crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: v }).banners.filter((b) => b.includes('Systemic ionized Ca'));
  assert.equal(at(1.0).length, 0, 'a normal 1.0 is within Davenport 0.95-1.2');
  assert.equal(at(0.95).length, 0);
  assert.equal(at(0.9).length, 1);
  // Two decimals: 1.24 must not print as "1.2 outside ... 1.2".
  assert.match(at(1.24)[0], /1\.24 mmol\/L/);
});

test('crrt-dose: total/iCa ratio above 2.5 flags citrate toxicity (Davenport)', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: 1.0, totalCa: 2.6 });
  assert.equal(r.totalIonisedRatio, 2.6);
  assert.ok(r.banners.some((b) => b.includes('citrate toxicity')));
  // "exceeds 2.5": exactly 2.5 does not.
  assert.ok(!crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: 1.0, totalCa: 2.5 }).banners.some((b) => b.includes('citrate')));
});

test('crrt-dose: requires weight and effluent rate', () => {
  assert.throws(() => crrtDose({ effluentRateMlPerHr: 1800 }));
  assert.throws(() => crrtDose({ weightKg: 80 }));
});

// spec-v1213: an ultrafiltration nobody prescribed was published as 0 mL/h.
test('crrt-dose: an unstated ultrafiltration is absent, not a rate of zero', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800 });
  assert.equal(r.ultrafiltrationMlPerHr, null);
  assert.equal(crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, ultrafiltrationMlPerHr: '' })
    .ultrafiltrationMlPerHr, null);
  // A prescribed zero still reports as zero.
  assert.equal(crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, ultrafiltrationMlPerHr: 0 })
    .ultrafiltrationMlPerHr, 0);
  assert.equal(crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, ultrafiltrationMlPerHr: 150 })
    .ultrafiltrationMlPerHr, 150);
});

test('crrt-dose: a total calcium of 0 (a blank field) yields no ratio', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: 1.1, totalCa: 0 });
  assert.equal(r.totalIonisedRatio, null);
});
