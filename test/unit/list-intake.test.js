// File intake for the pasted-list tools: a header row reorders the columns by name; no header passes as is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listFromFile, LIST_COLUMNS } from '../../lib/list-intake.js';
import { supdMeasure } from '../../lib/supd-measure-v1638.js';

test('a header row reorders the columns into the order the list reads', () => {
  const r = listFromFile('Fill date,Member,Class\n2025-01-10,A,diabetes\n2025-04-10,A,diabetes', 'supd-fills');
  assert.equal(r.text, 'A, 2025-01-10, diabetes\nA, 2025-04-10, diabetes');
  assert.match(r.note, /2 rows read by column name/);
  const s = supdMeasure({ measurementYear: 2025, members: listFromFile('Member,Age,Continuously enrolled\nA,60,yes', 'supd-members').text, fills: r.text });
  assert.equal(s.denominator, 1);
});

test('no header passes as is; a missing required column is named; a comma inside a cell becomes a semicolon', () => {
  assert.equal(listFromFile('A,60,yes\nB,61,no', 'supd-members').text, 'A, 60, yes\nB, 61, no');
  assert.match(listFromFile('Member,Age\nA,60', 'supd-members').message, /no column for continuously enrolled/);
  const m = listFromFile('Enrollee,Enrolled,Prior year,CMR dates,Age,Hospice,Met\nA,2026-03-01,no,"2026-04-01,2026-09-01",70,no,yes', 'msc-enrollees');
  assert.equal(m.text, 'A, 2026-03-01, no, , 2026-04-01;2026-09-01, , , 70, no, yes');
  assert.equal(Object.keys(LIST_COLUMNS).length, 5);
  assert.match(listFromFile('', 'supd-members').message, /no rows/);
});
