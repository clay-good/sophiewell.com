// spec-v1637 tool 18: the GS1 check digit and an NDC inside a GTIN.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ndcGtinConvert, gs1CheckDigit } from '../../lib/ndc-gtin-convert-v1637.js';

const now = new Date(2026, 9, 12);

test('the GS1 worked examples: Table 7-9 and Table 2-17', () => {
  assert.equal(gs1CheckDigit('37610425002123456'), '9');
  assert.equal(gs1CheckDigit('061414112345'), '2');
  assert.equal(gs1CheckDigit('1061414112345'), '9');
  assert.equal(gs1CheckDigit('8061414112345'), '8');
});

test('FDA\'s example: NDC 1234567890 gives UPC 312345678906', () => {
  const r = ndcGtinConvert({ value: '1234567890' }, now);
  assert.deepEqual([r.gtin12, r.gtin14, r.flag], ['312345678906', '00312345678906', 'gtin-built']);
  // Hyphens in any label layout give the same digits.
  assert.equal(ndcGtinConvert({ value: '12345-678-90' }, now).gtin12, '312345678906');
  assert.equal(ndcGtinConvert({ value: '1234-5678-90' }, now).gtin12, '312345678906');
});

test('a grouping takes the indicator and a recalculated check digit', () => {
  const r = ndcGtinConvert({ value: '1234567890', indicator: 'indicator-1' }, now);
  assert.equal(r.groupingGtin14, `1031234567890${gs1CheckDigit('1031234567890')}`);
  assert.notEqual(r.groupingGtin14.slice(-1), r.gtin12.slice(-1));
  assert.match(ndcGtinConvert({ value: '1234567890' }, now).note, /No indicator digit was chosen/);
});

test('reading a GTIN: the check digit, and the digits in the NDC position', () => {
  const twelve = ndcGtinConvert({ value: '312345678906' }, now);
  assert.deepEqual([twelve.checkDigitValid, twelve.ndcPositionDigits, twelve.flag], [true, '1234567890', 'ndc-position-read']);
  const fourteen = ndcGtinConvert({ value: '00312345678906' }, now);
  assert.deepEqual([fourteen.ndcPositionDigits, fourteen.indicator], ['1234567890', '0']);
  const grouping = ndcGtinConvert({ value: `1031234567890${gs1CheckDigit('1031234567890')}` }, now);
  assert.deepEqual([grouping.ndcPositionDigits, grouping.indicator, grouping.checkDigitValid], ['1234567890', '1', true]);
  const wrong = ndcGtinConvert({ value: '312345678905' }, now);
  assert.deepEqual([wrong.checkDigitValid, wrong.expectedCheckDigit, wrong.flag], [false, '6', 'check-digit-wrong']);
  // A GTIN-13 beginning 03 pads to x03 as well.
  assert.equal(ndcGtinConvert({ value: '0312345678906' }, now).ndcPositionDigits, '1234567890');
  // Prefix 06 holds no NDC position.
  assert.equal(ndcGtinConvert({ value: '0614141123452' }, now).flag, 'no-ndc-position');
});

test('from March 7, 2033 the digits are labeled the 10-digit form', () => {
  const later = new Date(2033, 2, 7);
  assert.equal(ndcGtinConvert({ value: '1234567890' }, later).flag, 'gtin-built-10-digit-form');
  assert.match(ndcGtinConvert({ value: '312345678906' }, later).note, /They are the 10-digit form/);
  assert.match(ndcGtinConvert({ value: '1234567890' }, now).note, /not yet in effect/);
});

test('refusals: 11 billing digits, other lengths, letters, an indicator outside 1 to 8', () => {
  assert.match(ndcGtinConvert({}, now).message, /^Enter a 10-digit NDC/);
  assert.match(ndcGtinConvert({ value: '12345-0678-90' }, now).message, /^Enter the 10-digit NDC as printed on the label/);
  assert.match(ndcGtinConvert({ value: '123456789' }, now).message, /9 digits were entered/);
  assert.match(ndcGtinConvert({ value: '12345678AB' }, now).message, /^Enter digits only/);
  assert.match(ndcGtinConvert({ value: '1234567890', indicator: 'indicator-9' }, now).message, /^Choose an indicator digit from 1 to 8/);
});
