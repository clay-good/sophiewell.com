// spec-v110 2.3: High-dose insulin euglycemia therapy (Engebretsen 2011). Bolus
// 1 unit/kg, infusion 1 unit/kg/hr titratable to a 10 unit/kg/hr ceiling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hietDosing } from '../../lib/tox-v110.js';

test('default 80 kg: 80-unit bolus, 80 units/hr start, 800 units/hr ceiling', () => {
  const r = hietDosing({ weight: 80 });
  assert.equal(r.valid, true);
  assert.equal(r.bolus, 80);
  assert.equal(r.startRate, 80);
  assert.equal(r.ceiling, 800);
  assert.equal(r.rateClamped, false);
});

test('titrated rate scales the infusion: 5 unit/kg/hr at 80 kg -> 400 units/hr', () => {
  const r = hietDosing({ weight: 80, rate: 5 });
  assert.equal(r.startRate, 400);
  assert.equal(r.rateClamped, false);
});

test('band flip: the 10 unit/kg/hr ceiling clamps the infusion rate', () => {
  const r = hietDosing({ weight: 80, rate: 12 });
  assert.equal(r.rateClamped, true);
  assert.equal(r.startRate, 800); // clamped to 10 unit/kg/hr x 80
  assert.match(r.band, /clamped to the 10 unit\/kg\/hr ceiling/);
});

test('exactly 10 unit/kg/hr is the ceiling, not clamped', () => {
  const r = hietDosing({ weight: 80, rate: 10 });
  assert.equal(r.rateClamped, false);
  assert.equal(r.startRate, 800);
});

test('guards zero / blank / negative weight', () => {
  assert.equal(hietDosing({ weight: 0 }).valid, false);
  assert.equal(hietDosing({}).valid, false);
  assert.equal(hietDosing({ weight: -10 }).valid, false);
});

test('spec-v1741: a weight past the envelope is refused, a heavy real one and the example answer', () => {
  const tenX = hietDosing({ weight: 5000 });
  assert.equal(tenX.valid, false);
  assert.match(tenX.band, /plausible range for weight/);
  assert.equal(hietDosing({ weight: 250 }).valid, true);
  assert.equal(hietDosing({ weight: 80 }).band,
    'HIET: bolus 80 units (1 unit/kg), starting infusion 80 units/hr (1 unit/kg/hr), titration ceiling 800 units/hr (10 unit/kg/hr); pair with a dextrose infusion to maintain euglycemia.');
});
