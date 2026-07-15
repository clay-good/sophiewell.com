// spec-v313: acute cholecystitis diagnosis (Tokyo Guidelines TG18/TG13 diagnostic
// criteria). Worked-example tests: nothing selected -> not met; A alone / B alone ->
// not met; A + B -> suspected; A + B + C -> definite; the worked example
// (Murphy + fever -> suspected); and the strict-boolean contract. Criteria
// transcribed from Yokoe 2018 Table 2 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cholecystitisDiagnosis } from '../../lib/cholecystitis-dx-v313.js';

test('no items selected does not meet criteria', () => {
  const r = cholecystitisDiagnosis({});
  assert.equal(r.category, 'not met');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Does not meet TG18 criteria/);
});

test('A alone or B alone does not meet criteria', () => {
  assert.equal(cholecystitisDiagnosis({ murphy: true }).category, 'not met');
  assert.equal(cholecystitisDiagnosis({ fever: true }).category, 'not met');
});

test('one item in A plus one in B is suspected', () => {
  assert.equal(cholecystitisDiagnosis({ murphy: true, fever: true }).category, 'suspected');
  assert.equal(cholecystitisDiagnosis({ ruq: true, elevatedWbc: true }).category, 'suspected');
  const r = cholecystitisDiagnosis({ murphy: true, elevatedCrp: true });
  assert.equal(r.suspected, true);
  assert.equal(r.abnormal, true);
});

test('imaging (C) without A + B is not met', () => {
  assert.equal(cholecystitisDiagnosis({ imaging: true }).category, 'not met');
  assert.equal(cholecystitisDiagnosis({ murphy: true, imaging: true }).category, 'not met');
});

test('A + B + a characteristic imaging finding is definite', () => {
  const r = cholecystitisDiagnosis({ murphy: true, fever: true, imaging: true });
  assert.equal(r.category, 'definite');
  assert.equal(r.definite, true);
  assert.equal(r.hasA && r.hasB && r.hasC, true);
});

test('non-true values do not fire an item', () => {
  const r = cholecystitisDiagnosis({ murphy: 'true', fever: 1, imaging: 'yes' });
  assert.equal(r.category, 'not met');
});

test('the worked example (Murphy + fever) is suspected', () => {
  const r = cholecystitisDiagnosis({ murphy: true, fever: true });
  assert.equal(r.category, 'suspected');
  assert.match(r.band, /Suspected acute cholecystitis/);
});
