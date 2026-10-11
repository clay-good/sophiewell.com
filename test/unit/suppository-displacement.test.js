// spec-v1629 tool 16: suppository and molded-form displacement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suppositoryDisplacement as sd } from '../../lib/suppository-displacement-v1629.js';

const batch = { mode: 'batch', units: 12, blankWeight: 2, drugPerUnit: 0.3 };

test('the same batch under definition (a) with factor 2 and under (b) with factor 0.5 gives the same base', () => {
  const a = sd({ ...batch, definition: 'density', factor: 2 });
  const b = sd({ ...batch, definition: 'displacement', factor: 0.5 });
  assert.equal(a.basePerUnit, 1.85);
  assert.equal(a.baseTotal, 22.2);
  assert.equal(b.baseTotal, a.baseTotal);
  assert.equal(a.drugTotal, 3.6);
  assert.equal(a.unitWeight, 2.15);
  assert.deepEqual([a.densityFactor, a.displacementFactor], [2, 0.5]);
  assert.deepEqual([b.densityFactor, b.displacementFactor], [2, 0.5]);
  // The wrong definition gives a different, wrong answer: that is why it must be chosen.
  assert.notEqual(sd({ ...batch, definition: 'displacement', factor: 2 }).baseTotal, a.baseTotal);
});

test('no definition chosen gives no answer', () => {
  const r = sd({ ...batch, factor: 2 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Choose which definition your factor uses/);
  assert.match(r.message, /reciprocals/);
});

test('drug volume larger than the mold is refused', () => {
  assert.match(sd({ ...batch, definition: 'displacement', drugPerUnit: 1.5, factor: 1.5 }).message, /does not fit this mold/);
  assert.match(sd({ ...batch, definition: 'density', drugPerUnit: 2, factor: 1 }).message, /does not fit this mold/);
});

test('overage adds whole units; the factor is never assumed', () => {
  const r = sd({ ...batch, definition: 'density', factor: 2, overage: 2 });
  assert.equal(r.unitsMade, 14);
  assert.equal(r.baseTotal, 25.9);
  assert.match(sd({ ...batch, definition: 'density' }).message, /Enter the factor/);
  assert.match(sd({ ...batch, definition: 'density', factor: 2, units: 2.5 }).message, /whole number/);
  assert.match(sd({}).message, /Choose what to work out/);
});

test('calibration: the factor both ways from three weighings', () => {
  // A plain unit 2 g; a medicated unit 2.15 g holding 0.3 g of drug: 1.85 g of base, so 0.15 g displaced.
  const r = sd({ mode: 'calibrate', blankWeight: 2, drugPerUnit: 0.3, medicatedWeight: 2.15 });
  assert.deepEqual([r.densityFactor, r.displacementFactor], [2, 0.5]);
  // Feeding the calibrated factor back reproduces the medicated unit's weight.
  assert.equal(sd({ ...batch, definition: 'density', factor: r.densityFactor }).unitWeight, 2.15);
  assert.match(sd({ mode: 'calibrate', blankWeight: 2, drugPerUnit: 0.3, medicatedWeight: 2.4 }).message, /displaced no base/);
  assert.match(sd({ mode: 'calibrate', blankWeight: 2, drugPerUnit: 0.3, medicatedWeight: 0.2 }).message, /must weigh more than the drug in it/);
});
