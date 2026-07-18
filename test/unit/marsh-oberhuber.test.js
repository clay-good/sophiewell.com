// spec-v423: Marsh-Oberhuber classification of celiac histology (0/1/2/3a/3b/3c).
// Worked-example tests: each type and its histologic description, alias input, and the invalid-type guard.
// Types transcribed from Oberhuber 1999 (Eur J Gastroenterol Hepatol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marshOberhuber } from '../../lib/marsh-oberhuber-v423.js';

test('type 3a: partial villous atrophy (the META example)', () => {
  const r = marshOberhuber({ type: '3a' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '3a');
  assert.match(r.band, /partial villous atrophy/);
});

test('type 0: preinfiltrative, normal mucosa', () => {
  const r = marshOberhuber({ type: '0' });
  assert.equal(r.type, '0');
  assert.match(r.band, /preinfiltrative/);
});

test('type 1: infiltrative, increased IELs, normal villi', () => {
  assert.match(marshOberhuber({ type: '1' }).band, /increased intraepithelial lymphocytes/);
});

test('type 2: hyperplastic, crypt hyperplasia', () => {
  assert.match(marshOberhuber({ type: '2' }).band, /crypt hyperplasia/);
});

test('type 3c: total villous atrophy', () => {
  const r = marshOberhuber({ type: '3c' });
  assert.equal(r.type, '3c');
  assert.match(r.band, /total villous atrophy/);
});

test('aliases: case-insensitive and a bare 3 maps to 3a', () => {
  assert.equal(marshOberhuber({ type: '3B' }).type, '3b');
  assert.equal(marshOberhuber({ type: '3' }).type, '3a');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(marshOberhuber({}).valid, false);
  assert.equal(marshOberhuber({ type: '4' }).valid, false);
  assert.equal(marshOberhuber({ type: '3d' }).valid, false);
});
