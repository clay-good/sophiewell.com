// spec-v1631 tool 1: vancomycin first dose and starting regimen; the label's table is a label row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vancInitialDose as vi, LABEL, LABEL_TABLE, GUIDE } from '../../lib/vanc-initial-dose-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const adult = { population: 'adult', weight: 70, crcl: 100, loadPerKg: 25, targetAuc: 500 };

test('the label\'s table and the guideline\'s ranges', () => {
  assert.deepEqual(LABEL_TABLE, [[100, 1545], [90, 1390], [80, 1235], [70, 1080], [60, 925], [50, 770], [40, 620], [30, 465], [20, 310], [10, 155]]);
  assert.deepEqual([GUIDE.load.adult, GUIDE.load['obese-adult'], GUIDE.loadCap, GUIDE.auc], [[20, 35], [20, 25], 3000, [400, 600]]);
  assert.equal(labelRow(LABEL.setId, now).answers, true);
});

test('the spec\'s case: clearance 100 mL/min, 70 kg, AUC 500: Matzke 2,177, Rodvold 1,986, label 1,545', () => {
  const r = vi(adult, now);
  // Matzke: (3.66 + 68.9) x 0.06 = 4.3536 L/h x 500. Rodvold: (22.7 + 5.67) x 70.
  assert.deepEqual([r.matzkeClearance, r.matzkeDailyDose, r.rodvoldDailyDose, r.labelProduct, r.labelTableDose], [4.354, 2177, 1986, 1500, 1545]);
  assert.deepEqual([r.loadingDose, r.loadingCapped, r.infusionMinutes], [1750, false, 175]);
  assert.deepEqual(r.flags, []);
  assert.match(r.notes.join(' '), /every 8 hours 725\.6 mg, every 12 hours 1,088 mg/);
  assert.match(r.notes.join(' '), /no less than 15 mg\/kg \(1,050 mg\)/);
});

test('the loading dose: 3,000 mg ceiling, the 60-minute floor, and the range flag by population', () => {
  const big = vi({ ...adult, population: 'obese-adult', weight: 150, crcl: 140, loadPerKg: 30 }, now);
  assert.deepEqual([big.loadingDose, big.loadingCapped, big.infusionMinutes], [3000, true, 300]);
  assert.match(big.flags.join(' '), /outside the guideline's 20 to 25 mg\/kg for obese adults/);
  assert.equal(vi({ ...adult, weight: 40, crcl: 30, loadPerKg: 12 }, now).infusionMinutes, 60);
  assert.match(vi({ ...adult, loadPerKg: 15 }, now).flags[0], /outside the guideline's 20 to 35/);
  assert.match(vi({ ...adult, targetAuc: 700 }, now).flags[0], /outside the guideline's 400 to 600/);
});

test('Rodvold standardizes the clearance to 70 kg; obese estimates above 4,000 and 4,500 mg/day are flagged', () => {
  const r = vi({ ...adult, population: 'obese-adult', weight: 150, crcl: 140, loadPerKg: 20 }, now);
  // 140 x 70 / 150 = 65.33; 0.227 x 65.33 + 5.67 = 20.5 mg/kg x 150.
  assert.deepEqual([r.rodvoldDailyDose, r.matzkeDailyDose, r.labelTableDose], [3075, 3004, 1545]);
  assert.deepEqual(r.flags, []);
  assert.match(r.notes.join(' '), /table stops at 100 mL\/min/);
  const high = vi({ ...adult, population: 'obese-adult', weight: 150, crcl: 220, loadPerKg: 20 }, now);
  assert.match(high.flags.join(' '), /above 4,500 mg\/day.*exceed 4,000 mg\/day/);
});

test('the label table is read at the row at or below; below 10 mL/min the anephric sentence is printed', () => {
  assert.deepEqual([100, 95, 90, 45, 10].map((crcl) => vi({ ...adult, crcl }, now).labelTableDose), [1545, 1390, 1390, 620, 155]);
  assert.match(vi({ ...adult, crcl: 95 }, now).notes.join(' '), /this tool's rule/);
  const low = vi({ ...adult, crcl: 5 }, now);
  assert.equal(low.labelTableDose, undefined);
  assert.match(low.notes.join(' '), /not valid for functionally anephric patients.*1\.9 mg\/kg\/24 h \(133 mg\/24 h\)/);
});

test('children: the daily dose against the guideline by age', () => {
  const r = vi({ population: 'child', weight: 25, ageYears: 8, dailyPerKg: 70 }, now);
  assert.deepEqual([r.dailyDose, r.doseEvery6h, r.flags.length], [1750, 437.5, 0]);
  const teen = vi({ population: 'child', weight: 60, ageYears: 14, dailyPerKg: 80, loadPerKg: 20 }, now);
  assert.deepEqual([teen.dailyDose, teen.loadingDose], [4800, 1200]);
  assert.match(teen.flags.join(' '), /outside the guideline's 60 to 70.*above the guideline's usual maximum empiric daily dose of 3,600 mg.*early monitoring/);
  assert.match(vi({ population: 'child', weight: 20, ageYears: 5, dailyPerKg: 100 }, now).flags[0], /100 mg\/kg\/day or more should be avoided/);
  assert.match(vi({ population: 'child', weight: 48, ageYears: 11, dailyPerKg: 70 }, now).flags[0], /most children should not need/);
  assert.equal(vi({ population: 'child', weight: 25, dailyPerKg: 70 }, now).valid, false);
  assert.equal(vi({ population: 'child', weight: 25, ageYears: 8 }, now).valid, false);
});

test('neonates: the label\'s 15 mg/kg, then 10 mg/kg every 12 or 8 hours', () => {
  const first = vi({ population: 'neonate', weight: 3, week: 'first' }, now);
  assert.deepEqual([first.initialDose, first.maintenanceDose, first.intervalHours], [45, 30, 12]);
  assert.equal(vi({ population: 'neonate', weight: 3, week: 'later' }, now).intervalHours, 8);
  assert.match(first.notes.join(' '), /10 to 20 mg\/kg every 8 to 48 hours/);
  assert.match(vi({ population: 'neonate', weight: 3 }, now).message, /first week of life/);
});

test('nothing is defaulted', () => {
  assert.match(vi({}, now).message, /Choose the population/);
  assert.match(vi({ ...adult, targetAuc: '' }, now).message, /Enter the target AUC24/);
  for (const k of ['weight', 'crcl', 'loadPerKg']) assert.equal(vi({ ...adult, [k]: '' }, now).valid, false, k);
  assert.match(vi({ ...adult, weight: 20 }, now).message, /below 30 kg/);
});

test('fail closed: a superseded label withholds its table and the neonatal doses, not the equations', () => {
  const table = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  const r = vi(adult, now, table);
  assert.deepEqual([r.valid, r.labelWithheld, r.labelTableDose, r.matzkeDailyDose], [true, true, undefined, 2177]);
  assert.match(r.band, /the label table is withheld/);
  const neo = vi({ population: 'neonate', weight: 3, week: 'first' }, now, table);
  assert.deepEqual([neo.withheld, neo.initialDose], [true, undefined]);
});
