// spec-v12 §3.4.1 wave 12-4: FIB-4 Index boundary examples per the
// shipping contract in spec-v12 §5. Formula and cutoffs per
// Sterling RK, et al. Hepatology. 2006;43(6):1317-1325.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fib4 } from '../../lib/clinical-v4.js';

// Low edge: well below the 1.45 rule-out cutoff.
test('fib4 low edge: age 30, AST 25, ALT 25, plt 250 -> 0.60 (rules out)', () => {
  const r = fib4({ ageYears: 30, ast: 25, alt: 25, plateletsK: 250 });
  assert.ok(Math.abs(r.score - 0.6) < 0.005);
  assert.match(r.band, /rules out/);
});

// Mid (tile example): hand-computed 3.48; should fall in rules-in band.
test('fib4 mid: age 55, AST 60, ALT 40, plt 150 -> 3.48 (rules in)', () => {
  const r = fib4({ ageYears: 55, ast: 60, alt: 40, plateletsK: 150 });
  assert.ok(Math.abs(r.score - 3.4786) < 0.005);
  assert.match(r.band, /rules in advanced fibrosis/);
});

// High edge: deeply abnormal labs, score 32.
test('fib4 high edge: age 80, AST 200, ALT 100, plt 50 -> 32.00', () => {
  const r = fib4({ ageYears: 80, ast: 200, alt: 100, plateletsK: 50 });
  assert.ok(Math.abs(r.score - 32) < 0.005);
  assert.match(r.band, /rules in/);
});

// Indeterminate band check.
test('fib4 indeterminate band: score in [1.45, 3.25]', () => {
  const r = fib4({ ageYears: 50, ast: 50, alt: 50, plateletsK: 150 });
  assert.ok(r.score >= 1.45 && r.score <= 3.25);
  assert.match(r.band, /indeterminate/);
});

// Invalid input rejection.
test('fib4 rejects zero platelets', () => {
  assert.throws(() => fib4({ ageYears: 50, ast: 50, alt: 50, plateletsK: 0 }),
    /plateletsK/);
});
