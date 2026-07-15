// spec-v319: CCS angina grading. Worked-example tests: each of the four classes and its
// definition, the I-II (mild) vs III-IV (severe) split, roman-numeral and numeric input,
// and the invalid-grade guard. Criteria transcribed from Campeau 1976 (Circulation),
// cross-verified across reproduced grade tables (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ccsAngina } from '../../lib/ccs-angina-v319.js';

test('class II: slight limitation (the META example)', () => {
  const r = ccsAngina({ grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 2);
  assert.equal(r.class, 'II');
  assert.equal(r.severe, false);
  assert.match(r.band, /slight limitation/);
  assert.match(r.band, /> 2 blocks on the level or climbing > 1 flight/);
});

test('class I is the mildest, not severe', () => {
  const r = ccsAngina({ grade: '1' });
  assert.equal(r.class, 'I');
  assert.equal(r.severe, false);
  assert.match(r.band, /ordinary physical activity .* does not cause angina/);
});

test('class III: marked limitation, severe', () => {
  const r = ccsAngina({ grade: '3' });
  assert.equal(r.class, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /marked limitation/);
});

test('class IV: angina at rest, severe', () => {
  const r = ccsAngina({ grade: '4' });
  assert.equal(r.class, 'IV');
  assert.equal(r.severe, true);
  assert.match(r.band, /at rest/);
});

test('roman-numeral input is accepted (case-insensitive)', () => {
  assert.equal(ccsAngina({ grade: 'II' }).grade, 2);
  assert.equal(ccsAngina({ grade: 'iv' }).grade, 4);
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(ccsAngina({}).valid, false);
  assert.equal(ccsAngina({ grade: '5' }).valid, false);
  assert.equal(ccsAngina({ grade: 'X' }).valid, false);
});
