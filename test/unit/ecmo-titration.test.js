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

// spec-v1153: when an input was absent, the "suggested" setting was the CURRENT
// one echoed back, with nothing on screen to distinguish it from a computed one.
test('ecmo-titration: it says which half it did not titrate', () => {
  const base = {
    modality: 'VV', weightKg: 70, currentSweepLpm: 4, currentFlowLpm: 4,
    currentPaCO2: 50, targetPaCO2: 40, hb: 10, sao2: 90,
  };
  const full = ecmoTitration(base);
  assert.equal(full.sweepTitrated, true);
  assert.equal(full.flowTitrated, true);
  assert.equal(full.suggestedSweepLpm, 5);

  // No PaCO2: the sweep is the input, and the reading says so.
  const noPaco2 = ecmoTitration({ ...base, currentPaCO2: null });
  assert.equal(noPaco2.sweepTitrated, false);
  assert.equal(noPaco2.suggestedSweepLpm, base.currentSweepLpm);
  assert.ok(noPaco2.banners.some((b) => /has NOT been titrated/.test(b)));
  assert.ok(noPaco2.banners.some((b) => /not a suggestion/.test(b)));

  // No hemoglobin or saturation: no DO2i, and the flow is the input.
  for (const missing of [{ hb: null }, { sao2: null }, { hb: null, sao2: null }]) {
    const r = ecmoTitration({ ...base, ...missing });
    assert.equal(r.flowTitrated, false, JSON.stringify(missing));
    assert.equal(r.do2iMlPerKgPerMin, null);
    assert.equal(r.suggestedFlowLpm, base.currentFlowLpm);
    assert.ok(r.banners.some((b) => /oxygen delivery has not been checked/.test(b)));
  }

  // The default target is named rather than applied silently.
  const noTarget = ecmoTitration({ ...base, targetPaCO2: null });
  assert.equal(noTarget.targetPaCO2Stated, false);
  assert.equal(noTarget.sweepTitrated, true);
  assert.ok(noTarget.banners.some((b) => /default target PaCO2 of 40/.test(b)));
});
