// spec-v365: Prague C&M criteria for Barrett's esophagus. Worked-example tests: the notation from C and
// M, the M >= C validity constraint, the long/short-segment (3 cm) descriptor, and the guards.
// Criteria transcribed from Sharma et al. 2006 (Gastroenterology), cross-verified against GI-endoscopy
// references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pragueBarrett } from '../../lib/prague-barrett-v365.js';

test('C2 M5 -> Prague C2 M5, long-segment (the META example)', () => {
  const r = pragueBarrett({ c: '2', m: '5' });
  assert.equal(r.valid, true);
  assert.equal(r.c, 2);
  assert.equal(r.m, 5);
  assert.equal(r.longSegment, true);
  assert.equal(r.segment, 'long-segment');
  assert.equal(r.bandLabel, 'Prague C2 M5');
});

test('a short segment is M < 3 cm; long segment is M >= 3 cm', () => {
  assert.equal(pragueBarrett({ c: 0, m: 2 }).segment, 'short-segment');
  assert.equal(pragueBarrett({ c: 0, m: 2 }).abnormal, false);
  assert.equal(pragueBarrett({ c: 1, m: 3 }).segment, 'long-segment');
  assert.equal(pragueBarrett({ c: 1, m: 3 }).abnormal, true);
});

test('M must be at least as long as C', () => {
  assert.equal(pragueBarrett({ c: 5, m: 3 }).valid, false);
  assert.equal(pragueBarrett({ c: 3, m: 3 }).valid, true);
});

test('C0 M0 is valid (no visible Barrett segment)', () => {
  const r = pragueBarrett({ c: 0, m: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.bandLabel, 'Prague C0 M0');
  assert.equal(r.segment, 'short-segment');
});

test('missing or implausible inputs are guarded', () => {
  assert.equal(pragueBarrett({}).valid, false);
  assert.equal(pragueBarrett({ c: '2' }).valid, false);
  assert.equal(pragueBarrett({ c: 'x', m: 5 }).valid, false);
  assert.equal(pragueBarrett({ c: 2, m: 99 }).valid, false);
});
