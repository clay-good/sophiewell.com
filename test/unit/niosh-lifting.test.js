import test from 'node:test';
import assert from 'node:assert/strict';
import { nioshLifting as n, frequencyMultiplier, couplingMultiplier, LOAD_CONSTANT_LB, H_MAX, V_MAX, A_MAX } from '../../lib/niosh-lifting-v885.js';

const base = {
  loadWeightLb: 30, horizontalInches: 15, verticalInches: 30, travelInches: 20,
  asymmetryDegrees: 0, liftsPerMinute: 1, duration: 'short', coupling: 'good',
};

test('niosh-lifting: the worked example from the applications manual', () => {
  const r = n(base);
  assert.equal(LOAD_CONSTANT_LB, 51);
  assert.deepEqual(r.multipliers, { hm: 0.67, vm: 1, dm: 0.91, am: 1, fm: 0.94, cm: 1 });
  assert.equal(r.rwl, 29.23);
  assert.equal(r.li, 1.03);
});

test('niosh-lifting: eleven published frequency-table spot-checks', () => {
  // The two vertical bands are identical to 8 lifts per minute and diverge above it, which is
  // the part of the table most often flattened.
  const checks = [
    [1, 'short', 35, 0.94], [8, 'short', 35, 0.60], [13, 'short', 35, 0.34], [13, 'short', 20, 0.00],
    [11, 'moderate', 35, 0.23], [11, 'moderate', 20, 0.00],
    [9, 'long', 35, 0.15], [9, 'long', 20, 0.00],
    [0.2, 'long', 20, 0.85], [0.5, 'moderate', 20, 0.92], [16, 'short', 35, 0.00],
  ];
  for (const [f, d, v, expected] of checks) {
    assert.equal(frequencyMultiplier(f, d, v), expected, `${f}/min ${d} V=${v}`);
  }
});

test('niosh-lifting: the coupling table splits on the vertical band', () => {
  assert.equal(couplingMultiplier('good', 20), 1.00);
  assert.equal(couplingMultiplier('good', 35), 1.00);
  assert.equal(couplingMultiplier('fair', 20), 0.95);
  assert.equal(couplingMultiplier('fair', 35), 1.00);
  assert.equal(couplingMultiplier('poor', 20), 0.90);
  assert.equal(couplingMultiplier('poor', 35), 0.90);
});

test('niosh-lifting: each multiplier follows its published formula', () => {
  // Horizontal below 10 inches is capped at 1.
  assert.equal(n({ ...base, horizontalInches: 5 }).multipliers.hm, 1);
  assert.equal(n({ ...base, horizontalInches: 20 }).multipliers.hm, 0.5);
  // Vertical is symmetric about 30 inches.
  assert.equal(n({ ...base, verticalInches: 0 }).multipliers.vm, 0.78);
  assert.equal(n({ ...base, verticalInches: 60 }).multipliers.vm, 0.78);
  // Travel below 10 inches is capped at 1.
  assert.equal(n({ ...base, travelInches: 5 }).multipliers.dm, 1);
  assert.equal(n({ ...base, asymmetryDegrees: 90 }).multipliers.am, 0.71);
});

test('niosh-lifting: a domain limit means outside the equation, not a safe weight of zero', () => {
  // The reason the tile exists, second half.
  for (const [field, value, word] of [['horizontalInches', H_MAX + 1, 'horizontal'], ['verticalInches', V_MAX + 1, 'vertical'], ['asymmetryDegrees', A_MAX + 1, 'asymmetry']]) {
    const r = n({ ...base, [field]: value });
    assert.equal(r.rwl, 0, field);
    assert.equal(r.li, null, field);
    assert.equal(r.indexBand, 'not-evaluable', field);
    assert.match(r.action, new RegExp(word));
    assert.match(r.action, /outside what it can evaluate, not that the safe weight is nothing/);
    assert.match(r.domainNote, /Redesign the task/);
  }
  assert.equal(n(base).domainNote, null);
});

test('niosh-lifting: the index bands', () => {
  assert.equal(n({ ...base, loadWeightLb: 20 }).indexBand, 'within');
  assert.equal(n({ ...base, loadWeightLb: 20 }).abnormal, false);
  assert.equal(n({ ...base, loadWeightLb: 40 }).indexBand, 'above');
  assert.equal(n({ ...base, loadWeightLb: 120 }).indexBand, 'well-above');
});

test('niosh-lifting: the index is a design number and the scope is stated, on every result', () => {
  for (const input of [base, { ...base, loadWeightLb: 120 }, { ...base, horizontalInches: 40 }]) {
    assert.match(n(input).designNumberNote, /not a prediction about a person/);
    assert.match(n(input).scopeOfEquationNote, /two-handed, smooth, unhurried lifts/);
    assert.match(n(input).scopeOfEquationNote, /gives no warning of its own/);
  }
});

test('niosh-lifting: the required measurements and the ranges', () => {
  assert.equal(n({}).valid, false);
  assert.match(n({}).message, /Enter the load weight/);
  assert.equal(n({ ...base, loadWeightLb: 501 }).valid, false);
  assert.equal(n({ ...base, liftsPerMinute: 21 }).valid, false);
  // Unknown enum values fall back rather than throwing.
  assert.equal(n({ ...base, duration: 'made-up', coupling: 'made-up' }).valid, true);
});
