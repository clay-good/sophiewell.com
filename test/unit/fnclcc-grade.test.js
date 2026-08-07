// spec-v651: FNCLCC histologic grade for adult soft-tissue sarcoma.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fnclccGrade } from '../../lib/fnclcc-grade-v651.js';

test('range: minimum 2 (diff 1, 0 mitoses, no necrosis) and maximum 8 (diff 3, >=20 mitoses, >=50% necrosis)', () => {
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '0', necrosis: '0' }).total, 2);
  assert.equal(fnclccGrade({ differentiation: '3', mitoticCount: '40', necrosis: '2' }).total, 8);
});

test('mitotic count binning: 0-9 = 1, 10-19 = 2, >=20 = 3', () => {
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '9', necrosis: '0' }).mitoticScore, 1);
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '10', necrosis: '0' }).mitoticScore, 2);
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '19', necrosis: '0' }).mitoticScore, 2);
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '20', necrosis: '0' }).mitoticScore, 3);
});

test('grade mapping: 2-3 = G1, 4-5 = G2, 6-8 = G3', () => {
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '0', necrosis: '0' }).grade, 1); // 2
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '0', necrosis: '0' }).grade, 1); // 3
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '10', necrosis: '1' }).grade, 2); // 4
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '15', necrosis: '1' }).grade, 2); // 5
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '20', necrosis: '1' }).grade, 3); // 6
  assert.equal(fnclccGrade({ differentiation: '3', mitoticCount: '40', necrosis: '2' }).grade, 3); // 8
});

test('grade boundaries 3/4 and 5/6 are exact', () => {
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '0', necrosis: '1' }).grade, 1); // 3 -> G1
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '10', necrosis: '1' }).grade, 2); // 4 -> G2
  assert.equal(fnclccGrade({ differentiation: '3', mitoticCount: '10', necrosis: '0' }).grade, 2); // 5 -> G2
  assert.equal(fnclccGrade({ differentiation: '1', mitoticCount: '20', necrosis: '2' }).grade, 3); // 6 -> G3
});

test('META example: differentiation 2 + mitoses 15 (score 2) + necrosis 1 = 5, grade 2 intermediate', () => {
  const r = fnclccGrade({ differentiation: '2', mitoticCount: '15', necrosis: '1' });
  assert.equal(r.total, 5);
  assert.equal(r.grade, 2);
  assert.equal(r.gradeLabel, 'intermediate grade');
  assert.match(r.bandLabel, /FNCLCC total 5 of 8/);
  assert.match(r.bandLabel, /grade 2/);
});

test('all three components required; differentiation 1-3, necrosis 0-2, mitoses whole non-negative', () => {
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '5' }).valid, false);
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '5' }).code, 'MISSING_INPUT');
  assert.equal(fnclccGrade({ differentiation: '4', mitoticCount: '5', necrosis: '1' }).valid, false);
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '5', necrosis: '3' }).valid, false);
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '-1', necrosis: '1' }).valid, false);
  assert.equal(fnclccGrade({ differentiation: '2', mitoticCount: '5.5', necrosis: '1' }).valid, false);
});
