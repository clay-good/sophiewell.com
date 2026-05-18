// spec-v12 §3.2.2 wave 12-2: sPESI boundary examples per the shipping
// contract in spec-v12 §5. Dichotomy reproduces Jimenez 2010 Table 3.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spesi } from '../../lib/scoring-v4.js';

test('spesi low edge: no criteria -> 0, low risk', () => {
  const r = spesi({ ageOver80: false, cancer: false,
    chronicCardiopulmonary: false, hr110: false, sbp100: false,
    sao2Lt90: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /^sPESI 0: low risk/);
});

test('spesi mid: single criterion -> 1, not-low risk', () => {
  const r = spesi({ ageOver80: true, cancer: false,
    chronicCardiopulmonary: false, hr110: false, sbp100: false,
    sao2Lt90: false });
  assert.equal(r.score, 1);
  assert.match(r.band, /not-low risk/);
});

test('spesi high edge: all criteria -> 6, not-low risk', () => {
  const r = spesi({ ageOver80: true, cancer: true,
    chronicCardiopulmonary: true, hr110: true, sbp100: true,
    sao2Lt90: true });
  assert.equal(r.score, 6);
  assert.match(r.band, /not-low risk/);
});
