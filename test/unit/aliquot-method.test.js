// spec-v1629 tool 10: the aliquot method.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aliquotMethod as al } from '../../lib/aliquot-method-v1629.js';

test('a drug quantity already at or above the minimum says no aliquot is needed', () => {
  const r = al({ form: 'solid', needed: 150, minimum: 120 });
  assert.equal(r.aliquotNeeded, false);
  assert.match(r.band, /No aliquot is needed/);
  assert.equal(al({ form: 'liquid', needed: 120, minimum: 120 }).aliquotNeeded, false);
});

test('solid: the smallest whole multiple, and an aliquot that carries the drug wanted', () => {
  const r = al({ form: 'solid', needed: 5, minimum: 120 });
  assert.equal(r.multiple, 24);
  assert.deepEqual([r.drugMg, r.diluentMg, r.aliquotMg, r.mixtureMg], [120, 2760, 120, 2880]);
  assert.equal(r.allMeasurable, true);
  assert.equal((r.drugMg * r.aliquotMg) / r.mixtureMg, 5);
});

test('each of the three measured quantities is checked against the minimum, not only the drug', () => {
  // 100 mg wanted, 120 mg minimum: twice the drug is weighable, but a 120 mg aliquot leaves 40 mg of diluent.
  const bad = al({ form: 'solid', needed: 100, minimum: 120, aliquot: 120 });
  assert.equal(bad.diluentMg, 40);
  assert.equal(bad.allMeasurable, false);
  assert.equal(bad.abnormal, true);
  assert.match(bad.notes.join(' '), /Diluent to weigh: 40 mg, BELOW the minimum of 120 mg/);
  assert.match(bad.notes.join(' '), /an aliquot of at least 160 mg keeps all three/);
  // With no aliquot entered the tool picks the smallest that keeps all three weighable.
  const ok = al({ form: 'solid', needed: 100, minimum: 120 });
  assert.deepEqual([ok.drugMg, ok.diluentMg, ok.aliquotMg], [200, 120, 160]);
  assert.equal(ok.allMeasurable, true);
  assert.match(al({ form: 'solid', needed: 100, minimum: 120, aliquot: 90 }).message, /must weigh more than the drug in it/);
});

test('liquid: the aliquot is the volume over the multiple, checked against the smallest measurable volume', () => {
  const r = al({ form: 'liquid', needed: 5, minimum: 120, volume: 240, minVolume: 5 });
  assert.deepEqual([r.multiple, r.drugMg, r.aliquotMl], [24, 120, 10]);
  assert.equal(r.allMeasurable, true);
  const small = al({ form: 'liquid', needed: 5, minimum: 120, volume: 24, minVolume: 5 });
  assert.equal(small.aliquotMl, 1);
  assert.equal(small.allMeasurable, false);
  assert.match(small.notes.join(' '), /dissolving to at least 120 mL keeps the aliquot at or above 5 mL/);
});

test('nothing is defaulted', () => {
  assert.match(al({}).message, /Choose the method/);
  assert.match(al({ form: 'solid', needed: 5 }).message, /Enter the minimum weighable quantity/);
  assert.match(al({ form: 'solid', minimum: 120 }).message, /Enter the quantity of drug needed/);
  assert.match(al({ form: 'liquid', needed: 5, minimum: 120 }).message, /Enter the volume the drug is dissolved to/);
  assert.match(al({ form: 'liquid', needed: 5, minimum: 120, volume: 100 }).message, /Enter the smallest volume you can measure/);
  assert.match(al({ form: 'solid', needed: 0.0001, minimum: 120 }).message, /serial dilution or a more sensitive balance/);
});
