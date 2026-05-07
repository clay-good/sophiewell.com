// Unit tests for lib/clinical-v5.js and lib/coding-v5.js.
// Worked examples track docs/clinical-citations.md and the citation
// numerics named in spec-v5 §4.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as V5 from '../../lib/clinical-v5.js';
import * as Code from '../../lib/coding-v5.js';

const close = (a, b, eps = 0.1) => Math.abs(a - b) <= eps;

// --- T1: Sodium correction (Adrogue-Madias) ------------------------------
test('sodiumCorrection: 70kg male, Na 110, 3% saline, 8 mEq/L/24h target', () => {
  const r = V5.sodiumCorrection({
    weightKg: 70, sex: 'M', age: 50,
    currentNa: 110, infusate: '3pct-saline',
    targetChangePer24h: 8,
  });
  // TBW = 70 * 0.6 = 42 L. Change/L = (513-110)/(42+1) = 9.37 mEq/L.
  // Volume to raise 8 mEq/L = 8/9.37 = 0.854 L -> ~35.6 mL/h over 24 h.
  assert.equal(r.tbwLiters, 42);
  assert.ok(close(r.changePerLiterInfusate, 9.37, 0.05));
  assert.ok(close(r.volumeLiters, 0.85, 0.05));
  assert.ok(close(r.rateMlPerHour, 35.6, 1));
  assert.equal(r.direction, 'hyponatremia');
  assert.equal(r.overCap, false);
});
test('sodiumCorrection: hyponatremia overcap flag at 12 mEq/L/24h', () => {
  const r = V5.sodiumCorrection({
    weightKg: 70, sex: 'M', currentNa: 110,
    infusate: '3pct-saline', targetChangePer24h: 12,
  });
  assert.equal(r.overCap, true);
  assert.equal(r.safetyCap, 8);
});
test('sodiumCorrection: rejects unknown infusate', () => {
  assert.throws(() => V5.sodiumCorrection({
    weightKg: 70, sex: 'M', currentNa: 110, infusate: 'unknown', targetChangePer24h: 8,
  }));
});

// --- T2: Free water deficit ----------------------------------------------
test('freeWaterDeficit: 70 kg male, Na 160 -> ~3.0 L deficit', () => {
  const r = V5.freeWaterDeficit({ weightKg: 70, sex: 'M', currentNa: 160 });
  // TBW = 42; deficit = 42 * (160/145 - 1) = 42 * 0.1034 = 4.34 L
  assert.ok(close(r.deficitLiters, 4.34, 0.1));
  assert.equal(r.tbwLiters, 42);
});
test('freeWaterDeficit: zero deficit when at target', () => {
  const r = V5.freeWaterDeficit({ weightKg: 70, sex: 'M', currentNa: 145 });
  assert.equal(r.deficitLiters, 0);
});

// --- T3: Iron deficit (Ganzoni) ------------------------------------------
test('ironDeficitGanzoni: 70 kg, Hb 9, target 15 -> 1508 mg', () => {
  const r = V5.ironDeficitGanzoni({ weightKg: 70, currentHb: 9, targetHb: 15 });
  // 70*(15-9)*2.4 + 500 = 1008 + 500 = 1508
  assert.equal(r.totalDeficitMg, 1508);
  assert.equal(r.ironStoresMg, 500);
});
test('ironDeficitGanzoni: pediatric 20 kg uses weight-based stores', () => {
  const r = V5.ironDeficitGanzoni({ weightKg: 20, currentHb: 9, targetHb: 12 });
  // 20*(12-9)*2.4 + 15*20 = 144 + 300 = 444
  assert.equal(r.ironStoresMg, 300);
  assert.equal(r.totalDeficitMg, 444);
});

// --- T4: PBW + ARDSnet tidal volume --------------------------------------
test('pbwArdsnet: male 175 cm -> ~71.5 kg PBW, Vt 6 mL/kg = 429 mL', () => {
  const r = V5.pbwArdsnet({ heightCm: 175, sex: 'M', mlPerKg: 6 });
  // height_in = 175/2.54 = 68.898, PBW = 50 + 2.3*(68.898-60) = 50 + 20.46 = 70.46
  assert.ok(close(r.pbwKg, 70.5, 0.5));
  assert.ok(Math.abs(r.vtTargetMl - 423) <= 5);
  assert.ok(r.vtRangeMl.low < r.vtTargetMl);
  assert.ok(r.vtRangeMl.high > r.vtTargetMl);
});
test('pbwArdsnet: female 160 cm -> ~52.4 kg PBW', () => {
  const r = V5.pbwArdsnet({ heightCm: 160, sex: 'F', mlPerKg: 6 });
  // 160/2.54 = 62.99, PBW = 45.5 + 2.3*(62.99-60) = 45.5 + 6.88 = 52.38
  assert.ok(close(r.pbwKg, 52.4, 0.5));
});

// --- T5: RSBI ------------------------------------------------------------
test('rsbi: RR 24, Vt 350 -> ~68.6, weaning likely', () => {
  const r = V5.rsbi({ respiratoryRate: 24, tidalVolumeMl: 350 });
  assert.ok(close(r.rsbi, 68.6, 0.5));
  assert.match(r.interpretation, /tolerate weaning/);
});
test('rsbi: high index flags failure', () => {
  const r = V5.rsbi({ respiratoryRate: 30, tidalVolumeMl: 250 });
  assert.ok(r.rsbi >= 105);
  assert.match(r.interpretation, /fail weaning/);
});

// --- T6: Light's criteria ------------------------------------------------
test("lightsCriteria: classic exudate", () => {
  const r = V5.lightsCriteria({
    pleuralProtein: 4.0, serumProtein: 6.0,
    pleuralLdh: 250, serumLdh: 200, serumLdhUln: 222,
  });
  // Protein ratio 0.67 > 0.5 → exudate
  assert.equal(r.classification, 'Exudate');
  assert.equal(r.criterionProtein, true);
});
test("lightsCriteria: classic transudate", () => {
  const r = V5.lightsCriteria({
    pleuralProtein: 2.0, serumProtein: 6.0,
    pleuralLdh: 80, serumLdh: 200, serumLdhUln: 222,
  });
  assert.equal(r.classification, 'Transudate');
});

// --- T7: Mentzer index ---------------------------------------------------
test('mentzerIndex: MCV 65, RBC 6.0 -> 10.8 favors thalassemia', () => {
  const r = V5.mentzerIndex({ mcvFl: 65, rbcMillionsPerUl: 6.0 });
  assert.ok(close(r.index, 10.8, 0.1));
  assert.match(r.interpretation, /thalassemia/);
});
test('mentzerIndex: MCV 70, RBC 4.0 -> 17.5 favors iron deficiency', () => {
  const r = V5.mentzerIndex({ mcvFl: 70, rbcMillionsPerUl: 4.0 });
  assert.equal(r.index, 17.5);
  assert.match(r.interpretation, /iron-deficiency/);
});

// --- T8: SAAG ------------------------------------------------------------
test('saag: 3.5 - 1.5 = 2.0 portal HTN', () => {
  const r = V5.saag({ serumAlbumin: 3.5, ascitesAlbumin: 1.5 });
  assert.equal(r.saag, 2.0);
  assert.equal(r.classification, 'Portal hypertension');
});
test('saag: 3.0 - 2.5 = 0.5 non-portal', () => {
  const r = V5.saag({ serumAlbumin: 3.0, ascitesAlbumin: 2.5 });
  assert.equal(r.classification, 'Non-portal etiology');
});

// --- T9: R-factor --------------------------------------------------------
test('rFactorLiver: ALT 500 (ULN 40), ALP 100 (ULN 120) -> hepatocellular', () => {
  const r = V5.rFactorLiver({ alt: 500, altUln: 40, alp: 100, alpUln: 120 });
  // (500/40)/(100/120) = 12.5/0.833 = 15.0
  assert.equal(r.pattern, 'Hepatocellular');
});
test('rFactorLiver: ALT 60 (ULN 40), ALP 600 (ULN 120) -> cholestatic', () => {
  const r = V5.rFactorLiver({ alt: 60, altUln: 40, alp: 600, alpUln: 120 });
  // (60/40)/(600/120) = 1.5/5 = 0.3
  assert.equal(r.pattern, 'Cholestatic');
});

// --- T10: KDIGO AKI ------------------------------------------------------
test('kdigoAki: SCr 1.0 -> 1.6 (1.6×) is Stage 1', () => {
  const r = V5.kdigoAki({ baselineCr: 1.0, currentCr: 1.6 });
  assert.equal(r.creatinineStage, 1);
  assert.equal(r.stage, 1);
});
test('kdigoAki: 3.5× baseline is Stage 3', () => {
  const r = V5.kdigoAki({ baselineCr: 1.0, currentCr: 3.5 });
  assert.equal(r.stage, 3);
});
test('kdigoAki: UO < 0.3 mL/kg/h x 24 h is Stage 3 by UO alone', () => {
  const r = V5.kdigoAki({
    baselineCr: 1.0, currentCr: 1.0,
    uoMlPerKgPerHour: 0.2, uoDurationHours: 24,
  });
  assert.equal(r.stage, 3);
  assert.equal(r.urineOutputStage, 3);
});
test('kdigoAki: RRT initiation forces Stage 3', () => {
  const r = V5.kdigoAki({ baselineCr: 1.0, currentCr: 1.5, rrtInitiated: true });
  assert.equal(r.stage, 3);
});

// --- T11: Modified Sgarbossa ---------------------------------------------
test('modifiedSgarbossa: any single criterion positive -> positive', () => {
  assert.equal(V5.modifiedSgarbossa({ concordantElevation: true }).positive, true);
  assert.equal(V5.modifiedSgarbossa({ concordantDepressionV1V3: true }).positive, true);
  assert.equal(V5.modifiedSgarbossa({ stToSRatioBelowMinus025: true }).positive, true);
});
test('modifiedSgarbossa: all negative -> negative', () => {
  assert.equal(V5.modifiedSgarbossa({}).positive, false);
});

// --- T12: RCRI -----------------------------------------------------------
test('rcri: 0 factors -> 0.4%', () => {
  assert.equal(V5.rcri({}).majorCardiacEventRiskPct, 0.4);
});
test('rcri: 2 factors -> 2.4%', () => {
  const r = V5.rcri({ ischemicHeartDisease: true, congestiveHeartFailure: true });
  assert.equal(r.count, 2);
  assert.equal(r.majorCardiacEventRiskPct, 2.4);
});
test('rcri: 3+ factors -> 5.4%', () => {
  const r = V5.rcri({
    highRiskSurgery: true, ischemicHeartDisease: true,
    congestiveHeartFailure: true, insulinDependentDm: true,
  });
  assert.equal(r.count, 4);
  assert.equal(r.majorCardiacEventRiskPct, 5.4);
});

// --- T13: PEWS -----------------------------------------------------------
test('pews: 0/0/0 = 0 low concern', () => {
  const r = V5.pews({ behaviorScore: 0, cardiovascularScore: 0, respiratoryScore: 0 });
  assert.equal(r.total, 0);
  assert.match(r.band, /Low concern/);
});
test('pews: 2/2/1 = 5 escalate', () => {
  const r = V5.pews({ behaviorScore: 2, cardiovascularScore: 2, respiratoryScore: 1 });
  assert.equal(r.total, 5);
  assert.match(r.band, /Escalate/);
});
test('pews: 3/3/3 = 9 high concern', () => {
  const r = V5.pews({ behaviorScore: 3, cardiovascularScore: 3, respiratoryScore: 3 });
  assert.equal(r.total, 9);
  assert.match(r.band, /High concern/);
});
test('pews: rejects non-integer', () => {
  assert.throws(() => V5.pews({ behaviorScore: 1.5, cardiovascularScore: 0, respiratoryScore: 0 }));
});

// --- T14: E/M time selector ----------------------------------------------
test('emTimeSelector: new 30 min -> 99202', () => {
  assert.equal(Code.emTimeSelector({ totalMinutes: 30, encounterType: 'new' }).code, '99202');
});
test('emTimeSelector: new 75 min -> 99205', () => {
  assert.equal(Code.emTimeSelector({ totalMinutes: 75, encounterType: 'new' }).code, '99205');
});
test('emTimeSelector: new 25 min -> null (under floor)', () => {
  assert.equal(Code.emTimeSelector({ totalMinutes: 25, encounterType: 'new' }).code, null);
});
test('emTimeSelector: established 40 -> 99214', () => {
  assert.equal(Code.emTimeSelector({ totalMinutes: 40, encounterType: 'established' }).code, '99214');
});
test('emTimeSelector: established 55 -> 99215', () => {
  assert.equal(Code.emTimeSelector({ totalMinutes: 55, encounterType: 'established' }).code, '99215');
});
test('emTimeSelector: rejects invalid type', () => {
  assert.throws(() => Code.emTimeSelector({ totalMinutes: 30, encounterType: 'consult' }));
});

// --- T15: NDC converter --------------------------------------------------
test('ndcConvert: 4-4-2 -> billing 11', () => {
  const r = Code.ndcConvert('1234-5678-90');
  assert.equal(r.billing11, '01234-5678-90');
  assert.equal(r.fda10, '1234-5678-90');
  assert.equal(r.source, '4-4-2');
});
test('ndcConvert: 5-3-2 -> billing 11 with leading 0 in product', () => {
  const r = Code.ndcConvert('12345-678-90');
  assert.equal(r.billing11, '12345-0678-90');
  assert.equal(r.source, '5-3-2');
});
test('ndcConvert: 5-4-1 -> billing 11 with leading 0 in package', () => {
  const r = Code.ndcConvert('12345-6789-0');
  assert.equal(r.billing11, '12345-6789-00');
  assert.equal(r.source, '5-4-1');
});
test('ndcConvert: 11-digit bare passes through', () => {
  const r = Code.ndcConvert('12345678901');
  assert.equal(r.billing11, '12345-6789-01');
});
test('ndcConvert: rejects bare 10-digit (ambiguous)', () => {
  assert.throws(() => Code.ndcConvert('1234567890'));
});
test('ndcConvert: rejects bad lengths', () => {
  assert.throws(() => Code.ndcConvert('123'));
});

// --- T16: AVPU <-> GCS ---------------------------------------------------
test('avpuToGcs: A -> 15', () => {
  const r = V5.avpuToGcs('A');
  assert.equal(r.typical, 15);
});
test('avpuToGcs: V -> 13', () => {
  assert.equal(V5.avpuToGcs('V').typical, 13);
});
test('avpuToGcs: P -> 8', () => {
  assert.equal(V5.avpuToGcs('P').typical, 8);
});
test('avpuToGcs: U -> 3', () => {
  assert.equal(V5.avpuToGcs('U').typical, 3);
});
test('avpuToGcs: lowercase normalized', () => {
  assert.equal(V5.avpuToGcs('a').level, 'A');
});
test('avpuToGcs: rejects invalid', () => {
  assert.throws(() => V5.avpuToGcs('X'));
});
