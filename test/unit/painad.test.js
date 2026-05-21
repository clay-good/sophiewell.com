import { test } from 'node:test';
import assert from 'node:assert/strict';
import { painad } from '../../lib/scoring-v4.js';

test('painad 0 (all zero; tile example) -> no pain', () => {
  const r = painad({ breathing: 0, vocalization: 0, facial: 0, bodyLanguage: 0, consolability: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.band, 'no pain');
});

test('painad 3 (upper edge of mild) -> mild discomfort', () => {
  const r = painad({ breathing: 1, vocalization: 1, facial: 1, bodyLanguage: 0, consolability: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'mild discomfort');
});

test('painad 4 (lower edge of moderate) -> moderate pain', () => {
  const r = painad({ breathing: 1, vocalization: 1, facial: 1, bodyLanguage: 1, consolability: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'moderate pain');
});

test('painad 7 (lower edge of severe) -> severe pain', () => {
  const r = painad({ breathing: 2, vocalization: 1, facial: 1, bodyLanguage: 2, consolability: 1 });
  assert.equal(r.score, 7);
  assert.equal(r.band, 'severe pain');
});

test('painad 10 (all 2s) -> severe pain', () => {
  const r = painad({ breathing: 2, vocalization: 2, facial: 2, bodyLanguage: 2, consolability: 2 });
  assert.equal(r.score, 10);
  assert.equal(r.band, 'severe pain');
});

test('painad rejects out-of-range items', () => {
  assert.throws(() => painad({ breathing: 3, vocalization: 0, facial: 0, bodyLanguage: 0, consolability: 0 }));
  assert.throws(() => painad({ breathing: 1, vocalization: -1, facial: 0, bodyLanguage: 0, consolability: 0 }));
});
