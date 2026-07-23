// spec-v507: degree-of-hearing-loss classification from a pure-tone average (dB HL).
// Worked-example tests: each band, the boundary values (a band owns its upper cut point), negative-but-valid
// input, and the out-of-range / non-numeric guards. Bands transcribed from Clark 1981 (ASHA) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hearingLossDegree } from '../../lib/hearing-loss-degree-v507.js';

test('PTA 45 dB HL is a moderate loss (the META example)', () => {
  const r = hearingLossDegree({ pta: 45 });
  assert.equal(r.valid, true);
  assert.equal(r.pta, 45);
  assert.equal(r.degree, 'Moderate loss');
  assert.match(r.band, /41 to 55 dB HL/);
});

test('each band returns its degree', () => {
  assert.equal(hearingLossDegree({ pta: 0 }).degree, 'Normal hearing');
  assert.equal(hearingLossDegree({ pta: 20 }).degree, 'Slight loss');
  assert.equal(hearingLossDegree({ pta: 30 }).degree, 'Mild loss');
  assert.equal(hearingLossDegree({ pta: 60 }).degree, 'Moderately severe loss');
  assert.equal(hearingLossDegree({ pta: 80 }).degree, 'Severe loss');
  assert.equal(hearingLossDegree({ pta: 100 }).degree, 'Profound loss');
});

test('a band owns its upper cut point', () => {
  assert.equal(hearingLossDegree({ pta: 15 }).degree, 'Normal hearing');
  assert.equal(hearingLossDegree({ pta: 16 }).degree, 'Slight loss');
  assert.equal(hearingLossDegree({ pta: 25 }).degree, 'Slight loss');
  assert.equal(hearingLossDegree({ pta: 26 }).degree, 'Mild loss');
  assert.equal(hearingLossDegree({ pta: 90 }).degree, 'Severe loss');
  assert.equal(hearingLossDegree({ pta: 91 }).degree, 'Profound loss');
});

test('a negative PTA down to -10 is valid and normal', () => {
  const r = hearingLossDegree({ pta: -10 });
  assert.equal(r.valid, true);
  assert.equal(r.degree, 'Normal hearing');
});

test('the band label carries the entered PTA', () => {
  assert.match(hearingLossDegree({ pta: 45 }).bandLabel, /PTA 45 dB HL - Moderate loss/);
});

test('a string number is accepted', () => {
  assert.equal(hearingLossDegree({ pta: '45' }).degree, 'Moderate loss');
});

test('missing, non-numeric, or out-of-range input is invalid', () => {
  assert.equal(hearingLossDegree({}).valid, false);
  assert.equal(hearingLossDegree({ pta: '' }).valid, false);
  assert.equal(hearingLossDegree({ pta: 'loud' }).valid, false);
  assert.equal(hearingLossDegree({ pta: -11 }).valid, false);
  assert.equal(hearingLossDegree({ pta: 131 }).valid, false);
});
