// spec-v200 2.5: APPS score low / intermediate / high triple, corrected bands.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appsArds } from '../../lib/critcare-severity-v200.js';

test('low tier (3-4): youngest / best oxygenation / lowest plateau', () => {
  const r = appsArds({ age: 40, pf: 200, plateau: 25 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.match(r.band, /low-mortality/);
  assert.equal(r.abnormal, false);
});

test('intermediate tier (5-7): all middle bands', () => {
  const r = appsArds({ age: 50, pf: 120, plateau: 28 });
  assert.equal(r.score, 6);
  assert.match(r.band, /intermediate-mortality/);
});

test('high tier (8-9): oldest / worst oxygenation / highest plateau', () => {
  const r = appsArds({ age: 70, pf: 90, plateau: 32 });
  assert.equal(r.score, 9);
  assert.match(r.band, /high-mortality/);
});

test('corrected Villar 2016 cut-points: P/F 105-158 is the middle band', () => {
  // The spec draft wrongly used 84-158 / <84; verified cut is 105-158 / <105.
  assert.equal(appsArds({ age: 40, pf: 100, plateau: 25 }).score, 5); // pf<105 -> +3 (1+3+1)
  assert.equal(appsArds({ age: 40, pf: 120, plateau: 25 }).score, 4); // pf 105-158 -> +2 (1+2+1)
});

test('corrected plateau middle band is greater-than-27 to 30', () => {
  assert.equal(appsArds({ age: 40, pf: 200, plateau: 27 }).score, 3); // plateau <=27 -> +1
  assert.equal(appsArds({ age: 40, pf: 200, plateau: 30 }).score, 4); // plateau 28-30 -> +2
  assert.equal(appsArds({ age: 40, pf: 200, plateau: 31 }).score, 5); // plateau >30 -> +3
});

test('missing inputs -> complete-the-fields', () => {
  const r = appsArds({ age: 60 });
  assert.equal(r.valid, false);
  assert.match(r.message, /plateau/);
});
