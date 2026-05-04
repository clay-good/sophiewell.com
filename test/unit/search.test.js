// Unit tests for the reusable code-search component.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex } from '../../lib/search.js';

const RECORDS = [
  { code: 'I10',     desc: 'Essential (primary) hypertension' },
  { code: 'I21.4',   desc: 'Non-ST elevation (NSTEMI) myocardial infarction' },
  { code: 'I50.9',   desc: 'Heart failure, unspecified' },
  { code: 'E11',     desc: 'Type 2 diabetes mellitus' },
  { code: 'E11.9',   desc: 'Type 2 diabetes mellitus without complications' },
  { code: 'E11.65',  desc: 'Type 2 diabetes mellitus with hyperglycemia' },
  { code: 'J18.9',   desc: 'Pneumonia, unspecified organism' },
  { code: 'M54.5',   desc: 'Low back pain' },
  { code: 'R51',     desc: 'Headache' },
  { code: 'Z00.00',  desc: 'Encounter for general adult medical examination without abnormal findings' },
];

test('buildIndex: exact code match returns the record', () => {
  const idx = buildIndex(RECORDS);
  const found = idx.search('I10');
  assert.equal(found[0].code, 'I10');
});

test('buildIndex: prefix code match returns matching records', () => {
  const idx = buildIndex(RECORDS);
  const found = idx.search('E11');
  const codes = found.map((r) => r.code).sort();
  assert.deepEqual(codes, ['E11', 'E11.65', 'E11.9']);
});

test('buildIndex: phrase match in description', () => {
  const idx = buildIndex(RECORDS);
  const found = idx.search('headache');
  assert.equal(found[0].code, 'R51');
});

test('buildIndex: case-insensitive code lookup', () => {
  const idx = buildIndex(RECORDS);
  assert.equal(idx.search('i10')[0].code, 'I10');
});

test('buildIndex: empty query returns empty array', () => {
  const idx = buildIndex(RECORDS);
  assert.deepEqual(idx.search(''), []);
});

test('buildIndex: limit caps results', () => {
  const idx = buildIndex(RECORDS);
  const found = idx.search('diabetes', 2);
  assert.equal(found.length, 2);
});

test('buildIndex: no match returns empty', () => {
  const idx = buildIndex(RECORDS);
  assert.deepEqual(idx.search('xyzzy'), []);
});
