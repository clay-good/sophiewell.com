// spec-v305: ASTCT cytokine release syndrome (CRS) grading. Worked-example tests:
// the does-not-meet case (no fever/hypotension/hypoxia), fever-only grade 1, each
// hypotension/hypoxia level, the more-severe-axis rule, the severe (>=3) flag, and
// the boolean coercions. Table cross-verified against Lee 2019 (ASTCT) and the
// NCBI/PDQ reproduction (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crsGrade } from '../../lib/crs-v305.js';

test('no fever, hypotension, or hypoxia does not meet CRS criteria (grade 0)', () => {
  const r = crsGrade({});
  assert.equal(r.grade, 0);
  assert.equal(r.meetsCriteria, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Does not meet CRS criteria/);
});

test('fever alone is grade 1', () => {
  const r = crsGrade({ fever: true });
  assert.equal(r.grade, 1);
  assert.equal(r.meetsCriteria, true);
  assert.equal(r.severe, false);
  assert.match(r.band, /grade 1 of 4/);
});

test('each hypotension level maps to its grade', () => {
  assert.equal(crsGrade({ fever: true, hypotension: 'novaso' }).grade, 2);
  assert.equal(crsGrade({ fever: true, hypotension: 'onevaso' }).grade, 3);
  assert.equal(crsGrade({ fever: true, hypotension: 'multivaso' }).grade, 4);
});

test('each hypoxia level maps to its grade', () => {
  assert.equal(crsGrade({ fever: true, hypoxia: 'lowflow' }).grade, 2);
  assert.equal(crsGrade({ fever: true, hypoxia: 'highflow' }).grade, 3);
  assert.equal(crsGrade({ fever: true, hypoxia: 'pospressure' }).grade, 4);
});

test('the grade is the more severe of the two axes', () => {
  // hypotension grade 2, hypoxia grade 4 -> grade 4.
  const r = crsGrade({ fever: true, hypotension: 'novaso', hypoxia: 'pospressure' });
  assert.equal(r.grade, 4);
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
});

test('grades >=3 are flagged severe', () => {
  assert.equal(crsGrade({ fever: true, hypotension: 'onevaso' }).severe, true);
  assert.equal(crsGrade({ fever: true, hypotension: 'novaso' }).severe, false);
  assert.match(crsGrade({ fever: true, hypoxia: 'highflow' }).band, /Severe CRS/);
});

test('boolean coercion accepts checkbox-style fever values', () => {
  assert.equal(crsGrade({ fever: '1', hypotension: 'onevaso' }).grade, 3);
  // hypotension present without fever still grades by the organ axis.
  assert.equal(crsGrade({ hypotension: 'multivaso' }).grade, 4);
});

test('the worked example (fever + one vasopressor) is grade 3 severe', () => {
  const r = crsGrade({ fever: true, hypotension: 'onevaso' });
  assert.equal(r.grade, 3);
  assert.equal(r.severe, true);
  assert.match(r.band, /ASTCT CRS grade 3 of 4/);
});
