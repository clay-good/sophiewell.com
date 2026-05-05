import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { filterRows, sortRows, formatRowAsTSV, renderTable } = await import('../../lib/table.js');

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'rw',   label: 'RW' },
];
const rows = [
  { code: '11', name: 'Office',     rw: 1.5 },
  { code: '21', name: 'Inpatient',  rw: 2.1 },
  { code: '22', name: 'Outpatient', rw: 1.5 },
  { code: '23', name: 'ER',         rw: 3.0 },
];

test('filterRows: empty query returns a copy', () => {
  const out = filterRows(rows, columns, '');
  assert.deepEqual(out, rows);
  assert.notEqual(out, rows);
});

test('filterRows: substring case-insensitive across all columns', () => {
  assert.equal(filterRows(rows, columns, 'office').length, 1);
  assert.equal(filterRows(rows, columns, 'er').length, 1); // only "ER"
  assert.equal(filterRows(rows, columns, 'patient').length, 2); // Inpatient + Outpatient
});

test('sortRows: numeric column ascending then descending', () => {
  const asc = sortRows(rows, columns, 'rw', 'asc').map((r) => r.code);
  // 1.5 (11), 1.5 (22), 2.1 (21), 3.0 (23) -- stable on ties.
  assert.deepEqual(asc, ['11', '22', '21', '23']);
  const desc = sortRows(rows, columns, 'rw', 'desc').map((r) => r.code);
  assert.deepEqual(desc, ['23', '21', '11', '22']);
});

test('sortRows: string column localeCompare', () => {
  const asc = sortRows(rows, columns, 'name', 'asc').map((r) => r.name);
  assert.deepEqual(asc, ['ER', 'Inpatient', 'Office', 'Outpatient']);
});

test('sortRows: unknown key returns a copy', () => {
  const out = sortRows(rows, columns, 'nope', 'asc');
  assert.deepEqual(out, rows);
});

test('formatRowAsTSV: tab-joined values, sanitizes embedded tabs/newlines', () => {
  const r = { code: 'X', name: 'a\tb', rw: 'a\nb' };
  assert.equal(formatRowAsTSV(r, columns), 'X\ta b\ta b');
});

test('renderTable: renders header + rows + search input', () => {
  const root = makeDiv();
  renderTable(root, { columns, rows, copyableRows: false });
  const ths = root.querySelectorAll('th');
  assert.equal(ths.length, 3);
  const trs = root.querySelectorAll('tr');
  // 1 header + 4 data rows.
  assert.equal(trs.length, 5);
  assert.ok(root.querySelector('.table-search'));
});

test('renderTable: search clearing restores all rows', () => {
  const root = makeDiv();
  const api = renderTable(root, { columns, rows, copyableRows: false });
  api.setQuery('office');
  let body = root.querySelector('tbody');
  assert.equal(body.querySelectorAll('tr').length, 1);
  api.setQuery('');
  body = root.querySelector('tbody');
  assert.equal(body.querySelectorAll('tr').length, 4);
});

test('renderTable: empty result shows fallback row', () => {
  const root = makeDiv();
  const api = renderTable(root, { columns, rows, copyableRows: false, emptyText: 'Nothing.' });
  api.setQuery('zzz-nomatch');
  assert.ok(root.textContent.includes('Nothing.'));
});
