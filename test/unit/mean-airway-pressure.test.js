// spec-v167 2.1: mean airway pressure, square-wave approximation. The (Ti+Te)
// denominator is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meanAirwayPressure } from '../../lib/oneformula-v167.js';

test('tile example: PIP 30, PEEP 5, Ti 1, Te 2 → 13.3 cmH₂O', () => {
  // (30*1 + 5*2)/(1+2) = 40/3 = 13.33
  const r = meanAirwayPressure({ pip: 30, peep: 5, ti: 1, te: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.maw, 13.3);
});

test('PEEP of 0 is accepted', () => {
  const r = meanAirwayPressure({ pip: 24, peep: 0, ti: 1, te: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.maw, 12); // (24+0)/2
});

test('longer expiratory time lowers the mean', () => {
  const a = meanAirwayPressure({ pip: 30, peep: 5, ti: 1, te: 1 }).maw; // 17.5
  const b = meanAirwayPressure({ pip: 30, peep: 5, ti: 1, te: 4 }).maw; // 10
  assert.ok(b < a);
});

test('guards: blank inputs, missing PEEP', () => {
  assert.equal(meanAirwayPressure({ pip: 30, ti: 1, te: 2 }).valid, false);
  assert.equal(meanAirwayPressure({ pip: 30, peep: 5, ti: 0, te: 2 }).valid, false);
  assert.equal(meanAirwayPressure({}).valid, false);
});
