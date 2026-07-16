// spec-v351: Goligher classification of internal hemorrhoids (grades I-IV). Worked-example tests: each
// grade and its prolapse description, the advanced flag on grades III-IV, roman + numeric +
// case-insensitive input, and the invalid-grade guard. Definitions transcribed from Goligher's Surgery
// of the Anus, Rectum and Colon (1984), cross-verified against Tech Coloproctol 2022 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goligherHemorrhoids } from '../../lib/goligher-hemorrhoids-v351.js';

test('grade III: prolapse requiring manual reduction, flagged advanced (the META example)', () => {
  const r = goligherHemorrhoids({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.equal(r.advanced, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /require manual reduction/);
});

test('grades I-II are lower grades and not flagged', () => {
  assert.match(goligherHemorrhoids({ grade: 'I' }).band, /bleed but do not prolapse/);
  assert.match(goligherHemorrhoids({ grade: 'II' }).band, /reduce spontaneously/);
  for (const g of ['I', 'II']) {
    assert.equal(goligherHemorrhoids({ grade: g }).advanced, false, g);
  }
});

test('grade IV is irreducible / permanently prolapsed and flagged advanced', () => {
  const r = goligherHemorrhoids({ grade: 'IV' });
  assert.equal(r.advanced, true);
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /irreducible/);
});

test('numeric and case-insensitive input map to the grades', () => {
  assert.equal(goligherHemorrhoids({ grade: 3 }).grade, 'III');
  assert.equal(goligherHemorrhoids({ grade: '4' }).grade, 'IV');
  assert.equal(goligherHemorrhoids({ grade: 'iv' }).grade, 'IV');
  assert.equal(goligherHemorrhoids({ grade: 'ii' }).grade, 'II');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(goligherHemorrhoids({}).valid, false);
  assert.equal(goligherHemorrhoids({ grade: 'V' }).valid, false);
  assert.equal(goligherHemorrhoids({ grade: '0' }).valid, false);
});
