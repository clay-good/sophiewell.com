// spec-v65 §2.1 unit tests: o2-cylinder-duration. >=3 boundary worked examples
// including the flow-0 null path and the at/below-residual flag (no negative
// duration, no NaN/Infinity leak).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../lib/clinical-v8.js';

test('o2CylinderDuration: E-cylinder 2000 psi, 200 residual, 2 L/min -> 504 L / 252 min', () => {
  const r = C.o2CylinderDuration({ factorLPsi: C.O2_CYLINDER_FACTORS.E, gaugePsi: 2000, flowLpm: 2, residualPsi: 200 });
  assert.equal(r.usableVolumeL, 504); // (2000 - 200) * 0.28
  assert.equal(r.minutesRemaining, 252); // 504 / 2
  assert.equal(r.atOrBelowResidual, false);
});

test('o2CylinderDuration: cylinder factor table matches the CGA/Egan values', () => {
  assert.deepEqual(C.O2_CYLINDER_FACTORS, { D: 0.16, E: 0.28, M: 1.56, G: 2.41, H: 3.14 });
});

test('o2CylinderDuration: inverse -- max flow that lasts a 45-min round trip on a full E-cylinder', () => {
  // usable (2200 - 200) * 0.28 = 560 L; 560 / 45 = 12.44 L/min
  const r = C.o2CylinderDuration({ factorLPsi: 0.28, gaugePsi: 2200, flowLpm: 0, residualPsi: 200, targetMinutes: 45 });
  assert.equal(r.usableVolumeL, 560);
  assert.equal(r.minutesRemaining, null); // flow 0 -> no time-to-empty
  assert.equal(r.maxFlowLpm, 12.44);
});

test('o2CylinderDuration: gauge at/below the residual -> 0 usable, flag set, no negative duration', () => {
  const r = C.o2CylinderDuration({ factorLPsi: 0.28, gaugePsi: 150, flowLpm: 2, residualPsi: 200 });
  assert.equal(r.usableVolumeL, 0);
  assert.equal(r.minutesRemaining, 0);
  assert.equal(r.atOrBelowResidual, true);
});

test('o2CylinderDuration: flow 0 -> null minutes (no divide-by-zero); impossible inputs throw', () => {
  assert.equal(C.o2CylinderDuration({ factorLPsi: 0.28, gaugePsi: 2000, flowLpm: 0 }).minutesRemaining, null);
  assert.throws(() => C.o2CylinderDuration({ factorLPsi: 0, gaugePsi: 2000, flowLpm: 2 }), RangeError);
  assert.throws(() => C.o2CylinderDuration({ factorLPsi: 0.28, gaugePsi: NaN, flowLpm: 2 }), TypeError);
});
