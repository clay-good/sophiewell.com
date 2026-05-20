import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecmoTitration } from '../../lib/scoring-v4.js';

test('ecmo-titration: sweep increases when PaCO2 above target', () => {
  // current sweep 4 L/min, PaCO2 50, target 40 -> 4 * 50/40 = 5.
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 4, currentFlowLpm: 4,
    currentPaCO2: 50, targetPaCO2: 40, hb: 10, sao2: 90,
  });
  assert.equal(r.suggestedSweepLpm, 5);
});

test('ecmo-titration: sweep decreases when PaCO2 below target', () => {
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 5, currentFlowLpm: 4,
    currentPaCO2: 32, targetPaCO2: 40,
  });
  assert.equal(r.suggestedSweepLpm, 4);
});

test('ecmo-titration: DO2i computed with Hb and SaO2 as percent', () => {
  // DO2 = 4 * 10 * 1.34 * 10 * 0.9 = 482.4 mL/min; / 70 = 6.89 -> 6.9.
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 4, currentFlowLpm: 4,
    currentPaCO2: 40, hb: 10, sao2: 90,
  });
  assert.equal(r.do2iMlPerKgPerMin, 6.9);
});

test('ecmo-titration: SaO2 accepted as fraction too', () => {
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 4, currentFlowLpm: 4,
    currentPaCO2: 40, hb: 10, sao2: 0.9,
  });
  assert.equal(r.do2iMlPerKgPerMin, 6.9);
});

test('ecmo-titration: DO2i below 6 triggers banner', () => {
  // DO2 = 3 * 10 * 1.34 * 8 * 0.85 = 273.36 / 70 = 3.9.
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 4, currentFlowLpm: 3,
    currentPaCO2: 40, hb: 8, sao2: 85,
  });
  assert.ok(r.do2iMlPerKgPerMin < 6);
  assert.ok(r.banners.some((b) => b.includes('below ELSO 2022 target')));
});

test('ecmo-titration: VA modality returns perfusion banner', () => {
  const r = ecmoTitration({
    modality: 'VA', weightKg: 70, currentSweepLpm: 3, currentFlowLpm: 4,
    currentPaCO2: 40,
  });
  assert.equal(r.modality, 'VA');
  assert.ok(r.banners.some((b) => b.includes('VA target')));
});

test('ecmo-titration: not-a-closed-loop disclaimer present', () => {
  const r = ecmoTitration({
    modality: 'VV', weightKg: 70, currentSweepLpm: 3, currentFlowLpm: 4,
    currentPaCO2: 40,
  });
  assert.ok(r.banners.some((b) => b.includes('not a closed-loop controller')));
});

test('ecmo-titration: requires weight, sweep, flow', () => {
  assert.throws(() => ecmoTitration({ currentSweepLpm: 3, currentFlowLpm: 4 }));
  assert.throws(() => ecmoTitration({ weightKg: 70, currentFlowLpm: 4 }));
  assert.throws(() => ecmoTitration({ weightKg: 70, currentSweepLpm: 3 }));
});

test('ecmo-titration: rejects unknown modality', () => {
  assert.throws(() => ecmoTitration({ modality: 'XX', weightKg: 70, currentSweepLpm: 3, currentFlowLpm: 4 }));
});
