// spec-v242: worked examples for the environmental heat / cold indices. Formulas
// spec-v97 verified (Rothfusz/NOAA; Masterton 1979; JAG/TI 2001; Yaglou & Minard
// 1957).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heatIndex, humidex, windChill, wbgt } from '../../lib/environ-v242.js';

test('heat-index: Rothfusz danger band', () => {
  const r = heatIndex({ tempF: 90, humidity: 70 });
  assert.equal(r.score, 105.9);
  assert.equal(r.abnormal, true);
});
test('heat-index: cool conditions use simple formula', () => {
  const r = heatIndex({ tempF: 75, humidity: 40 });
  assert.equal(r.abnormal, false);
});

test('humidex: some discomfort', () => {
  const r = humidex({ tempC: 30, dewpointC: 20 });
  assert.equal(r.score, 37.6);
});
test('humidex: dewpoint cannot exceed air temp', () => {
  assert.equal(humidex({ tempC: 20, dewpointC: 25 }).valid, false);
});

test('wind-chill: 2001 equation', () => {
  const r = windChill({ tempC: -10, windKmh: 30 });
  assert.equal(r.score, -19.5);
});
test('wind-chill: severe cold high frostbite risk', () => {
  const r = windChill({ tempC: -30, windKmh: 40 });
  assert.equal(r.abnormal, true);
});

test('wbgt: outdoor weighted average', () => {
  const r = wbgt({ setting: 'outdoor', naturalWetBulb: 25, globe: 35, dryBulb: 30 });
  assert.equal(r.score, 27.5);
});
test('wbgt: indoor drops globe term', () => {
  const r = wbgt({ setting: 'indoor', naturalWetBulb: 25, dryBulb: 30 });
  assert.equal(r.score, 26.5); // 0.7*25 + 0.3*30
});
