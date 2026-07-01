// spec-v185 §2.3: Qp/Qs pulmonary-to-systemic flow ratio. The transpulmonary
// (PvO2 − PaO2) denominator is guarded against zero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qpQs } from '../../lib/gaps-v185.js';

test('tile example: large left-to-right shunt', () => {
  // (95 − 60) / (98 − 85) = 35/13 = 2.69
  const r = qpQs({ sao2: 95, mvo2: 60, pvo2: 98, pao2: 85 });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 2.69);
  assert.equal(r.bandLabel, 'Large left-to-right shunt');
});

test('no net shunt near 1.0 and moderate shunt band', () => {
  // (95 − 75)/(98 − 78) = 20/20 = 1.0
  const none = qpQs({ sao2: 95, mvo2: 75, pvo2: 98, pao2: 78 });
  assert.equal(none.ratio, 1);
  assert.equal(none.bandLabel, 'No significant net shunt');
  // (96 − 60)/(99 − 79) = 36/20 = 1.8
  const mod = qpQs({ sao2: 96, mvo2: 60, pvo2: 99, pao2: 79 });
  assert.equal(mod.ratio, 1.8);
  assert.equal(mod.bandLabel, 'Moderate left-to-right shunt');
});

test('pulmonary-vein saturation defaults to 98%', () => {
  const r = qpQs({ sao2: 95, mvo2: 60, pao2: 85 });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 2.69);
});

test('guards: equal PvO2 and PaO2 is undefined; blanks fall back', () => {
  assert.equal(qpQs({ sao2: 95, mvo2: 60, pvo2: 90, pao2: 90 }).valid, false);
  assert.equal(qpQs({ sao2: 95, mvo2: 60 }).valid, false);
  assert.equal(qpQs({}).valid, false);
});
