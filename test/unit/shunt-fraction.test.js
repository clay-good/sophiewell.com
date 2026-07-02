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
