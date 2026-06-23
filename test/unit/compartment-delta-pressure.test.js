// spec-v145 2.5: compartment delta pressure (McQueen & Court-Brown 1996).
// ΔP = diastolic - measured compartment pressure; ΔP < 30 mmHg is the published
// fasciotomy threshold. Includes the Δ = exactly 30 mmHg boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compartmentDeltaPressure } from '../../lib/ortho-v145.js';

test('delta 25 (< 30) -> below threshold, abnormal', () => {
  const r = compartmentDeltaPressure({ diastolic: 70, compartment: 45 });
  assert.equal(r.valid, true);
  assert.equal(r.delta, 25);
  assert.equal(r.belowThreshold, true);
  assert.equal(r.abnormal, true);
});

test('delta exactly 30 -> NOT below threshold (strict < 30)', () => {
  const r = compartmentDeltaPressure({ diastolic: 80, compartment: 50 });
  assert.equal(r.delta, 30);
  assert.equal(r.belowThreshold, false);
  assert.equal(r.abnormal, false);
});

test('delta 31 -> above threshold', () => {
  const r = compartmentDeltaPressure({ diastolic: 81, compartment: 50 });
  assert.equal(r.delta, 31);
  assert.equal(r.belowThreshold, false);
});

test('negative delta (compartment > diastolic) -> below threshold', () => {
  const r = compartmentDeltaPressure({ diastolic: 60, compartment: 75 });
  assert.equal(r.delta, -15);
  assert.equal(r.belowThreshold, true);
});

test('blank / non-finite inputs -> invalid (no NaN leak)', () => {
  assert.equal(compartmentDeltaPressure({ diastolic: null, compartment: 45 }).valid, false);
  assert.equal(compartmentDeltaPressure({ diastolic: NaN, compartment: 45 }).valid, false);
  assert.equal(compartmentDeltaPressure({}).valid, false);
});

test('out-of-range pressures -> invalid', () => {
  assert.equal(compartmentDeltaPressure({ diastolic: 300, compartment: 10 }).valid, false);
  assert.equal(compartmentDeltaPressure({ diastolic: 70, compartment: -5 }).valid, false);
});
