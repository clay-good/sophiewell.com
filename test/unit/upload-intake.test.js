import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDelimited, parseJsonTable, parseTable, matchColumns, validateColumnMapping, serializeCsv, MAX_FILE_BYTES, MAX_DATA_ROWS } from '../../lib/upload-intake.js';

test('CSV preserves quoted delimiters, escaped quotes, newlines and identifier zeros', () => {
  const result = parseDelimited('\uFEFFpatient,notes,date\r\n001,"a, b\r\nsaid ""yes""",2026-09-28\r\n');
  assert.equal(result.delimiter, ',');
  assert.deepEqual(result.headers, ['patient', 'notes', 'date']);
  assert.deepEqual(result.rows, [['001', 'a, b\r\nsaid "yes"', '2026-09-28']]);
});

test('TSV sniff ignores commas inside quoted headers and values', () => {
  const result = parseDelimited('"name, patient"\tdate_filled\n"Smith, A"\t2026-09-28');
  assert.equal(result.delimiter, '\t');
  assert.deepEqual(result.rows, [['Smith, A', '2026-09-28']]);
});

test('empty fields, terminal delimiters, lone CR and header-only files are preserved', () => {
  assert.deepEqual(parseDelimited('a,b,c\r1,,\r,,').rows, [['1', '', ''], ['', '', '']]);
  assert.deepEqual(parseDelimited('a\n""').rows, [['']]);
  assert.deepEqual(parseDelimited('a,b\n').rows, []);
  assert.deepEqual(parseDelimited('a\n\n').rows, [['']]);
});

test('malformed quoting and inconsistent row widths fail instead of dropping values', () => {
  for (const input of ['a,b\n"open,b', 'a,b\nx"y,z', 'a,b\n"x"y,z', 'a,b\nx', 'a,b\nx,y,z']) {
    assert.throws(() => parseDelimited(input), RangeError, input);
  }
  for (const input of ['', '\uFEFF', ',b\nx,y', 'a, \nx,y']) {
    assert.throws(() => parseDelimited(input), RangeError, input);
  }
});

test('ambiguous sniff needs an explicit delimiter; unsupported delimiters fail', () => {
  assert.throws(() => parseDelimited('a,b\tc\nx,y\tz'), /ambiguous/);
  assert.deepEqual(parseDelimited('a,b\tc\nx,y\tz', { delimiter: '\t' }).headers, ['a,b', 'c']);
  assert.throws(() => parseDelimited('a;b', { delimiter: ';' }), /CSV or TSV/);
});

test('byte and row limits reject the whole file at the first excess', () => {
  assert.equal(MAX_FILE_BYTES, 50 * 1024 * 1024);
  assert.equal(MAX_DATA_ROWS, 500000);
  assert.deepEqual(parseDelimited('a\né', { maxBytes: 4, maxRows: 1 }).rows, [['é']]);
  assert.throws(() => parseDelimited('a\né', { maxBytes: 3 }), /byte limit/);
  assert.deepEqual(parseDelimited('a', { maxRows: 0 }).rows, []);
  assert.throws(() => parseDelimited('a\n1\n2', { maxRows: 1 }), /row limit/);
  assert.throws(() => parseDelimited('a\n1\n', { maxRows: 0 }), /row limit/);
  assert.throws(() => parseDelimited('a', { maxRows: MAX_DATA_ROWS + 1 }), /Invalid file limits/);
  assert.throws(() => parseDelimited('a', { maxBytes: NaN }), /Invalid file limits/);
  assert.throws(() => parseDelimited(null), TypeError);
});

const fields = [
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date_filled', 'dispense date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
  { id: 'patient', required: false },
];

test('header synonyms propose indexes without changing the input', () => {
  const headers = [' DAYS-SUPPLY ', 'Dispense Date', 'ignored'];
  const result = matchColumns(headers, fields);
  assert.deepEqual({ ...result.mapping }, { fill_date: 1, days_supply: 0, patient: null });
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.ambiguous, []);
  assert.deepEqual(validateColumnMapping(headers, fields, result.mapping), []);
  assert.equal(headers[0], ' DAYS-SUPPLY ');
});

test('missing required columns are named and block a run', () => {
  const result = matchColumns(['patient'], fields);
  assert.deepEqual(result.missing, ['fill_date', 'days_supply']);
  assert.deepEqual(validateColumnMapping(['patient'], fields, result.mapping), [
    'Choose a column for Fill date.', 'Choose a column for Days supply.',
  ]);
});

test('duplicate and conflicting header matches require a reader choice', () => {
  const headers = ['fill_date', 'date_filled', 'days_supply'];
  const result = matchColumns(headers, fields);
  assert.deepEqual(result.ambiguous, ['fill_date']);
  assert.equal(result.mapping.fill_date, null);
  assert.deepEqual(validateColumnMapping(headers, fields, { fill_date: 1, days_supply: 2 }), []);
  const shared = matchColumns(['fill_date'], [...fields, { id: 'other', synonyms: ['fill_date'] }]);
  assert.deepEqual(shared.ambiguous, ['fill_date', 'other']);
  assert.equal(shared.mapping.other, null);
});

test('confirmed mappings refuse reused, out-of-range and nonnumeric columns', () => {
  const headers = ['a', 'b'];
  for (const mapping of [
    { fill_date: 0, days_supply: 0 }, { fill_date: -1, days_supply: 1 },
    { fill_date: 2, days_supply: 1 }, { fill_date: '0', days_supply: 1 },
  ]) assert.ok(validateColumnMapping(headers, fields, mapping).length);
});

test('untrusted headers and field IDs cannot change object prototypes', () => {
  const result = matchColumns(['__proto__'], [{ id: '__proto__', required: true }]);
  assert.equal(Object.getPrototypeOf(result.mapping), null);
  assert.equal(result.mapping.__proto__, 0);
  assert.deepEqual(validateColumnMapping(['x'], [{ id: 'constructor', required: true }], {}), [
    'Choose a column for constructor.',
  ]);
});

test('CSV export round-trips quotes and newlines and neutralizes spreadsheet formulas', () => {
  const csv = serializeCsv(['patient', 'note', 'amount'], [
    ['Smith, Ann', 'said "yes"\nthen left', -3],
    ['=HYPERLINK("https://example.invalid")', '@SUM(A1:A2)', '12'],
  ]);
  assert.match(csv, /^patient,note,amount\r\n/);
  assert.match(csv, /"Smith, Ann","said ""yes""\nthen left",-3/);
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example.invalid""\)",'@SUM\(A1:A2\),12/);
  assert.deepEqual(parseDelimited(csv).rows[0], ['Smith, Ann', 'said "yes"\nthen left', '-3']);
  assert.throws(() => serializeCsv(['a'], [['x', 'y']]), /wrong number of columns/);
});

test('serializeCsv: an optional trailer is one closing comment row, on one line', () => {
  const csv = serializeCsv(['a'], [['=1+1']], { trailer: 'Made by x,\nresult abc' });
  assert.equal(csv.split('\r\n').at(-2), '# Made by x, result abc');
  assert.ok(csv.includes("'=1+1"), 'the formula guard still applies to cells');
  assert.equal(serializeCsv(['a'], [['1']]).split('\r\n').length, 3, 'no trailer, no extra row');
});

test('spec-v1501 §3 JSON intake: an array, an object holding one array, or NDJSON becomes headers and string rows', () => {
  const want = { delimiter: 'json', headers: ['id', 'size', 'income', 'note'], rows: [['00123', '3', '40000', ''], ['B', '2', '', 'x']] };
  const recs = [{ id: '00123', size: 3, income: 40000 }, { id: 'B', size: 2, income: null, note: 'x' }];
  assert.deepEqual(parseJsonTable(JSON.stringify(recs)), want);
  assert.deepEqual(parseJsonTable(JSON.stringify({ households: recs, meta: { v: 1 } })), want);
  assert.deepEqual(parseJsonTable(recs.map((r) => JSON.stringify(r)).join('\n') + '\n'), want);
  assert.deepEqual(parseTable('﻿' + JSON.stringify(recs)), want);
  assert.equal(parseTable('a,b\n1,2\n').delimiter, ',');
});

test('JSON intake refuses what it would have to guess at', () => {
  assert.throws(() => parseJsonTable('[{"a":{"b":1}}]'), /Record 1, "a" holds a nested value/);
  assert.throws(() => parseJsonTable('{"x":[{"a":1}],"y":[{"b":2}]}'), /holds 2 lists \(x, y\)/);
  assert.throws(() => parseJsonTable('[1,2]'), /Record 1 is not an object/);
  assert.throws(() => parseJsonTable('{"a":1}\nnot json'), /Line 2 is not valid JSON/);
  assert.throws(() => parseJsonTable('[]'), /no named values/);
});
