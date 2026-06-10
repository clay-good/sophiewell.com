// spec-v65 §2.2 unit tests: minute-ventilation. >=3 boundary worked examples
// including the RR-0 null path and the target-PaCO2 inverse round-trip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../lib/clinical-v8.js';

test('minuteVentilation: RR 16 x Vt 450 mL -> 7.2 L/min', () => {
  const r = C.minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450 });
  assert.equal(r.minuteVentilationLMin, 7.2);
  assert.equal(r.alveolarVentilationLMin, null); // no IBW -> no dead-space term
  assert.equal(r.requiredRate, null); // no PaCO2 pair
});

test('minuteVentilation: alveolar ventilation subtracts ~2.2 mL/kg IBW dead space', () => {
  // IBW 70 kg -> dead space 154 mL; effective Vt 450 - 154 = 296 mL; V̇A = 16 x 296 / 1000
  const r = C.minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450, ibwKg: 70 });
  assert.equal(r.minuteVentilationLMin, 7.2);
  assert.equal(r.alveolarVentilationLMin, 4.74);
});

test('minuteVentilation: target-PaCO2 inverse round-trips (60 -> 40 at RR 16 => RR 24)', () => {
  const r = C.minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450, currentPaco2: 60, targetPaco2: 40 });
  assert.equal(r.requiredRate, 24); // 16 * 60/40
});

test('minuteVentilation: RR 0 or target PaCO2 0 -> null required rate (no divide-by-zero)', () => {
  assert.equal(C.minuteVentilation({ respiratoryRate: 0, tidalVolumeMl: 450, currentPaco2: 60, targetPaco2: 40 }).requiredRate, null);
  assert.equal(C.minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450, currentPaco2: 60, targetPaco2: 0 }).requiredRate, null);
  // V̇E with RR 0 is a finite 0, not NaN.
  assert.equal(C.minuteVentilation({ respiratoryRate: 0, tidalVolumeMl: 450 }).minuteVentilationLMin, 0);
});

test('minuteVentilation: impossible inputs throw (no NaN/Infinity leak)', () => {
  assert.throws(() => C.minuteVentilation({ respiratoryRate: NaN, tidalVolumeMl: 450 }), TypeError);
  assert.throws(() => C.minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: -1 }), RangeError);
});
