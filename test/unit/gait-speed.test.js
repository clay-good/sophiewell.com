// spec-v176 §2.5: gait speed (distance / time, m/s). Guarded denominator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gaitSpeed } from '../../lib/ltcga-v176.js';

test('Gait speed = distance / time', () => {
  const r = gaitSpeed({ distanceM: 4, timeS: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.speed, 0.8);
  assert.equal(r.value, 0.8);
});

test('Gait speed 0.8 m/s boundary (limited-community-ambulation cut-point)', () => {
  // < 0.8 is limited community ambulation; 0.8 itself is above that cut.
  assert.match(gaitSpeed({ distanceM: 4, timeS: 5.4 }).band, /limited community ambulation/); // 0.74
  assert.match(gaitSpeed({ distanceM: 4, timeS: 5 }).band, /reduced/); // 0.80
});

test('Gait speed < 0.6 high risk; >= 1.0 healthy', () => {
  assert.match(gaitSpeed({ distanceM: 4, timeS: 8 }).band, /high risk/); // 0.5
  assert.match(gaitSpeed({ distanceM: 4, timeS: 4 }).band, /healthy/); // 1.0
});

test('Gait speed guards the time denominator (zero/blank/negative -> valid:false, never Infinity)', () => {
  const zero = gaitSpeed({ distanceM: 4, timeS: 0 });
  assert.equal(zero.valid, false);
  assert.equal(gaitSpeed({ distanceM: 4, timeS: '' }).valid, false);
  assert.equal(gaitSpeed({ distanceM: 4, timeS: -2 }).valid, false);
  assert.equal(gaitSpeed({ distanceM: 0, timeS: 5 }).valid, false);
  assert.equal(gaitSpeed({}).valid, false);
});
