// spec-v503: Simpson grade of meningioma resection completeness (grades I-V).
// Worked-example tests: each grade, the I/II/III dural-attachment distinction, alias input, invalid-grade guard.
// Grades transcribed from Simpson 1957 (J Neurol Neurosurg Psychiatry) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simpsonMeningioma } from '../../lib/simpson-meningioma-v503.js';

test('grade II: complete removal with coagulation of the dural attachment (the META example)', () => {
  const r = simpsonMeningioma({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /coagulation rather than excision of the dural attachment/);
});

test('grade I: complete removal with excision of the dura and bone', () => {
  assert.match(simpsonMeningioma({ grade: 'I' }).band, /excision of the dural attachment and any abnormal bone/);
});

test('grades I, II, and III all describe macroscopically complete removal', () => {
  for (const g of ['I', 'II', 'III']) {
    assert.match(simpsonMeningioma({ grade: g }).band, /macroscopically complete removal/);
  }
});

test('grade IV: partial removal, tumor left in situ', () => {
  assert.match(simpsonMeningioma({ grade: 'IV' }).band, /partial \(subtotal\) removal, leaving tumor in situ/);
});

test('grade V: simple decompression', () => {
  const r = simpsonMeningioma({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /simple decompression/);
});

test('lowercase and numeric aliases map to the canonical grades', () => {
  assert.equal(simpsonMeningioma({ grade: 'iv' }).grade, 'IV');
  assert.equal(simpsonMeningioma({ grade: 1 }).grade, 'I');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(simpsonMeningioma({}).valid, false);
  assert.equal(simpsonMeningioma({ grade: '0' }).valid, false);
  assert.equal(simpsonMeningioma({ grade: 'VI' }).valid, false);
});
