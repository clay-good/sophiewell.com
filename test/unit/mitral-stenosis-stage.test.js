import test from 'node:test';
import assert from 'node:assert/strict';
import { mitralStenosisStage as ms } from '../../lib/mitral-stenosis-stage-v845.js';

test('ms stage: the four stages', () => {
  assert.equal(ms({ anatomy: 'doming', valveArea: 3.0 }).stage, 'A');
  assert.equal(ms({ anatomy: 'fusion', valveArea: 1.9, pressureHalfTime: 120 }).stage, 'B');
  assert.equal(ms({ valveArea: 1.2 }).stage, 'C');
  assert.equal(ms({ valveArea: 1.2, symptoms: true }).stage, 'D');
});

test('ms stage: severe is met by the area OR the half-time', () => {
  assert.equal(ms({ valveArea: 1.5 }).severe, true);
  assert.equal(ms({ pressureHalfTime: 150 }).severe, true);
  assert.equal(ms({ valveArea: 1.6, pressureHalfTime: 140, anatomy: 'fusion' }).severe, false);
  // Very severe sits inside the severe range.
  const vs = ms({ valveArea: 0.9 });
  assert.equal(vs.verySevere, true);
  assert.equal(vs.stage, 'C');
  assert.ok(vs.verySevereNote.includes('very severe'));
  assert.equal(ms({ pressureHalfTime: 230 }).verySevere, true);
  assert.equal(ms({ valveArea: 1.3 }).verySevereNote, null);
});

test('ms stage: the mean gradient is recorded but never stages', () => {
  // The error the tile exists to prevent.
  const r = ms({ valveArea: 1.8, pressureHalfTime: 130, anatomy: 'fusion', meanGradient: 12 });
  assert.equal(r.stage, 'B');
  assert.ok(r.gradientNote.includes('does not set the stage'));
  assert.equal(ms({ valveArea: 1.8, anatomy: 'fusion' }).gradientNote, null);
});

test('ms stage: heart rate is named as the reason a gradient misleads', () => {
  const fast = ms({ valveArea: 1.8, anatomy: 'fusion', meanGradient: 12, heartRate: 130 });
  assert.ok(fast.heartRateNote.includes('overstatement'));
  const slow = ms({ valveArea: 1.2, meanGradient: 4, heartRate: 48 });
  assert.ok(slow.heartRateNote.includes('does not rule out severe'));
  assert.equal(ms({ valveArea: 1.2, meanGradient: 8, heartRate: 75 }).heartRateNote, null);
  // No gradient entered, no heart-rate caveat to make.
  assert.equal(ms({ valveArea: 1.2, heartRate: 130 }).heartRateNote, null);
});

test('ms stage: a disagreement between area and half-time is reported, not hidden', () => {
  const r = ms({ valveArea: 1.8, pressureHalfTime: 180 });
  assert.equal(r.stage, 'C');
  assert.ok(r.disagreeNote.includes('disagree about severity'));
  assert.equal(ms({ valveArea: 1.2, pressureHalfTime: 200 }).disagreeNote, null);
});

test('ms stage: the half-time limits are stated whenever a half-time is used', () => {
  assert.ok(ms({ pressureHalfTime: 160 }).halfTimeLimitsNote.includes('valvuloplasty'));
  assert.equal(ms({ valveArea: 1.2 }).halfTimeLimitsNote, null);
});

test('ms stage: A and B need the anatomy, and the tile says so', () => {
  const r = ms({ valveArea: 2.2 });
  assert.equal(r.stage, null);
  assert.ok(r.pending.includes('commissural fusion'));
  const anatomyOnly = ms({ anatomy: 'fusion' });
  assert.equal(anatomyOnly.stage, 'B');
  assert.ok(anatomyOnly.pending.includes('rule out severe'));
});

test('ms stage: guards', () => {
  assert.equal(ms({}).valid, false);
  assert.equal(ms().valid, false);
  assert.equal(ms({ valveArea: 20 }).valid, false);
  assert.equal(ms({ pressureHalfTime: 9000 }).valid, false);
  assert.equal(ms({ valveArea: 1.2, meanGradient: 300 }).valid, false);
  assert.equal(ms({ valveArea: 1.2, heartRate: 500 }).valid, false);
  assert.doesNotMatch(JSON.stringify(ms({ valveArea: 1.2, symptoms: true })), /NaN|Infinity/);
});

// spec-v1091: severe is met by the area OR the half-time, so a reading taken
// from one of them is a floor, and "no severe obstruction" is a claim about a
// measurement the tile may not have. The same patient reads stage C with both
// numbers and stage B with only the area; the second reading now says which
// measurement is missing and which way it can move.
test('spec-v1091: a stage read from one of the two measurements says so', () => {
  const both = ms({ valveArea: 1.8, pressureHalfTime: 160, anatomy: 'fusion' });
  assert.equal(both.stage, 'C', 'the half-time alone reaches severe');
  assert.equal(both.footing, null, 'nothing is missing, so there is nothing to disclose');

  const areaOnly = ms({ valveArea: 1.8, anatomy: 'fusion' });
  assert.equal(areaOnly.stage, 'B', 'the stage itself is unchanged; only the footing is new');
  assert.match(areaOnly.footing, /1 of 2 measurements/);
  assert.match(areaOnly.footing, /pressure half-time was not entered/);
  assert.match(areaOnly.footing, /can only raise this reading, never lower it/);

  const halfTimeOnly = ms({ pressureHalfTime: 120, anatomy: 'fusion' });
  assert.match(halfTimeOnly.footing, /valve area was not entered/);

  // A severe reading is already the floor, so it discloses nothing.
  assert.equal(ms({ valveArea: 1.2 }).footing, null);
  assert.equal(ms({ pressureHalfTime: 230 }).footing, null);
});
