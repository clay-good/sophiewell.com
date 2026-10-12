// spec-v1637 tool 17: reading a GS1 element string from a drug package.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gs1DrugBarcodeParser } from '../../lib/gs1-drug-barcode-parser-v1637.js';

const now = new Date(2026, 9, 12);
const p = (scan, at = now) => gs1DrugBarcodeParser({ scan }, at);
const GS = '\u001d';

test('the human-readable form: four elements, check digit, date, NDC digits', () => {
  const r = p('(01)00312345678906(17)271130(10)A1B2(21)12345');
  assert.deepEqual([r.gtin, r.expiration, r.lot, r.serial, r.ndcPositionDigits, r.dscsaElementsPresent, r.flag], ['00312345678906', '2027-11-30', 'A1B2', '12345', '1234567890', true, 'read-all-four-elements']);
});

test('the raw form with separators gives the same reading, with or without a symbology prefix', () => {
  const raw = `0100312345678906172711301${'0'}A1B2${GS}2112345`;
  const r = p(raw);
  assert.deepEqual([r.gtin, r.expiration, r.lot, r.serial], ['00312345678906', '2027-11-30', 'A1B2', '12345']);
  assert.equal(p(`]d2${raw}`).serial, '12345');
  assert.equal(p('010031234567890617271130' + '10A1B2<GS>2112345').lot, 'A1B2');
});

test('a variable-length element that is not last needs the separator', () => {
  // Lot then serial with no separator: everything to the end is read as the lot, which is over 20.
  const r = p('01003123456789061727113010A1B2C3D4E5F6G7H8I9J02112345');
  assert.equal(r.flag, 'problems-found');
  assert.match(r.note, /no separator was found after lot/);
});

test('day 00 is the last day of the month, leap years included, and is flagged', () => {
  const feb = p('(01)00312345678906(17)280200(10)A(21)1');
  assert.deepEqual([feb.expiration, feb.expirationDayWasZero], ['2028-02-29', true]);
  assert.match(feb.note, /shall not be expressed as two zeroes/);
  assert.equal(p('(01)00312345678906(17)270200(10)A(21)1').expiration, '2027-02-28');
});

test('the century: 49 years back to 50 years ahead of the current year', () => {
  const year = (yy) => p(`(17)${yy}0115`).expiration.slice(0, 4);
  assert.deepEqual([year('76'), year('77'), year('26'), year('00')], ['2076', '1977', '2026', '2000']);
});

test('a wrong check digit, a bad month, a missing element', () => {
  const bad = p('(01)00312345678905(17)271130(10)A1B2(21)12345');
  assert.equal(bad.flag, 'problems-found');
  assert.match(bad.note, /has check digit 5 where these digits take 6/);
  assert.equal(bad.gtin, undefined);
  assert.match(p('(01)00312345678906(17)271330(10)A(21)1').note, /month 13 is not a month/);
  const partial = p('(01)00312345678906(17)271130');
  assert.deepEqual([partial.dscsaElementsPresent, partial.flag], [false, 'read-with-elements-missing']);
  assert.match(partial.bandLabel, /Missing: serial number, lot/);
});

test('the NDC comes from (715) when present; a GTIN without prefix 3 gives none', () => {
  assert.equal(p('(01)00312345678906(715)012345067890(17)271130(10)A(21)1').ndc715, '012345067890');
  const other = p('(01)00614141123452(17)271130(10)A(21)1');
  assert.equal(other.ndcPositionDigits, undefined);
  assert.match(other.note, /does not carry U\.P\.C\. prefix 3/);
});

test('refusals and unknown identifiers', () => {
  assert.match(p('').message, /^Enter the scanned string/);
  assert.match(p('hello').message, /^Enter a GS1 element string/);
  assert.match(p('(01)00312345678906(99)zz').note, /\(99\) zz: not an identifier this tool reads/);
  assert.equal(gs1DrugBarcodeParser(null, now).valid, false);
  assert.match(gs1DrugBarcodeParser({ scan: '(17)271130' }).note, /no clock was supplied/);
});
