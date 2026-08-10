// spec-v687: Elemental iron ingested - toxic-dose estimator.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { elementalIronIngested } from '../../lib/elemental-iron-ingested-v687.js';

test('worked example: 20 x 325 mg ferrous sulfate, 20 kg -> 1300 mg, 65 mg/kg (severe)', () => {
  const r = elementalIronIngested({ tablets: '20', mgPerTablet: '325', saltType: 'ferrous-sulfate', weightKg: '20' });
  assert.equal(r.valid, true);
  assert.equal(r.elementalMg, 1300);   // 20 * 325 * 0.20
  assert.equal(r.dosePerKg, 65);       // 1300 / 20
  assert.equal(r.tier, 'severe');
  assert.equal(r.abnormal, true);
});

test('salt fractions: sulfate 20%, gluconate 12%, fumarate 33%, elemental 100%', () => {
  const base = { tablets: '10', mgPerTablet: '300', weightKg: '30' };
  assert.equal(elementalIronIngested({ ...base, saltType: 'ferrous-sulfate' }).elementalMg, 600);   // 3000*0.20
  assert.equal(elementalIronIngested({ ...base, saltType: 'ferrous-gluconate' }).elementalMg, 360); // *0.12
  assert.equal(elementalIronIngested({ ...base, saltType: 'ferrous-fumarate' }).elementalMg, 990);  // *0.33
  assert.equal(elementalIronIngested({ ...base, saltType: 'elemental' }).elementalMg, 3000);        // *1.0
});

test('toxicity bands: <20 minimal, 20-60 mild-moderate, 60-150 severe, >150 lethal', () => {
  const mk = (mg, wt) => elementalIronIngested({ tablets: '1', mgPerTablet: String(mg), saltType: 'elemental', weightKg: String(wt) }).tier;
  assert.equal(mk(150, 10), 'minimal');       // 15 mg/kg
  assert.equal(mk(400, 10), 'mild-moderate'); // 40 mg/kg
  assert.equal(mk(1000, 10), 'severe');       // 100 mg/kg
  assert.equal(mk(2000, 10), 'lethal');       // 200 mg/kg
});

test('inputs are validated', () => {
  assert.equal(elementalIronIngested({}).valid, false);
  assert.equal(elementalIronIngested({}).code, 'MISSING_INPUT');
  assert.equal(elementalIronIngested({ tablets: '10', mgPerTablet: '300', saltType: 'ferrous-sulfate' }).field, 'weightKg');
  assert.equal(elementalIronIngested({ tablets: '10', mgPerTablet: '300', saltType: 'bogus', weightKg: '30' }).field, 'saltType');
});
