// spec-v340: Clark level of a cutaneous melanoma (levels I-V). Worked-example tests: each level and
// its anatomic-compartment description, the deeper-invasion flag on levels IV-V, roman + numeric +
// case-insensitive input, and the invalid-level guard. Definitions transcribed from Clark 1969
// (Cancer Res), cross-verified against melanoma-staging references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clarkLevel } from '../../lib/clark-level-v340.js';

test('level IV: reticular dermis, flagged deeper (the META example)', () => {
  const r = clarkLevel({ level: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 'IV');
  assert.equal(r.deep, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /invasion into the reticular dermis/);
});

test('level I is in situ; levels I-III are not flagged deeper', () => {
  assert.match(clarkLevel({ level: 'I' }).band, /melanoma in situ/);
  for (const l of ['I', 'II', 'III']) {
    assert.equal(clarkLevel({ level: l }).deep, false, l);
  }
});

test('level V is the deepest (subcutaneous fat) and flagged', () => {
  const r = clarkLevel({ level: 'V' });
  assert.equal(r.deep, true);
  assert.match(r.band, /subcutaneous fat/);
});

test('numeric 1-5 and case-insensitive roman input map to the levels', () => {
  assert.equal(clarkLevel({ level: '1' }).level, 'I');
  assert.equal(clarkLevel({ level: 5 }).level, 'V');
  assert.equal(clarkLevel({ level: 'iv' }).level, 'IV');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(clarkLevel({}).valid, false);
  assert.equal(clarkLevel({ level: 'VI' }).valid, false);
  assert.equal(clarkLevel({ level: '6' }).valid, false);
});
