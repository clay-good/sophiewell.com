// spec-v1505 tool 2: part-b-or-d, against SSA §1861(s) and 42 CFR 410.63.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partBOrD as p, CATEGORIES } from '../../lib/part-b-or-d.js';

test('a clinician-given drug is Part B unless the MAC lists it as self-administered; unknown says it depends', () => {
  assert.equal(p({ category: 'incident', sad: 'no' }).answer, 'Part B');
  assert.equal(p({ category: 'incident', sad: 'yes' }).answer, 'Part D');
  assert.equal(p({ category: 'incident' }).answer, 'Depends on the MAC\'s self-administered drug list');
  assert.equal(p({ category: 'incident', sad: 'unknown' }).answer, 'Depends on the MAC\'s self-administered drug list');
});

test('vaccines: flu, pneumococcal and COVID-19 are Part B; hepatitis B by risk, including an unknown history', () => {
  for (const v of ['influenza', 'pneumococcal', 'covid', 'injury']) assert.equal(p({ category: 'vaccine', vaccine: v }).answer, 'Part B', v);
  assert.equal(p({ category: 'vaccine', vaccine: 'other' }).answer, 'Part D');
  assert.equal(p({ category: 'vaccine', vaccine: 'hepb', hepbRisk: 'yes' }).answer, 'Part B');
  assert.equal(p({ category: 'vaccine', vaccine: 'hepb', hepbRisk: 'no' }).answer, 'Part D');
  assert.match(p({ category: 'vaccine', vaccine: 'hepb' }).message, /never completed the vaccine series/);
});

test('each statutory category turns on its own condition, and a blank condition is asked for', () => {
  const cases = [
    ['immunosuppressant', 'medicareTransplant'], ['oral-anticancer', 'sameAsInjectable'], ['oral-antiemetic', 'within48'],
    ['esa-dialysis', 'dialysis'], ['ivig-home', 'primaryImmuneDeficiency'], ['parenteral-nutrition', 'permanent'], ['dme', 'atHome'],
  ];
  for (const [category, key] of cases) {
    assert.equal(p({ category, [key]: 'yes' }).answer, 'Part B', `${category} yes`);
    assert.equal(p({ category, [key]: 'no' }).answer, 'Part D', `${category} no`);
    assert.equal(p({ category }).valid, false, `${category} blank`);
  }
  assert.equal(p({ category: 'clotting-factor' }).answer, 'Part B');
  assert.equal(p({ category: 'self' }).answer, 'Part D');
  assert.equal(CATEGORIES.length, 11);
  assert.match(p({}).message, /^Choose how the drug is given/);
});
