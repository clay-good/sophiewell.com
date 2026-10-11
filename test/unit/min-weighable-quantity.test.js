// spec-v1629 tool 9: minimum weighable quantity and percent error.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minWeighableQuantity as mw } from '../../lib/min-weighable-quantity-v1629.js';

test('minimum quantity = sensitivity ÷ (error ÷ 100)', () => {
  const r = mw({ mode: 'minimum', unit: 'mg', sensitivity: 10, errorLimit: 2 });
  assert.equal(r.minimum, 500);
  assert.equal(r.band, 'Smallest quantity inside 2% error: 500 mg.');
  assert.equal(mw({ mode: 'minimum', unit: 'mL', sensitivity: 0.1, errorLimit: 2.5 }).minimum, 4);
});

test('a blank sensitivity or a blank error limit refuses: nothing is defaulted', () => {
  assert.match(mw({ mode: 'minimum', unit: 'mg', errorLimit: 5 }).message, /Enter the device's sensitivity/);
  assert.match(mw({ mode: 'minimum', unit: 'mg', sensitivity: 6 }).message, /Enter the largest error accepted/);
  assert.match(mw({ mode: 'minimum', unit: 'mg', sensitivity: '  ', errorLimit: 5 }).message, /Enter the device's sensitivity/);
  assert.match(mw({ mode: 'minimum', sensitivity: 6, errorLimit: 5 }).message, /Choose the unit/);
  assert.match(mw({ unit: 'mg' }).message, /Choose what to work out/);
  assert.match(mw({ mode: 'minimum', unit: 'mg', sensitivity: 6, errorLimit: 0 }).message, /greater than 0/);
});

test('a quantity exactly at the minimum passes', () => {
  // 6 ÷ 120 × 100 is 5.000000000000001 in floating point; it is still at the limit, not over it.
  const at = mw({ mode: 'potential', unit: 'mg', quantity: 120, sensitivity: 6, errorLimit: 5 });
  assert.equal(at.percentError, 5);
  assert.equal(at.insideLimit, true);
  assert.match(at.notes.join(' '), /inside the 5% limit/);
  const under = mw({ mode: 'potential', unit: 'mg', quantity: 100, sensitivity: 6, errorLimit: 5 });
  assert.equal(under.percentError, 6);
  assert.equal(under.insideLimit, false);
});

test('percent error of a measurement, over or under, judged only against an entered limit', () => {
  const r = mw({ mode: 'error', unit: 'mL', wanted: 5, obtained: 5.3 });
  assert.equal(r.percentError, 6);
  assert.equal(r.insideLimit, null);
  assert.match(r.band, /6% \(over\)/);
  assert.match(r.notes.join(' '), /No error limit was entered, so the error is not judged/);
  assert.match(mw({ mode: 'error', unit: 'mL', wanted: 5, obtained: 4.9, errorLimit: 5 }).notes.join(' '), /inside the 5% limit/);
  assert.match(mw({ mode: 'error', unit: 'mL', wanted: 5, obtained: 4.9 }).band, /2% \(under\)/);
  assert.match(mw({ mode: 'error', unit: 'mL', wanted: 5, obtained: 5 }).band, /exactly the quantity wanted/);
  assert.match(mw({ mode: 'error', unit: 'mL', obtained: 5 }).message, /Enter the quantity wanted/);
});
