import { test } from 'node:test';
import assert from 'node:assert/strict';
import { westley } from '../../lib/scoring-v4.js';

test('westley 0 of 17 (tile example) -> mild band', () => {
  const r = westley({ loc: 0, cyanosis: 0, stridor: 0, airEntry: 0, retractions: 0 });
  assert.equal(r.score, 0);
  assert.match(r.band, /mild croup per Westley 1978/);
});

test('westley 3 of 17 (lower edge of moderate) -> moderate', () => {
  const r = westley({ loc: 0, cyanosis: 0, stridor: 1, airEntry: 0, retractions: 2 });
  assert.equal(r.score, 3);
  assert.match(r.band, /moderate croup/);
});

test('westley 7 of 17 (upper edge of moderate) -> moderate', () => {
  // 0 + 4 + 1 + 0 + 2 = 7
  const r = westley({ loc: 0, cyanosis: 4, stridor: 1, airEntry: 0, retractions: 2 });
  assert.equal(r.score, 7);
  assert.match(r.band, /moderate/);
});

test('westley 8 of 17 (lower edge of severe) -> severe', () => {
  // 5 + 0 + 1 + 0 + 2 = 8
  const r = westley({ loc: 5, cyanosis: 0, stridor: 1, airEntry: 0, retractions: 2 });
  assert.equal(r.score, 8);
  assert.match(r.band, /severe croup/);
});

test('westley 11 of 17 (upper edge of severe) -> severe', () => {
  // 0 + 5 + 2 + 1 + 3 = 11
  const r = westley({ loc: 0, cyanosis: 5, stridor: 2, airEntry: 1, retractions: 3 });
  assert.equal(r.score, 11);
  assert.match(r.band, /severe/);
});

test('westley 12 of 17 (lower edge of impending) -> impending respiratory failure', () => {
  // 5 + 4 + 0 + 0 + 3 = 12
  const r = westley({ loc: 5, cyanosis: 4, stridor: 0, airEntry: 0, retractions: 3 });
  assert.equal(r.score, 12);
  assert.match(r.band, /impending respiratory failure/);
});

test('westley 17 of 17 (max) -> impending', () => {
  const r = westley({ loc: 5, cyanosis: 5, stridor: 2, airEntry: 2, retractions: 3 });
  assert.equal(r.score, 17);
  assert.match(r.band, /impending/);
});

test('westley snaps out-of-token values (LOC 3 -> 5)', () => {
  // 3 is between 0 and 5; nearer to 5
  const r = westley({ loc: 3, cyanosis: 0, stridor: 0, airEntry: 0, retractions: 0 });
  assert.equal(r.parts.loc, 5);
});
