// spec-v133 2.1: IWPC pharmacogenetic warfarin dose (Klein TE, et al; IWPC,
// N Engl J Med 2009;360:753-764, supplementary appendix S1e). sqrt(weekly dose)
// = 5.6044 - 0.2614*decades + 0.0087*ht + 0.0128*wt + VKORC1 + CYP2C9 + race
// + 1.1816*inducer - 0.5503*amiodarone; squared for mg/week. Reference baseline:
// VKORC1 G/G, CYP2C9 *1/*1, White, no inducer, no amiodarone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { warfarinIwpc } from '../../lib/warfarin-v133.js';

test('reference genotype worked example squares the root to mg/week', () => {
  // age 65 (6 decades), 170 cm, 70 kg, G/G, *1/*1, White, no inducer, no amio:
  // sqrt = 5.6044 - 1.5684 + 1.479 + 0.896 = 6.411; 6.411^2 = 41.10 mg/week.
  const r = warfarinIwpc({ age: 65, height: 170, weight: 70, vkorc1: 'GG', cyp2c9: '*1/*1', race: 'white', inducer: 'no', amiodarone: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.weekly, 41.1);
  assert.equal(r.daily, 5.9);
});

test('a sensitive genotype lowers the predicted dose', () => {
  // VKORC1 A/A (-1.6974) and CYP2C9 *3/*3 (-2.3312) drive the dose well below
  // the reference; amiodarone (-0.5503) lowers it further.
  const sens = warfarinIwpc({ age: 75, height: 165, weight: 60, vkorc1: 'AA', cyp2c9: '*3/*3', race: 'asian', inducer: 'no', amiodarone: 'yes' });
  const ref = warfarinIwpc({ age: 75, height: 165, weight: 60, vkorc1: 'GG', cyp2c9: '*1/*1', race: 'white', inducer: 'no', amiodarone: 'no' });
  assert.equal(sens.valid, true);
  assert.ok(sens.weekly < ref.weekly);
});

test('the enzyme inducer raises the dose vs the same patient without it', () => {
  const base = { age: 55, height: 175, weight: 80, vkorc1: 'AG', cyp2c9: '*1/*2', race: 'white', amiodarone: 'no' };
  const withInducer = warfarinIwpc({ ...base, inducer: 'yes' });
  const without = warfarinIwpc({ ...base, inducer: 'no' });
  assert.ok(withInducer.weekly > without.weekly);
});

test('the unknown-genotype terms are accepted (not dropped)', () => {
  const r = warfarinIwpc({ age: 60, height: 170, weight: 75, vkorc1: 'unknown', cyp2c9: 'unknown', race: 'mixed', inducer: 'no', amiodarone: 'no' });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.weekly) && r.weekly > 0);
});

test('blank or unrecognized inputs surface valid:false, never a dose from NaN', () => {
  assert.equal(warfarinIwpc({ age: 65, height: 170 }).valid, false);
  assert.equal(warfarinIwpc({ age: 65, height: 170, weight: 70, vkorc1: '', cyp2c9: '*1/*1', race: 'white', inducer: 'no', amiodarone: 'no' }).valid, false);
  assert.equal(warfarinIwpc({ age: 65, height: 170, weight: 70, vkorc1: 'GG', cyp2c9: 'GG', race: 'white', inducer: 'no', amiodarone: 'no' }).valid, false); // bad CYP2C9 key
  assert.equal(warfarinIwpc({ age: 65, height: 170, weight: 70, vkorc1: 'GG', cyp2c9: '*1/*1', race: 'martian', inducer: 'no', amiodarone: 'no' }).valid, false);
  assert.equal(warfarinIwpc(7).valid, false);
});
