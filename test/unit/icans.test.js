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

// spec-v1095: a blank ICE reads as iceG 0 -- the grade for an ICE of TEN.
//
// The band then asserted the measurement it never had: "No ICANS (ICE 10 and no
// consciousness, seizure, motor, or raised-ICP findings)". Printing a specific
// score nobody took is worse than a silent zero, and it is printed for a patient
// under CAR-T neurotoxicity monitoring, where catching the change early is the
// entire purpose of the ICE.
test('spec-v1095: an unentered ICE score does not read as a normal one', () => {
  const blank = icansGrade({});
  assert.equal(blank.incomplete, true);
  assert.doesNotMatch(blank.band, /No ICANS/, 'never claim the absence of ICANS from an ICE nobody took');
  assert.doesNotMatch(blank.band, /ICE 10/, 'and never assert the score itself');
  assert.match(blank.band, /cannot be excluded/);
  assert.match(blank.band, /an ICE of 2 or less is grade 3/, 'say how far it could move');

  // Entered as 10 is a normal exam, and still reads as one.
  const normal = icansGrade({ ice: 10 });
  assert.equal(normal.incomplete, false);
  assert.equal(normal.grade, 0);
  assert.match(normal.band, /No ICANS/);

  // A grade from a domain that WAS assessed stands, with the ICE named as able
  // to raise it.
  const fromLoc = icansGrade({ loc: 'voice' });
  assert.equal(fromLoc.grade, 2);
  assert.match(fromLoc.band, /ICE score was not entered/);
  assert.match(fromLoc.band, /can only raise/);

  // At grade 3 or more the ICE cannot change the management line, so no footing.
  const severe = icansGrade({ motor: true });
  assert.equal(severe.grade, 4);
  assert.doesNotMatch(severe.band, /can only raise/);
});
