// spec-v186 §2.5: estimated VO2max & METs (Bruce treadmill / Cooper field test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vo2maxExercise } from '../../lib/specialtymath-v186.js';

test('tile example: Bruce protocol, man, 10 minutes', () => {
  // 14.76 − 13.79 + 45.1 − 12 = 34.07 -> 34.1; METs = 34.07/3.5 = 9.7
  const r = vo2maxExercise({ method: 'bruce', sex: 'male', time: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.vo2max, 34.1);
  assert.equal(r.mets, 9.7);
});

test('Cooper 12-minute run, 2400 m', () => {
  // (2400 − 504.9)/44.73 = 42.37 -> 42.4
  const r = vo2maxExercise({ method: 'cooper', distance: 2400 });
  assert.equal(r.valid, true);
  assert.equal(r.vo2max, 42.4);
  assert.equal(r.mets, 12.1);
});

test('the women’s Bruce formula differs from the men’s', () => {
  const man = vo2maxExercise({ method: 'bruce', sex: 'male', time: 10 });
  const woman = vo2maxExercise({ method: 'bruce', sex: 'female', time: 10 });
  assert.ok(woman.vo2max !== man.vo2max);
});

test('guards: method required; Bruce needs time + sex; Cooper needs distance', () => {
  assert.equal(vo2maxExercise({ method: 'bruce', sex: 'male' }).valid, false);
  assert.equal(vo2maxExercise({ method: 'cooper' }).valid, false);
  assert.equal(vo2maxExercise({ time: 10, sex: 'male' }).valid, false);
  assert.equal(vo2maxExercise({}).valid, false);
});
