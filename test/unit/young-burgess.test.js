// spec-v380: Young-Burgess classification of a pelvic ring injury (LC I-III, APC I-III, VS, CM).
// Worked-example tests: representative patterns and their mechanism/stability descriptions, the unstable
// flag, separator/case-insensitive input, and the invalid-pattern guard. Patterns transcribed from Young
// 1986 (Radiology), cross-verified against a modern review (CORR 2014) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youngBurgess } from '../../lib/young-burgess-v380.js';

test('APC-III: complete SI disruption, unstable, flagged (the META example)', () => {
  const r = youngBurgess({ pattern: 'APC-III' });
  assert.equal(r.valid, true);
  assert.equal(r.pattern, 'APC-III');
  assert.equal(r.unstable, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /complete sacroiliac disruption/);
  assert.match(r.band, /rotationally and vertically unstable/);
});

test('LC-I is ipsilateral sacral compression, stable, not flagged', () => {
  const r = youngBurgess({ pattern: 'LC-I' });
  assert.equal(r.unstable, false);
  assert.match(r.band, /sacral \(ala\) compression/);
});

test('APC-I is stable (symphysis < 2.5 cm), not flagged', () => {
  const r = youngBurgess({ pattern: 'APC-I' });
  assert.equal(r.unstable, false);
  assert.match(r.band, /under 2.5 cm/);
});

test('VS and CM are unstable, flagged', () => {
  assert.equal(youngBurgess({ pattern: 'VS' }).unstable, true);
  assert.equal(youngBurgess({ pattern: 'CM' }).unstable, true);
  assert.match(youngBurgess({ pattern: 'VS' }).band, /vertical shear/);
});

test('separator and case-insensitive input map to the patterns', () => {
  assert.equal(youngBurgess({ pattern: 'apc3' }).pattern, 'APC-III');
  assert.equal(youngBurgess({ pattern: 'lc 2' }).pattern, 'LC-II');
  assert.equal(youngBurgess({ pattern: 'vs' }).pattern, 'VS');
});

test('a missing or unknown pattern is invalid', () => {
  assert.equal(youngBurgess({}).valid, false);
  assert.equal(youngBurgess({ pattern: 'APC-IV' }).valid, false);
  assert.equal(youngBurgess({ pattern: 'LC' }).valid, false);
});
