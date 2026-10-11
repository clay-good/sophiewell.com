// spec-v1630 tool 14: mean kinetic temperature (ICH Q1A(R2); formula as printed in Jenkins 2022).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meanKineticTemperature as m, GAS_CONSTANT, DEFAULT_ACTIVATION_ENERGY } from '../../lib/mean-kinetic-temperature-v1630.js';

const EA = 83.144;

test('the constants are the paper\'s, and Ea / R is 10,000 K', () => {
  assert.equal(GAS_CONSTANT, 0.0083144);
  assert.equal(DEFAULT_ACTIVATION_ENERGY, 83.144);
  assert.ok(Math.abs(DEFAULT_ACTIVATION_ENERGY / GAS_CONSTANT - 10000) < 1e-9);
});

test('a constant log returns its own temperature', () => {
  const r = m({ unit: 'C', activationEnergy: EA, readings: '25\n25\n25' });
  assert.deepEqual([r.mkt, r.mean, r.mktF, r.mktK, r.n], [25, 25, 77, 298.15, 3]);
});

test('20 and 30 °C give 26.26 °C by the formula, above the arithmetic mean of 25', () => {
  // 10,000 / -ln((e^(-10,000/293.15) + e^(-10,000/303.15)) / 2) = 299.41 K.
  const byHand = 10000 / -Math.log((Math.exp(-10000 / 293.15) + Math.exp(-10000 / 303.15)) / 2) - 273.15;
  const r = m({ unit: 'C', activationEnergy: EA, readings: '20\n30' });
  assert.equal(r.mkt, Number(byHand.toFixed(2)));
  assert.deepEqual([r.mkt, r.mean, r.min, r.max], [26.26, 25, 20, 30]);
  // The same log in Fahrenheit.
  const f = m({ unit: 'F', activationEnergy: EA, readings: '68\n86' });
  assert.deepEqual([f.mkt, f.mktC, f.mean], [79.27, 26.26, 77]);
});

test('durations weight each term; equal durations match the unweighted answer', () => {
  assert.equal(m({ unit: 'C', activationEnergy: EA, readings: '20, 1\n30, 1' }).mkt, 26.26);
  const r = m({ unit: 'C', activationEnergy: EA, readings: '20, 23\n40, 1' });
  assert.deepEqual([r.mkt, r.mean, r.timeWeighted], [22.45, 20.83, true]);
  // 23 lines at 20 and one at 40, an hour each, is the same log.
  assert.equal(m({ unit: 'C', activationEnergy: EA, readings: `${'20\n'.repeat(23)}40` }).mkt, 22.45);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20, 23\n40' }).message, /duration on every line or on none/);
});

test('no limit is applied unless one is entered', () => {
  assert.equal(m({ unit: 'C', activationEnergy: EA, readings: '20\n30' }).aboveLimit, undefined);
  const at = m({ unit: 'C', activationEnergy: EA, readings: '25\n25', limit: 25 });
  assert.deepEqual([at.aboveLimit, at.abnormal], [false, false]);
  const over = m({ unit: 'C', activationEnergy: EA, readings: '20\n30', limit: 25 });
  assert.deepEqual([over.aboveLimit, over.abnormal], [true, true]);
  assert.match(over.notes.join(' '), /highest single reading, 30 °C, is above it/);
});

test('the activation energy is required and named in the result; a higher one raises the answer', () => {
  assert.match(m({ unit: 'C', readings: '20\n30' }).message, /83\.144 is the default/);
  const r = m({ unit: 'C', activationEnergy: 120, readings: '20\n30' });
  assert.ok(r.mkt > 26.26 && r.mkt < 30);
  assert.match(r.notes[0], /activation energy of 120 kJ\/mol and/);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20\n30' }).notes[0], /the default used when the manufacturer's stability data are not available/);
});

test('ultra-cold logs do not underflow; bad input is refused by line', () => {
  const cold = m({ unit: 'C', activationEnergy: 500, readings: '-90\n-60' });
  assert.ok(cold.mkt > -75 && cold.mkt < -60);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20\nwarm' }).message, /line 2/);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20\n400' }).message, /line 2/);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20' }).message, /at least two readings/);
  assert.match(m({ activationEnergy: EA, readings: '20\n30' }).message, /°C or °F/);
  assert.match(m({ unit: 'C', activationEnergy: EA, readings: '20\n30' }).note, /not a method for vaccines/);
});
