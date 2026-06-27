// spec-v159 2.2: ASIA Impairment Scale A-E (ISNCSCI, Kirshblum 2011). Sacral
// sparing is the complete-vs-incomplete gate; the half-of-key-muscles proportion
// is the C-vs-D gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asiaImpairment } from '../../lib/neuro-disability-v159.js';

test('no sacral sparing -> A (complete)', () => {
  const r = asiaImpairment({ sacralSparing: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'A');
  assert.match(r.band, /Complete/);
});

test('sacral sparing, no motor below level -> B (sensory incomplete)', () => {
  const r = asiaImpairment({ sacralSparing: 'yes', motorIncomplete: 'no' });
  assert.equal(r.grade, 'B');
});

test('C vs D turns on the half-of-key-muscles proportion', () => {
  assert.equal(asiaImpairment({ sacralSparing: 'yes', motorIncomplete: 'yes', halfGrade3: 'no' }).grade, 'C');
  assert.equal(asiaImpairment({ sacralSparing: 'yes', motorIncomplete: 'yes', halfGrade3: 'yes' }).grade, 'D');
});

test('E (normal in a patient with prior deficit) overrides', () => {
  assert.equal(asiaImpairment({ allNormal: 'yes' }).grade, 'E');
});

test('incomplete exam falls back to complete-the-fields', () => {
  assert.equal(asiaImpairment({}).valid, false); // no sacral sparing answer
  assert.equal(asiaImpairment({ sacralSparing: 'yes' }).valid, false); // need motor-incomplete answer
  assert.equal(asiaImpairment({ sacralSparing: 'yes', motorIncomplete: 'yes' }).valid, false); // need proportion
});
