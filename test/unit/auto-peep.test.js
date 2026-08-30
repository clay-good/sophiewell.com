// spec-v928: auto-PEEP. The tests that matter are that a measured zero is never an absence, and
// that the driving-pressure error is shown rather than described.

import test from 'node:test';
import assert from 'node:assert/strict';
import { autoPeep, AUTO_PEEP_NOTE } from '../../lib/auto-peep-v928.js';

test('auto-peep: both pressures are required', () => {
  assert.equal(autoPeep({}).valid, false);
  assert.match(autoPeep({ setPeep: 5 }).message, /end-expiratory hold/);
});

test('auto-peep: a total below the set PEEP is refused', () => {
  const r = autoPeep({ setPeep: 8, totalPeep: 5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /expiratory effort/);
});

test('auto-peep: the difference is the answer', () => {
  const r = autoPeep({ setPeep: 5, totalPeep: 13 });
  assert.equal(r.autoPeep, 8);
  assert.equal(r.present, true);
  assert.equal(r.abnormal, true);
});

test('auto-peep: a measured zero is reported as no auto-PEEP measured, not as no gas trapping', () => {
  const r = autoPeep({ setPeep: 5, totalPeep: 5 });
  assert.equal(r.present, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not the same as no gas trapping/);
  assert.match(r.zeroNote, /does not exclude gas trapping/);
});

test('auto-peep: the flow sign is named when it is recorded and when it is not', () => {
  assert.match(autoPeep({ setPeep: 5, totalPeep: 5, expiratoryFlowNotReturningToZero: true }).zeroNote,
    /recorded as not returning to zero/);
  assert.match(autoPeep({ setPeep: 5, totalPeep: 5 }).zeroNote, /that is not recorded here/);
});

test('auto-peep: a measured value is a floor, not a ceiling', () => {
  assert.match(autoPeep({ setPeep: 5, totalPeep: 13 }).zeroNote, /a floor, not a ceiling/);
});

test('auto-peep: the driving-pressure error is shown, both ways', () => {
  const r = autoPeep({ setPeep: 5, totalPeep: 13, plateauPressure: 30 });
  assert.equal(r.drivingPressureVsTotalPeep, 17);
  assert.equal(r.drivingPressureVsSetPeep, 25);
  assert.match(r.drivingNote, /overstated by exactly the 8 of auto-PEEP/);
  assert.match(r.drivingNote, /The first is the real one/);
});

test('auto-peep: with no plateau it says what a plateau would show', () => {
  const r = autoPeep({ setPeep: 5, totalPeep: 13 });
  assert.equal(r.drivingPressureVsTotalPeep, null);
  assert.match(r.drivingNote, /Enter a plateau to see both/);
});

test('auto-peep: not being recorded passive is called out as the commonest error', () => {
  assert.match(autoPeep({ setPeep: 5, totalPeep: 13 }).passiveNote, /commonest reason a measurement is wrong/);
  assert.match(autoPeep({ setPeep: 5, totalPeep: 13, passive: true }).passiveNote, /Recorded as passive/);
});

test('auto-peep: the trigger threshold is named whether or not any was measured', () => {
  assert.match(autoPeep({ setPeep: 5, totalPeep: 13 }).triggerNote, /generate the whole 8 cmH2O/);
  assert.match(autoPeep({ setPeep: 5, totalPeep: 5 }).triggerNote, /raises the trigger threshold when present/);
  assert.match(AUTO_PEEP_NOTE, /where missed triggers come from/);
});
