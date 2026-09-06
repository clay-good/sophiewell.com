// spec-v659: ISGPS grading of delayed gastric emptying.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isgpsDge } from '../../lib/isgps-dge-v659.js';

test('no criterion met = no DGE', () => {
  const r = isgpsDge({});
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.code, 'No DGE');
  assert.equal(isgpsDge({ ngtDays: '3', reinsertionPod: '3', unableSolidsPod: '6' }).grade, 0);
});

test('NGT duration binning: 4-7 = A, 8-14 = B, >14 = C', () => {
  assert.equal(isgpsDge({ ngtDays: '4' }).grade, 1);
  assert.equal(isgpsDge({ ngtDays: '7' }).grade, 1);
  assert.equal(isgpsDge({ ngtDays: '8' }).grade, 2);
  assert.equal(isgpsDge({ ngtDays: '14' }).grade, 2);
  assert.equal(isgpsDge({ ngtDays: '15' }).grade, 3);
});

test('NGT reinsertion binning: after POD 3 = A, after POD 7 = B, after POD 14 = C', () => {
  assert.equal(isgpsDge({ reinsertionPod: '3' }).grade, 0); // "after POD 3" means > 3
  assert.equal(isgpsDge({ reinsertionPod: '4' }).grade, 1);
  assert.equal(isgpsDge({ reinsertionPod: '8' }).grade, 2);
  assert.equal(isgpsDge({ reinsertionPod: '15' }).grade, 3);
});

test('unable-to-tolerate-solids binning: POD 7 = A, POD 14 = B, POD 21 = C', () => {
  assert.equal(isgpsDge({ unableSolidsPod: '6' }).grade, 0);
  assert.equal(isgpsDge({ unableSolidsPod: '7' }).grade, 1);
  assert.equal(isgpsDge({ unableSolidsPod: '14' }).grade, 2);
  assert.equal(isgpsDge({ unableSolidsPod: '21' }).grade, 3);
});

test('most severe grade across criteria wins', () => {
  const r = isgpsDge({ ngtDays: '5', reinsertionPod: '8', unableSolidsPod: '7' }); // A, B, A -> B
  assert.equal(r.grade, 2);
  assert.equal(r.code, 'Grade B');
  const r2 = isgpsDge({ ngtDays: '5', unableSolidsPod: '21' }); // A, C -> C
  assert.equal(r2.grade, 3);
});

test('META example: NGT 10 days = Grade B', () => {
  const r = isgpsDge({ ngtDays: '10' });
  assert.equal(r.grade, 2);
  assert.equal(r.code, 'Grade B');
  assert.match(r.bandLabel, /Grade B/);
});

test('negative or non-numeric entry is rejected', () => {
  assert.equal(isgpsDge({ ngtDays: '-1' }).valid, false);
  assert.equal(isgpsDge({ ngtDays: 'x' }).valid, false);
  assert.equal(isgpsDge({ ngtDays: '-1' }).code, 'OUT_OF_RANGE');
});

// spec-v1095: `num` returns 0 for a blank, and the grade is the MOST SEVERE of
// three time criteria, so a criterion nobody recorded read as a criterion the
// patient passed. With all three blank the tile answered "No DGE - no delayed
// gastric emptying": a postoperative course graded as uneventful because nothing
// about it had been entered yet.
test('spec-v1095: an unrecorded postoperative course is not an uneventful one', () => {
  const blank = isgpsDge({});
  assert.equal(blank.grade, 0);
  assert.equal(blank.unrecordedCriteria, 3);
  assert.doesNotMatch(blank.detail, /no delayed gastric emptying\./, 'do not rule out from nothing');
  assert.match(blank.detail, /not ruled out/);
  assert.match(blank.detail, /None of the three time criteria were entered/);
  assert.match(blank.detail, /can only raise it/);

  // All three recorded as 0 is a course: uneventful, and it says so plainly.
  const uneventful = isgpsDge({ ngtDays: 0, reinsertionPod: 0, unableSolidsPod: 0 });
  assert.equal(uneventful.unrecordedCriteria, 0);
  assert.match(uneventful.detail, /no delayed gastric emptying/);

  // A grade already rests on a criterion that WAS recorded; the rest can only
  // raise it, and the tile names which are still missing.
  const gradeC = isgpsDge({ ngtDays: 15 });
  assert.equal(gradeC.code, 'Grade C');
  assert.match(gradeC.detail, /Not entered: /);
  assert.match(gradeC.detail, /can only raise it/);
});
