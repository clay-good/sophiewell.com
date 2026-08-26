// spec-v794: Furst urine-to-plasma electrolyte ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { furstRatio } from '../../lib/furst-ratio-v794.js';

test('worked example: urine Na 60 + K 40 over serum Na 125 -> 0.80, restrict to 500', () => {
  const r = furstRatio({ urineSodium: 60, urinePotassium: 40, serumSodium: 125 });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 0.8);
  assert.equal(r.tier, 'restrict-500');
  assert.match(r.advice, /500 mL\/day/);
});

test('under 0.5 gives the 1000 mL/day band', () => {
  const r = furstRatio({ urineSodium: 30, urinePotassium: 20, serumSodium: 125 });
  assert.equal(r.ratio, 0.4);
  assert.equal(r.tier, 'restrict-1000');
  assert.equal(r.abnormal, false);
});

test('exactly 0.5 falls in the 500 mL band, not the 1000 mL one', () => {
  const r = furstRatio({ urineSodium: 62.5, urinePotassium: 0, serumSodium: 125 });
  assert.equal(r.ratio, 0.5);
  assert.equal(r.tier, 'restrict-500');
});

test('exactly 1.0 is still restrictable; above 1.0 is not', () => {
  const at1 = furstRatio({ urineSodium: 125, urinePotassium: 0, serumSodium: 125 });
  assert.equal(at1.ratio, 1);
  assert.equal(at1.tier, 'restrict-500');
  assert.equal(at1.abnormal, false);

  const over = furstRatio({ urineSodium: 90, urinePotassium: 50, serumSodium: 125 });
  assert.ok(over.ratio > 1);
  assert.equal(over.tier, 'restriction-unlikely');
  assert.equal(over.abnormal, true);
  assert.match(over.advice, /unlikely to help/);
});

test('potassium is added to sodium, not ignored', () => {
  const withK = furstRatio({ urineSodium: 60, urinePotassium: 40, serumSodium: 125 });
  const withoutK = furstRatio({ urineSodium: 60, urinePotassium: 0, serumSodium: 125 });
  assert.equal(withK.ratio, 0.8);
  assert.equal(withoutK.ratio, 0.48);
  assert.notEqual(withK.tier, withoutK.tier);
});

test('all three values are required and range-checked', () => {
  assert.equal(furstRatio({ urinePotassium: 40, serumSodium: 125 }).field, 'urineSodium');
  assert.equal(furstRatio({ urineSodium: 60, serumSodium: 125 }).field, 'urinePotassium');
  assert.equal(furstRatio({ urineSodium: 60, urinePotassium: 40 }).field, 'serumSodium');
  assert.equal(furstRatio({ urineSodium: 60, urinePotassium: 40, serumSodium: 20 }).valid, false);
  assert.equal(furstRatio({ urineSodium: -1, urinePotassium: 40, serumSodium: 125 }).valid, false);
});
