// spec-v576: the Ablett tetanus severity classification.
//
// The load-bearing tests are that grade 4 is grade 3 plus a boolean rather than a selectable picture, and
// that the tile accepts no vital signs at all.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ablettTetanus, ABLETT_GRADES, GRADE_4, AUTONOMIC_PROMOTES_FROM } from '../../lib/ablett-tetanus-v576.js';

const at = (picture, autonomic = 'no') =>
  ablettTetanus({ severityPicture: String(picture), autonomicInstability: autonomic });

test('only three severity pictures are selectable', () => {
  assert.deepEqual(ABLETT_GRADES.map((g) => g.grade), [1, 2, 3]);
  assert.equal(GRADE_4.grade, 4);
  assert.equal(AUTONOMIC_PROMOTES_FROM, 3);
});

test('grade 4 cannot be selected directly', () => {
  const r = ablettTetanus({ severityPicture: '4', autonomicInstability: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /arises only from grade 3 plus autonomic instability/);
});

// THE structure.
test('autonomic instability promotes grade 3 to grade 4', () => {
  const three = at(3, 'no');
  assert.equal(three.grade, 3);
  const four = at(3, 'yes');
  assert.equal(four.grade, 4);
  assert.equal(four.promotedToGrade4, true);
  assert.match(four.gradeLabel, /very severe/);
});

test('autonomic instability does NOT promote grades 1 or 2', () => {
  for (const picture of [1, 2]) {
    const r = at(picture, 'yes');
    assert.equal(r.grade, picture, `grade ${picture} must not become 4`);
    assert.equal(r.promotedToGrade4, false);
    assert.equal(r.autonomicAtLowGrade, true);
    assert.match(r.bandText, /does not promote a lower grade/);
  }
});

test('the result explains that grade 4 is grade 3 plus a modifier', () => {
  assert.match(at(1).bandText, /not a separate clinical picture/);
  assert.match(at(1).bandText, /three severity levels and one boolean/);
});

test('the result notes that series report grades 3 and 4 together', () => {
  assert.match(at(3, 'yes').bandText, /grades 3 and 4 together as one stratum/);
});

// No vital signs.
test('the classification accepts no vital-sign inputs at all', () => {
  // Passing vital signs must not change anything: they are not part of the contract.
  const bare = at(2);
  const withVitals = ablettTetanus({
    severityPicture: '2', autonomicInstability: 'no',
    respiratoryRate: '35', pulse: '130',
  });
  assert.equal(withVitals.grade, bare.grade);
  assert.equal(withVitals.gradeLabel, bare.gradeLabel);
});

test('the result explains that the figures are illustrative, not thresholds', () => {
  const r = at(2);
  assert.match(r.bandText, /illustrate each picture rather than acting as decision thresholds/);
  assert.match(r.bandText, /not monotone across the rows/);
  assert.match(r.bandText, /respiratory rate of 35 and a pulse of 130 satisfies neither row cleanly/);
});

// Descriptor, not score.
test('no points or total are emitted, and there is no grade 0', () => {
  const r = at(2);
  assert.equal(r.total, undefined);
  assert.equal(r.points, undefined);
  assert.match(r.bandText, /no points, no sum, and no grade 0/);
  assert.ok(!ABLETT_GRADES.some((g) => g.grade === 0));
});

test('only grade 1 lacks a numeric criterion', () => {
  assert.equal(ABLETT_GRADES.find((g) => g.grade === 1).hasNumericCriteria, false);
  assert.equal(ABLETT_GRADES.find((g) => g.grade === 2).hasNumericCriteria, true);
  assert.equal(ABLETT_GRADES.find((g) => g.grade === 3).hasNumericCriteria, true);
});

// Wording provenance.
test('the wording variance between reproductions is disclosed', () => {
  assert.match(at(1).bandText, /transcription variants/);
});

// Input handling.
test('both inputs are required', () => {
  assert.equal(ablettTetanus({}).valid, false);
  assert.equal(ablettTetanus({ severityPicture: '2' }).valid, false);
});

test('the missing-grade message explains why grade 4 is absent from the choices', () => {
  const r = ablettTetanus({ autonomicInstability: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Grade 4 is not chosen directly/);
});

test('the scope note separates this from prophylaxis and refuses to indicate treatment', () => {
  const r = at(3, 'yes');
  assert.match(r.note, /prophylaxis decision tree/);
  assert.match(r.note, /does not diagnose tetanus/);
  assert.match(r.note, /does not indicate tetanus immune globulin/);
});
