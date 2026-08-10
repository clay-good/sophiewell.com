// spec-v697: King's Score for liver fibrosis (chronic HCV).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kingsScore } from '../../lib/kings-score-v697.js';

test('worked example: age 45, AST 60, INR 1.1, platelets 200 -> 14.9 (significant fibrosis)', () => {
  const r = kingsScore({ age: '45', ast: '60', inr: '1.1', platelets: '200' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 14.9); // (45*60*1.1)/200 = 14.85 -> 14.9
  assert.equal(r.tier, 'significant-fibrosis');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Kings Score 14.9/);
});

test('formula is (age * AST * INR) / platelets', () => {
  const r = kingsScore({ age: '50', ast: '40', inr: '1.0', platelets: '250' });
  assert.equal(r.score, Math.round((50 * 40 * 1.0) / 250 * 10) / 10); // 8
  assert.equal(r.score, 8);
});

test('bands: <12.3 low, 12.3-16.7 significant fibrosis, >=16.7 cirrhosis', () => {
  assert.equal(kingsScore({ age: '40', ast: '30', inr: '1.0', platelets: '250' }).tier, 'low'); // 4.8
  assert.equal(kingsScore({ age: '45', ast: '60', inr: '1.1', platelets: '200' }).tier, 'significant-fibrosis'); // 14.9
  assert.equal(kingsScore({ age: '55', ast: '90', inr: '1.3', platelets: '120' }).tier, 'cirrhosis'); // 53.6
});

test('the 12.3 and 16.7 boundaries are inclusive of the higher band', () => {
  // construct exactly 12.3: age*ast*inr/plt = 12.3. Use 123/10 with plt 100 -> 1230/100=12.3
  const at123 = kingsScore({ age: '10', ast: '123', inr: '1.0', platelets: '100' });
  assert.equal(at123.score, 12.3);
  assert.equal(at123.tier, 'significant-fibrosis');
  const at167 = kingsScore({ age: '10', ast: '167', inr: '1.0', platelets: '100' });
  assert.equal(at167.score, 16.7);
  assert.equal(at167.tier, 'cirrhosis');
});

test('inputs are validated', () => {
  assert.equal(kingsScore({}).valid, false);
  assert.equal(kingsScore({}).code, 'MISSING_INPUT');
  assert.equal(kingsScore({ age: '45', ast: '60', inr: '1.1' }).field, 'platelets');
  assert.equal(kingsScore({ age: '0', ast: '60', inr: '1.1', platelets: '200' }).field, 'age');
});
