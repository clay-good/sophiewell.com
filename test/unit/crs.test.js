// spec-v305: ASTCT cytokine release syndrome (CRS) grading. Worked-example tests:
// the does-not-meet case (no fever/hypotension/hypoxia), fever-only grade 1, each
// hypotension/hypoxia level, the more-severe-axis rule, the severe (>=3) flag, and
// the boolean coercions. Table cross-verified against Lee 2019 (ASTCT) and the
// NCBI/PDQ reproduction (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crsGrade } from '../../lib/crs-v305.js';

test('no fever, hypotension, or hypoxia does not meet CRS criteria (grade 0)', () => {
  // spec-v1120: both columns stated. They used to fall through to 'none', so
  // this assertion was reading two unstated observations as two made ones.
  const r = crsGrade({ hypotension: 'none', hypoxia: 'none' });
  assert.equal(r.grade, 0);
  assert.equal(r.meetsCriteria, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Does not meet CRS criteria/);
});

test('spec-v1120: an unstated column is not an absent finding', () => {
  // The grade is the MAX of hypotension and hypoxia, so an unstated one could
  // only ever raise it -- and the tile said "without hypotension or hypoxia"
  // about a patient on CAR-T, where the grade decides tocilizumab and ICU.
  const r = crsGrade({ fever: true });
  assert.equal(r.grade, 1);
  assert.equal(r.floorOnly, true);
  assert.deepEqual(r.unstated, ['the hypotension', 'the hypoxia']);
  assert.match(r.band, /at least grade 1 of 4 on what was stated/);
  assert.doesNotMatch(r.band, /without hypotension or hypoxia/);

  const stated = crsGrade({ fever: true, hypotension: 'none', hypoxia: 'none' });
  assert.equal(stated.floorOnly, false);
  assert.match(stated.band, /without hypotension or hypoxia/);
});

test('spec-v1120: grade 3 rules in with the other column unstated', () => {
  // Rule 13: the max is already 3, and the unstated column cannot lower it.
  const r = crsGrade({ fever: true, hypoxia: 'highflow' });
  assert.equal(r.grade, 3);
  assert.equal(r.floorOnly, false);
  assert.equal(r.severe, true);
  assert.match(r.band, /grade 3 of 4/);
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
