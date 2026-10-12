// spec-v1635 tool 34: inverse square and lead shielding.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { radiationDistanceShielding as calc } from '../../lib/radiation-distance-shielding-v1635.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const d = (i, table) => calc(i, now, table);

test('inverse square', () => {
  assert.equal(d({ rate: 100, distance: 1, newDistance: 2 }).rate, 25);
  assert.equal(d({ rate: 100, distance: 2, newDistance: 1 }).rate, 400);
  assert.match(d({ rate: 100, distance: 1 }).message, /Both distances are needed/);
});

test('the label tables: the row reached, never interpolated', () => {
  const row = (shield, thicknessCm) => d({ rate: 100, shield, thicknessCm }).shieldFactor;
  assert.deepEqual([0.02, 0.023, 0.089, 0.09, 0.18, 0.27, 0.33, 1].map((t) => row('tc-99m', t)), [1, 0.5, 0.5, 0.1, 0.01, 0.001, 0.0001, 0.0001]);
  assert.deepEqual([0.5, 0.7, 2.3, 4.7, 7.0, 9.3].map((t) => row('rb-82', t)), [1, 0.5, 0.1, 0.01, 0.001, 0.0001]);
  assert.match(d({ rate: 100, shield: 'tc-99m', thicknessCm: 0.1 }).notes.join(' '), /does not interpolate/);
  assert.match(d({ rate: 100, shield: 'tc-99m', thicknessCm: 0.01 }).notes.join(' '), /no reduction is credited/);
});

test('a typed half-value layer, distance and shield together, and a stay time', () => {
  assert.equal(d({ rate: 80, shield: 'typed', thicknessCm: 3, halfValueLayerCm: 1 }).rate, 10);
  const both = d({ rate: 100, distance: 1, newDistance: 2, shield: 'tc-99m', thicknessCm: 0.09, doseLimit: 5 });
  assert.deepEqual([both.rateAtNewDistance, both.rate, both.stayTimeHours], [25, 2.5, 2]);
  assert.match(both.note, /not a shielding design/);
});

test('a superseded label withholds its table', () => {
  const tc = '3ae14c6b-3daf-4dd1-bbdb-e990fe8100e4';
  const dead = { ...LABEL_EDITIONS, [tc]: { ...LABEL_EDITIONS[tc], supersededOn: '2026-10-10' } };
  const r = d({ rate: 100, shield: 'tc-99m', thicknessCm: 0.09 }, dead);
  assert.deepEqual([r.withheld, r.rate], [true, undefined]);
  assert.equal(d({ rate: 100, shield: 'typed', thicknessCm: 1, halfValueLayerCm: 1 }, dead).rate, 50);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the measured dose rate/);
  assert.match(d({ rate: 100 }).message, /^Enter the two distances, a lead shield/);
  assert.match(d({ rate: 100, thicknessCm: 1 }).message, /^Choose the source for the lead shield/);
  assert.match(d({ rate: 100, shield: 'typed', thicknessCm: 1 }).message, /^Enter the half-value layer/);
  assert.match(d({ rate: 100, shield: 'tc-99m' }).message, /^Enter the lead thickness/);
  assert.equal(calc(null, now).valid, false);
});
