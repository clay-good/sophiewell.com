import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mtpTracker } from '../../lib/scoring-v4.js';

test('Zero state -> initial cooler banner', () => {
  const r = mtpTracker({ prbcUnits: 0, ffpUnits: 0, plateletUnits: 0, cryoUnits: 0 });
  assert.equal(r.ratio, '0:0:0');
  assert.ok(r.banners.some((b) => b.includes('Initial cooler')));
});

test('PRBC ahead of FFP -> next product is FFP', () => {
  const r = mtpTracker({ prbcUnits: 6, ffpUnits: 4, plateletUnits: 1 });
  assert.equal(r.nextProduct, 'FFP');
});

// PROPPR (PMC4374744): a 1:1:1 container is 6 plasma, 1 platelet dose (a pool of 6 on average), 6 RBC. The field is
// apheresis doses, so one dose is 6 in the ratio. The tracker used to call for platelets after its own 6:6:1 cooler.
test('PRBC ahead of platelets -> next product is Platelets', () => {
  const r = mtpTracker({ prbcUnits: 12, ffpUnits: 12, plateletUnits: 1 });
  assert.equal(r.nextProduct, 'Platelets');
});

test('the initial cooler, 6 PRBC : 6 FFP : 1 apheresis dose, is 1:1:1 -> next product PRBC', () => {
  const r = mtpTracker({ prbcUnits: 6, ffpUnits: 6, plateletUnits: 1 });
  assert.equal(r.nextProduct, 'PRBC');
  assert.equal(r.ratio, '6:6:6');
  assert.equal(r.plateletEquivalentUnits, 6);
});

test('Cryo due once per 6 PRBC (ATLS 2018)', () => {
  const r = mtpTracker({ prbcUnits: 12, ffpUnits: 12, plateletUnits: 2, cryoUnits: 1 });
  assert.equal(r.cryoDoseDue, 2);
  assert.ok(r.banners.some((b) => b.includes('Cryoprecipitate due')));
});

test('Cumulative units sum across all products', () => {
  const r = mtpTracker({ prbcUnits: 6, ffpUnits: 6, plateletUnits: 1, cryoUnits: 1 });
  assert.equal(r.cumulativeUnits, 14);
});

test('Negative or non-integer inputs are clamped / truncated', () => {
  const r = mtpTracker({ prbcUnits: -2, ffpUnits: 3.9, plateletUnits: 'x' });
  assert.equal(r.prbcUnits, 0);
  assert.equal(r.ffpUnits, 3);
  assert.equal(r.plateletUnits, 0);
});
