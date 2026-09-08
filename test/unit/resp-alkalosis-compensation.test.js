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

test('spec-v1137: an unstated chronicity is not "acute"', () => {
  // The same default as its acidosis sibling, and the same promise in its note.
  const undecided = respAlkalosisCompensation({ paco2: 25, bicarbonate: 21 });
  assert.equal(undecided.valid, false);
  assert.match(undecided.message, /Choose acute or chronic/);
  assert.equal(undecided.expectedAcute, 21);
  assert.equal(undecided.expectedChronic, 18);

  assert.equal(respAlkalosisCompensation({ paco2: 25, bicarbonate: 21, chronic: 'acute' }).expected, 21);
  assert.equal(respAlkalosisCompensation({ paco2: 25, bicarbonate: 21, chronic: true }).expected, 18);
});

test('spec-v1137: where both rates agree, the tile answers', () => {
  const r = respAlkalosisCompensation({ paco2: 25, bicarbonate: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.chronicityStated, false);
  assert.match(r.band, /21 mEq\/L acute or 18 mEq\/L chronic/);
  assert.match(r.band, /reads the same either way/);
});
