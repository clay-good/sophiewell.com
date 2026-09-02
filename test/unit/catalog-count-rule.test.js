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

// spec-v994: the architecture doc restates the tile taxonomy as a table. It had
// drifted to naming five of six groups wrongly and calling three of them
// retired while they were live, so it is gated now. These pin the detector on
// synthetic input: a right table passes, a wrong label and a wrong count each
// fail, and a group present in one and not the other is named.

import { parseGroupTable, findGroupTableDrift } from '../../scripts/lib/group-labels.mjs';
import { countTilesByGroup } from '../../scripts/check-catalog-truth.mjs';

const DOC = [
  '| Group | Label | Tiles |',
  '| --- | --- | --- |',
  '| A | Billing & Coding | 3 |',
  '| K | Reference Ranges | 0 |',
].join('\n');
const LABELS = { A: 'Billing & Coding', K: 'Reference Ranges' };

test('the group table passes when it matches app.js', () => {
  assert.deepEqual(findGroupTableDrift(parseGroupTable(DOC), LABELS, { A: 3 }), []);
});

test('a wrong tile count in the table is caught', () => {
  const drift = findGroupTableDrift(parseGroupTable(DOC), LABELS, { A: 4 });
  assert.equal(drift.length, 1);
  assert.match(drift[0], /group A holds 3 tiles; app\.js has 4/);
});

test('a wrong label in the table is caught', () => {
  const drift = findGroupTableDrift(parseGroupTable(DOC), { ...LABELS, A: 'Billing and Coding' }, { A: 3 });
  assert.equal(drift.length, 1);
  assert.match(drift[0], /calls group A "Billing & Coding" where app\.js calls it "Billing and Coding"/);
});

test('a group in only one of the two is named, in both directions', () => {
  const missing = findGroupTableDrift(parseGroupTable(DOC), { ...LABELS, P: 'Revenue Cycle' }, { A: 3 });
  assert.ok(missing.some((d) => /missing group P/.test(d)), missing.join('; '));
  const extra = findGroupTableDrift(parseGroupTable(DOC), { A: 'Billing & Coding' }, { A: 3 });
  assert.ok(extra.some((d) => /names a group K that app\.js does not declare/.test(d)), extra.join('; '));
});

test('a doc with no table at all fails rather than passing empty', () => {
  assert.equal(parseGroupTable('# Architecture\n\nno table here'), null);
  assert.deepEqual(findGroupTableDrift(null, LABELS, {}), ['docs/architecture.md no longer carries the group table']);
});

test('countTilesByGroup counts only top-level UTILITIES rows', () => {
  const counts = countTilesByGroup([
    'const UTILITIES = [',
    "  { id: 'a', name: 'A', group: 'G', clinical: true },",
    "  { id: 'b', name: 'B', group: 'G', clinical: true },",
    "  { id: 'c', name: 'C', group: 'E', clinical: true },",
    '];',
  ].join('\n'));
  assert.deepEqual(counts, { G: 2, E: 1 });
});
