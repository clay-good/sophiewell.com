// spec-v4 §7 step v4.5: DEA validator tests. >=8 known-valid + >=4 invalid.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDEA } from '../../lib/dea.js';

// Generate a valid DEA from a 2-letter prefix + first 6 digits.
function makeValid(prefix, sixDigits) {
  const d = sixDigits.split('').map(Number);
  const total = (d[0] + d[2] + d[4]) + 2 * (d[1] + d[3] + d[5]);
  return prefix + sixDigits + (total % 10);
}

const VALID_CASES = [
  makeValid('AB', '123456'), // A registrant
  makeValid('BS', '987654'), // B registrant
  makeValid('FA', '111111'),
  makeValid('FA', '999999'),
  makeValid('MS', '246802'), // mid-level practitioner
  makeValid('GG', '500500'),
  makeValid('PJ', '314159'),
  makeValid('XB', '271828'),
  makeValid('RS', '000001'), // boundary: leading zeros
];

for (const v of VALID_CASES) {
  test(`validateDEA: valid - ${v}`, () => {
    const r = validateDEA(v);
    assert.equal(r.ok, true, r.error || 'should be valid');
    assert.equal(r.input, v);
    assert.equal(r.expectedCheckDigit, r.gotCheckDigit);
  });
}

test('validateDEA: rejects too-short input', () => {
  const r = validateDEA('AB12345');
  assert.equal(r.ok, false);
  assert.match(r.error, /2 letters/);
});

test('validateDEA: rejects letters in digit positions', () => {
  const r = validateDEA('ABABCDEFG');
  assert.equal(r.ok, false);
});

test('validateDEA: rejects bad registrant letter', () => {
  // "Z" is outside the canonical A/B/F/G/M/P/R/X set. Use a checksum-correct
  // body so the error is specifically the registrant-letter rejection.
  const body = makeValid('AB', '123456').slice(2); // 7 digits
  const r = validateDEA('Z' + 'B' + body);
  assert.equal(r.ok, false);
  assert.match(r.error, /Registrant letter/);
});

test('validateDEA: detects checksum mismatch (off-by-one)', () => {
  const v = makeValid('AB', '123456'); // valid
  // Flip the check digit by 1.
  const broken = v.slice(0, -1) + ((Number(v.slice(-1)) + 1) % 10);
  const r = validateDEA(broken);
  assert.equal(r.ok, false);
  assert.match(r.error, /Checksum/);
  assert.notEqual(r.expectedCheckDigit, r.gotCheckDigit);
});

test('validateDEA: detects transposition error in middle digits', () => {
  // Transposing two adjacent middle digits typically breaks the checksum
  // because of the 2x weighting on alternating positions.
  const v = makeValid('AB', '123456');
  // Swap d[1] and d[2] (the second and third digits of the 7-digit run).
  const arr = v.split('');
  [arr[3], arr[4]] = [arr[4], arr[3]];
  const r = validateDEA(arr.join(''));
  assert.equal(r.ok, false);
});

test('validateDEA: case-insensitive', () => {
  const v = makeValid('AB', '123456');
  const lower = v.toLowerCase();
  assert.equal(validateDEA(lower).ok, true);
});

test('validateDEA: trims surrounding whitespace', () => {
  const v = makeValid('AB', '123456');
  assert.equal(validateDEA(`  ${v}  `).ok, true);
});

test('validateDEA: empty input is rejected', () => {
  assert.equal(validateDEA('').ok, false);
  assert.equal(validateDEA(null).ok, false);
});
