// spec-v1564 §3: foodborne-trematode-treatment. Every regimen is checked against the 2011 WHO expert consultation
// (chapter 5) and the WHO Model Formulary 2008 (section 6.1.3), read October 9, 2026.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foodborneTrematodeTreatment as f } from '../../lib/foodborne-trematode-treatment-v1564.js';

test('liver fluke from fish: 40 mg/kg once in preventive chemotherapy; 25 mg/kg 3 times a day for 2 days for one person', () => {
  const pc = f({ infection: 'liver-fluke', use: 'pc', weight: '25', age: '9' });
  assert.equal(pc.band, 'Praziquantel 1,000 mg (40 mg/kg, 1.7 × 600 mg tablets) once, as a single dose.');
  assert.match(pc.notes[0], /yearly where 20% or more/);
  const one = f({ infection: 'liver-fluke', use: 'person', weight: '60', age: '40' });
  assert.equal(one.band, 'Praziquantel 1,500 mg (25 mg/kg, 2.5 × 600 mg tablets) three times a day for 2 days.');
  assert.match(one.notes[0], /^Or: Praziquantel 2,400 mg \(40 mg\/kg/);
  assert.ok(one.notes.some((n) => /2010 formulary for children .* for 1 day instead of 2/.test(n)), 'the two formularies disagree, and it says so');
});

test('fascioliasis: triclabendazole 10 mg/kg once; 20 mg/kg for one person after failure', () => {
  const r = f({ infection: 'fasciola', use: 'person', weight: '50', age: '30' });
  assert.equal(r.band, 'Triclabendazole 500 mg (10 mg/kg, 2 × 250 mg tablets) once, as a single dose.');
  assert.match(r.notes[0], /^Or: Triclabendazole 1,000 mg \(20 mg\/kg.*after treatment failure/);
  assert.equal(f({ infection: 'fasciola', use: 'pc', weight: '50', age: '30', pregnancy: 'no' }).notes.length, 0);
});

test('paragonimiasis: two 10 mg/kg doses the same day for a person, or praziquantel for 3 days; 20 mg/kg once in mass treatment', () => {
  const r = f({ infection: 'paragonimus', use: 'person', weight: '48', age: '12' });
  assert.equal(r.band, 'Triclabendazole 480 mg (10 mg/kg, 1.9 × 250 mg tablets) twice a day, the same day (20 mg/kg in all).');
  assert.match(r.notes[0], /^Or: Praziquantel 1,200 mg \(25 mg\/kg.*for 3 days, only if/);
  assert.ok(r.notes.some((n) => /in hospital/.test(n)));
  assert.equal(f({ infection: 'paragonimus', use: 'pc', weight: '48', age: '12', pregnancy: 'no' }).band, 'Triclabendazole 960 mg (20 mg/kg, 3.8 × 250 mg tablets) once, as a single dose.');
});

test('who mass treatment leaves out: under 4, and with triclabendazole pregnancy (and breastfeeding for fascioliasis)', () => {
  assert.match(f({ infection: 'liver-fluke', use: 'pc', weight: '14', age: '3' }).band, /^Not given in preventive chemotherapy under 4 years/);
  assert.match(f({ infection: 'fasciola', use: 'pc', weight: '50', age: '25', pregnancy: 'breastfeeding' }).band, /breastfeeding woman/);
  assert.match(f({ infection: 'paragonimus', use: 'pc', weight: '50', age: '25', pregnancy: 'pregnant' }).band, /pregnant woman/);
  assert.match(f({ infection: 'paragonimus', use: 'pc', weight: '50', age: '25', pregnancy: 'breastfeeding' }).band, /^Triclabendazole/, 'breastfeeding is not an exclusion for paragonimiasis');
  assert.match(f({ infection: 'liver-fluke', use: 'pc', weight: '50', age: '25', pregnancy: 'pregnant' }).band, /^Praziquantel/, 'praziquantel may be given in pregnancy');
  // A blank pregnancy answer is disclosed, never read as "no".
  assert.ok(f({ infection: 'fasciola', use: 'pc', weight: '50', age: '25' }).notes.some((n) => /^Pregnancy and breastfeeding not assessed/.test(n)));
  // Under 4, one person: a dose, with the supervision condition.
  const child = f({ infection: 'fasciola', use: 'person', weight: '14', age: '3' });
  assert.match(child.band, /^Triclabendazole 140 mg/);
  assert.ok(child.notes.some((n) => /under medical supervision/.test(n)));
});

test('refusals: no infection, no use, a weight or age out of range', () => {
  assert.equal(f({}).valid, false);
  assert.equal(f({ infection: 'fasciola' }).valid, false);
  assert.equal(f({ infection: 'fasciola', use: 'person', weight: '', age: '3' }).message, 'Enter the weight in kg.');
  assert.equal(f({ infection: 'fasciola', use: 'person', weight: '500', age: '3' }).valid, false);
  assert.equal(f({ infection: 'fasciola', use: 'person', weight: '50', age: '' }).valid, false);
});
