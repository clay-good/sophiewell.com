// spec-v62 §3 Part B (wave 1) + §4 Part C unit tests. Each tile gets >=3
// boundary worked examples including the zero-denominator / impossible-input
// fallback (which must throw TypeError/RangeError, caught by the renderer's
// safe() wrapper, never a NaN/Infinity leak).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../lib/clinical-v8.js';

// --- infusion-time-remaining ------------------------------------------------
test('infusionTimeRemaining: 250 mL at 100 mL/hr -> 2.5 h / 150 min', () => {
  const r = C.infusionTimeRemaining({ volumeMl: 250, rateMlHr: 100 });
  assert.equal(r.hoursToEmpty, 2.5);
  assert.equal(r.minutesToEmpty, 150);
});
test('infusionTimeRemaining: 1000 mL at 125 mL/hr -> 8 h', () => {
  assert.equal(C.infusionTimeRemaining({ volumeMl: 1000, rateMlHr: 125 }).hoursToEmpty, 8);
});
test('infusionTimeRemaining: zero rate throws (no divide-by-zero leak)', () => {
  assert.throws(() => C.infusionTimeRemaining({ volumeMl: 250, rateMlHr: 0 }), RangeError);
  assert.throws(() => C.infusionTimeRemaining({ volumeMl: 250, rateMlHr: NaN }), TypeError);
});
test('infusionRateToLast: 500 mL over 8 h -> 62.5 mL/hr; 0 h throws', () => {
  assert.equal(C.infusionRateToLast({ volumeMl: 500, hours: 8 }).rateMlHr, 62.5);
  assert.throws(() => C.infusionRateToLast({ volumeMl: 500, hours: 0 }), RangeError);
});

// --- enteral-free-water -----------------------------------------------------
test('enteralFreeWater: 1200 mL/day at 84% FW, goal 1500 -> 1008 formula / 492 flush / 123 q6h', () => {
  const r = C.enteralFreeWater({ dailyVolumeMl: 1200, freeWaterPct: 84, goalMl: 1500 });
  assert.equal(r.freeWaterFromFormulaMl, 1008);
  assert.equal(r.additionalFlushMl, 492);
  assert.equal(r.flushPerShiftMlQ6h, 123);
});
test('enteralFreeWater: formula already exceeds goal -> flush clamps to 0', () => {
  const r = C.enteralFreeWater({ dailyVolumeMl: 2000, freeWaterPct: 80, goalMl: 1000 });
  assert.equal(r.additionalFlushMl, 0);
});
test('enteralFreeWater: impossible fraction throws', () => {
  assert.throws(() => C.enteralFreeWater({ dailyVolumeMl: 1200, freeWaterPct: 150, goalMl: 1500 }), RangeError);
  assert.throws(() => C.enteralFreeWater({ dailyVolumeMl: NaN, freeWaterPct: 84, goalMl: 1500 }), TypeError);
});

// --- apap-24h-max -----------------------------------------------------------
test('apapSourceTotal: 650 mg x 4/day -> 2600 mg', () => {
  assert.equal(C.apapSourceTotal({ doseMg: 650, dosesPerDay: 4 }).totalMg, 2600);
});
test('apapCeilingCheck: 3900 vs 4000 -> under, 100 remaining, 97.5%', () => {
  const r = C.apapCeilingCheck({ totalMg: 3900, ceilingMg: 4000 });
  assert.equal(r.over, false);
  assert.equal(r.remainingMg, 100);
  assert.equal(r.pctOfCeiling, 97.5);
});
test('apapCeilingCheck: 4500 vs 4000 -> over', () => {
  assert.equal(C.apapCeilingCheck({ totalMg: 4500, ceilingMg: 4000 }).over, true);
});
test('apapCeilingCheck: zero ceiling throws', () => {
  assert.throws(() => C.apapCeilingCheck({ totalMg: 100, ceilingMg: 0 }), RangeError);
});

// --- icu-nutrition-target ---------------------------------------------------
test('icuNutritionTarget: 70 kg @ 25-30 kcal/kg, 1.2-2.0 g/kg -> 1750-2100 kcal; 84-140 g', () => {
  const r = C.icuNutritionTarget({ weightKg: 70, kcalLow: 25, kcalHigh: 30, proteinLow: 1.2, proteinHigh: 2.0 });
  assert.equal(r.energyLowKcal, 1750);
  assert.equal(r.energyHighKcal, 2100);
  assert.equal(r.proteinLowG, 84);
  assert.equal(r.proteinHighG, 140);
});
test('icuNutritionTarget: 50 kg @ 25-30 -> 1250-1500 kcal', () => {
  const r = C.icuNutritionTarget({ weightKg: 50, kcalLow: 25, kcalHigh: 30, proteinLow: 1.2, proteinHigh: 2.0 });
  assert.equal(r.energyLowKcal, 1250);
  assert.equal(r.energyHighKcal, 1500);
});
test('icuNutritionTarget: zero weight throws', () => {
  assert.throws(() => C.icuNutritionTarget({ weightKg: 0, kcalLow: 25, kcalHigh: 30, proteinLow: 1.2, proteinHigh: 2 }), RangeError);
});

// --- neonatal-feeding-volume ------------------------------------------------
test('neonatalFeedingVolume: 3.2 kg @ 150 mL/kg/day, q3h (8 feeds) -> 480/day, 60/feed', () => {
  const r = C.neonatalFeedingVolume({ weightKg: 3.2, mlPerKgDay: 150, feedsPerDay: 8 });
  assert.equal(r.dailyMl, 480);
  assert.equal(r.perFeedMl, 60);
});
test('neonatalFeedingVolume: 2 kg @ 120, q2h (12) -> 240/day, 20/feed', () => {
  const r = C.neonatalFeedingVolume({ weightKg: 2, mlPerKgDay: 120, feedsPerDay: 12 });
  assert.equal(r.dailyMl, 240);
  assert.equal(r.perFeedMl, 20);
});
test('neonatalFeedingVolume: adult-weight entry rejected (neonate envelope)', () => {
  assert.throws(() => C.neonatalFeedingVolume({ weightKg: 70, mlPerKgDay: 150, feedsPerDay: 8 }), RangeError);
  assert.throws(() => C.neonatalFeedingVolume({ weightKg: 3, mlPerKgDay: 150, feedsPerDay: 0 }), RangeError);
});

// --- vte-prophylaxis-dose ---------------------------------------------------
test('enoxaparinDose: prophylaxis, normal renal -> 40 mg q24h', () => {
  const r = C.enoxaparinDose({ weightKg: 80, crcl: 80, indication: 'prophylaxis', regimen: '' });
  assert.equal(r.doseMg, 40);
  assert.equal(r.interval, 'q24h');
  assert.equal(r.renalAdjusted, false);
});
test('enoxaparinDose: prophylaxis, CrCl <30 -> 30 mg q24h', () => {
  const r = C.enoxaparinDose({ weightKg: 80, crcl: 20, indication: 'prophylaxis', regimen: '' });
  assert.equal(r.doseMg, 30);
  assert.equal(r.renalAdjusted, true);
});
test('enoxaparinDose: treatment q12h, 80 kg -> 80 mg q12h', () => {
  const r = C.enoxaparinDose({ weightKg: 80, crcl: 80, indication: 'treatment', regimen: 'q12' });
  assert.equal(r.doseMg, 80);
  assert.equal(r.interval, 'q12h');
});
test('enoxaparinDose: treatment daily, 80 kg -> 120 mg q24h; CrCl <30 -> 80 mg q24h', () => {
  assert.equal(C.enoxaparinDose({ weightKg: 80, crcl: 80, indication: 'treatment', regimen: 'daily' }).doseMg, 120);
  const renal = C.enoxaparinDose({ weightKg: 80, crcl: 20, indication: 'treatment', regimen: 'daily' });
  assert.equal(renal.doseMg, 80);
  assert.equal(renal.interval, 'q24h');
});
test('enoxaparinDose: unknown indication -> null; bad weight throws', () => {
  assert.equal(C.enoxaparinDose({ weightKg: 80, crcl: 80, indication: 'x', regimen: '' }), null);
  assert.throws(() => C.enoxaparinDose({ weightKg: 0, crcl: 80, indication: 'treatment', regimen: 'q12' }), RangeError);
});

// --- oxytocin-titration -----------------------------------------------------
test('oxytocinConvert: 60 mU/mL, 6 mU/min -> 6 mL/hr; 12 mL/hr -> 12 mU/min', () => {
  const r = C.oxytocinConvert({ milliunitsPerMl: 60, doseMilliunitsMin: 6, rateMlHr: 12 });
  assert.equal(r.rateFromDoseMlHr, 6);
  assert.equal(r.doseFromRateMuMin, 12);
});
test('oxytocinConvert: 20 mU/mL, 2 mU/min -> 6 mL/hr', () => {
  assert.equal(C.oxytocinConvert({ milliunitsPerMl: 20, doseMilliunitsMin: 2, rateMlHr: 0 }).rateFromDoseMlHr, 6);
});
test('oxytocinConvert: zero concentration throws', () => {
  assert.throws(() => C.oxytocinConvert({ milliunitsPerMl: 0, doseMilliunitsMin: 6, rateMlHr: 12 }), RangeError);
});

// --- peds-dose (converted) --------------------------------------------------
test('pedsDosePanel: 20 kg -> acetaminophen 200-300 mg, dexamethasone 12 mg', () => {
  const r = C.pedsDosePanel({ weightKg: 20 });
  const apap = r.rows.find((x) => x.drug.startsWith('Acetaminophen'));
  assert.equal(apap.lowMg, 200);
  assert.equal(apap.highMg, 300);
  assert.equal(apap.capped, false);
  const dex = r.rows.find((x) => x.drug.startsWith('Dexamethasone'));
  assert.equal(dex.lowMg, 12);
});
test('pedsDosePanel: 80 kg -> acetaminophen caps at 1000 mg single', () => {
  const r = C.pedsDosePanel({ weightKg: 80 });
  const apap = r.rows.find((x) => x.drug.startsWith('Acetaminophen'));
  assert.equal(apap.highMg, 1000);
  assert.equal(apap.capped, true);
});
test('pedsDosePanel: impossible weight throws', () => {
  assert.throws(() => C.pedsDosePanel({ weightKg: 0 }), RangeError);
  assert.throws(() => C.pedsDosePanel({ weightKg: NaN }), TypeError);
});

// --- anticoag-reversal (converted) ------------------------------------------
test('anticoagReversalDose: warfarin 80 kg INR 5 -> 4F-PCC 35 u/kg = 2800 units', () => {
  const r = C.anticoagReversalDose({ weightKg: 80, inr: 5, agent: 'warfarin' });
  assert.equal(r.unitsPerKg, 35);
  assert.equal(r.units, 2800);
  assert.equal(r.capped, false);
});
test('anticoagReversalDose: warfarin 120 kg INR 8 -> dosing weight capped at 100 kg, 5000 max', () => {
  const r = C.anticoagReversalDose({ weightKg: 120, inr: 8, agent: 'warfarin' });
  assert.equal(r.units, 5000);
  assert.equal(r.capped, true);
});
test('anticoagReversalDose: dabigatran -> idarucizumab fixed 5 g; unknown agent -> null', () => {
  assert.equal(C.anticoagReversalDose({ weightKg: 80, inr: 1, agent: 'dabigatran' }).doseG, 5);
  assert.equal(C.anticoagReversalDose({ weightKg: 80, inr: 1, agent: 'zzz' }), null);
});
test('anticoagReversalDose: bad weight throws', () => {
  assert.throws(() => C.anticoagReversalDose({ weightKg: 0, inr: 5, agent: 'warfarin' }), RangeError);
});
test('protamineDose: 4000 units -> 40 mg; 6000 units -> caps at 50 mg', () => {
  assert.equal(C.protamineDose({ heparinUnits: 4000 }).protamineMg, 40);
  const big = C.protamineDose({ heparinUnits: 6000 });
  assert.equal(big.protamineMg, 50);
  assert.equal(big.capped, true);
});
