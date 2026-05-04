// Unit tests for lib/field.js per spec-v3 5.1 worked examples.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsDose, defibEnergy, cincinnatiStroke, fast, fieldTriage, startTriage, jumpStartTriage, ruleOfNines, lundBrowder, burnFluid, pediatricEtt, naloxoneDose, selectEmsChecklist, RULE_OF_NINES_ADULT, PEDS_DOSE_RECIPES } from '../../lib/field.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname_field = dirname(fileURLToPath(import.meta.url));
const ROOT_field = join(__dirname_field, '..', '..');

// ---- Pediatric weight-to-dose ----
test('pedsDose: epi 0.01 mg/kg IV/IO at 10 kg = 0.1 mg', () => {
  const r = pedsDose({ weightKg: 10, recipe: 'epinephrine-iv-io' });
  assert.equal(r.dose, 0.1);
  assert.equal(r.units, 'mg');
});
test('pedsDose: epi capped at 1 mg even when weight is 200 kg', () => {
  const r = pedsDose({ weightKg: 200, recipe: 'epinephrine-iv-io' });
  assert.equal(r.dose, 1);
  assert.equal(r.capped, true);
});
test('pedsDose: atropine has min 0.1 mg even at very low weight', () => {
  const r = pedsDose({ weightKg: 1, recipe: 'atropine' });
  assert.equal(r.dose, 0.1);
});
test('pedsDose: amiodarone capped at 300 mg', () => {
  const r = pedsDose({ weightKg: 100, recipe: 'amiodarone' });
  assert.equal(r.dose, 300);
});
test('pedsDose: NS bolus 20 mL/kg at 25 kg = 500 mL (uncapped)', () => {
  const r = pedsDose({ weightKg: 25, recipe: 'fluid-bolus-ns' });
  assert.equal(r.dose, 500);
  assert.equal(r.capped, false);
});
test('pedsDose: rejects unknown recipe', () => {
  assert.throws(() => pedsDose({ weightKg: 10, recipe: 'fake' }));
});
test('pedsDose: rejects out-of-range weight', () => {
  assert.throws(() => pedsDose({ weightKg: 0, recipe: 'epinephrine-iv-io' }));
});
test('pedsDose: every recipe in registry is callable at 10 kg', () => {
  for (const k of Object.keys(PEDS_DOSE_RECIPES)) {
    const r = pedsDose({ weightKg: 10, recipe: k });
    assert.ok(r.dose >= 0, `${k}: dose missing`);
    assert.ok(r.units, `${k}: units missing`);
  }
});

// ---- Defibrillation ----
test('defib: adult biphasic VF/pVT', () => {
  const r = defibEnergy({ population: 'adult', scenario: 'vf-pvt', waveform: 'biphasic' });
  assert.match(r.joules, /120-200 J/);
});
test('defib: adult monophasic VF/pVT', () => {
  const r = defibEnergy({ population: 'adult', scenario: 'vf-pvt', waveform: 'monophasic' });
  assert.equal(r.joules, '360 J');
});
test('defib: pediatric VF/pVT first shock 2 J/kg', () => {
  const r = defibEnergy({ population: 'pediatric', scenario: 'vf-pvt', weightKg: 20, shockNumber: 1 });
  assert.equal(r.joules, '40 J');
});
test('defib: pediatric VF/pVT subsequent shock 4 J/kg', () => {
  const r = defibEnergy({ population: 'pediatric', scenario: 'vf-pvt', weightKg: 20, shockNumber: 2 });
  assert.equal(r.joules, '80 J');
});
test('defib: adult cardioversion narrow regular SVT', () => {
  const r = defibEnergy({ population: 'adult', scenario: 'cardioversion-svt-narrow-regular' });
  assert.match(r.joules, /50-100 J/);
});
test('defib: pediatric cardioversion first shock 0.5 J/kg', () => {
  const r = defibEnergy({ population: 'pediatric', scenario: 'cardioversion', weightKg: 20, shockNumber: 1 });
  assert.equal(r.joules, '10 J synchronized');
});
test('defib: rejects unknown population', () => {
  assert.throws(() => defibEnergy({ population: 'rhino', scenario: 'vf-pvt' }));
});

// ---- Cincinnati ----
test('cincinnati: all normal = negative', () => {
  const r = cincinnatiStroke({ facialDroop: 0, armDrift: 0, abnormalSpeech: 0 });
  assert.equal(r.positive, false);
  assert.equal(r.total, 0);
});
test('cincinnati: any one abnormal = positive', () => {
  const r = cincinnatiStroke({ facialDroop: 1, armDrift: 0, abnormalSpeech: 0 });
  assert.equal(r.positive, true);
  assert.equal(r.total, 1);
});
test('cincinnati: all abnormal = positive total 3', () => {
  const r = cincinnatiStroke({ facialDroop: 1, armDrift: 1, abnormalSpeech: 1 });
  assert.equal(r.total, 3);
});

// ---- FAST / BE-FAST ----
test('fast: positive on speech alone', () => {
  const r = fast({ face: false, arms: false, speech: true });
  assert.equal(r.positive, true);
});
test('fast: BE-FAST positive on balance alone', () => {
  const r = fast({ balance: true }, { extended: true });
  assert.equal(r.positive, true);
});
test('fast: all negative = negative', () => {
  const r = fast({ face: false, arms: false, speech: false });
  assert.equal(r.positive, false);
});

// ---- Field triage ----
test('fieldTriage: any step 1 criterion -> highest-level trauma', () => {
  const r = fieldTriage({ 'gcs-le-13': true });
  assert.equal(r.step, 1);
  assert.match(r.destination, /Highest-level/);
});
test('fieldTriage: step 2 anatomy criterion', () => {
  const r = fieldTriage({ 'amputation-proximal-wrist-ankle': true });
  assert.equal(r.step, 2);
});
test('fieldTriage: step 3 mechanism only -> consider trauma center', () => {
  const r = fieldTriage({ 'mvc-high-risk': true });
  assert.equal(r.step, 3);
});
test('fieldTriage: step 4 special considerations', () => {
  const r = fieldTriage({ 'older-adult': true });
  assert.equal(r.step, 4);
});
test('fieldTriage: no criteria -> closest appropriate', () => {
  const r = fieldTriage({});
  assert.equal(r.step, 0);
  assert.match(r.destination, /Closest/);
});

// ---- START ----
test('startTriage: walking -> minor', () => {
  const r = startTriage({ canWalk: true });
  assert.match(r.category, /Minor/);
});
test('startTriage: not breathing, no return -> expectant', () => {
  const r = startTriage({ canWalk: false, isBreathing: false, breathsAfterReposition: false });
  assert.match(r.category, /Expectant/);
});
test('startTriage: not breathing, returns after reposition -> immediate', () => {
  const r = startTriage({ canWalk: false, isBreathing: false, breathsAfterReposition: true });
  assert.match(r.category, /Immediate/);
});
test('startTriage: RR > 30 -> immediate', () => {
  const r = startTriage({ canWalk: false, isBreathing: true, respiratoryRate: 35,
                          hasRadialPulseAndCapRefillUnder2s: true, followsCommands: true });
  assert.match(r.category, /Immediate/);
});
test('startTriage: perfusion failure -> immediate', () => {
  const r = startTriage({ canWalk: false, isBreathing: true, respiratoryRate: 20,
                          hasRadialPulseAndCapRefillUnder2s: false, followsCommands: true });
  assert.match(r.category, /Immediate/);
});
test('startTriage: cannot follow commands -> immediate', () => {
  const r = startTriage({ canWalk: false, isBreathing: true, respiratoryRate: 20,
                          hasRadialPulseAndCapRefillUnder2s: true, followsCommands: false });
  assert.match(r.category, /Immediate/);
});
test('startTriage: all checks pass -> delayed', () => {
  const r = startTriage({ canWalk: false, isBreathing: true, respiratoryRate: 20,
                          hasRadialPulseAndCapRefillUnder2s: true, followsCommands: true });
  assert.match(r.category, /Delayed/);
});

// ---- JumpSTART ----
test('jumpStartTriage: walking -> minor', () => {
  assert.match(jumpStartTriage({ canWalk: true }).category, /Minor/);
});
test('jumpStartTriage: apnea after rescue -> expectant', () => {
  const r = jumpStartTriage({ canWalk: false, isBreathing: false, breathsAfterRescue: false });
  assert.match(r.category, /Expectant/);
});
test('jumpStartTriage: breathing returns after rescue -> immediate', () => {
  const r = jumpStartTriage({ canWalk: false, isBreathing: false, breathsAfterRescue: true });
  assert.match(r.category, /Immediate/);
});
test('jumpStartTriage: RR outside 15-45 -> immediate', () => {
  const r = jumpStartTriage({ canWalk: false, isBreathing: true, respiratoryRate: 50,
                              palpablePulse: true, avpuAppropriate: true });
  assert.match(r.category, /Immediate/);
});
test('jumpStartTriage: in normal envelope -> delayed', () => {
  const r = jumpStartTriage({ canWalk: false, isBreathing: true, respiratoryRate: 30,
                              palpablePulse: true, avpuAppropriate: true });
  assert.match(r.category, /Delayed/);
});

// ---- Burn surface area ----
test('ruleOfNines: anterior trunk only = 18%', () => {
  assert.equal(ruleOfNines({ 'trunk-anterior': true }).tbsa, 18);
});
test('ruleOfNines: full body cap at 100', () => {
  const sel = {};
  for (const k of Object.keys(RULE_OF_NINES_ADULT)) sel[k] = true;
  assert.equal(ruleOfNines(sel).tbsa, 100);
});
test('lundBrowder: sums entered percentages', () => {
  assert.equal(lundBrowder({ head: 5, 'arm-left': 4, 'leg-right': 9 }).tbsa, 18);
});

// ---- Burn fluid ----
test('burnFluid: 70 kg, 20% TBSA -> Parkland 5600 mL/24h, 2800 mL first 8h', () => {
  const r = burnFluid({ weightKg: 70, tbsaPercent: 20 });
  assert.equal(r.parkland.total24h, 5600);
  assert.equal(r.parkland.first8h, 2800);
  assert.equal(r.brooke.total24h, 2800);
});
test('burnFluid: hours since injury computes remaining-in-first-8h', () => {
  const r = burnFluid({ weightKg: 70, tbsaPercent: 20, hoursSinceInjury: 2 });
  // 6 of the first 8 hours remain. Parkland first 8h = 2800; remaining = 2800 * 6/8 = 2100.
  assert.equal(r.parkland.remainingInFirst8h, 2100);
  // 2100 / 6 = 350 mL/hr.
  assert.equal(r.parkland.ratePerHourRemainingFirst8h, 350);
});
test('burnFluid: rejects out-of-range TBSA', () => {
  assert.throws(() => burnFluid({ weightKg: 70, tbsaPercent: 150 }));
});

// ---- Pediatric ETT ----
test('pediatricEtt: age 4 uncuffed -> 5.0 mm, depth 15 cm', () => {
  const r = pediatricEtt({ ageYears: 4, cuffed: false });
  assert.equal(r.sizeMm, 5);
  assert.equal(r.depthCm, 15);
});
test('pediatricEtt: age 4 cuffed -> 4.5 mm, depth 13.5 cm', () => {
  const r = pediatricEtt({ ageYears: 4, cuffed: true });
  assert.equal(r.sizeMm, 4.5);
  assert.equal(r.depthCm, 13.5);
});
test('pediatricEtt: age 8 uncuffed -> 6.0 mm, depth 18 cm', () => {
  const r = pediatricEtt({ ageYears: 8, cuffed: false });
  assert.equal(r.sizeMm, 6);
  assert.equal(r.depthCm, 18);
});
test('pediatricEtt: rejects out-of-range age', () => {
  assert.throws(() => pediatricEtt({ ageYears: -1, cuffed: false }));
});

// ---- Naloxone ----
test('naloxoneDose: adult IN -> 4 mg per spray', () => {
  const r = naloxoneDose({ population: 'adult', route: 'in' });
  assert.match(r.dose, /4 mg intranasal/);
});
test('naloxoneDose: adult IV -> 0.4-2 mg', () => {
  const r = naloxoneDose({ population: 'adult', route: 'iv' });
  assert.match(r.dose, /0.4-2 mg IV/);
});
test('naloxoneDose: pediatric 20 kg = 2 mg cap', () => {
  const r = naloxoneDose({ population: 'pediatric', route: 'iv', weightKg: 20 });
  assert.match(r.dose, /2 mg/);
});
test('naloxoneDose: pediatric 10 kg = 1 mg', () => {
  const r = naloxoneDose({ population: 'pediatric', route: 'iv', weightKg: 10 });
  assert.match(r.dose, /1 mg/);
});
test('naloxoneDose: rejects unknown route', () => {
  assert.throws(() => naloxoneDose({ population: 'adult', route: 'aerosol' }));
});

// ---- EMS doc helper ----
test('selectEmsChecklist: returns named run-type', async () => {
  const bank = JSON.parse(await readFile(join(ROOT_field, 'data', 'workflow', 'ems-runtypes.json'), 'utf8'));
  const c = selectEmsChecklist(bank, 'cardiac-arrest');
  assert.ok(c);
  assert.ok(c.items.length >= 5);
});
test('selectEmsChecklist: unknown id returns null', async () => {
  const bank = JSON.parse(await readFile(join(ROOT_field, 'data', 'workflow', 'ems-runtypes.json'), 'utf8'));
  assert.equal(selectEmsChecklist(bank, 'nope'), null);
});
