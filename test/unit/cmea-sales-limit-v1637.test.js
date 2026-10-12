// spec-v1637 tool 11: every tablet cell of DEA's CMEA equivalency charts, and the limits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cmeaSalesLimit, baseFactor } from '../../lib/cmea-sales-limit-v1637.js';

const cells = (mg, ingredient, salt) => [3.6, 7.5, 9].map((g) => Math.floor((g * 1000) / (mg * baseFactor(ingredient, salt)) + 1e-9));

test('DEA chart, tablets: 3.6 g, 7.5 g and 9 g columns', () => {
  assert.deepEqual(cells(25, 'ephedrine', 'hydrochloride-salt'), [175, 366, 439]);
  assert.deepEqual(cells(25, 'ephedrine', 'sulfate-salt'), [186, 389, 466]);
  assert.deepEqual(cells(30, 'pseudoephedrine', 'hydrochloride-salt'), [146, 305, 366]);
  assert.deepEqual(cells(60, 'pseudoephedrine', 'hydrochloride-salt'), [73, 152, 183]);
  assert.deepEqual(cells(120, 'pseudoephedrine', 'hydrochloride-salt'), [36, 76, 91]);
  assert.deepEqual(cells(30, 'pseudoephedrine', 'sulfate-salt'), [155, 324, 389]);
  assert.deepEqual(cells(60, 'pseudoephedrine', 'sulfate-salt'), [77, 162, 194]);
  assert.deepEqual(cells(120, 'pseudoephedrine', 'sulfate-salt'), [38, 81, 97]);
});

test('DEA chart, liquids at 3.6 g and 7.5 g', () => {
  const ml = (mg, per, g) => Math.floor(((g * 1000) / (mg * baseFactor('pseudoephedrine', 'hydrochloride-salt'))) * per + 1e-9);
  assert.deepEqual([ml(6.25, 5, 3.6), ml(15, 1.6, 3.6), ml(7.5, 5, 3.6), ml(15, 5, 3.6), ml(15, 2.5, 3.6), ml(30, 5, 3.6), ml(30, 2.5, 3.6), ml(60, 5, 3.6)], [3515, 468, 2929, 1464, 732, 732, 366, 366]);
  assert.deepEqual([ml(6.25, 5, 7.5), ml(15, 1.6, 7.5), ml(7.5, 5, 7.5), ml(15, 5, 7.5), ml(15, 2.5, 7.5), ml(30, 5, 7.5), ml(30, 2.5, 7.5), ml(60, 5, 7.5)], [7323, 976, 6103, 3051, 1525, 1525, 762, 762]);
});

const sale = (over) => cmeaSalesLimit({ ingredient: 'pseudoephedrine', salt: 'hydrochloride-salt', form: 'tablets-or-capsules', strengthMg: 30, unitsPerPackage: 48, packages: 1, seller: 'retail-store', soldToday: 0, ...over });

test('a retail store: the 3.6 g daily limit binds, and packages are rounded down', () => {
  const r = sale({ packages: 3 });
  // 48 x 30 mg x 0.81923 = 1.180 g a package; three is 3.539 g.
  assert.deepEqual([r.basePerPackageGrams, r.saleBaseGrams, r.flag, r.maxPackages], [1.18, 3.539, 'sale-fits', 3]);
  const over = sale({ packages: 4 });
  assert.deepEqual([over.flag, over.maxPackages, over.bindingLimit], ['sale-over-the-limit', 3, 'the 3.6 g daily limit']);
  assert.equal(sale({ soldToday: 2.5 }).maxPackages, 0);
  assert.match(r.note, /federal law puts no 30-day limit on the store/);
});

test('a mobile retail vendor or mail-order seller: the 30-day total is required and can bind', () => {
  assert.match(sale({ seller: 'mobile-retail-vendor' }).message, /^Enter the base grams sold to this purchaser in the past 30 days/);
  const r = sale({ seller: 'mail-order-seller', soldThirtyDays: 7, packages: 1 });
  assert.deepEqual([r.flag, r.bindingLimit, r.leftGrams, r.maxPackages], ['sale-over-the-limit', 'the 7.5 g 30-day limit', 0.5, 0]);
  assert.match(r.note, /1314\.100\(b\)/);
});

test('a state 30-day limit the reader enters can bind for a retail store', () => {
  const r = sale({ soldThirtyDays: 8, stateThirtyDayLimit: 9 });
  assert.deepEqual([r.bindingLimit, r.maxPackages], ['the state 30-day limit of 9 g', 0]);
});

test('the logbook exception: a single package of not more than 60 mg', () => {
  assert.match(sale({ strengthMg: 30, unitsPerPackage: 2 }).note, /outside the logbook requirement/);
  // 72 mg labeled is 58.98 mg of base: the rule does not say which, so the exception is not asserted.
  const edge = sale({ strengthMg: 36, unitsPerPackage: 2 });
  assert.doesNotMatch(edge.note, /outside the logbook requirement/);
  assert.match(edge.note, /does not say salt or base/);
  assert.doesNotMatch(sale({ strengthMg: 30, unitsPerPackage: 2, packages: 2 }).note, /logbook/);
});

test('liquid, phenylpropanolamine, and refusals', () => {
  const liq = sale({ form: 'liquid-product', strengthMg: 30, perMl: 5, unitsPerPackage: 118, packages: 1 });
  assert.equal(liq.basePerPackageGrams, 0.58);
  assert.match(sale({ ingredient: 'phenylpropanolamine', salt: 'sulfate-salt' }).message, /no conversion figure was found/);
  assert.match(sale({ ingredient: 'phenylpropanolamine' }).note, /no phenylpropanolamine row/);
  assert.match(cmeaSalesLimit({}).message, /^Choose the ingredient/);
  assert.match(sale({ soldToday: '' }).message, /^Enter the base grams already sold/);
  assert.match(sale({ packages: 1.5 }).message, /whole number/);
  assert.match(sale({ form: 'liquid-product' }).message, /^Enter the mL the strength is stated in/);
  assert.match(sale({ soldToday: 2, soldThirtyDays: 1 }).message, /at least the amount sold today/);
});
