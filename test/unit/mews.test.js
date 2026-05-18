// spec-v12 §3.1.2 wave 12-1: MEWS boundary worked examples per the
// shipping contract in spec-v12 §5. Scoring reproduces Subbe 2001
// Table 1; bands reproduce Subbe 2001 Table 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mews } from '../../lib/scoring-v4.js';

// Low edge: every parameter normal -> aggregate 0.
test('mews low edge: normal vitals -> 0, low band', () => {
  const r = mews({ sbp: 120, pulse: 78, rr: 14, temp: 37.0, avpu: 'A' });
  assert.equal(r.score, 0);
  assert.match(r.band, /^0-2/);
});

// Mid: SBP 95 (1) + HR 105 (1) + RR 22 (2) + T 38.6 (2) + V (1) = 7.
// 7 >= 5 -> high-risk band per Subbe 2001 Table 2.
test('mews mid: moderately abnormal vitals -> 7, >=5 band', () => {
  const r = mews({ sbp: 95, pulse: 105, rr: 22, temp: 38.6, avpu: 'V' });
  assert.equal(r.score, 7);
  assert.equal(r.parts.sbp, 1);
  assert.equal(r.parts.pulse, 1);
  assert.equal(r.parts.rr, 2);
  assert.equal(r.parts.temp, 2);
  assert.equal(r.parts.avpu, 1);
  assert.match(r.band, /^>=5/);
});

// High edge: every parameter at the deep-red band.
test('mews high edge: severe abnormalities -> very high, >=5 band', () => {
  const r = mews({ sbp: 65, pulse: 140, rr: 35, temp: 34.5, avpu: 'U' });
  assert.equal(r.parts.sbp, 3);
  assert.equal(r.parts.pulse, 3);
  assert.equal(r.parts.rr, 3);
  assert.equal(r.parts.temp, 2);
  assert.equal(r.parts.avpu, 3);
  assert.equal(r.score, 14);
  assert.match(r.band, /^>=5/);
});

// Band edges per Subbe 2001 Table 2.
test('mews band edges: 3 -> low-intermediate, 4 -> intermediate', () => {
  const r3 = mews({ sbp: 120, pulse: 78, rr: 22, temp: 37.0, avpu: 'A' });
  assert.equal(r3.score, 2);
  const r4 = mews({ sbp: 95, pulse: 105, rr: 14, temp: 37.0, avpu: 'V' });
  assert.equal(r4.score, 3);
  assert.match(r4.band, /^3:/);
  const r5 = mews({ sbp: 95, pulse: 105, rr: 14, temp: 37.0, avpu: 'P' });
  assert.equal(r5.score, 4);
  assert.match(r5.band, /^4:/);
});
