// spec-v649: Nottingham histologic grade for breast cancer (Elston-Ellis modified SBR).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nottinghamGrade } from '../../lib/nottingham-grade-v649.js';

test('range: minimum 3 (all 1) and maximum 9 (all 3)', () => {
  assert.equal(nottinghamGrade({ tubules: '1', pleomorphism: '1', mitoses: '1' }).total, 3);
  assert.equal(nottinghamGrade({ tubules: '3', pleomorphism: '3', mitoses: '3' }).total, 9);
});

test('grade mapping: 3-5 = G1, 6-7 = G2, 8-9 = G3', () => {
  assert.equal(nottinghamGrade({ tubules: '1', pleomorphism: '1', mitoses: '1' }).grade, 1); // 3
  assert.equal(nottinghamGrade({ tubules: '1', pleomorphism: '2', mitoses: '2' }).grade, 1); // 5
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '2', mitoses: '2' }).grade, 2); // 6
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '2', mitoses: '3' }).grade, 2); // 7
  assert.equal(nottinghamGrade({ tubules: '3', pleomorphism: '3', mitoses: '2' }).grade, 3); // 8
  assert.equal(nottinghamGrade({ tubules: '3', pleomorphism: '3', mitoses: '3' }).grade, 3); // 9
});

test('grade boundaries 5/6 and 7/8 are exact', () => {
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '2', mitoses: '1' }).grade, 1); // 5 -> G1
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '1', mitoses: '3' }).grade, 2); // 6 -> G2
  assert.equal(nottinghamGrade({ tubules: '3', pleomorphism: '2', mitoses: '2' }).grade, 2); // 7 -> G2
  assert.equal(nottinghamGrade({ tubules: '3', pleomorphism: '3', mitoses: '2' }).grade, 3); // 8 -> G3
});

test('META example: 2 + 2 + 3 = 7, grade 2 moderately differentiated', () => {
  const r = nottinghamGrade({ tubules: '2', pleomorphism: '2', mitoses: '3' });
  assert.equal(r.total, 7);
  assert.equal(r.grade, 2);
  assert.equal(r.differentiation, 'moderately differentiated');
  assert.match(r.bandLabel, /Nottingham 7 of 9/);
  assert.match(r.bandLabel, /grade 2/);
});

test('all three components are required and 1-3 only', () => {
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '2' }).valid, false);
  assert.equal(nottinghamGrade({ tubules: '2', pleomorphism: '2' }).code, 'MISSING_INPUT');
  assert.equal(nottinghamGrade({ tubules: '4', pleomorphism: '2', mitoses: '2' }).valid, false);
  assert.equal(nottinghamGrade({ tubules: '0', pleomorphism: '2', mitoses: '2' }).valid, false);
});
