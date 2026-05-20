import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insulinCorrection } from '../../lib/scoring-v4.js';

test('insulin-correction: ISF provided directly; BG above target', () => {
  const r = insulinCorrection({ currentBG: 250, targetBG: 150, isf: 50 });
  // (250-150)/50 = 2 U correction; no carbs.
  assert.equal(r.correctionUnits, 2);
  assert.equal(r.mealUnits, 0);
  assert.equal(r.totalUnits, 2);
});

test('insulin-correction: BG at or below target -> zero correction', () => {
  const r = insulinCorrection({ currentBG: 120, targetBG: 150, isf: 50 });
  assert.equal(r.correctionUnits, 0);
});

test('insulin-correction: ISF derived from TDD with 1800-rule', () => {
  const r = insulinCorrection({ currentBG: 250, targetBG: 150, totalDailyDose: 50, isfRule: 'rapid' });
  // ISF = 1800/50 = 36; correction = 100/36 = 2.78 -> 2.8.
  assert.equal(r.isf, 36);
  assert.ok(r.isfDerivedFromTdd);
  assert.equal(r.correctionUnits, 2.8);
});

test('insulin-correction: ISF derived from TDD with 1500-rule (regular)', () => {
  const r = insulinCorrection({ currentBG: 200, targetBG: 100, totalDailyDose: 50, isfRule: 'regular' });
  // ISF = 1500/50 = 30; correction = 100/30 = 3.33 -> 3.3.
  assert.equal(r.isf, 30);
  assert.equal(r.correctionUnits, 3.3);
});

test('insulin-correction: meal coverage via carbs/ICR adds to total', () => {
  const r = insulinCorrection({ currentBG: 150, targetBG: 150, isf: 50, carbs: 60, icr: 10 });
  assert.equal(r.mealUnits, 6);
  assert.equal(r.totalUnits, 6);
});

test('insulin-correction: requires currentBG and targetBG', () => {
  assert.throws(() => insulinCorrection({ targetBG: 150, isf: 50 }));
  assert.throws(() => insulinCorrection({ currentBG: 200, isf: 50 }));
});

test('insulin-correction: requires ISF or TDD', () => {
  assert.throws(() => insulinCorrection({ currentBG: 250, targetBG: 150 }));
});
