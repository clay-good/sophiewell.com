// spec-v129 2.3: expected HCO3 in respiratory acidosis (Brackett 1965 acute;
// Schwartz 1965 chronic). expected HCO3 = 24 + k*(PaCO2-40)/10; k = 1 acute,
// 4 chronic. Measured outside +/-2 flags an added metabolic disorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { respAcidosisCompensation } from '../../lib/acidbase-v129.js';

test('acute, PaCO2 60 -> expected HCO3 26, measured 26 matches', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 26, chronic: false });
  assert.equal(r.valid, true);
  assert.equal(r.expected, 26); // 24 + 1*(20)/10
  assert.equal(r.abnormal, false);
  assert.match(r.band, /appropriate compensation/);
});

test('chronic, PaCO2 60 -> expected HCO3 32 (boundary acute vs chronic)', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 32, chronic: true });
  assert.equal(r.expected, 32); // 24 + 4*(20)/10
  assert.equal(r.abnormal, false);
});

test('measured HCO3 above expected -> added metabolic alkalosis flag', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 36, chronic: false });
  assert.equal(r.expected, 26);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /metabolic alkalosis/);
});

test('measured HCO3 below expected -> added metabolic acidosis flag', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 20, chronic: true });
  assert.equal(r.expected, 32);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /metabolic acidosis/);
});

test('any blank field -> valid:false', () => {
  assert.equal(respAcidosisCompensation({ paco2: 60 }).valid, false);
  assert.equal(respAcidosisCompensation('x').valid, false);
});
