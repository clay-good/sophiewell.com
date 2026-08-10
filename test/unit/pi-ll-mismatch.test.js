// spec-v705: PI-LL mismatch (spinopelvic sagittal alignment).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { piLlMismatch } from '../../lib/pi-ll-mismatch-v705.js';

test('worked example: PI 55, LL 30 -> 25 deg (marked, ++)', () => {
  const r = piLlMismatch({ pelvicIncidence: '55', lumbarLordosis: '30' });
  assert.equal(r.valid, true);
  assert.equal(r.mismatch, 25);
  assert.equal(r.modifier, '++');
  assert.equal(r.tier, 'marked');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /PI-LL 25/);
});

test('well aligned: |PI-LL| < 10 -> modifier 0', () => {
  const r = piLlMismatch({ pelvicIncidence: '50', lumbarLordosis: '45' });
  assert.equal(r.mismatch, 5);
  assert.equal(r.modifier, '0');
  assert.equal(r.tier, 'aligned');
  assert.equal(r.abnormal, false);
});

test('modifier bands: <10 = 0, 10-20 = +, >20 = ++', () => {
  assert.equal(piLlMismatch({ pelvicIncidence: '55', lumbarLordosis: '46' }).modifier, '0');  // 9
  assert.equal(piLlMismatch({ pelvicIncidence: '55', lumbarLordosis: '45' }).modifier, '+');  // 10
  assert.equal(piLlMismatch({ pelvicIncidence: '55', lumbarLordosis: '35' }).modifier, '+');  // 20
  assert.equal(piLlMismatch({ pelvicIncidence: '55', lumbarLordosis: '34' }).modifier, '++'); // 21
});

test('mismatch can be negative (LL > PI) and still uses absolute value for the modifier', () => {
  const r = piLlMismatch({ pelvicIncidence: '40', lumbarLordosis: '65' });
  assert.equal(r.mismatch, -25);
  assert.equal(r.modifier, '++');
});

test('inputs are validated', () => {
  assert.equal(piLlMismatch({}).valid, false);
  assert.equal(piLlMismatch({}).code, 'MISSING_INPUT');
  assert.equal(piLlMismatch({ pelvicIncidence: '50' }).field, 'lumbarLordosis');
});
