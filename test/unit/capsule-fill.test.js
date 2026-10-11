// spec-v1629 tool 17: capsule fill weight and diluent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capsuleFill as cf } from '../../lib/capsule-fill-v1629.js';

const w = { method: 'weights', capsules: 30, activeFillMg: 400, diluentFillMg: 300 };

test('by measured fill weights: the diluent fills what the active leaves', () => {
  const r = cf({ ...w, activeMg: 100 });
  assert.equal(r.fits, true);
  assert.equal(r.fractionFilled, 0.25);
  assert.equal(r.diluentMg, 225);
  assert.equal(r.fillWeightMg, 325);
  assert.deepEqual([r.activeTotalG, r.diluentTotalG], [3, 6.75]);
});

test('an active that overfills the capsule reports "does not fit"', () => {
  const r = cf({ ...w, activeMg: 500 });
  assert.equal(r.valid, true);
  assert.equal(r.fits, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Does not fit this size/);
  assert.equal(r.diluentMg, undefined);
});

test('zero diluent when the active exactly fills', () => {
  const r = cf({ ...w, activeMg: 400 });
  assert.equal(r.fits, true);
  assert.equal(r.diluentMg, 0);
  assert.equal(r.fillWeightMg, 400);
});

test('by densities: the same capsule gives the same answer', () => {
  // 0.5 mL capsule; active 0.8 g/mL fills it at 400 mg, diluent 0.6 g/mL at 300 mg: the same capsule as above.
  const r = cf({ method: 'densities', capsules: 30, activeMg: 100, capsuleVolumeMl: 0.5, activeDensity: 0.8, diluentDensity: 0.6, overage: 3 });
  assert.equal(r.diluentMg, 225);
  assert.equal(r.capsulesMade, 33);
  assert.deepEqual([r.activeTotalG, r.diluentTotalG], [3.3, 7.425]);
});

test('nothing is defaulted: no capsule volume, fill weight or density ships', () => {
  assert.match(cf({}).message, /Choose the method/);
  assert.match(cf({ method: 'densities', capsules: 30, activeMg: 100, activeDensity: 0.8, diluentDensity: 0.6 }).message, /Enter the capsule body volume/);
  assert.match(cf({ method: 'weights', capsules: 30, activeMg: 100, diluentFillMg: 300 }).message, /Enter the weight of active alone/);
  assert.match(cf({ ...w, activeMg: 100, capsules: 2.5 }).message, /whole number/);
});
