// spec-v194 2.4: shuntFraction worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuntFraction } from '../../lib/hemo-v194.js';

test('normal shunt fraction', () => {
  const r = shuntFraction({hb:15,pAO2:110,sao2:99,pao2:95,svo2:75,pvo2:40});
  assert.equal(r.valid, true);
  assert.equal(r.pct, 4.7);
  assert.equal(r.abnormal, false);
});

test('elevated shunt fraction', () => {
  const r = shuntFraction({hb:15,pAO2:100,sao2:90,pao2:60,svo2:60,pvo2:35});
  assert.equal(r.pct, 25.9);
  assert.equal(r.abnormal, true);
});

test('guards: missing mixed-venous invalid', () => {
  const r = shuntFraction({hb:15,pAO2:110,sao2:99,pao2:95});
  assert.equal(r.valid, false);
});

// spec-v1739: oxygen out of its gradient (venous above arterial, arterial above alveolar) is refused, not a
// shunt of 497%.
test('oxygen values out of their gradient are refused', () => {
  const b = { hb: 15, pAO2: 110, sao2: 99, pao2: 95, svo2: 75, pvo2: 40 };
  assert.match(shuntFraction({ ...b, sao2: 70, svo2: 95 }).message, /mixed-venous SvO₂ \(95\) is above the arterial SaO₂ \(70\)/);
  assert.equal(shuntFraction({ ...b, pvo2: 120 }).valid, false);
  assert.equal(shuntFraction({ ...b, pao2: 120 }).valid, false);
  assert.equal(shuntFraction({ ...b, pao2: 110 }).valid, true, 'equal tensions answer');
});
