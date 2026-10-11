// spec-v1630 tool 8: aluminum in a PN order (21 CFR 201.323).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pnAluminumLoad as al } from '../../lib/pn-aluminum-load-v1630.js';

const bag = 'Amino acids 10%, 60, 25\nDextrose 50%, 40, 600\nPotassium phosphates, 1, 900\nCalcium gluconate, 4, 400';

test('each component is volume in liters times its label figure; the total is divided by the weight', () => {
  const r = al({ weight: 1.2, weightUnit: 'kg', components: bag });
  // 1.5 + 24 + 0.9 + 1.6 = 28 mcg; 28 / 1.2 = 23.33.
  assert.deepEqual([r.totalMcg, r.mcgPerKgDay, r.band4to5, r.abnormal], [28, 23.33, 'over 5', true]);
  assert.deepEqual(r.components.map((c) => [c.name, c.mcg]), [['Dextrose 50%', 24], ['Calcium gluconate', 1.6], ['Amino acids 10%', 1.5], ['Potassium phosphates', 0.9]]);
  assert.match(r.band, /^No more than 23\.33 mcg\/kg\/day/);
  assert.match(r.note, /upper bound/);
});

test('grams and pounds give the same answer as kilograms', () => {
  assert.equal(al({ weight: 1200, weightUnit: 'g', components: bag }).mcgPerKgDay, 23.33);
  assert.equal(al({ weight: 154.324, weightUnit: 'lb', components: 'Bag, 2000, 25' }).mcgPerKgDay, al({ weight: 70, weightUnit: 'kg', components: 'Bag, 2000, 25' }).mcgPerKgDay);
});

test('the three bands: at or under 4, between 4 and 5, over 5', () => {
  // 1 L at 400 mcg/L is 400 mcg.
  const at = (kg) => al({ weight: kg, weightUnit: 'kg', components: 'Additive, 1000, 400' });
  assert.deepEqual([at(100).mcgPerKgDay, at(100).band4to5, at(100).abnormal], [4, 'at or under 4', false]);
  assert.deepEqual([at(90).band4to5, at(90).abnormal], ['between 4 and 5', true]);
  assert.deepEqual([at(80).mcgPerKgDay, at(80).band4to5], [5, 'between 4 and 5']);
  assert.equal(at(79).band4to5, 'over 5');
});

test('an all-25 adult bag sits far under the warning figures and still quotes the warning', () => {
  const r = al({ weight: 70, weightUnit: 'kg', components: 'Amino acids, 1000, 25\nDextrose 70%, 350, 25\nLipid, 250, 25' });
  assert.deepEqual([r.totalMcg, r.mcgPerKgDay, r.band4to5], [40, 0.5714, 'at or under 4']);
  assert.match(r.notes.at(-1), /21 CFR 201\.323\(e\).*greater than 4 to 5 mcg\/kg\/day/);
});

test('no label figure is defaulted, and the weight unit is required', () => {
  assert.match(al({ weight: 70, weightUnit: 'kg', components: 'Amino acids, 1000' }).message, /Component line 1/);
  assert.match(al({ weight: 70, weightUnit: 'kg', components: '1000, 25' }).message, /Component line 1/);
  assert.match(al({ weight: 70, components: 'x, 1000, 25' }).message, /weight unit/);
  assert.match(al({ weight: 70, weightUnit: 'kg' }).message, /each component/);
  assert.match(al({ weight: 0.1, weightUnit: 'kg', components: 'x, 1000, 25' }).message, /below the 0\.2 kg/);
  // A label that says 0 is an answer, not a blank.
  assert.equal(al({ weight: 70, weightUnit: 'kg', components: 'Sterile water, 500, 0' }).totalMcg, 0);
});
