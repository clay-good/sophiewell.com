import { test } from 'node:test';
import assert from 'node:assert/strict';
import { improveBleeding } from '../../lib/scoring-v4.js';

test('improve-bleeding 0 (tile example) -> not high bleeding risk', () => {
  const r = improveBleeding({});
  assert.equal(r.score, 0);
  assert.equal(r.highBleedingRisk, false);
  assert.match(r.band, /not high bleeding risk per Decousus 2011/);
});

test('improve-bleeding 7 boundary (age>=85 + hepatic failure + male) -> high', () => {
  const r = improveBleeding({ age: '>=85', hepaticFailure: true, male: true });
  assert.equal(r.score, 7);
  assert.equal(r.highBleedingRisk, true);
  assert.match(r.band, /high bleeding risk per Decousus 2011/);
});

test('improve-bleeding 6.5 (just below cutoff) -> not high', () => {
  const r = improveBleeding({ age: '40-84', hepaticFailure: true, icuAdmission: true });
  assert.equal(r.score, 6.5);
  assert.equal(r.highBleedingRisk, false);
});

test('improve-bleeding active ulcer (4.5) alone -> not high', () => {
  const r = improveBleeding({ activeUlcer: true });
  assert.equal(r.score, 4.5);
  assert.equal(r.highBleedingRisk, false);
});

test('improve-bleeding active ulcer + age 40-84 + male = 7 -> high boundary', () => {
  const r = improveBleeding({ activeUlcer: true, age: '40-84', male: true });
  assert.equal(r.score, 7);
  assert.equal(r.highBleedingRisk, true);
});

test('improve-bleeding all criteria (max 30.5) -> high', () => {
  const r = improveBleeding({
    activeUlcer: true, bleeding3moPrior: true, plateletLt50: true,
    age: '>=85', hepaticFailure: true, renalFailure: 'severe',
    icuAdmission: true, centralVenousCatheter: true,
    rheumaticDisease: true, currentCancer: true, male: true,
  });
  assert.equal(r.score, 30.5);
  assert.equal(r.highBleedingRisk, true);
});

test('improve-bleeding age category is mutually exclusive (only one weight applied)', () => {
  const r = improveBleeding({ age: '40-84' });
  assert.equal(r.score, 1.5);
});

test('improve-bleeding renal moderate vs severe', () => {
  const moderate = improveBleeding({ renalFailure: 'moderate' });
  const severe = improveBleeding({ renalFailure: 'severe' });
  assert.equal(moderate.score, 1);
  assert.equal(severe.score, 2.5);
});

test('improve-bleeding unknown age string contributes 0', () => {
  const r = improveBleeding({ age: 'unknown', male: true });
  assert.equal(r.score, 1);
});
