// spec-v368: Ross classification of pediatric heart failure (classes I-IV). Worked-example tests: each
// class and its symptom description, the advanced flag on III-IV, roman + numeric + case-insensitive
// input, and the invalid-class guard. Definitions transcribed from Ross 1992 / modified 2012, cross-
// verified against pediatric-cardiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rossHfPeds } from '../../lib/ross-hf-peds-v368.js';

test('class III: marked symptoms with growth failure, flagged (the META example)', () => {
  const r = rossHfPeds({ cls: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.rossClass, 'III');
  assert.equal(r.advanced, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /growth failure/);
});

test('classes I-II are not flagged (no growth failure)', () => {
  assert.match(rossHfPeds({ cls: 'I' }).band, /no limitation or symptoms/);
  assert.match(rossHfPeds({ cls: 'II' }).band, /mild tachypnea/);
  for (const c of ['I', 'II']) {
    assert.equal(rossHfPeds({ cls: c }).advanced, false, c);
  }
});

test('class IV is symptoms at rest and flagged', () => {
  const r = rossHfPeds({ cls: 'IV' });
  assert.equal(r.advanced, true);
  assert.equal(r.rossClass, 'IV');
  assert.match(r.band, /symptomatic at rest/);
});

test('numeric and case-insensitive input map to the classes', () => {
  assert.equal(rossHfPeds({ cls: 3 }).rossClass, 'III');
  assert.equal(rossHfPeds({ cls: '4' }).rossClass, 'IV');
  assert.equal(rossHfPeds({ cls: 'ii' }).rossClass, 'II');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(rossHfPeds({}).valid, false);
  assert.equal(rossHfPeds({ cls: 'V' }).valid, false);
  assert.equal(rossHfPeds({ cls: '0' }).valid, false);
});
