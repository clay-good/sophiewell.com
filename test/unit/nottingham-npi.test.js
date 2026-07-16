// spec-v330: Nottingham Prognostic Index (NPI) for breast cancer. Worked-example tests: the
// 0.2*size + node + grade formula, each prognostic-group boundary (excellent/good/moderate/
// poor), and the validation guards. Formula + groups transcribed from Haybittle 1982 / Galea
// 1992, cross-verified against reproductions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nottinghamNpi } from '../../lib/nottingham-npi-v330.js';

test('0.2*size + node + grade (the META example: 0.2*2.5 + 2 + 2 = 4.5, moderate)', () => {
  const r = nottinghamNpi({ size: '2.5', nodeStage: '2', grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.npi, 4.5);
  assert.equal(r.group, 'moderate');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderate prognosis/);
});

test('a small node-negative grade-I tumor is the excellent group (<= 2.4)', () => {
  const r = nottinghamNpi({ size: '1', nodeStage: '1', grade: '1' });
  assert.equal(r.npi, 2.2);
  assert.equal(r.group, 'excellent');
  assert.equal(r.abnormal, false);
});

test('the group boundaries: 3.4 is good, just over is moderate; 5.4 is moderate, over is poor', () => {
  // size 2, node 1, grade 2 -> 0.4 + 1 + 2 = 3.4 (good, upper edge).
  assert.equal(nottinghamNpi({ size: '2', nodeStage: '1', grade: '2' }).group, 'good');
  // size 3, node 3, grade 3 -> 0.6 + 3 + 3 = 6.6 (poor).
  const poor = nottinghamNpi({ size: '3', nodeStage: '3', grade: '3' });
  assert.equal(poor.npi, 6.6);
  assert.equal(poor.group, 'poor');
  // size 2, node 2, grade 3 -> 0.4 + 2 + 3 = 5.4 (moderate, upper edge).
  assert.equal(nottinghamNpi({ size: '2', nodeStage: '2', grade: '3' }).group, 'moderate');
});

test('missing size or invalid node/grade is invalid', () => {
  assert.equal(nottinghamNpi({ nodeStage: '2', grade: '2' }).valid, false);
  assert.equal(nottinghamNpi({ size: '2', nodeStage: '4', grade: '2' }).valid, false);
  assert.equal(nottinghamNpi({ size: '2', nodeStage: '2', grade: '0' }).valid, false);
  assert.equal(nottinghamNpi({ size: '-1', nodeStage: '2', grade: '2' }).valid, false);
});
