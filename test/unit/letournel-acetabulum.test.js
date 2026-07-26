// spec-v466: Judet-Letournel acetabular fracture classification (ten patterns).
// Worked-example tests: elementary vs associated patterns, the both-column definition, alias input, and the
// invalid-pattern guard. Patterns transcribed from Judet & Letournel 1964 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { letournelAcetabulum } from '../../lib/letournel-acetabulum-v466.js';

test('transverse: elementary (the META example)', () => {
  const r = letournelAcetabulum({ pattern: 'transverse' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'elementary');
  assert.match(r.band, /dividing the acetabulum into upper and lower halves/);
});

test('posterior-wall is elementary', () => {
  const r = letournelAcetabulum({ pattern: 'posterior-wall' });
  assert.equal(r.group, 'elementary');
  assert.equal(r.pattern, 'Posterior wall');
});

test('both-column is associated with the floating-acetabulum definition', () => {
  const r = letournelAcetabulum({ pattern: 'both-column' });
  assert.equal(r.group, 'associated');
  assert.match(r.band, /no part of the articular surface remains attached to the axial skeleton/);
});

test('t-shaped and ac-pht are associated', () => {
  assert.equal(letournelAcetabulum({ pattern: 't-shaped' }).group, 'associated');
  assert.equal(letournelAcetabulum({ pattern: 'ac-pht' }).group, 'associated');
});

test('uppercase alias maps to the pattern', () => {
  assert.equal(letournelAcetabulum({ pattern: 'BOTH-COLUMN' }).pattern, 'Both-column');
});

test('an unknown pattern is invalid', () => {
  assert.equal(letournelAcetabulum({}).valid, false);
  assert.equal(letournelAcetabulum({ pattern: 'floor' }).valid, false);
});
