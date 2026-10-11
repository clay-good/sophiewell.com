// spec-v1634 tool 14: pediatric heparin protocol (Monagle 2012, Table 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsHeparinNomogram as d } from '../../lib/peds-heparin-nomogram-v1634.js';

test('starting doses: 75 units/kg, then 28 or 20 units/kg per hour', () => {
  const infant = d({ weight: 10, age: 'under-1' });
  assert.deepEqual([infant.loadingDoseUnits, infant.initialRateUnitsPerHour], [750, 280]);
  const child = d({ weight: 20, age: 'over-1' });
  assert.deepEqual([child.loadingDoseUnits, child.initialRateUnitsPerHour], [1500, 400]);
  assert.match(infant.band, /over 10 minutes/);
});

test('every row of the adjustment table, at its edges', () => {
  const row = (aptt) => { const r = d({ weight: 20, aptt, currentRate: 400 }); return [r.bolusUnits, r.holdMinutes, r.rateChangePercent, r.newRateUnitsPerHour]; };
  assert.deepEqual(row(49), [1000, 0, 10, 440]);
  assert.deepEqual(row(50), [0, 0, 10, 440]);
  assert.deepEqual(row(59), [0, 0, 10, 440]);
  assert.deepEqual(row(60), [0, 0, 0, 400]);
  assert.deepEqual(row(85), [0, 0, 0, 400]);
  assert.deepEqual(row(86), [0, 0, -10, 360]);
  assert.deepEqual(row(95), [0, 0, -10, 360]);
  assert.deepEqual(row(96), [0, 30, -10, 360]);
  assert.deepEqual(row(120), [0, 30, -10, 360]);
  assert.deepEqual(row(121), [0, 60, -15, 340]);
  assert.match(d({ weight: 20, aptt: 70, currentRate: 400 }).band, /Repeat the aPTT the next day/);
  assert.match(d({ weight: 20, aptt: 45, currentRate: 400 }).band, /Repeat the aPTT in 4 hours/);
});

test('a value between two whole-second rows is not assigned to either', () => {
  const r = d({ weight: 20, aptt: 59.5, currentRate: 400 });
  assert.equal(r.flag, 'between-rows');
  assert.equal(r.newRateUnitsPerHour, undefined);
  assert.equal(d({ weight: 20, aptt: 85.4, currentRate: 400 }).flag, 'between-rows');
});

test('the anti-Xa assumption is always printed', () => {
  assert.match(d({ weight: 10, age: 'under-1' }).note, /anti-Xa level of 0\.35 to 0\.70/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the weight/);
  assert.match(d({ weight: 20 }).message, /^Choose the age group/);
  assert.match(d({ weight: 20, aptt: 70 }).message, /^Enter the current infusion rate/);
  assert.equal(d({ weight: 0.2, age: 'under-1' }).valid, false);
  assert.equal(d({ weight: 20, aptt: 0, currentRate: 400 }).valid, false);
  assert.equal(d(null).valid, false);
});
