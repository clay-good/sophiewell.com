// spec-v1629 tool 2: dilution and stock solutions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dilutionC1V1 as d } from '../../lib/dilution-c1v1-v1629.js';

test('1:1,000 to 1:10,000 is a tenfold dilution across ratio units', () => {
  const r = d({ stockUnit: 'ratio', stockStrength: 1000, finalUnit: 'ratio', finalStrength: 10000, finalQuantity: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.solvedFor, 'q1');
  assert.equal(r.stockQuantity, 10);
  assert.equal(r.dilutionFactor, 10);
  assert.equal(r.band, 'Stock needed: 10 mL.');
});

test('each of the four terms can be the one solved for', () => {
  const base = { stockUnit: 'pct-wv', finalUnit: 'pct-wv' };
  assert.equal(d({ ...base, stockQuantity: 5, finalStrength: 2, finalQuantity: 25 }).stockStrength, 10);
  assert.equal(d({ ...base, stockStrength: 10, finalStrength: 2, finalQuantity: 25 }).stockQuantity, 5);
  assert.equal(d({ ...base, stockStrength: 10, stockQuantity: 5, finalQuantity: 25 }).finalStrength, 2);
  assert.equal(d({ ...base, stockStrength: 10, stockQuantity: 5, finalStrength: 2 }).finalQuantity, 25);
});

test('weight-in-volume units convert among themselves', () => {
  // 10% w/v is 100 mg/mL; 250 mL at 2 mg/mL holds 500 mg, which is 5 mL of stock.
  assert.equal(d({ stockUnit: 'pct-wv', stockStrength: 10, finalUnit: 'mg-ml', finalStrength: 2, finalQuantity: 250 }).stockQuantity, 5);
  // 5 mL of a 1 mg/mL stock made to 50 mL is 100 mcg/mL.
  assert.equal(d({ stockUnit: 'mg-ml', stockStrength: 1, stockQuantity: 5, finalUnit: 'mcg-ml', finalQuantity: 50 }).finalStrength, 100);
  // 1:1,000 is 0.1% w/v.
  assert.equal(d({ stockUnit: 'ratio', stockStrength: 1000, stockQuantity: 10, finalUnit: 'pct-wv', finalQuantity: 10 }).finalStrength, 0.1);
  const ppm = d({ stockUnit: 'ppm', stockStrength: 1000, finalUnit: 'ppm', finalStrength: 50, finalQuantity: 200 });
  assert.equal(ppm.stockQuantity, 10);
  assert.match(ppm.notes.join(' '), /ppm is read here as mg per liter/);
});

test('a w/w stock without a specific gravity is refused when the product is w/v', () => {
  const args = { stockUnit: 'pct-ww', stockStrength: 37, finalUnit: 'pct-wv', finalStrength: 10, finalQuantity: 1000 };
  assert.match(d(args).message, /needs the stock's specific gravity/);
  assert.match(d(args).message, /not assumed to be 1/);
  // 37% w/w at 1.18 holds 436.6 mg/mL; 100 g of solute is 229.043 mL of it.
  const r = d({ ...args, specificGravity: 1.18 });
  assert.equal(r.stockQuantity, 229.043);
  assert.match(r.notes.join(' '), /holds 436\.6 mg of solute per mL; 229\.043 mL of it weighs 270\.27 g/);
});

test('different bases are refused, not converted', () => {
  assert.match(d({ stockUnit: 'pct-vv', stockStrength: 95, finalUnit: 'pct-wv', finalStrength: 70, finalQuantity: 5 }).message, /different bases/);
  assert.match(d({ stockUnit: 'pct-wv', stockStrength: 95, finalUnit: 'pct-ww', finalStrength: 70, finalQuantity: 5 }).message, /different bases/);
});

test('the diluent line never claims additivity for a volume; weights add', () => {
  const vol = d({ stockUnit: 'pct-wv', stockStrength: 10, finalUnit: 'pct-wv', finalStrength: 2, finalQuantity: 25 }).notes.join(' ');
  assert.match(vol, /add diluent to make 25 mL/);
  assert.match(vol, /Do not measure the diluent as 20 mL and add it: volumes are not always additive/);
  const wt = d({ stockUnit: 'pct-ww', stockStrength: 10, stockQuantity: 30, finalUnit: 'pct-ww', finalStrength: 2.5 });
  assert.equal(wt.finalQuantity, 120);
  assert.match(wt.notes.join(' '), /add diluent to make 120 g \(90 g of diluent; weights add\)/);
});

test('refusals: not three terms, no unit, a result above the stock, an impossible strength', () => {
  assert.match(d({}).message, /Choose the unit of the stock strength/);
  assert.match(d({ stockUnit: 'pct-wv' }).message, /Choose the unit of the final strength/);
  assert.match(d({ stockUnit: 'constructor', finalUnit: 'pct-wv' }).message, /Choose the unit of the stock strength/);
  const u = { stockUnit: 'pct-wv', finalUnit: 'pct-wv' };
  assert.match(d({ ...u, stockStrength: 1, stockQuantity: 10 }).message, /any three/);
  assert.match(d({ ...u, stockStrength: 1, stockQuantity: 10, finalStrength: 1, finalQuantity: 5 }).message, /any three/);
  assert.match(d({ ...u, stockStrength: 1, stockQuantity: 10, finalQuantity: 5 }).message, /above the stock strength/);
  assert.match(d({ ...u, stockStrength: 150, stockQuantity: 10, finalQuantity: 50 }).message, /at most 100/);
  assert.match(d({ ...u, stockQuantity: 1, finalStrength: 50, finalQuantity: 10 }).message, /not a possible strength/);
  assert.match(d({ ...u, stockStrength: 0, stockQuantity: 10, finalQuantity: 50 }).message, /greater than 0/);
});
