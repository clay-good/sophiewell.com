// lib/prompt.js rankingQuery: values are stripped before ranking, except a number that is part of a
// curated phrase (found October 16, 2026: "usp 797 bud" ranked on "usp bud" and reached nothing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankingQuery } from '../../lib/prompt.js';

const SYN = [
  { phrases: ['usp 797 bud'], tile: 'compounding-bud', audience: 'clinicians' },
  { phrases: ['kidney function'], tile: 'egfr', audience: 'patients' },
];

test('a curated phrase with a number keeps its number', () => {
  assert.equal(rankingQuery('usp 797 bud', SYN), 'usp 797 bud');
  assert.equal(rankingQuery('  USP 797 BUD ', SYN), 'USP 797 BUD');
});

test('values in an ordinary question are still stripped', () => {
  assert.equal(rankingQuery('crcl 72 year old 68 kg', SYN), 'crcl year old kg');
  assert.equal(rankingQuery('kidney function 45', SYN), 'kidney function', 'the matched phrase has no digit');
  assert.equal(rankingQuery('wells score', SYN), 'wells score');
  assert.equal(rankingQuery(42, SYN), '');
  assert.equal(rankingQuery('usp 797 bud', null), 'usp bud', 'no table, no exception');
});
