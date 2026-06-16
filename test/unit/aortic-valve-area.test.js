// spec-v90 §2.6: aortic valve area by the continuity equation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aorticValveArea } from '../../lib/cardio-v90.js';

test('worked example: LVOT d 2.0, LVOT VTI 20, AV VTI 100 -> 0.63 cm2 severe', () => {
  // pi x (1.0)^2 x 20 / 100 = 0.6283 -> 0.63; DI = 20/100 = 0.2
  const r = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.ava, 0.63);
  assert.equal(r.di, 0.2);
  assert.equal(r.severity, 'severe');
});

test('severity boundary at 1.0 cm2 reads moderate (inclusive lower)', () => {
  // choose AV VTI so AVA = pi x 1 x 20 / AV = 1.0 -> AV = 20*pi
  const r = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 20 * Math.PI });
  assert.equal(r.ava, 1);
  assert.equal(r.severity, 'moderate');
});

test('just below 1.0 cm2 reads severe', () => {
  // AV slightly larger than 20*pi pushes AVA < 1.0
  const r = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 20 * Math.PI + 2 });
  assert.ok(r.ava < 1.0);
  assert.equal(r.severity, 'severe');
});

test('severity boundary at 1.5 cm2 reads moderate; just above reads mild', () => {
  // AVA = 1.5 -> AV = 20*pi/1.5
  const at = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: (20 * Math.PI) / 1.5 });
  assert.equal(at.ava, 1.5);
  assert.equal(at.severity, 'moderate');
  // larger area -> mild
  const mild = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 35 });
  assert.ok(mild.ava > 1.5);
  assert.equal(mild.severity, 'mild');
});

test('the dimensionless index is LVOT VTI / AV VTI', () => {
  const r = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 50 });
  assert.equal(r.di, 0.4);
  assert.equal(r.severity, 'moderate'); // AVA = 1.26
});

test('AV VTI = 0 is guarded and never yields a NaN', () => {
  const r = aorticValveArea({ lvotDiameter: 2.0, lvotVti: 20, avVti: 0 });
  assert.equal(r.valid, false);
  assert.match(r.band, />\s*0/);
});

test('a non-positive LVOT diameter renders the fallback', () => {
  assert.equal(aorticValveArea({ lvotDiameter: 0, lvotVti: 20, avVti: 100 }).valid, false);
  assert.equal(aorticValveArea({ lvotVti: 20, avVti: 100 }).valid, false);
});
