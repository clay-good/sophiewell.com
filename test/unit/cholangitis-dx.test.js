// spec-v312: acute cholangitis diagnosis (Tokyo Guidelines TG18/TG13 diagnostic
// criteria). Worked-example tests: nothing selected -> not met; A alone -> not met;
// A + B (or A + C) -> suspected; A + B + C -> definite; the worked example
// (fever + jaundice -> suspected); and the strict-boolean contract. Criteria
// transcribed from Kiriyama 2018 Table 1 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cholangitisDiagnosis } from '../../lib/cholangitis-dx-v312.js';

test('no items selected does not meet criteria', () => {
  const r = cholangitisDiagnosis({});
  assert.equal(r.category, 'not met');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Does not meet TG18 criteria/);
});

test('category A alone does not meet criteria', () => {
  const r = cholangitisDiagnosis({ fever: true });
  assert.equal(r.category, 'not met');
  assert.equal(r.suspected, false);
});

test('A + B or A + C is suspected', () => {
  assert.equal(cholangitisDiagnosis({ fever: true, jaundice: true }).category, 'suspected');
  assert.equal(cholangitisDiagnosis({ inflammation: true, biliaryDilatation: true }).category, 'suspected');
  const r = cholangitisDiagnosis({ fever: true, etiologyImaging: true });
  assert.equal(r.suspected, true);
  assert.equal(r.abnormal, true);
});

test('B + C without A is not met (A is required)', () => {
  assert.equal(cholangitisDiagnosis({ jaundice: true, biliaryDilatation: true }).category, 'not met');
});

test('one item in each of A, B, and C is definite', () => {
  const r = cholangitisDiagnosis({ fever: true, jaundice: true, biliaryDilatation: true });
  assert.equal(r.category, 'definite');
  assert.equal(r.definite, true);
  assert.equal(r.hasA && r.hasB && r.hasC, true);
});

test('non-true values do not fire an item', () => {
  const r = cholangitisDiagnosis({ fever: 'true', jaundice: 1, biliaryDilatation: 'yes' });
  assert.equal(r.category, 'not met');
});

test('the worked example (fever + jaundice) is suspected', () => {
  const r = cholangitisDiagnosis({ fever: true, jaundice: true });
  assert.equal(r.category, 'suspected');
  assert.match(r.band, /Suspected acute cholangitis/);
});
