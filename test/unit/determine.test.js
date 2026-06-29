// spec-v178 §2.6: DETERMINE checklist, 10 weighted items, total 0-21.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { determine } from '../../lib/ltcga-v178.js';

const z = { illness: 'no', fewMeals: 'no', fewFruitVeg: 'no', alcohol: 'no', toothMouth: 'no', money: 'no', eatAlone: 'no', medications: 'no', weightChange: 'no', selfCare: 'no' };

test('DETERMINE 0 -> good', () => {
  assert.match(determine(z).band, /good/);
});

test('DETERMINE band edges (2 good, 3 moderate, 6 high)', () => {
  assert.match(determine({ ...z, illness: 'yes' }).band, /good/); // 2
  assert.match(determine({ ...z, fewMeals: 'yes' }).band, /moderate/); // 3
  assert.match(determine({ ...z, money: 'yes', illness: 'yes' }).band, /high/); // 4+2=6
});

test('DETERMINE weights sum to a max of 21', () => {
  const all = {}; for (const k of Object.keys(z)) all[k] = 'yes';
  assert.equal(determine(all).total, 21);
});

test('DETERMINE guards blanks', () => {
  assert.equal(determine({ ...z, illness: '' }).valid, false);
  assert.equal(determine({}).valid, false);
});
