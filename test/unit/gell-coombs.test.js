// spec-v426: Gell and Coombs hypersensitivity classification (types I-IV).
// Worked-example tests: each type and its mechanism, numeric input, and the invalid-type guard.
// Types transcribed from Gell & Coombs 1963 / Rajan 2003 (Trends Immunol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gellCoombs } from '../../lib/gell-coombs-v426.js';

test('type I: immediate, IgE-mediated (the META example)', () => {
  const r = gellCoombs({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /immediate, IgE-mediated/);
});

test('type II: antibody-mediated cytotoxic', () => {
  const r = gellCoombs({ type: 'II' });
  assert.equal(r.type, 'II');
  assert.match(r.band, /antibody-mediated cytotoxic/);
});

test('type III: immune-complex-mediated', () => {
  assert.match(gellCoombs({ type: 'III' }).band, /immune-complex-mediated/);
});

test('type IV: delayed, cell-mediated', () => {
  const r = gellCoombs({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /delayed, cell-mediated/);
});

test('numeric input maps to the types', () => {
  assert.equal(gellCoombs({ type: 1 }).type, 'I');
  assert.equal(gellCoombs({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(gellCoombs({}).valid, false);
  assert.equal(gellCoombs({ type: 'V' }).valid, false);
  assert.equal(gellCoombs({ type: '0' }).valid, false);
});
