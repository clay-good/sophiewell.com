// spec-v306: ASTCT ICANS neurotoxicity grading. Worked-example tests: the ICE-score
// tiers (10->0, 7-9->1, 3-6->2, 0-2->3), each other domain's grade, the
// most-severe-domain rule, the severe (>=3) flag, the out-of-range ICE guard, and
// the boolean coercion. Table cross-verified against Lee 2019 (ASTCT) and the
// NCBI/PDQ + NHS-Wales reproductions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icansGrade } from '../../lib/icans-v306.js';

test('ICE 10 with no other findings is no ICANS (grade 0)', () => {
  const r = icansGrade({ ice: '10' });
  assert.equal(r.grade, 0);
  assert.equal(r.meetsCriteria, false);
  assert.match(r.band, /No ICANS/);
});

test('the ICE score tiers map to grades', () => {
  assert.equal(icansGrade({ ice: '8' }).grade, 1);
  assert.equal(icansGrade({ ice: '5' }).grade, 2);
  assert.equal(icansGrade({ ice: '1' }).grade, 3);
  assert.equal(icansGrade({ ice: '0' }).grade, 3);
});

test('the consciousness domain grades independently of ICE', () => {
  assert.equal(icansGrade({ loc: 'voice' }).grade, 2);
  assert.equal(icansGrade({ loc: 'tactile' }).grade, 3);
  assert.equal(icansGrade({ loc: 'unarousable' }).grade, 4);
});

test('seizure, motor, and raised-ICP domains grade to their thresholds', () => {
  assert.equal(icansGrade({ seizure: 'g3' }).grade, 3);
  assert.equal(icansGrade({ seizure: 'g4' }).grade, 4);
  assert.equal(icansGrade({ motor: true }).grade, 4);
  assert.equal(icansGrade({ icp: 'focal' }).grade, 3);
  assert.equal(icansGrade({ icp: 'diffuse' }).grade, 4);
});

test('the grade is the most severe of the five domains', () => {
  // ICE 8 (grade 1) + focal edema (grade 3) -> grade 3.
  const r = icansGrade({ ice: '8', icp: 'focal' });
  assert.equal(r.grade, 3);
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  // Unarousable dominates a mild ICE.
  assert.equal(icansGrade({ ice: '9', loc: 'unarousable' }).grade, 4);
});

test('an out-of-range or non-integer ICE score throws RangeError', () => {
  assert.throws(() => icansGrade({ ice: '11' }), RangeError);
  assert.throws(() => icansGrade({ ice: '-1' }), RangeError);
  assert.throws(() => icansGrade({ ice: '4.5' }), RangeError);
});

test('the motor domain accepts checkbox-style values; empty input is grade 0', () => {
  assert.equal(icansGrade({ motor: '1' }).grade, 4);
  assert.equal(icansGrade({}).grade, 0);
});

test('the worked example (ICE 1) is grade 3 severe, ICE-driven', () => {
  const r = icansGrade({ ice: '1' });
  assert.equal(r.grade, 3);
  assert.equal(r.severe, true);
  assert.match(r.band, /ICANS grade 3 of 4/);
  assert.match(r.band, /ICE score/);
});
