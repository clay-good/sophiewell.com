import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crrtDose } from '../../lib/scoring-v4.js';

test('crrt-dose: within KDIGO target 20-25 mL/kg/h', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 22.5);
  assert.ok(r.banners.some((b) => b.includes('Within KDIGO')));
});

test('crrt-dose: below target -> banner suggests increase', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1200 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 15);
  assert.ok(r.banners.some((b) => b.includes('Below KDIGO')));
});

test('crrt-dose: above target -> banner suggests reduce', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 2400 });
  assert.equal(r.effluentDoseMlPerKgPerHr, 30);
  assert.ok(r.banners.some((b) => b.includes('Above KDIGO')));
});

test('crrt-dose: post-filter iCa outside 0.25-0.35 triggers banner', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, postFilterIonisedCa: 0.5 });
  assert.ok(r.banners.some((b) => b.includes('Post-filter ionised Ca')));
});

test('crrt-dose: systemic iCa outside 1.1-1.2 triggers banner', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: 1.0 });
  assert.ok(r.banners.some((b) => b.includes('Systemic ionised Ca')));
});

test('crrt-dose: total/iCa ratio >=2.5 flags citrate accumulation (Davenport)', () => {
  const r = crrtDose({ weightKg: 80, effluentRateMlPerHr: 1800, systemicIonisedCa: 1.0, totalCa: 2.6 });
  assert.equal(r.totalIonisedRatio, 2.6);
  assert.ok(r.banners.some((b) => b.includes('citrate accumulation')));
});

test('crrt-dose: requires weight and effluent rate', () => {
  assert.throws(() => crrtDose({ effluentRateMlPerHr: 1800 }));
  assert.throws(() => crrtDose({ weightKg: 80 }));
});
