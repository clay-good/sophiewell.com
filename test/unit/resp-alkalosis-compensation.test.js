// spec-v129 2.4: expected HCO3 in respiratory alkalosis (Gennari 1972).
// expected HCO3 = 24 - k*(40-PaCO2)/10; k = 2 acute, 4 chronic; not below a
// physiologic floor (~18 acute, ~12 chronic). Measured outside +/-2 flags an
// added metabolic disorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { respAlkalosisCompensation } from '../../lib/acidbase-v129.js';

test('acute, PaCO2 25 -> expected HCO3 21, measured 21 matches', () => {
  const r = respAlkalosisCompensation({ paco2: 25, bicarbonate: 21, chronic: false });
  assert.equal(r.valid, true);
  assert.equal(r.expected, 21); // 24 - 2*(15)/10
  assert.equal(r.abnormal, false);
  assert.match(r.band, /appropriate compensation/);
});

test('chronic, PaCO2 25 -> expected HCO3 18 (boundary acute vs chronic)', () => {
  const r = respAlkalosisCompensation({ paco2: 25, bicarbonate: 18, chronic: true });
  assert.equal(r.expected, 18); // 24 - 4*(15)/10
  assert.equal(r.abnormal, false);
});

test('chronic floor clamps expected HCO3 at 12', () => {
  const r = respAlkalosisCompensation({ paco2: 10, bicarbonate: 12, chronic: true });
  // 24 - 4*(30)/10 = 12 -> at floor
  assert.equal(r.expected, 12);
});

test('measured HCO3 below expected -> added metabolic acidosis flag', () => {
  const r = respAlkalosisCompensation({ paco2: 25, bicarbonate: 14, chronic: false });
  assert.equal(r.expected, 21);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /metabolic acidosis/);
});

test('any blank field -> valid:false', () => {
  assert.equal(respAlkalosisCompensation({ bicarbonate: 21 }).valid, false);
  assert.equal(respAlkalosisCompensation(5).valid, false);
});
