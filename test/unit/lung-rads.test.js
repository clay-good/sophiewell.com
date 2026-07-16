// spec-v325: ACR Lung-RADS v2022 assessment categories. Worked-example tests: the
// non-suspicious end (0-3), the suspicious end (4A/4B/4X), the follow-up intervals, the
// 4X definition, case-insensitive input, and the invalid-category guard. Transcribed from
// the primary ACR Lung-RADS v2022 assessment-category table (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lungRads } from '../../lib/lung-rads-v325.js';

test('category 4A: suspicious, 3-month LDCT (the META example)', () => {
  const r = lungRads({ category: '4A' });
  assert.equal(r.valid, true);
  assert.equal(r.category, '4A');
  assert.equal(r.suspicious, true);
  assert.match(r.band, /3-month LDCT/);
  assert.match(r.band, /solid component of at least 8 mm/);
});

test('categories 0-3 are not flagged suspicious', () => {
  for (const c of ['0', '1', '2', '3']) {
    assert.equal(lungRads({ category: c }).suspicious, false, `category ${c}`);
  }
});

test('categories 1 and 2 continue annual (12-month) screening', () => {
  assert.match(lungRads({ category: '1' }).band, /12-month LDCT/);
  assert.match(lungRads({ category: '2' }).band, /12-month LDCT/);
});

test('category 3 is a 6-month LDCT follow-up', () => {
  assert.match(lungRads({ category: '3' }).band, /6-month LDCT/);
});

test('4B is very suspicious and 4X is a category 3/4 with added suspicious features, both suspicious', () => {
  assert.equal(lungRads({ category: '4B' }).suspicious, true);
  const x = lungRads({ category: '4X' });
  assert.equal(x.suspicious, true);
  assert.match(x.band, /additional features or imaging findings that increase the suspicion/);
});

test('the sub-division letter is case-insensitive', () => {
  assert.equal(lungRads({ category: '4b' }).category, '4B');
});

test('a missing or unknown category is invalid', () => {
  assert.equal(lungRads({}).valid, false);
  assert.equal(lungRads({ category: '5' }).valid, false);
  assert.equal(lungRads({ category: '4C' }).valid, false); // Lung-RADS has no 4C
});
