// spec-v992: the catalog-count drift rule went blind when the catalog passed
// 999 and stayed blind for the next seven hundred tiles, because it matched a
// three-digit literal and capped the range at 999. These tests pin the shape of
// the rule, not one value: each asserts on a synthetic line, and each would
// have failed against the old regex.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { driftedCountsOnLine, assertRuleStillSees, YEAR_BAND } from '../../scripts/grep-check.mjs';
import { parseUtilityIds } from '../../scripts/check-catalog-truth.mjs';

const TRUTH = 1704;

test('a four-digit drift is caught (the defect that shipped)', () => {
  assert.deepEqual(
    driftedCountsOnLine('a combobox over all 1145 utilities plus a nav', TRUTH),
    [1145],
  );
});

test('a three-digit drift is still caught', () => {
  assert.deepEqual(driftedCountsOnLine('the live catalog is 700 tiles', TRUTH), [700]);
});

test('a comma-grouped count is read whole, not as its last three digits', () => {
  // The old lookbehind stopped at digits, so "1,704" was read as 704 and any
  // line stating the true count in the house number format read as a drift.
  assert.deepEqual(driftedCountsOnLine('1,704 free healthcare calculators', TRUTH), []);
  assert.deepEqual(driftedCountsOnLine('1,145 free healthcare calculators', TRUTH), [1145]);
});

test('the true count passes in either format', () => {
  assert.deepEqual(driftedCountsOnLine('all 1704 utilities', TRUTH), []);
  assert.deepEqual(driftedCountsOnLine('all 1,704 utilities', TRUTH), []);
});

test('a publication year beside a catalog word is not a count', () => {
  for (const line of [
    'Opioid MME Calculator (CDC 2022),',
    '## spec-v61 bedside tiles (added 2026-06-06)',
    'the Marti-Soler 2016 point table). The tile below is',
  ]) {
    assert.deepEqual(driftedCountsOnLine(line, TRUTH), [], line);
  }
});

test('a number with no catalog word near it is ignored', () => {
  assert.deepEqual(driftedCountsOnLine('a 1145 ms interval', TRUTH), []);
});

test('the year carve-out cannot silently blind the rule a second time', () => {
  assert.equal(assertRuleStillSees(1704), null);
  const blind = assertRuleStillSees(YEAR_BAND[0]);
  assert.ok(blind && blind.includes('can no longer see'), 'expected a failure message inside the year band');
  assert.ok(assertRuleStillSees(YEAR_BAND[1]), 'the top of the band is inside it');
  assert.equal(assertRuleStillSees(YEAR_BAND[1] + 1), null);
});

test('parseUtilityIds returns the live ids the orphan-copy guard needs', () => {
  const ids = parseUtilityIds([
    'const UTILITIES = [',
    "  { id: 'alpha', name: 'A' },",
    "  { id: 'beta', name: 'B' },",
    '];',
  ].join('\n'));
  assert.deepEqual(ids, ['alpha', 'beta']);
});
