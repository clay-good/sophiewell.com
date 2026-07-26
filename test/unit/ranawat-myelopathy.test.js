// spec-v495: Ranawat classification of rheumatoid cervical myelopathy (classes I, II, IIIA, IIIB).
// Worked-example tests: each class, the IIIA/IIIB ambulation split, alias input, invalid-class guard.
// Classes transcribed from Ranawat and colleagues 1979 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ranawatMyelopathy } from '../../lib/ranawat-myelopathy-v495.js';

test('class IIIA: objective weakness, still ambulatory (the META example)', () => {
  const r = ranawatMyelopathy({ klass: 'IIIA' });
  assert.equal(r.valid, true);
  assert.equal(r.klass, 'IIIA');
  assert.match(r.band, /objective weakness and long-tract signs, still ambulatory/);
});

test('class I: pain without neural deficit', () => {
  assert.match(ranawatMyelopathy({ klass: 'I' }).band, /pain, but no neural deficit/);
});

test('class II: subjective weakness', () => {
  assert.match(ranawatMyelopathy({ klass: 'II' }).band, /subjective weakness, with dysesthesias and hyperreflexia/);
});

test('the IIIA/IIIB split turns on ambulation', () => {
  assert.match(ranawatMyelopathy({ klass: 'IIIA' }).band, /still ambulatory/);
  assert.match(ranawatMyelopathy({ klass: 'IIIB' }).band, /no longer ambulatory/);
});

test('lowercase and numeric aliases map to the canonical classes', () => {
  assert.equal(ranawatMyelopathy({ klass: 'iiib' }).klass, 'IIIB');
  assert.equal(ranawatMyelopathy({ klass: '3a' }).klass, 'IIIA');
  assert.equal(ranawatMyelopathy({ klass: 1 }).klass, 'I');
});

test('a missing, bare-III, or out-of-range class is invalid', () => {
  assert.equal(ranawatMyelopathy({}).valid, false);
  assert.equal(ranawatMyelopathy({ klass: 'III' }).valid, false);
  assert.equal(ranawatMyelopathy({ klass: 'IV' }).valid, false);
});
