// spec-v1476: ASAS criteria for inflammatory back pain (Sieper 2009).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { asasIbp as ibp } from '../../lib/asas-ibp-v1476.js';

const four = { chronic: true, ageUnder40: true, insidious: true, exercise: true, noRestRelief: true };

test('the worked example: four of five meets the criteria', () => {
  const r = ibp(four);
  assert.equal(r.met, true);
  assert.equal(r.band, 'Meets the ASAS criteria for inflammatory back pain: 4 of 5 (age at onset under 40, insidious onset, improvement with exercise, no improvement with rest); 4 are needed.');
});

test('three of five does not, and names what is absent', () => {
  const r = ibp({ ...four, noRestRelief: false });
  assert.equal(r.met, false);
  assert.equal(r.count, 3);
  assert.match(r.band, /not present: no improvement with rest, pain at night, improving on getting up/);
});

test('all five meets; none does not', () => {
  assert.equal(ibp({ ...four, nightPain: true }).count, 5);
  assert.equal(ibp({ chronic: true }).met, false);
});

test('the criteria are asked only of chronic back pain', () => {
  for (const r of [ibp({}), ibp({ ...four, chronic: false })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

test('the weak specificity and the age restatement are stated on every answer', () => {
  const notes = ibp(four).notes.join(' ');
  assert.match(notes, /specificity of only 31% to 39%/);
  assert.match(notes, /under 40 and as 40 or under/);
});
