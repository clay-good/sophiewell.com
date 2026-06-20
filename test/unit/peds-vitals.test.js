// spec-v149 2.2: pediatric vital-sign reference (PALS). Age -> band ranges +
// computed hypotension SBP (< 60 neonate, < 70 infant, < 70 + 2 x age 1-10,
// < 90 at >= 10 yr).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsVitals } from '../../lib/ems-v149.js';

test('5 years -> preschool band, hypotension SBP < 80 (70 + 2 x 5)', () => {
  const r = pedsVitals({ ageYears: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.bandKey, 'preschool');
  assert.equal(r.hypotensionSbp, 80);
  assert.match(r.band, /Preschool \(3-5 yr\): PALS hypotension if systolic BP < 80 mmHg\./);
});

test('newborn (age 0) -> neonate band, hypotension SBP < 60', () => {
  const r = pedsVitals({ ageYears: 0 });
  assert.equal(r.bandKey, 'neonate');
  assert.equal(r.hypotensionSbp, 60);
});

test('0.5 years -> infant band, hypotension SBP < 70', () => {
  const r = pedsVitals({ ageYears: 0.5 });
  assert.equal(r.bandKey, 'infant');
  assert.equal(r.hypotensionSbp, 70);
});

test('14 years -> adolescent band, hypotension SBP < 90', () => {
  const r = pedsVitals({ ageYears: 14 });
  assert.equal(r.bandKey, 'adolescent');
  assert.equal(r.hypotensionSbp, 90);
});

test('age 10 boundary -> uses 70 + 2 x 10 = 90', () => {
  const r = pedsVitals({ ageYears: 10 });
  assert.equal(r.hypotensionSbp, 90);
});

test('no age -> invalid prompt, no NaN', () => {
  const r = pedsVitals({});
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
});
