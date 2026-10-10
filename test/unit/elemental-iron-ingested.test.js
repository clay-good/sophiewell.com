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

// spec-v1641 row 18: each printed fraction is shown with the formula mass it comes from.
test('the result derives each salt fraction from its formula mass', () => {
  const base = { tablets: '10', mgPerTablet: '300', weightKg: '30' };
  const cases = [
    ['ferrous-sulfate', /FeSO4·7H2O.*55\.845 ÷ formula mass 278\.01 = 20\.1%, printed as 20% in the Merck Manual/],
    ['ferrous-gluconate', /C12H22FeO14·2H2O.*formula mass 482\.17 = 11\.6%, printed as 12%/],
    ['ferrous-fumarate', /C4H2FeO4.*formula mass 169\.90 = 32\.9%, printed as 33%/],
  ];
  for (const [saltType, re] of cases) {
    const d = elementalIronIngested({ ...base, saltType }).detail;
    assert.match(d, re);
    // The derived share rounds to the fraction the dose is computed from.
    const [, derived, printed] = d.match(/= (\d+\.\d)%, printed as (\d+)%/);
    assert.equal(Math.round(Number(derived)), Number(printed));
  }
  assert.match(elementalIronIngested({ ...base, saltType: 'ferrous-sulfate' }).detail, /Dried ferrous sulfate \(FeSO4·H2O\) is 32\.9% iron/);
  assert.doesNotMatch(elementalIronIngested({ ...base, saltType: 'ferrous-fumarate' }).detail, /Dried/);
  assert.doesNotMatch(elementalIronIngested({ ...base, saltType: 'elemental' }).detail, /formula mass/);
  assert.equal(elementalIronIngested({ ...base, saltType: 'constructor' }).field, 'saltType');
});
