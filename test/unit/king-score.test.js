// spec-v212 2.3: King's Score worked examples. King's Score =
// (age x AST x INR) / platelets (x10^9/L). Cut-points spec-v97 cross-verified
// (Cross 2009 derivation; PMC3741695 validation): >= 16.7 rule-in cirrhosis,
// >= 12.3 significant fibrosis, < 12.3 rule-out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kingScore } from '../../lib/hep-fibrosis-portal-v212.js';

test('rule-out band (< 12.3) with worked example', () => {
  const r = kingScore({ age: 40, ast: 30, inr: 1.0, platelets: 200 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /rule-out band/);
});

test('intermediate significant-fibrosis band (12.3-16.7)', () => {
  // (50 x 60 x 1.0) / 200 = 15.0
  const r = kingScore({ age: 50, ast: 60, inr: 1.0, platelets: 200 });
  assert.equal(r.score, 15);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /significant fibrosis/);
});

test('cirrhosis rule-in band (>= 16.7)', () => {
  // (60 x 80 x 1.2) / 200 = 28.8
  const r = kingScore({ age: 60, ast: 80, inr: 1.2, platelets: 200 });
  assert.equal(r.score, 28.8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /cirrhosis likely/);
});

test('rounds to one decimal', () => {
  // (45 x 55 x 1.1) / 130 = 20.94...
  const r = kingScore({ age: 45, ast: 55, inr: 1.1, platelets: 130 });
  assert.equal(r.score, 20.9);
});

test('invalid when a field is missing or non-positive', () => {
  assert.equal(kingScore({ age: 40, ast: 30, inr: 1.0 }).valid, false);
  assert.equal(kingScore({ age: 40, ast: 30, inr: 1.0, platelets: 0 }).valid, false);
  assert.equal(kingScore({}).valid, false);
});
