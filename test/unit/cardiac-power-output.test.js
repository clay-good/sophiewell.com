// spec-v90 §2.5: Cardiac power output (Fincke 2004).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardiacPowerOutput } from '../../lib/cardio-v90.js';

test('worked example: MAP 80, CO 5 -> 0.89 W, above the shock threshold', () => {
  // (80 x 5) / 451 = 0.8869 -> 0.89
  const r = cardiacPowerOutput({ map: 80, co: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.cpo, 0.89);
  assert.equal(r.belowThreshold, false);
});

test('the 0.6 W threshold flips below it', () => {
  // (65 x 4) / 451 = 0.5765 -> 0.58 W, below 0.6
  const below = cardiacPowerOutput({ map: 65, co: 4 });
  assert.equal(below.cpo, 0.58);
  assert.equal(below.belowThreshold, true);
  // (70 x 4) / 451 = 0.6208 -> 0.62 W, above 0.6
  const above = cardiacPowerOutput({ map: 70, co: 4 });
  assert.equal(above.cpo, 0.62);
  assert.equal(above.belowThreshold, false);
});

test('CPO scales linearly with MAP and CO', () => {
  // (80 x 10) / 451 = 1.7738 -> 1.77 (exactly twice the unrounded base)
  const dbl = cardiacPowerOutput({ map: 80, co: 10 });
  assert.equal(dbl.cpo, 1.77);
});

test('negative inputs clamp to a non-negative result', () => {
  const r = cardiacPowerOutput({ map: -80, co: 5 });
  assert.equal(r.cpo, 0);
  assert.equal(r.belowThreshold, true);
});

test('a blank input renders the complete-the-fields fallback', () => {
  assert.equal(cardiacPowerOutput({ map: 80 }).valid, false);
  assert.equal(cardiacPowerOutput({ co: 5 }).valid, false);
});
