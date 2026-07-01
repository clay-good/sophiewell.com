// spec-v185 §2.8: lean body weight (Janmahasatian). The BMI denominator is
// guarded via the positive height/weight inputs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leanBodyWeight } from '../../lib/gaps-v185.js';

test('tile example: male, 100 kg, 180 cm', () => {
  // BMI = 100/1.8² = 30.86; LBW = 9270·100/(6680 + 216·30.86) = 69.5 kg
  const r = leanBodyWeight({ sex: 'male', weight: 100, height: 180 });
  assert.equal(r.valid, true);
  assert.equal(r.lbw, 69.5);
  assert.equal(r.bmi, 30.9);
});

test('the female equation gives a lower LBW at the same body size', () => {
  const man = leanBodyWeight({ sex: 'male', weight: 100, height: 180 });
  const woman = leanBodyWeight({ sex: 'female', weight: 100, height: 180 });
  assert.equal(woman.lbw, 56.8);
  assert.ok(woman.lbw < man.lbw);
});

test('LBW is reported as a percent of total body weight', () => {
  const r = leanBodyWeight({ sex: 'male', weight: 100, height: 180 });
  assert.equal(r.pctTbw, 69.5);
});

test('guards: sex required; blanks fall back', () => {
  assert.equal(leanBodyWeight({ weight: 100, height: 180 }).valid, false);
  assert.equal(leanBodyWeight({ sex: 'male', height: 180 }).valid, false);
  assert.equal(leanBodyWeight({}).valid, false);
});
