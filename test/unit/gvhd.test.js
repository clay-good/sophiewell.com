// spec-v309: acute GVHD grade (modified Glucksberg). Worked-example tests: the
// no-GVHD case, each grade boundary (skin 1-2 = I; skin 3 or organ stage 1 = II;
// liver/GI stage 2-3 = III; any stage 4 = IV), the highest-severity precedence, the
// severe (III-IV) flag, and the out-of-range guard. Criteria cross-verified against
// Przepiorka 1995 (modified Glucksberg) and StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gvhdGrade } from '../../lib/gvhd-v309.js';

// spec-v1111: all three organs staged, with the ones under test overridden.
const staged = (o = {}) => ({ skinStage: '0', liverStage: '0', giStage: '0', ...o });

test('all organ stages 0 is no acute GVHD (grade 0)', () => {
  const r = gvhdGrade(staged());
  assert.equal(r.grade, 0);
  assert.equal(r.hasGvhd, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /No acute GVHD/);
});

test('skin stage 1-2 with no liver/GI is grade I', () => {
  assert.equal(gvhdGrade({ skinStage: 1 }).gradeRoman, 'I');
  assert.equal(gvhdGrade({ skinStage: 2 }).gradeRoman, 'I');
  assert.equal(gvhdGrade({ skinStage: 2 }).severe, false);
});

test('skin stage 3 or a stage-1 liver/GI is grade II', () => {
  assert.equal(gvhdGrade({ skinStage: 3 }).gradeRoman, 'II');
  assert.equal(gvhdGrade({ liverStage: 1 }).gradeRoman, 'II');
  assert.equal(gvhdGrade({ giStage: 1 }).gradeRoman, 'II');
});

test('liver or GI stage 2-3 is grade III (severe)', () => {
  const r = gvhdGrade({ liverStage: 2 });
  assert.equal(r.gradeRoman, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.equal(gvhdGrade({ giStage: 3 }).gradeRoman, 'III');
});

test('any organ at stage 4 is grade IV (severe)', () => {
  assert.equal(gvhdGrade({ skinStage: 4 }).gradeRoman, 'IV');
  assert.equal(gvhdGrade({ liverStage: 4 }).gradeRoman, 'IV');
  assert.equal(gvhdGrade({ giStage: 4 }).gradeRoman, 'IV');
});

test('the highest-severity organ drives the overall grade', () => {
  // skin 2 (would be I) but GI 3 -> grade III.
  assert.equal(gvhdGrade({ skinStage: 2, giStage: 3 }).gradeRoman, 'III');
  // skin 3 (II) but liver 4 -> grade IV.
  assert.equal(gvhdGrade({ skinStage: 3, liverStage: 4 }).gradeRoman, 'IV');
});

test('an out-of-range organ stage throws RangeError', () => {
  assert.throws(() => gvhdGrade({ skinStage: 5 }), RangeError);
  assert.throws(() => gvhdGrade({ liverStage: -1 }), RangeError);
  assert.throws(() => gvhdGrade({ giStage: '2.5' }), RangeError);
});

test('the worked example (liver stage 2) is grade III severe', () => {
  const r = gvhdGrade({ liverStage: 2 });
  assert.equal(r.gradeRoman, 'III');
  assert.equal(r.severe, true);
  assert.match(r.band, /liver stage 2/);
});


// --- spec-v1111: an unstaged organ was an organ assessed and uninvolved ---

test('spec-v1111: an unstaged patient is not "no acute GVHD"', () => {
  const r = gvhdGrade({});
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.unstaged.length, 3);
  assert.equal(r.floorOnly, true);
  assert.doesNotMatch(r.band, /No acute GVHD/);
  assert.match(r.band, /not yet gradeable/);
  assert.match(r.band, /can only raise the grade/);
});

test('spec-v1111: grade III-IV rules in, and still does not invent the other stages', () => {
  // Rule 13 for the verdict; rule 11 for the line under it.
  const r = gvhdGrade({ skinStage: '4' });
  assert.equal(r.grade, 4);
  assert.equal(r.severe, true);
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /skin stage 4, liver not staged, GI not staged/);
  assert.doesNotMatch(r.band, /liver stage 0/);
});
