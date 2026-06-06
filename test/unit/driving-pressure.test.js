// spec-v55 §2.9: driving pressure + static/dynamic compliance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drivingPressure } from '../../lib/clinical-v6.js';

test('dp at target: plateau 25, PEEP 10, Vt 400 -> dP 15, Cstat 26.7', () => {
  const r = drivingPressure({ plateau: 25, peep: 10, tidalVolume: 400 });
  assert.equal(r.drivingPressure, 15);
  assert.equal(r.staticCompliance, 26.7);
  assert.equal(r.dynamicCompliance, null);
  assert.match(r.band, /within the lung-protective target/);
});

test('dp above target with dynamic: plateau 30, PEEP 5, Vt 420, peak 35 -> dP 25, Cstat 16.8, Cdyn 14', () => {
  const r = drivingPressure({ plateau: 30, peep: 5, tidalVolume: 420, peak: 35 });
  assert.equal(r.drivingPressure, 25);
  assert.equal(r.staticCompliance, 16.8);
  assert.equal(r.dynamicCompliance, 14);
  assert.match(r.band, /above the lung-protective target/);
});

test('dp low: plateau 20, PEEP 8, Vt 450 -> dP 12, Cstat 37.5', () => {
  const r = drivingPressure({ plateau: 20, peep: 8, tidalVolume: 450 });
  assert.equal(r.drivingPressure, 12);
  assert.equal(r.staticCompliance, 37.5);
});

test('dp invalid: plateau <= PEEP returns null with guard note', () => {
  const r = drivingPressure({ plateau: 10, peep: 12, tidalVolume: 400 });
  assert.equal(r.drivingPressure, null);
  assert.equal(r.staticCompliance, null);
  assert.match(r.band, /must exceed PEEP/);
});

test('driving-pressure rejects impossible input', () => {
  assert.throws(() => drivingPressure({ plateau: 25, peep: 10, tidalVolume: 0 }), /tidalVolume/);
});
