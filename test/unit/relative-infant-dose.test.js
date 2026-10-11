// spec-v1634 tool 8: relative infant dose (FDA draft guidance, May 2019).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeInfantDose as d } from '../../lib/relative-infant-dose-v1634.js';

test('from a milk concentration, at 150 and 200 mL/kg a day', () => {
  // 100 ng/mL = 0.1 mg/L; x 0.15 L/kg/day = 0.015 mg/kg/day; maternal 100 mg / 60 kg.
  const r = d({ milkConcentration: 100, unit: 'ng-ml', maternalDose: 100, maternalWeight: 60 });
  assert.equal(r.infantDosageMgKgDay, 0.015);
  assert.ok(Math.abs(r.relativeInfantDosePercent - 0.9) < 1e-9);
  assert.equal(r.infantDosageAt200, 0.02);
  assert.ok(Math.abs(r.relativeInfantDoseAt200 - 1.2) < 1e-9);
});

test('the units convert explicitly', () => {
  const base = { maternalDose: 100, maternalWeight: 60 };
  const a = d({ ...base, milkConcentration: 100, unit: 'ng-ml' }).infantDosageMgKgDay;
  assert.equal(d({ ...base, milkConcentration: 100, unit: 'mcg-l' }).infantDosageMgKgDay, a);
  assert.equal(d({ ...base, milkConcentration: 0.1, unit: 'mcg-ml' }).infantDosageMgKgDay, a);
  assert.equal(d({ ...base, milkConcentration: 0.1, unit: 'mg-l' }).infantDosageMgKgDay, a);
});

test('from a milk-plasma ratio, with the approved-dose comparison', () => {
  const r = d({ mpRatio: 0.5, plasmaConcentration: 2, unit: 'mg-l', maternalDose: 500, maternalWeight: 70, approvedInfantDose: 10 });
  assert.equal(r.milkConcentrationMgL, 1);
  assert.equal(r.infantDosageMgKgDay, 0.15);
  assert.ok(Math.abs(r.relativeInfantDosePercent - 2.1) < 1e-9);
  assert.equal(r.percentOfApprovedDose, 1.5);
  assert.match(r.notes.join(' '), /not a single time point/);
  assert.equal(d({ milkConcentration: 1, unit: 'mg-l', maternalDose: 500, maternalWeight: 70 }).percentOfApprovedDose, undefined);
});

test('no cutoff is applied or quoted', () => {
  const r = d({ milkConcentration: 50, unit: 'mg-l', maternalDose: 100, maternalWeight: 60 });
  assert.equal(r.abnormal, false);
  assert.match(r.note, /no cutoff/);
  assert.doesNotMatch(JSON.stringify(r), /10%|acceptable|compatible/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the average milk concentration, or/);
  assert.match(d({ milkConcentration: 1, mpRatio: 1, unit: 'mg-l', maternalDose: 1, maternalWeight: 60 }).message, /not both/);
  assert.match(d({ milkConcentration: 1, maternalDose: 1, maternalWeight: 60 }).message, /^Choose the concentration unit/);
  assert.match(d({ mpRatio: 0.5, unit: 'mg-l', maternalDose: 1, maternalWeight: 60 }).message, /^Enter the average maternal plasma concentration/);
  assert.match(d({ milkConcentration: 1, unit: 'mg-l', maternalWeight: 60 }).message, /^Enter the maternal dose/);
  assert.match(d({ milkConcentration: 1, unit: 'mg-l', maternalDose: 1 }).message, /^Enter the maternal weight/);
  assert.equal(d({ milkConcentration: 1, unit: 'mg-l', maternalDose: 1, maternalWeight: 5 }).valid, false);
  assert.equal(d({ milkConcentration: 0, unit: 'mg-l', maternalDose: 1, maternalWeight: 60 }).valid, false);
  assert.equal(d(null).valid, false);
});
