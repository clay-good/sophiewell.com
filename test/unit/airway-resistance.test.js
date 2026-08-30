// spec-v927: inspiratory airway resistance. The tests that matter are the impossible inputs and
// the peak-versus-plateau line that has to print whatever the number comes to.

import test from 'node:test';
import assert from 'node:assert/strict';
import { airwayResistance, AIRWAY_RESISTANCE_NOTE } from '../../lib/airway-resistance-v927.js';

test('airway-resistance: both pressures and the flow are required', () => {
  assert.match(airwayResistance({}).message, /peak inspiratory pressure and the plateau/);
  assert.match(airwayResistance({ peakPressure: 30, plateauPressure: 20 }).message, /liters per minute/);
  assert.equal(airwayResistance({ peakPressure: 30, plateauPressure: 20, inspiratoryFlow: 0 }).valid, false);
});

test('airway-resistance: a plateau above the peak is refused, not computed', () => {
  const r = airwayResistance({ peakPressure: 20, plateauPressure: 25, inspiratoryFlow: 60 });
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot happen/);
});

test('airway-resistance: the arithmetic converts the flow to liters per second', () => {
  const r = airwayResistance({ peakPressure: 38, plateauPressure: 22, inspiratoryFlow: 60 });
  assert.equal(r.resistiveDrop, 16);
  assert.equal(r.inspiratoryFlowLps, 1);
  assert.equal(r.resistance, 16);
  const half = airwayResistance({ peakPressure: 38, plateauPressure: 22, inspiratoryFlow: 30 });
  assert.equal(half.resistance, 32);
});

test('airway-resistance: above 10 is raised, at or below is within the usual range', () => {
  assert.equal(airwayResistance({ peakPressure: 32, plateauPressure: 22, inspiratoryFlow: 60 }).raised, false);
  assert.equal(airwayResistance({ peakPressure: 33, plateauPressure: 22, inspiratoryFlow: 60 }).raised, true);
  assert.equal(airwayResistance({ peakPressure: 33, plateauPressure: 22, inspiratoryFlow: 60 }).abnormal, true);
});

test('airway-resistance: an equal peak and plateau is called out rather than reported as zero', () => {
  const r = airwayResistance({ peakPressure: 22, plateauPressure: 22, inspiratoryFlow: 60 });
  assert.equal(r.resistance, 0);
  assert.match(r.plateauNote, /worth checking before it is believed/);
  assert.match(r.plateauNote, /not measured during a real end-inspiratory hold/);
});

test('airway-resistance: the peak-versus-plateau distinction prints whatever the number is', () => {
  for (const peak of [24, 60]) {
    const r = airwayResistance({ peakPressure: peak, plateauPressure: 22, inspiratoryFlow: 60 });
    assert.match(r.distinctionNote, /rising peak with an unchanged plateau is a resistance problem/);
    assert.match(r.distinctionNote, /rising plateau is a compliance problem/);
  }
});

test('airway-resistance: the four conditions are stated on every result', () => {
  const r = airwayResistance({ peakPressure: 38, plateauPressure: 22, inspiratoryFlow: 60 });
  assert.match(r.flowNote, /constant square-wave flow in volume control/);
  assert.match(r.tubeNote, /trend in one patient says more than the absolute/);
  assert.match(r.passiveNote, /assumes a passive patient/);
  assert.match(r.complianceNote, /says nothing about compliance/);
  assert.match(r.scopeNote, /does not diagnose the cause/);
  assert.match(AIRWAY_RESISTANCE_NOTE, /wastes time on the wrong intervention/);
});
