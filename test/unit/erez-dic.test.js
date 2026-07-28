// spec-v559: the Erez pregnancy-specific DIC score.
//
// The load-bearing test is the non-monotonic platelet row: it is the published table, and every instinct
// says to straighten it. The others pin the boundary convention and the reachability of the cutoff.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  erezDic, PLATELET_ROWS, PT_DIFFERENCE_ROWS, FIBRINOGEN_ROWS,
  EREZ_MAX, EREZ_CUTOFF, MAX_WITHOUT_A_25_POINT_FINDING,
} from '../../lib/erez-dic-v559.js';

const at = (platelets, ptDifference, fibrinogen) => erezDic({
  platelets: String(platelets), ptDifference: String(ptDifference), fibrinogen: String(fibrinogen),
});
const plateletPoints = (v) => at(v, 0, 5).components.platelets.points;
const ptPoints = (v) => at(200, v, 5).components.ptDifference.points;
const fibPoints = (v) => at(200, 0, v).components.fibrinogen.points;

test('the cutoff and maximum are the published ones', () => {
  assert.equal(EREZ_MAX, 52);
  assert.equal(EREZ_CUTOFF, 26);
});

// THE non-monotonic row.
test('the platelet row is non-monotonic: below 50 scores fewer points than 50 to 100', () => {
  assert.equal(plateletPoints(30), 1);
  assert.equal(plateletPoints(75), 2);
  assert.ok(plateletPoints(30) < plateletPoints(75),
    'the published table gives the most severe thrombocytopenia fewer points');
});

test('the full platelet ladder matches the published table', () => {
  assert.equal(plateletPoints(10), 1);
  assert.equal(plateletPoints(49.9), 1);
  assert.equal(plateletPoints(50), 2);
  assert.equal(plateletPoints(100), 2);
  assert.equal(plateletPoints(101), 1);
  assert.equal(plateletPoints(185), 1);
  assert.equal(plateletPoints(200), 0);
});

test('the platelet points are not sorted, which is the point', () => {
  const points = PLATELET_ROWS.map((r) => r.points);
  assert.deepEqual(points, [1, 2, 1, 0]);
  const sorted = [...points].sort((a, b) => b - a);
  assert.notDeepEqual(points, sorted);
});

test('the result states that the row is reproduced rather than corrected', () => {
  assert.match(at(30, 0, 5).bandText, /reproduced here rather than corrected/);
});

// The other two ladders are monotonic and match.
test('the prothrombin time ladder matches the published table', () => {
  assert.deepEqual(PT_DIFFERENCE_ROWS.map((r) => r.points), [0, 5, 12, 25]);
  assert.equal(ptPoints(0.4), 0);
  assert.equal(ptPoints(0.5), 5);
  assert.equal(ptPoints(1.0), 5);
  assert.equal(ptPoints(1.2), 12);
  assert.equal(ptPoints(1.5), 12);
  assert.equal(ptPoints(2.0), 25);
});

test('the fibrinogen ladder matches the published table', () => {
  assert.deepEqual(FIBRINOGEN_ROWS.map((r) => r.points), [25, 6, 1, 0]);
  assert.equal(fibPoints(2.5), 25);
  assert.equal(fibPoints(3.0), 6);
  assert.equal(fibPoints(4.0), 6);
  assert.equal(fibPoints(4.2), 1);
  assert.equal(fibPoints(4.5), 1);
  assert.equal(fibPoints(5.0), 0);
});

// Reachability of the cutoff.
test('the cutoff cannot be reached without one of the two 25-point findings', () => {
  // Worst case with neither: platelets 2, PT mid 12, fibrinogen mid 6.
  const best = at(75, 1.2, 3.5);
  assert.equal(best.total, MAX_WITHOUT_A_25_POINT_FINDING);
  assert.ok(best.total < EREZ_CUTOFF);
  assert.equal(best.meetsDic, false);
  assert.equal(best.hasHighPointFinding, false);
});

test('either 25-point finding alone can carry the score over the cutoff', () => {
  const lowFibrinogen = at(75, 1.2, 2.0);
  assert.equal(lowFibrinogen.total, 2 + 12 + 25);
  assert.equal(lowFibrinogen.meetsDic, true);

  const longPt = at(75, 2.0, 3.5);
  assert.equal(longPt.total, 2 + 25 + 6);
  assert.equal(longPt.meetsDic, true);
});

test('the maximum is 52', () => {
  assert.equal(at(75, 2.0, 2.0).total, EREZ_MAX);
});

test('the result explains that the cutoff needs a 25-point finding', () => {
  assert.match(at(200, 0, 5).bandText, /essentially unreachable without one of the two 25-point findings/);
});

test('a score below the cutoff says it does not exclude DIC', () => {
  const r = at(200, 0, 5);
  assert.equal(r.total, 0);
  assert.equal(r.meetsDic, false);
  assert.match(r.bandText, /does NOT exclude DIC/);
});

// The prothrombin time confusion.
test('the prothrombin time field is labeled a difference in seconds in the result', () => {
  assert.match(at(200, 0.2, 5).bandText, /DIFFERENCE IN SECONDS/);
  assert.match(at(200, 0.2, 5).bandText, /not a ratio and not an INR|not a ratio/i);
});

test('a missing prothrombin time is refused with the difference explained', () => {
  const r = erezDic({ platelets: '150', fibrinogen: '4' });
  assert.equal(r.valid, false);
  assert.match(r.message, /DIFFERENCE in seconds/);
  assert.match(r.message, /not an INR/);
});

// Input handling.
test('missing or out-of-range values are refused', () => {
  assert.equal(erezDic({}).valid, false);
  assert.equal(at(-1, 0, 4).valid, false);
  assert.equal(at(150, -1, 4).valid, false);
  assert.equal(at(150, 0, 100).valid, false);
});

test('the scope note names the causes it does not identify', () => {
  const r = at(75, 2.0, 2.0);
  assert.match(r.note, /amniotic fluid embolism/);
  assert.match(r.note, /does not indicate delivery/);
  assert.match(r.note, /26 rather than 5/);
});
