// Unit tests for lib/codes.js (NDC normalizer, NPI Luhn, regex extractors).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeNDC, isValidNPI, REGEX, extractAll, extractDollars } from '../../lib/codes.js';

test('normalizeNDC: 5-4-2 hyphenated passes through', () => {
  const r = normalizeNDC('00093-1014-01');
  assert.equal(r.canonical, '00093101401');
  assert.equal(r.formatted, '00093-1014-01');
  assert.equal(r.originalFormat, '5-4-2');
});

test('normalizeNDC: 4-4-2 hyphenated zero-pads labeler', () => {
  const r = normalizeNDC('1234-5678-90');
  assert.equal(r.canonical, '01234567890');
  assert.equal(r.originalFormat, '4-4-2');
});

test('normalizeNDC: 5-3-2 hyphenated zero-pads product', () => {
  const r = normalizeNDC('12345-678-90');
  assert.equal(r.canonical, '12345067890');
  assert.equal(r.originalFormat, '5-3-2');
});

test('normalizeNDC: 5-4-1 hyphenated zero-pads package', () => {
  const r = normalizeNDC('12345-6789-0');
  assert.equal(r.canonical, '12345678900');
  assert.equal(r.originalFormat, '5-4-1');
});

test('normalizeNDC: 11-digit unhyphenated reads as 5-4-2', () => {
  const r = normalizeNDC('00093101401');
  assert.equal(r.canonical, '00093101401');
});

test('normalizeNDC: rejects garbage', () => {
  assert.equal(normalizeNDC(''), null);
  assert.equal(normalizeNDC('abc'), null);
  assert.equal(normalizeNDC('12-34'), null);
  assert.equal(normalizeNDC('12345-6789-012'), null);
});

test('normalizeNDC: rejects non-string', () => {
  assert.equal(normalizeNDC(12345678901), null);
});

test('isValidNPI: known valid sample passes Luhn', () => {
  // 1234567893 is a CMS-published example NPI for documentation.
  assert.equal(isValidNPI('1234567893'), true);
});

test('isValidNPI: rejects too-short input', () => {
  assert.equal(isValidNPI('123456789'), false);
});

test('isValidNPI: rejects non-digit input', () => {
  assert.equal(isValidNPI('1234567A93'), false);
});

test('isValidNPI: rejects all zeros', () => {
  assert.equal(isValidNPI('0000000000'), false);
});

test('REGEX.icd10: matches simple codes', () => {
  const text = 'Dx: I10 and E11.65 plus J44.0';
  const found = extractAll(REGEX.icd10, text).map((m) => m.value);
  assert.deepEqual(found.sort(), ['E11.65', 'I10', 'J44.0']);
});

test('REGEX.hcpcs: matches J codes', () => {
  const found = extractAll(REGEX.hcpcs, 'Drug J2270 administered with G0008').map((m) => m.value);
  assert.deepEqual(found.sort(), ['G0008', 'J2270']);
});

test('extractDollars: parses comma and decimal forms', () => {
  const found = extractDollars('Charge $1,234.56 and $7.89 and 100.00 paid');
  const values = found.map((d) => d.value);
  assert.deepEqual(values, [1234.56, 7.89, 100.00]);
});
