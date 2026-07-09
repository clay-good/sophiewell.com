// spec-v267: worked examples for the HALP score. Formula spec-v97 verified against
// Chen 2015 (Oncotarget, gastric-cancer derivation) and Guo 2019 (J Cancer, pan-cancer
// validation): HALP = hemoglobin (g/L) x albumin (g/L) x ALC (10^9/L) / platelets (10^9/L).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { halp } from '../../lib/inflam-v267.js';

test('halp: a healthy-range worked example', () => {
  const r = halp({ hgb: 140, albumin: 40, alc: 2.0, plt: 250 });
  // 140 x 40 x 2.0 / 250 = 11200 / 250 = 44.8.
  assert.equal(r.valid, true);
  assert.equal(r.score, 44.8);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('HALP score 44.8'));
  assert.ok(r.band.includes('lower value is less favorable'));
  assert.ok(r.detail.includes('140 g/L'));
});

test('halp: a low (less favorable) profile', () => {
  const r = halp({ hgb: 90, albumin: 28, alc: 0.8, plt: 400 });
  // 90 x 28 x 0.8 / 400 = 2016 / 400 = 5.04 -> r1 5.
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.ok(r.band.includes('HALP score 5'));
});

test('halp: missing any field is invalid, not a crash', () => {
  assert.equal(halp({ hgb: 140, albumin: 40, alc: 2.0 }).valid, false);
  assert.equal(halp({}).valid, false);
  assert.equal(halp().valid, false);
});

test('halp: out-of-range inputs are rejected', () => {
  assert.equal(halp({ hgb: -1, albumin: 40, alc: 2.0, plt: 250 }).valid, false);
  assert.equal(halp({ hgb: 140, albumin: 40, alc: 2.0, plt: 0 }).valid, false);
});
