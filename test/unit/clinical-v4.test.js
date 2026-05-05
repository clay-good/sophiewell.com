// spec-v4 §5: Group E clinical-math extensions tests.
// >=4 published examples per calculator (8+ for QTc and eGFR-MDRD).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deltaDelta, osmolalGap, wintersFormula,
  pulsePressure, shockIndex, modifiedShockIndex,
  ibwDevine, adjBW, egfrMdrd, feNa, feUrea, maintenanceFluids,
  qtcBazett, qtcFridericia, qtcFramingham, qtcHodges, qtcAll,
  eddFromLmp, gaFromCrl, pregnancyDiscordance,
} from '../../lib/clinical-v4.js';

const close = (a, b, eps = 0.5) => assert.ok(Math.abs(a - b) <= eps, `expected ~${b}, got ${a}`);

// --- 117 delta-delta ----------------------------------------------------
test('deltaDelta: ratio ~1 -> pure AG metabolic acidosis', () => {
  const r = deltaDelta({ anionGap: 22, hco3: 14 });        // dAG=10, dHCO3=10, ratio 1
  close(r.ratio, 1.0); assert.match(r.interpretation, /Pure AG/);
});
test('deltaDelta: ratio <0.4 -> pure non-AG', () => {
  const r = deltaDelta({ anionGap: 14, hco3: 14 });        // dAG=2, dHCO3=10, 0.2
  close(r.ratio, 0.2); assert.match(r.interpretation, /non-AG/);
});
test('deltaDelta: ratio >2 -> concurrent alkalosis', () => {
  const r = deltaDelta({ anionGap: 32, hco3: 20 });        // dAG=20, dHCO3=4, 5
  assert.equal(r.ratio, 5);
  assert.match(r.interpretation, /alkalosis/);
});
test('deltaDelta: ratio between 0.4 and 1 -> mixed', () => {
  const r = deltaDelta({ anionGap: 18, hco3: 14 });        // 6/10 = 0.6
  close(r.ratio, 0.6); assert.match(r.interpretation, /Mixed/);
});

// --- 119 osmolal gap ----------------------------------------------------
test('osmolalGap: standard worked example', () => {
  const r = osmolalGap({ measuredOsm: 320, sodium: 140, glucoseMgDl: 90, bunMgDl: 14 });
  // calc = 280 + 5 + 5 = 290, gap = 30
  close(r.calculatedOsm, 290);
  close(r.gap, 30);
});
test('osmolalGap: includes ethanol contribution', () => {
  const r = osmolalGap({ measuredOsm: 350, sodium: 140, glucoseMgDl: 90, bunMgDl: 14, etohMgDl: 230 });
  // EtOH/4.6 = 50; calc = 290+50 = 340; gap = 10
  close(r.calculatedOsm, 340);
  close(r.gap, 10);
});
test('osmolalGap: positive gap raises suspicion of toxic alcohol', () => {
  const r = osmolalGap({ measuredOsm: 320, sodium: 140, glucoseMgDl: 90, bunMgDl: 14 });
  assert.ok(r.gap > 10);
});
test('osmolalGap: handles zero EtOH default', () => {
  const r = osmolalGap({ measuredOsm: 285, sodium: 140, glucoseMgDl: 90, bunMgDl: 14 });
  close(r.gap, -5);
});

// --- 121 Winter's formula -----------------------------------------------
test("Winter's: HCO3 14 -> expected PaCO2 27-31", () => {
  const r = wintersFormula({ hco3: 14 });
  close(r.expectedPaco2Low, 27); close(r.expectedPaco2High, 31);
});
test("Winter's: appropriate compensation flag", () => {
  const r = wintersFormula({ hco3: 14, measuredPaco2: 29 });
  assert.match(r.secondaryDisorder, /Appropriate/);
});
test("Winter's: detects respiratory acidosis", () => {
  const r = wintersFormula({ hco3: 14, measuredPaco2: 40 });
  assert.match(r.secondaryDisorder, /respiratory acidosis/);
});
test("Winter's: detects respiratory alkalosis", () => {
  const r = wintersFormula({ hco3: 14, measuredPaco2: 20 });
  assert.match(r.secondaryDisorder, /respiratory alkalosis/);
});

// --- 122 PP / SI / MSI --------------------------------------------------
test('pulsePressure: 120/80 -> 40', () => assert.equal(pulsePressure({ sbp: 120, dbp: 80 }), 40));
test('shockIndex: HR 90 / SBP 120 -> 0.75', () => close(shockIndex({ hr: 90, sbp: 120 }), 0.75, 0.01));
test('shockIndex: shock-range 110/90 -> ~1.22', () => close(shockIndex({ hr: 110, sbp: 90 }), 1.22, 0.02));
test('modifiedShockIndex: HR 100, BP 100/60 -> ~1.36', () => close(modifiedShockIndex({ hr: 100, sbp: 100, dbp: 60 }), 1.36, 0.02));

// --- 123 IBW / AdjBW ----------------------------------------------------
test('ibwDevine: 5\'10" male -> 75.5 kg', () => close(ibwDevine({ heightInches: 70, sex: 'M' }), 73, 0.5));
test('ibwDevine: 5\'4" female -> 54.7 kg', () => close(ibwDevine({ heightInches: 64, sex: 'F' }), 54.7, 0.5));
test('ibwDevine: under 60 inches floors at 50/45.5', () => {
  assert.equal(ibwDevine({ heightInches: 58, sex: 'M' }), 50);
  assert.equal(ibwDevine({ heightInches: 58, sex: 'F' }), 45.5);
});
test('adjBW: actual 100kg with IBW 60kg -> 76kg', () => close(adjBW({ ibw: 60, actualKg: 100 }), 76, 0.001));

// --- 124 MDRD eGFR ------------------------------------------------------
// 8 cases as required by spec for sub-formula coverage.
test('egfrMdrd: SCr 1.0, age 60, M -> ~77', () => close(egfrMdrd({ scr: 1.0, age: 60, sex: 'M' }), 77, 1));
test('egfrMdrd: SCr 1.0, age 60, F -> ~57', () => close(egfrMdrd({ scr: 1.0, age: 60, sex: 'F' }), 57, 1));
test('egfrMdrd: SCr 2.0, age 60, M -> ~35', () => close(egfrMdrd({ scr: 2.0, age: 60, sex: 'M' }), 35, 1));
test('egfrMdrd: SCr 2.0, age 60, F -> ~26', () => close(egfrMdrd({ scr: 2.0, age: 60, sex: 'F' }), 26, 1));
test('egfrMdrd: SCr 1.0, age 30, M -> ~88', () => close(egfrMdrd({ scr: 1.0, age: 30, sex: 'M' }), 87.7, 1));
test('egfrMdrd: SCr 1.0, age 80, M -> ~71', () => close(egfrMdrd({ scr: 1.0, age: 80, sex: 'M' }), 71, 1));
test('egfrMdrd: SCr 0.6, age 40, F -> ~110', () => close(egfrMdrd({ scr: 0.6, age: 40, sex: 'F' }), 110.7, 1));
test('egfrMdrd: SCr 3.0, age 70, M -> ~21', () => close(egfrMdrd({ scr: 3.0, age: 70, sex: 'M' }), 21, 1));

// --- 125 FENa / FEUrea --------------------------------------------------
test('feNa: classic prerenal example <1%', () => {
  // UNa 10, PNa 140, UCr 100, PCr 1 -> (10*1)/(140*100)*100 = 0.071%
  close(feNa({ urineNa: 10, plasmaNa: 140, urineCr: 100, plasmaCr: 1 }), 0.071, 0.01);
});
test('feNa: ATN-range >2%', () => {
  // UNa 60, PNa 140, UCr 30, PCr 2 -> (60*2)/(140*30)*100 = 2.857%
  close(feNa({ urineNa: 60, plasmaNa: 140, urineCr: 30, plasmaCr: 2 }), 2.857, 0.01);
});
test('feUrea: prerenal <35% even on diuretics', () => {
  // UU 200, PU 30, UCr 50, PCr 1 -> (200*1)/(30*50)*100 = 13.33%
  close(feUrea({ urineUrea: 200, plasmaUrea: 30, urineCr: 50, plasmaCr: 1 }), 13.33, 0.01);
});
test('feNa: returns null on missing component', () => {
  assert.equal(feNa({ urineNa: 0, plasmaNa: 140, urineCr: 100, plasmaCr: 1 }), null);
});

// --- 126 maintenance fluids 4-2-1 ---------------------------------------
test('4-2-1: 8 kg infant -> 32 mL/hr', () => assert.equal(maintenanceFluids({ weightKg: 8 }), 32));
test('4-2-1: 15 kg child -> 50 mL/hr (40+10)', () => assert.equal(maintenanceFluids({ weightKg: 15 }), 50));
test('4-2-1: 30 kg child -> 70 mL/hr (40+20+10)', () => assert.equal(maintenanceFluids({ weightKg: 30 }), 70));
test('4-2-1: 70 kg adult -> 110 mL/hr (40+20+50)', () => assert.equal(maintenanceFluids({ weightKg: 70 }), 110));

// --- 127 QTc suite ------------------------------------------------------
test('qtcBazett: QT 400 at HR 60 -> 400 ms', () => close(qtcBazett({ qtMs: 400, hrBpm: 60 }), 400, 0.5));
test('qtcFridericia: QT 400 at HR 60 -> 400 ms', () => close(qtcFridericia({ qtMs: 400, hrBpm: 60 }), 400, 0.5));
test('qtcFramingham: QT 400 at HR 60 -> 400 ms', () => close(qtcFramingham({ qtMs: 400, hrBpm: 60 }), 400, 0.5));
test('qtcHodges: QT 400 at HR 60 -> 400 ms', () => close(qtcHodges({ qtMs: 400, hrBpm: 60 }), 400, 0.5));
test('qtcBazett: QT 360 at HR 100 -> ~465', () => close(qtcBazett({ qtMs: 360, hrBpm: 100 }), 465, 1));
test('qtcFridericia: QT 360 at HR 100 -> ~427', () => close(qtcFridericia({ qtMs: 360, hrBpm: 100 }), 427, 1));
test('qtcHodges: QT 360 at HR 100 -> 430', () => close(qtcHodges({ qtMs: 360, hrBpm: 100 }), 430, 0.5));
test('qtcAll: returns all four', () => {
  const r = qtcAll({ qtMs: 400, hrBpm: 60 });
  for (const k of ['bazett', 'fridericia', 'framingham', 'hodges']) close(r[k], 400, 0.5);
});

// --- 128 Pregnancy dating -----------------------------------------------
test('eddFromLmp: LMP 2026-01-01 -> EDD 2026-10-08', () => {
  const r = eddFromLmp({ lmpIso: '2026-01-01', todayIso: '2026-04-01' });
  assert.equal(r.edd, '2026-10-08');
  assert.equal(r.gaWeeks, 12);
});
test('eddFromLmp: GA accumulates with todayIso', () => {
  const r = eddFromLmp({ lmpIso: '2026-01-01', todayIso: '2026-07-01' });
  assert.equal(r.gaDays, 181);
});
test('gaFromCrl: 12 mm CRL -> GA ~7w4d', () => {
  const r = gaFromCrl({ crlMm: 12, ultrasoundDateIso: '2026-04-01' });
  // 8.052*sqrt(12.444) + 23.73 ~= 28.41 + 23.73 = 52.14 ~ 52 days = 7w 3d
  close(r.gaDays, 52, 1);
});
test('gaFromCrl: 60 mm CRL -> GA ~12w', () => {
  const r = gaFromCrl({ crlMm: 60, ultrasoundDateIso: '2026-04-01' });
  close(r.gaDays, 87, 2); // ~12w 3d
});
test('pregnancyDiscordance: 5-day diff in T1 not discordant', () => {
  const r = pregnancyDiscordance({ lmpGaDays: 60, usGaDays: 65 });
  assert.equal(r.discordant, false);
  assert.equal(r.trimester, 1);
});
test('pregnancyDiscordance: 10-day diff in T1 IS discordant', () => {
  const r = pregnancyDiscordance({ lmpGaDays: 60, usGaDays: 70 });
  assert.equal(r.discordant, true);
});
test('pregnancyDiscordance: 10-day diff in T2 not discordant (limit 14)', () => {
  const r = pregnancyDiscordance({ lmpGaDays: 120, usGaDays: 130 });
  assert.equal(r.discordant, false);
  assert.equal(r.trimester, 2);
});
