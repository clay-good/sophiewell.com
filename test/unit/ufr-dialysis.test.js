// spec-v127 2.4: UFR (Flythe 2011). vol/(weight*hours) mL/kg/hr; >13 flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ufrDialysis } from '../../lib/nephro-v127.js';

test('above the 13 mL/kg/hr threshold', () => {
  const r = ufrDialysis({ volume: 3.5, hours: 3, weight: 70 });
  assert.equal(r.valid, true);
  assert.equal(r.ufr, 16.67);
  assert.equal(r.abnormal, true);
});

test('at or below threshold not flagged', () => {
  const r = ufrDialysis({ volume: 2.0, hours: 4, weight: 80 });
  assert.equal(r.ufr, 6.25);
  assert.equal(r.abnormal, false);
});

test('zero/blank denominator -> valid:false (no divide-by-zero)', () => {
  assert.equal(ufrDialysis({ volume: 3, hours: 0, weight: 70 }).valid, false);
  assert.equal(ufrDialysis({ volume: 3, hours: 3 }).valid, false);
  assert.equal(ufrDialysis(9).valid, false);
});
