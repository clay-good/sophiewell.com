// spec-v468: Brouet cryoglobulinemia classification (types I-III).
// Worked-example tests: each type and its clonality/association description, numeric input, invalid-type guard.
// Types transcribed from Brouet 1974 (Am J Med) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brouetCryoglobulinemia } from '../../lib/brouet-cryoglobulinemia-v468.js';

test('type II: mixed monoclonal + polyclonal (the META example)', () => {
  const r = brouetCryoglobulinemia({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /a monoclonal immunoglobulin .* plus polyclonal IgG/);
  assert.match(r.band, /hepatitis C/);
});

test('type I: monoclonal only', () => {
  assert.match(brouetCryoglobulinemia({ type: 'I' }).band, /a single monoclonal immunoglobulin/);
});

test('type III: polyclonal only', () => {
  const r = brouetCryoglobulinemia({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /polyclonal immunoglobulins only/);
});

test('numeric input maps to the types', () => {
  assert.equal(brouetCryoglobulinemia({ type: 1 }).type, 'I');
  assert.equal(brouetCryoglobulinemia({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(brouetCryoglobulinemia({}).valid, false);
  assert.equal(brouetCryoglobulinemia({ type: 'IV' }).valid, false);
  assert.equal(brouetCryoglobulinemia({ type: '0' }).valid, false);
});
