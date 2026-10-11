// spec-v1631 tool 3: vancomycin continuous infusion; the label's concentration limit is a label row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vancContinuousInfusion as ci, LABEL, GUIDE } from '../../lib/vanc-continuous-infusion-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const base = { weight: 70, loadPerKg: 20, dailyPerKg: 35, concentration: 5 };

test('the guideline\'s ranges and the label\'s concentrations', () => {
  assert.deepEqual([GUIDE.load, GUIDE.daily, GUIDE.dailyUpTo, GUIDE.css, GUIDE.auc, GUIDE.loadCap], [[15, 20], [30, 40], 60, [20, 25], [400, 600], 3000]);
  assert.deepEqual([LABEL.concentration, LABEL.restricted], [5, 10]);
  assert.equal(labelRow(LABEL.setId, now).answers, true);
});

test('doses and pump rates: 20 mg/kg load, 35 mg/kg/day at 5 mg/mL on 70 kg', () => {
  const r = ci(base, now);
  // 1,400 mg; 2,450 mg/day / 24 = 102.08 mg/h; / 5 = 20.42 mL/h.
  assert.deepEqual([r.loadingDose, r.dailyDose, r.rateMgPerHour, r.rateMlPerHour, r.abnormal], [1400, 2450, 102.1, 20.42, false]);
  assert.deepEqual(r.flags, []);
});

test('values outside the guideline or the label are flagged, never changed', () => {
  const r = ci({ ...base, loadPerKg: 25, dailyPerKg: 50, concentration: 8 }, now);
  assert.deepEqual([r.loadingDose, r.dailyDose], [1750, 3500]);
  assert.equal(r.flags.length, 3);
  assert.match(r.flags.join(' '), /outside the guideline's 15 to 20.*within its "up to 60".*above the label's 5 mg\/mL/);
  assert.match(ci({ ...base, dailyPerKg: 70 }, now).flags[0], /above the guideline's 30 to 40 mg\/kg\/day \(up to 60\)/);
  assert.match(ci({ ...base, dailyPerKg: 20 }, now).flags[0], /below the guideline's 30 to 40/);
  assert.match(ci({ ...base, concentration: 12 }, now).flags[0], /above the 10 mg\/mL the label allows even for fluid restriction/);
  const big = ci({ ...base, weight: 200 }, now);
  assert.deepEqual([big.loadingDose, big.loadingCapped], [3000, true]);
});

test('with a level: AUC24 = level x 24, and the new rate by proportion', () => {
  const r = ci({ ...base, level: 30, currentRate: 145, targetCss: 22 }, now);
  // 30 x 24 = 720; 145 x 22 / 30 = 106.33 mg/h; / 5 = 21.27 mL/h.
  assert.deepEqual([r.auc24, r.aucAgainst, r.newRateMgPerHour, r.newRateMlPerHour, r.abnormal], [720, 'above', 106.3, 21.27, true]);
  assert.match(r.notes.join(' '), /assumes clearance has not changed/);
  assert.equal(ci({ ...base, level: 20, currentRate: 100, targetCss: 20 }, now).aucAgainst, 'within');
  assert.match(ci({ ...base, level: 20, currentRate: 100, targetCss: 30 }, now).flags[0], /outside the guideline's 20 to 25 mg\/L/);
});

test('a level, a rate and a target go together', () => {
  assert.match(ci({ ...base, level: 30 }, now).message, /current infusion rate/);
  assert.match(ci({ ...base, level: 30, currentRate: 100 }, now).message, /target steady-state level/);
  assert.match(ci({ ...base, currentRate: 100 }, now).message, /measured steady-state level/);
});

test('nothing is defaulted', () => {
  for (const k of Object.keys(base)) assert.equal(ci({ ...base, [k]: '' }, now).valid, false, k);
  assert.equal(ci({ ...base, concentration: 0 }, now).valid, false);
});

test('fail closed: a superseded label withholds the concentration check and keeps the arithmetic', () => {
  const table = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  const r = ci({ ...base, concentration: 8 }, now, table);
  assert.deepEqual([r.valid, r.labelWithheld, r.rateMgPerHour, r.flags.length], [true, true, 102.1, 0]);
  assert.match(r.notes.join(' '), /concentration limit is withheld/);
  assert.match(r.labelUrl, /setid=00946db3/);
});
