// spec-v357: NYHA functional classification of heart failure (classes I-IV). Worked-example tests:
// each class and its symptom-limitation description, the advanced flag on III-IV, roman + numeric +
// case-insensitive input, and the invalid-class guard. Definitions transcribed from the NYHA Criteria
// Committee 1994, cross-verified against standard cardiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyhaClass } from '../../lib/nyha-class-v357.js';

test('class III: marked limitation, flagged (the META example)', () => {
  const r = nyhaClass({ cls: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.nyhaClass, 'III');
  assert.equal(r.advanced, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /marked limitation/);
});

test('classes I-II are not flagged and are comfortable at rest', () => {
  assert.match(nyhaClass({ cls: 'I' }).band, /no limitation/);
  assert.match(nyhaClass({ cls: 'II' }).band, /slight limitation/);
  for (const c of ['I', 'II']) {
    assert.equal(nyhaClass({ cls: c }).advanced, false, c);
  }
});

test('class IV is symptoms at rest and flagged', () => {
  const r = nyhaClass({ cls: 'IV' });
  assert.equal(r.advanced, true);
  assert.equal(r.nyhaClass, 'IV');
  assert.match(r.band, /at rest/);
});

test('numeric and case-insensitive input map to the classes', () => {
  assert.equal(nyhaClass({ cls: 3 }).nyhaClass, 'III');
  assert.equal(nyhaClass({ cls: '4' }).nyhaClass, 'IV');
  assert.equal(nyhaClass({ cls: 'ii' }).nyhaClass, 'II');
  assert.equal(nyhaClass({ cls: 'iv' }).nyhaClass, 'IV');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(nyhaClass({}).valid, false);
  assert.equal(nyhaClass({ cls: 'V' }).valid, false);
  assert.equal(nyhaClass({ cls: '0' }).valid, false);
});
