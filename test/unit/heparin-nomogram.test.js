// spec-v56 §2.1: weight-based heparin infusion nomogram (Raschke 1993).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heparinNomogram } from '../../lib/medication-v5.js';

test('heparin VTE 80 kg: 6400 u bolus, 1440 u/h', () => {
  const r = heparinNomogram({ weightKg: 80, indication: 'vte' });
  assert.equal(r.initialBolusUnits, 6400);
  assert.equal(r.initialRateUnitsH, 1440);
  assert.equal(r.titration, null);
});

test('heparin ACS caps bolus at 4000 and rate at 1000', () => {
  const r = heparinNomogram({ weightKg: 120, indication: 'acs' });
  assert.equal(r.initialBolusUnits, 4000); // 120*60=7200 -> capped
  assert.equal(r.initialRateUnitsH, 1000); // 120*12=1440 -> capped
});

test('heparin titration: aPTT 40 s -> rebolus 40 u/kg, +2 u/kg/h', () => {
  const r = heparinNomogram({ weightKg: 80, indication: 'vte', aptt: 40 });
  assert.equal(r.titration.rebolusUnits, 3200);
  assert.equal(r.titration.rateChangeUnitsH, 160);
  assert.equal(r.titration.hold, false);
});

test('heparin titration: aPTT >90 s holds and decreases 3 u/kg/h', () => {
  const r = heparinNomogram({ weightKg: 80, indication: 'vte', aptt: 95 });
  assert.equal(r.titration.hold, true);
  assert.equal(r.titration.rateChangeUnitsH, -240);
});

test('heparin titration: aPTT 60 s therapeutic, no change', () => {
  const r = heparinNomogram({ weightKg: 80, indication: 'vte', aptt: 60 });
  assert.equal(r.titration.rebolusUnits, 0);
  assert.equal(r.titration.rateChangeUnitsH, 0);
});

test('heparin weight cap at 150 kg surfaces a flag', () => {
  const r = heparinNomogram({ weightKg: 200, indication: 'vte' });
  assert.equal(r.weightCapped, true);
  assert.equal(r.initialBolusUnits, 150 * 80);
});

test('heparin rejects impossible input', () => {
  assert.throws(() => heparinNomogram({ weightKg: 0, indication: 'vte' }), /weightKg/);
  assert.throws(() => heparinNomogram({ weightKg: NaN }), /weightKg/);
});
