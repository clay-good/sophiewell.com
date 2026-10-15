// spec-v1630 tool 13: the NIOSH 2024 hazardous drug list lookup (owner decision 5, October 15, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hazardousDrugListCheck as h } from '../../lib/hazardous-drug-list-check-v1630.js';
import { TABLE1, TABLE2, REMOVED, SOURCE } from '../../lib/niosh-hazardous-drugs-2024.js';

test('the dataset carries the 2024 list as read from the publication', () => {
  assert.deepEqual([TABLE1.length, TABLE2.length, REMOVED.length], [106, 130, 7]);
  assert.equal(SOURCE.route, 'B');
  assert.match(SOURCE.source.url, /^https:\/\/www\.cdc\.gov\/niosh\/docs\/2025-103\//);
});

test('one name: Table 1, Table 2, removed, and a miss that never says safe', () => {
  assert.deepEqual([h({ drug: 'Methotrexate' }).flag, h({ drug: 'warfarin' }).flag, h({ drug: 'risperidone' }).flag], ['table-1', 'table-2', 'removed']);
  const miss = h({ drug: 'acetaminophen' });
  assert.equal(miss.flag, 'not-listed');
  assert.equal(miss.abnormal, false);
  assert.match(miss.band, /is not on the NIOSH 2024 \(December 2024\) list\.$/);
  assert.match(miss.notes.join(' '), /not shown to be safe to handle/);
  assert.doesNotMatch(miss.notes.join(' '), /not hazardous/);
});

test('a trailing salt word is removed once, and said; either name of a two-name entry matches', () => {
  const r = h({ drug: 'fluorouracil sodium' });
  assert.equal(r.flag, 'table-1');
  assert.match(r.notes[0], /salt word removed/);
  assert.equal(h({ drug: 'valproic acid' }).flag, 'table-2');
  assert.equal(h({ drug: 'valproate' }).flag, 'table-2');
});

test('an entry that only contains the name is shown, not counted', () => {
  const r = h({ drug: 'estrogen' });
  assert.equal(r.flag, 'not-listed');
  assert.match(r.notes[0], /not counted as a match: .*estrogen\/progesterone/);
});

test('a list: distinct names counted by table, with a CSV', () => {
  const r = h({ list: 'methotrexate\nacetaminophen\nwarfarin, 5 mg\nliraglutide\nMETHOTREXATE' });
  assert.deepEqual([r.table1, r.table2, r.removed, r.notListed, r.results.length], [1, 1, 1, 1, 4]);
  assert.equal(r.band, '2 of 4 names on the NIOSH 2024 (December 2024) list (1 in Table 1, 1 in Table 2).');
  assert.match(r.csv.split('\n')[0], /^name entered,status,NIOSH entry,table/);
  assert.equal(r.csv.trim().split('\n').length, 5);
});

test('nothing entered is refused', () => {
  assert.equal(h({}).valid, false);
  assert.equal(h({ drug: '  ', list: '\n' }).valid, false);
});
