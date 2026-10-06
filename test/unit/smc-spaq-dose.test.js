// spec-v1552 tool 4: SMC SP+AQ by age. The 3/12/60-month edges, the whole infant SP tablet, weight dosing
// from 60 months, the mg/kg check, contraindications, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { smcSpaqDose as s } from '../../lib/smc-spaq-dose-v1552.js';

const B = { contra: 'none' };

test('age packs: under 3 months none, infant pack to under 12, child pack to 59', () => {
  assert.equal(s({ ...B, age: '2.9' }).bandLabel, 'Under 3 months');
  const inf = s({ ...B, age: '3' });
  assert.equal(inf.bandLabel, 'Infant pack');
  assert.match(inf.band, /one SP 250\/12\.5 mg tablet and the first of three AQ 75 mg tablets/);
  assert.equal(s({ ...B, age: '11.9' }).bandLabel, 'Infant pack');
  assert.equal(s({ ...B, age: '12' }).bandLabel, 'Child pack');
  assert.equal(s({ ...B, age: '59.9' }).bandLabel, 'Child pack');
});

test('60 months or older: by weight, which is then required', () => {
  assert.match(s({ ...B, age: '60' }).message, /Enter the weight/);
  const r = s({ ...B, age: '72', weight: '20' });
  assert.equal(r.bandLabel, 'By weight');
  assert.match(r.band, /sulfadoxine-pyrimethamine 500\/25 mg once on day 1, and amodiaquine 200 mg base on days 1, 2 and 3/);
});

test('with a weight, the pack shows its mg/kg', () => {
  assert.match(s({ ...B, age: '24', weight: '12' }).notes[0], /sulfadoxine 41\.7 mg\/kg .* amodiaquine 12\.5 mg\/kg/);
  assert.match(s({ ...B, age: '24' }).notes[0], /No weight was entered/);
});

test('contraindications stop the cycle', () => {
  for (const c of ['ill', 'ctx', 'recent', 'allergy']) assert.equal(s({ age: '24', contra: c }).bandLabel, 'Not this cycle', c);
});

test('refusals', () => {
  assert.equal(s({ age: '24' }).valid, false);
  assert.equal(s({ ...B }).valid, false);
  assert.equal(s({ ...B, age: '24', weight: '1' }).valid, false);
});
