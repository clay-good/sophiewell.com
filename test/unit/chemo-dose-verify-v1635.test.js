// spec-v1635 tool 1: re-derive an ordered chemotherapy dose and report the variance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chemoDoseVerify } from '../../lib/chemo-dose-verify-v1635.js';

// 180.5 cm and 72 kg give a Mosteller body surface area of exactly 1.90 m².
const base = { basis: 'mg-m2', perUnitDose: 75, height: 180.5, weight: 72, bsaFormula: 'mosteller', orderedDose: 150 };
const v = (i) => chemoDoseVerify({ ...base, ...i });

test('75 mg/m² at 1.90 m² is 142.5 mg, and an order of 150 mg is +5.3%', () => {
  const r = v({});
  assert.deepEqual([r.bsa, r.calculatedDose, r.variancePercent, r.flag, r.abnormal], [1.9, 142.5, 5.3, 'variance', false]);
  assert.equal(v({ orderedDose: 135 }).variancePercent, -5.3);
  assert.match(v({ orderedDose: 135 }).band, /variance −5\.3%/);
});

test('both formulas are shown and the chosen one is used', () => {
  const m = v({}); const d = v({ bsaFormula: 'du-bois' });
  assert.ok(Math.abs(d.bsa - 0.007184 * 72 ** 0.425 * 180.5 ** 0.725) < 0.001);
  assert.notEqual(m.calculatedDose, d.calculatedDose);
  assert.match(m.notes.join(' '), /Mosteller 1\.9 m², Du Bois 1\.91 m²/);
});

test('a typed 2.0 m² cap changes nothing at 1.90 and is labeled institutional at 2.3', () => {
  assert.equal(v({ bsaCap: 2 }).calculatedDose, 142.5);
  assert.match(v({ bsaCap: 2 }).notes.join(' '), /changes nothing/);
  const big = v({ weight: 105.5, bsaCap: 2 });
  assert.deepEqual([big.bsa, big.calculatedDose], [2, 150]);
  assert.match(big.notes.join(' '), /Institutional cap, entered by you: 2\.3 m² is capped at 2 m²/);
  // With no cap typed, none is applied.
  assert.equal(v({ weight: 105.5 }).calculatedDose, Number((75 * Math.sqrt(180.5 * 105.5 / 3600)).toFixed(2)));
});

test('actual weight unless a dosing weight is entered, and the result says which', () => {
  assert.match(v({}).notes.join(' '), /Weight used: actual weight, 72 kg/);
  const r = v({ weight: 105.5, dosingWeight: 72 });
  assert.deepEqual([r.weightUsed, r.calculatedDose], [72, 142.5]);
  assert.match(r.notes.join(' '), /the dosing weight you entered, 72 kg \(actual 105\.5 kg\)/);
});

test('a reduction, mg/kg and units/m²', () => {
  assert.equal(v({ reduction: 20 }).calculatedDose, 114);
  const kg = chemoDoseVerify({ basis: 'mg-kg', perUnitDose: 6, weight: 80, orderedDose: 500 });
  assert.deepEqual([kg.calculatedDose, kg.variancePercent, kg.bsa], [480, 4.2, null]);
  assert.match(v({ basis: 'units-m2', perUnitDose: 10, orderedDose: 19 }).band, /Calculated 19 units; ordered 19 units; variance 0%/);
  assert.match(chemoDoseVerify({ basis: 'mg-kg', perUnitDose: 6, weight: 80, orderedDose: 480, bsaCap: 2 }).message, /does not apply to a mg\/kg dose/);
});

test('no pass or fail without a tolerance; with one, the boundary is inside', () => {
  assert.equal(v({}).flag, 'variance');
  assert.deepEqual([v({ tolerance: 5 }).flag, v({ tolerance: 5 }).abnormal], ['outside-tolerance', true]);
  assert.equal(v({ tolerance: 5.3 }).flag, 'within-tolerance');
  assert.equal(v({ orderedDose: 149.625, tolerance: 5 }).flag, 'within-tolerance');
});

test('a target AUC is handed to the Calvert tool, not computed', () => {
  const r = chemoDoseVerify({ basis: 'carboplatin-target' });
  assert.deepEqual([r.flag, r.calculatedDose], ['handoff', undefined]);
});

test('nothing else is defaulted', () => {
  assert.match(chemoDoseVerify({}).message, /^Choose the dose basis/);
  assert.match(chemoDoseVerify({ basis: 'mg-m2' }).message, /^Enter the regimen dose/);
  assert.match(v({ height: '' }).message, /^Enter the height/);
  assert.match(v({ bsaFormula: '' }).message, /^Choose the body surface area formula/);
  assert.match(v({ orderedDose: '' }).message, /^Enter the ordered dose/);
  assert.equal(chemoDoseVerify(null).valid, false);
});
