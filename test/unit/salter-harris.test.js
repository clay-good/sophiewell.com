// spec-v144 2.5: Salter-Harris physeal classification (Salter & Harris 1963).
// SALTR types I-V; the II -> III boundary is the intra-articular transition.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { salterHarris } from '../../lib/ortho-v144.js';

test('blank -> complete-the-fields fallback', () => {
  assert.equal(salterHarris({}).valid, false);
});

test('through the physis only -> Type I', () => {
  const r = salterHarris({ pattern: 'physis' });
  assert.equal(r.classification, 'I');
  assert.equal(r.abnormal, false);
});

test('physis + metaphysis -> Type II (most common)', () => {
  const r = salterHarris({ pattern: 'metaphysis' });
  assert.equal(r.classification, 'II');
  assert.match(r.band, /most common/i);
});

test('II -> III boundary (intra-articular, abnormal flips on)', () => {
  assert.equal(salterHarris({ pattern: 'metaphysis' }).abnormal, false); // II
  const iii = salterHarris({ pattern: 'epiphysis' });
  assert.equal(iii.classification, 'III');
  assert.equal(iii.abnormal, true);
});

test('through all three -> IV and crush -> V', () => {
  assert.equal(salterHarris({ pattern: 'both' }).classification, 'IV');
  assert.equal(salterHarris({ pattern: 'crush' }).classification, 'V');
});
