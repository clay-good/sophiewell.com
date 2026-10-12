// spec-v1635 tool 30: radioactive package label category and transport index (49 CFR 172.403).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { radPackageLabelCategory as d } from '../../lib/rad-package-label-category-v1635.js';

const run = (surface, oneMeter, extra = {}) => d({ unit: 'mrem-h', surface, oneMeter, highwayRouteControlled: 'no', ...extra });

test('the regulation\'s own example: index 0.8 and surface 60 mrem/h is YELLOW-III', () => {
  const r = run(60, 0.8);
  assert.deepEqual([r.transportIndex, r.category, r.setBy], [0.8, 'RADIOACTIVE YELLOW-III', 'the surface dose rate']);
  // The same package in mSv/h.
  const si = d({ unit: 'msv-h', surface: 0.6, oneMeter: 0.008, highwayRouteControlled: 'no' });
  assert.deepEqual([si.transportIndex, si.category], [0.8, 'RADIOACTIVE YELLOW-III']);
});

test('the transport index is rounded up to the next tenth, and 0.05 or less is zero', () => {
  assert.equal(run(1, 0.05).transportIndex, 0);
  assert.equal(run(1, 0.051).transportIndex, 0.1);
  assert.equal(run(5, 0.8).transportIndex, 0.8);
  assert.equal(run(5, 0.81).transportIndex, 0.9);
  assert.equal(run(40, 1.01).transportIndex, 1.1);
});

test('each row of the table, at its edges, and the higher of the two tests', () => {
  assert.equal(run(0.5, 0).flag, 'white-i');
  assert.equal(run(0.51, 0).flag, 'yellow-ii');
  assert.equal(run(0.4, 0.3).flag, 'yellow-ii'); // set by the index
  assert.equal(run(50, 1).flag, 'yellow-ii');
  assert.equal(run(50.1, 1).flag, 'yellow-iii');
  assert.equal(run(50, 1.1).flag, 'yellow-iii');
  assert.equal(run(200, 10).flag, 'yellow-iii');
  assert.equal(run(201, 10).flag, 'yellow-iii-exclusive-use');
  assert.equal(run(200, 10.1).flag, 'yellow-iii-exclusive-use');
  assert.equal(run(1000, 12).flag, 'yellow-iii-exclusive-use');
  assert.equal(run(1001, 12).flag, 'above-table');
});

test('a highway route controlled quantity is YELLOW-III whatever the readings', () => {
  const r = run(0.3, 0, { highwayRouteControlled: 'yes' });
  assert.deepEqual([r.flag, r.setBy], ['yellow-iii', 'highway route controlled quantity']);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose the unit/);
  assert.match(d({ unit: 'mrem-h' }).message, /^Enter the maximum dose rate at the package surface/);
  assert.match(d({ unit: 'mrem-h', surface: 5 }).message, /^Enter the maximum dose rate at 1 meter/);
  assert.match(d({ unit: 'mrem-h', surface: 5, oneMeter: 1 }).message, /^Choose whether the package holds/);
  assert.match(run(1, 5).message, /higher than at the surface/);
  assert.equal(run(-1, 0).valid, false);
  assert.equal(d(null).valid, false);
});
