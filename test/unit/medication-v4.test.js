// spec-v4 §7 step v4.7: medication / infusion tests with published examples.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  mmeTotal, steroidEquivalent, benzoEquivalent, abxRenalDose,
  vasopressorRateMlHr, vasopressorDose, tpnMacro, ivToPo,
} from '../../lib/medication-v4.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const MME = JSON.parse(await readFile(join(ROOT, 'data', 'mme-factors', 'mme.json'), 'utf8'));
const STEROIDS = JSON.parse(await readFile(join(ROOT, 'data', 'steroid-equiv', 'steroid.json'), 'utf8'));
const BENZOS = JSON.parse(await readFile(join(ROOT, 'data', 'benzo-equiv', 'benzo.json'), 'utf8'));
const ABX = JSON.parse(await readFile(join(ROOT, 'data', 'abx-renal', 'abx.json'), 'utf8'));
const IVPO = JSON.parse(await readFile(join(ROOT, 'data', 'iv-to-po', 'iv-po.json'), 'utf8'));
const close = (a, b, eps = 0.5) => assert.ok(Math.abs(a - b) <= eps, `expected ~${b}, got ${a}`);

// --- MME ---------------------------------------------------------------
test('mmeTotal: morphine 30 mg q4h -> 180 MME (factor 1.0)', () => {
  const r = mmeTotal({ rows: [{ drug: 'morphine', mgPerDose: 30, dosesPerDay: 6 }], factors: MME });
  assert.equal(r.totalMme, 180);
});
test('mmeTotal: oxycodone 10 mg q6h -> 60 MME (factor 1.5)', () => {
  const r = mmeTotal({ rows: [{ drug: 'oxycodone', mgPerDose: 10, dosesPerDay: 4 }], factors: MME });
  assert.equal(r.totalMme, 60);
});
test('mmeTotal: hydrocodone 5 mg q4h + tramadol 50 mg q6h', () => {
  const r = mmeTotal({ rows: [
    { drug: 'hydrocodone', mgPerDose: 5, dosesPerDay: 6 },
    { drug: 'tramadol',    mgPerDose: 50, dosesPerDay: 4 },
  ], factors: MME });
  // 30*1 + 200*0.2 = 30 + 40 = 70
  assert.equal(r.totalMme, 70);
});
test('mmeTotal: unknown drug noted but does not crash', () => {
  const r = mmeTotal({ rows: [{ drug: 'foo', mgPerDose: 10, dosesPerDay: 2 }], factors: MME });
  assert.equal(r.totalMme, 0);
  assert.equal(r.breakdown[0].mme, null);
});

// --- Steroid equivalence ----------------------------------------------
test('steroid: prednisone 5 mg <-> methylprednisolone 4 mg', () => {
  const r = steroidEquivalent({ drug: 'prednisone', doseMg: 5, target: 'methylprednisolone', table: STEROIDS });
  close(r, 4);
});
test('steroid: dexamethasone 0.75 mg <-> prednisone 5 mg', () => {
  const r = steroidEquivalent({ drug: 'dexamethasone', doseMg: 0.75, target: 'prednisone', table: STEROIDS });
  close(r, 5);
});
test('steroid: hydrocortisone 100 mg <-> prednisone 25 mg', () => {
  const r = steroidEquivalent({ drug: 'hydrocortisone', doseMg: 100, target: 'prednisone', table: STEROIDS });
  close(r, 25);
});
test('steroid: unknown drug returns null', () => {
  assert.equal(steroidEquivalent({ drug: 'unknown', doseMg: 10, target: 'prednisone', table: STEROIDS }), null);
});

// --- Benzodiazepine equivalence (Ashton) ------------------------------
test('benzo: alprazolam 0.5 mg <-> diazepam 10 mg', () => {
  close(benzoEquivalent({ drug: 'alprazolam', doseMg: 0.5, target: 'diazepam', table: BENZOS }), 10);
});
test('benzo: lorazepam 1 mg <-> diazepam 10 mg', () => {
  close(benzoEquivalent({ drug: 'lorazepam', doseMg: 1, target: 'diazepam', table: BENZOS }), 10);
});
test('benzo: clonazepam 0.5 mg <-> alprazolam 0.5 mg', () => {
  close(benzoEquivalent({ drug: 'clonazepam', doseMg: 0.5, target: 'alprazolam', table: BENZOS }), 0.5);
});
test('benzo: oxazepam 20 mg <-> lorazepam 1 mg', () => {
  close(benzoEquivalent({ drug: 'oxazepam', doseMg: 20, target: 'lorazepam', table: BENZOS }), 1);
});

// --- Antibiotic renal-dose ---------------------------------------------
test('abxRenalDose: cefepime CrCl 70 -> q8-12h', () => {
  const r = abxRenalDose({ drug: 'cefepime', crCl: 70, table: ABX });
  assert.equal(r.interval, 'q8-12h');
});
test('abxRenalDose: cefepime CrCl 40 -> q12-24h', () => {
  const r = abxRenalDose({ drug: 'cefepime', crCl: 40, table: ABX });
  assert.equal(r.interval, 'q12-24h');
});
test('abxRenalDose: cefepime CrCl 5 (low) -> q24h band', () => {
  const r = abxRenalDose({ drug: 'cefepime', crCl: 5, table: ABX });
  assert.equal(r.interval, 'q24h');
});
test('abxRenalDose: piperacillin-tazobactam normal renal', () => {
  const r = abxRenalDose({ drug: 'piperacillin-tazobactam', crCl: 80, table: ABX });
  assert.equal(r.dose, '4.5 g');
});
test('abxRenalDose: unknown drug returns null', () => {
  assert.equal(abxRenalDose({ drug: 'foo', crCl: 50, table: ABX }), null);
});

// --- Vasopressor dose <-> rate ----------------------------------------
test('vasopressor: norepi 0.1 mcg/kg/min, 70 kg, 16 mcg/mL -> 26.25 mL/hr', () => {
  // 0.1*70 = 7 mcg/min; /16 * 60 = 26.25 mL/hr
  close(vasopressorRateMlHr({ dose: 0.1, units: 'mcg/kg/min', weightKg: 70, concUgPerMl: 16 }), 26.25, 0.05);
});
test('vasopressor: round-trip rate -> dose', () => {
  const rate = vasopressorRateMlHr({ dose: 0.1, units: 'mcg/kg/min', weightKg: 70, concUgPerMl: 16 });
  const back = vasopressorDose({ rateMlHr: rate, units: 'mcg/kg/min', weightKg: 70, concUgPerMl: 16 });
  close(back, 0.1, 0.001);
});
test('vasopressor: phenylephrine 100 mcg/min @ 80 mcg/mL -> 75 mL/hr', () => {
  close(vasopressorRateMlHr({ dose: 100, units: 'mcg/min', concUgPerMl: 80 }), 75, 0.05);
});
test('vasopressor: missing weight throws for kg-based units', () => {
  assert.throws(() => vasopressorRateMlHr({ dose: 0.1, units: 'mcg/kg/min', concUgPerMl: 16 }));
});

// --- TPN ---------------------------------------------------------------
test('tpn: 1500 mL of D20 + 5% AA + 20% lipid (10% of volume)', () => {
  const r = tpnMacro({ volumeMl: 1500, dextrosePct: 20, aminoAcidPct: 5, lipidPctOfVolume: 10 });
  assert.equal(r.dextroseG, 300);
  assert.equal(r.proteinG, 75);
  // lipid mL = 0.10 * 1500 = 150 mL of 20% emulsion -> 30 g lipid
  close(r.lipidG, 30, 0.001);
  // kcal: 300*3.4 + 75*4 + 150*2 = 1020 + 300 + 300 = 1620
  close(r.totalKcal, 1620, 0.5);
});
test('tpn: zero lipid leaves total at carb+protein only', () => {
  const r = tpnMacro({ volumeMl: 1000, dextrosePct: 10, aminoAcidPct: 4 });
  // 100*3.4 + 40*4 = 340 + 160 = 500
  close(r.totalKcal, 500, 0.5);
  assert.equal(r.kcalLipid, 0);
});
test('tpn: rejects zero volume', () => {
  assert.throws(() => tpnMacro({ volumeMl: 0, dextrosePct: 20, aminoAcidPct: 5 }));
});

// --- IV-to-PO ----------------------------------------------------------
test('ivToPo: levofloxacin 1:1', () => {
  const r = ivToPo({ drug: 'levofloxacin', ivDoseMg: 750, table: IVPO });
  close(r.poDoseMg, 757.5, 1); // 750/0.99
  close(r.bioavailability, 0.99);
});
test('ivToPo: metronidazole F=1', () => {
  const r = ivToPo({ drug: 'metronidazole', ivDoseMg: 500, table: IVPO });
  close(r.poDoseMg, 500);
});
test('ivToPo: ciprofloxacin F=0.7 -> larger PO dose', () => {
  const r = ivToPo({ drug: 'ciprofloxacin', ivDoseMg: 400, table: IVPO });
  close(r.poDoseMg, 571.4, 0.5);
});
test('ivToPo: unknown drug returns null', () => {
  assert.equal(ivToPo({ drug: 'foo', ivDoseMg: 100, table: IVPO }), null);
});
