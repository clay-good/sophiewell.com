// spec-v195 2.1: sfRatio worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sfRatio } from '../../lib/vent-v195.js';

test('ARDS-range S/F with estimated P/F', () => {
  const r = sfRatio({spo2:95,fio2:0.5});
  assert.equal(r.valid, true);
  assert.equal(r.sf, 190);
  assert.equal(r.pf, 150);
});

test('ceiling caveat above SpO2 97', () => {
  const r = sfRatio({spo2:99,fio2:0.3});
  assert.equal(r.ceilingHit, true);
});

test('guards: FiO2 required', () => {
  const r = sfRatio({spo2:95});
  assert.equal(r.valid, false);
});
