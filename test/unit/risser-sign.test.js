// spec-v383: Risser sign (US grading, 0-5) skeletal-maturity staging. Worked-example tests: each grade
// and its ossification description, the maturity flag at grade 5, the growth-potential field, numeric
// input, and the invalid-grade guard. As a maturity indicator it never sets abnormal. Grades transcribed
// from Risser 1958, cross-verified against radiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { risserSign } from '../../lib/risser-sign-v383.js';

test('grade 5: ossified and fused, skeletally mature (the META example)', () => {
  const r = risserSign({ grade: '5' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '5');
  assert.equal(r.skeletallyMature, true);
  assert.equal(r.abnormal, false);
  assert.equal(r.growthPotentialRemaining, 'none');
  assert.match(r.band, /complete ossification and fusion/);
});

test('grade 0: no ossification, substantial growth remaining, not mature', () => {
  const r = risserSign({ grade: '0' });
  assert.equal(r.skeletallyMature, false);
  assert.equal(r.growthPotentialRemaining, 'substantial');
  assert.match(r.band, /no ossification/);
});

test('grade 4: fully ossified but not fused, minimal growth', () => {
  const r = risserSign({ grade: '4' });
  assert.equal(r.skeletallyMature, false);
  assert.equal(r.growthPotentialRemaining, 'minimal');
  assert.match(r.band, /not yet fused/);
});

test('a maturity grade is never flagged abnormal', () => {
  for (const g of ['0', '1', '2', '3', '4', '5']) {
    assert.equal(risserSign({ grade: g }).abnormal, false);
  }
});

test('numeric input maps to the grades', () => {
  assert.equal(risserSign({ grade: 2 }).grade, '2');
  assert.equal(risserSign({ grade: 5 }).grade, '5');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(risserSign({}).valid, false);
  assert.equal(risserSign({ grade: '6' }).valid, false);
  assert.equal(risserSign({ grade: 'I' }).valid, false);
});
