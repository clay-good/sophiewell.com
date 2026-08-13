// spec-v715: Basic Erosive Wear Examination (BEWE).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bewe } from '../../lib/bewe-v715.js';

const S = (a, b, c, d, e, f) => ({ sextant1: String(a), sextant2: String(b), sextant3: String(c), sextant4: String(d), sextant5: String(e), sextant6: String(f) });

test('all-zero -> 0, none', () => {
  const r = bewe(S(0, 0, 0, 0, 0, 0));
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'none');
  assert.equal(r.abnormal, false);
});

test('maximum is 18 -> high', () => {
  const r = bewe(S(3, 3, 3, 3, 3, 3));
  assert.equal(r.score, 18);
  assert.equal(r.tier, 'high');
});

test('worked example sums to 9 -> medium', () => {
  const r = bewe(S(1, 1, 2, 2, 2, 1));
  assert.equal(r.score, 9);
  assert.equal(r.tier, 'medium');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /BEWE 9 of 18/);
});

test('risk levels: 0-2 none, 3-8 low, 9-13 medium, >=14 high', () => {
  assert.equal(bewe(S(1, 1, 0, 0, 0, 0)).tier, 'none');    // 2
  assert.equal(bewe(S(1, 1, 1, 0, 0, 0)).tier, 'low');     // 3
  assert.equal(bewe(S(2, 2, 2, 2, 0, 0)).tier, 'low');     // 8
  assert.equal(bewe(S(2, 2, 2, 2, 1, 0)).tier, 'medium');  // 9
  assert.equal(bewe(S(3, 3, 3, 3, 1, 0)).tier, 'medium');  // 13
  assert.equal(bewe(S(3, 3, 3, 3, 2, 0)).tier, 'high');    // 14
});

test('sextants require an integer 0-3; required', () => {
  assert.equal(bewe({}).valid, false);
  assert.equal(bewe({}).code, 'MISSING_INPUT');
  assert.equal(bewe(S(1, 1, 1, 1, 1, 4)).valid, false);
  const partial = S(1, 1, 1, 1, 1, 1); delete partial.sextant6;
  assert.equal(bewe(partial).field, 'sextant6');
});
