// spec-v4 §5 utility 86: Type of Bill decoder.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { decodeTob } from '../../lib/tob.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const table = JSON.parse(await readFile(join(ROOT, 'data', 'tob-codes', 'tob.json'), 'utf8'));

test('decodeTob: rejects non-numeric input', () => {
  assert.equal(decodeTob('abc', table).ok, false);
  assert.equal(decodeTob('', table).ok, false);
  assert.equal(decodeTob('12', table).ok, false);
  assert.equal(decodeTob('12345', table).ok, false);
});

test('decodeTob: 0111 -> Hospital / Inpatient (Part A) / Admit Through Discharge', () => {
  const r = decodeTob('0111', table);
  assert.equal(r.ok, true);
  assert.equal(r.input, '0111');
  assert.equal(r.facility.label, 'Hospital');
  assert.equal(r.classification.label, 'Inpatient (incl. Medicare Part A)');
  assert.equal(r.frequency.label, 'Admit Through Discharge');
});

test('decodeTob: 3-digit input is left-padded with leading 0', () => {
  const r = decodeTob('111', table);
  assert.equal(r.ok, true);
  assert.equal(r.input, '0111');
  assert.equal(r.facility.digit, '1');
});

test('decodeTob: 0131 -> Hospital / Outpatient / Admit Through Discharge', () => {
  const r = decodeTob('0131', table);
  assert.equal(r.facility.label, 'Hospital');
  assert.equal(r.classification.label, 'Outpatient');
  assert.equal(r.frequency.label, 'Admit Through Discharge');
});

test('decodeTob: 0218 -> SNF / Inpatient (Part A) / Void', () => {
  const r = decodeTob('0218', table);
  assert.equal(r.facility.label, 'Skilled Nursing');
  assert.equal(r.classification.label, 'Inpatient (incl. Medicare Part A)');
  assert.equal(r.frequency.label, 'Void / Cancel of Prior Claim');
});

test('decodeTob: unknown digit returns null for that slot', () => {
  // facilityType only includes 1,2,3,4,7,8 in the seed; digit "9" is unknown.
  const r = decodeTob('0911', table);
  assert.equal(r.ok, true);
  assert.equal(r.facility, null);
  assert.equal(r.classification.label, 'Inpatient (incl. Medicare Part A)');
});
