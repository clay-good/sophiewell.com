// spec-v1736: ventilator pressures past their definitional order or range. Each row below
// used to answer, and three of them answered reassuringly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lisMurray, ventSbtPeep } from '../../lib/scoring-v4.js';
import { meanAirwayPressure } from '../../lib/oneformula-v167.js';
import { drivingPressure } from '../../lib/clinical-v6.js';

const lis = { quadrants: 0, pao2: 300, fio2: 0.4, peep: 5, complianceMlPerCmH2O: 80 };
test('lis-murray: a negative PEEP or a compliance of 0 is refused, not "no lung injury"', () => {
  assert.match(lisMurray(lis).band, /no lung injury/);
  assert.equal(lisMurray({ ...lis, peep: -5 }).valid, false);
  assert.equal(lisMurray({ ...lis, complianceMlPerCmH2O: 0 }).valid, false);
  assert.equal(lisMurray({ ...lis, peep: 0 }).score, 0, 'a PEEP of 0 is real');
});

const sbt = { pao2FiO2: 200, peep: 6, fio2: 0.4, vasopressors: false, awakeCooperative: true };
test('vent-sbt-peep: impossible PEEP, FiO2 or P/F no longer meets a readiness criterion', () => {
  assert.equal(ventSbtPeep(sbt).sbtReady, true);
  assert.throws(() => ventSbtPeep({ ...sbt, peep: -5 }), /PEEP -5 is outside 0 to 50/);
  assert.throws(() => ventSbtPeep({ ...sbt, fio2: 0.05 }), /FiO2/);
  assert.throws(() => ventSbtPeep({ ...sbt, pao2FiO2: 99999 }), /outside 10 to 3334/);
  assert.equal(ventSbtPeep({ ...sbt, peep: 0, fio2: 0.21, pao2FiO2: 3000 }).sbtReady, true, 'edges answer');
});

test('mean-airway-pressure: a PEEP above the peak is refused; equal answers', () => {
  const b = { pip: 30, peep: 5, ti: 1, te: 2 };
  assert.equal(meanAirwayPressure({ ...b, peep: 60 }).valid, false);
  assert.equal(meanAirwayPressure({ ...b, peep: 30 }).valid, true);
});

test('driving-pressure: plateau at or below PEEP is a refusal; a peak below the plateau throws', () => {
  assert.equal(drivingPressure({ plateau: 25, peep: 30, tidalVolume: 400 }).valid, false);
  assert.throws(() => drivingPressure({ plateau: 25, peep: 10, tidalVolume: 400, peak: 20 }), /below the plateau/);
  assert.equal(drivingPressure({ plateau: 25, peep: 10, tidalVolume: 400, peak: 25 }).drivingPressure, 15);
});
