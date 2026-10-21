// Regression tests for the defects an independent review found in the spec-v1632 (renal dose checks) and v1633 (drug
// switches and titration) tools on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnsRenalDoseCheck } from '../../lib/cns-renal-dose-check-v1632.js';
import { lmwhFondaparinuxDoseCheck } from '../../lib/lmwh-fondaparinux-dose-check-v1632.js';
import { dofetilideDoseAlgorithm } from '../../lib/dofetilide-dose-algorithm-v1632.js';
import { doacDoseCheck } from '../../lib/doac-dose-check-v1632.js';
import { ivAntithromboticRenalCheck } from '../../lib/iv-antithrombotic-renal-check-v1632.js';
import { gabapentinoidRenalDose } from '../../lib/gabapentinoid-renal-dose-v1632.js';
import { crclForLabel } from '../../lib/crcl-label-weight-v1632.js';
import { erOpioidLabelStart } from '../../lib/er-opioid-label-start-v1633.js';
import { taperCalendar } from '../../lib/taper-calendar-v1633.js';
import { anticoagSwitchClock } from '../../lib/anticoag-switch-clock-v1633.js';
import { levothyroxineStartDose } from '../../lib/levothyroxine-start-dose-v1633.js';
import { hfGdmtTargetPercent } from '../../lib/hf-gdmt-target-percent-v1633.js';

const now = new Date('2026-10-20T09:00:00Z');

test('levetiracetam: the BSA-adjusted clearance is banded unrounded (29.996 is under 30)', () => {
  const r = cnsRenalDoseCheck({ regimen: 'levetiracetam', dialysis: 'none', kidney: 43, bsa: 2.48, enteredDose: 1200 }, now);
  assert.match(r.band, /250 to 500 mg every 12 hours/);
  assert.equal(r.doseCheck, 'above-row-maximum');
  assert.match(r.notes[0], /= 29\.996 mL\/min\/1\.73 m²/);
});

test('dalteparin: Table 1 prints "<50 kg", so 49.5 kg is in that row alone', () => {
  const r = lmwhFondaparinuxDoseCheck({ drug: 'dalteparin', indication: 'ua-nqmi', weight: 49.5 }, now);
  assert.deepEqual(r.doses, [5500]);
  assert.match(r.band, /below 50 kg/);
  assert.deepEqual(lmwhFondaparinuxDoseCheck({ drug: 'dalteparin', indication: 'ua-nqmi', weight: 50 }, now).doses, [6500]);
});

test('a printed clearance or percent never sits on the edge its rule says it is past', () => {
  const dof = dofetilideDoseAlgorithm({ conduction: 'no', baselineQt: 333, crcl: 70, firstDoseQt: 383 }, now);
  assert.equal(dof.percentChange, 15.02);
  const all = (r) => [r.band, r.rule, ...(r.notes || [])].join(' ');
  assert.match(all(lmwhFondaparinuxDoseCheck({ drug: 'fondaparinux', indication: 'vte-treatment', weight: 80, crcl: 29.9996 }, now)), /CrCl 29\.9996 mL\/min is below 30/);
  assert.match(all(ivAntithromboticRenalCheck({ drug: 'tirofiban', weight: 80, crcl: 60.0004 }, now)), /CrCl 60\.0004 mL\/min is above 60/);
  assert.match(all(doacDoseCheck({ drug: 'rivaroxaban', indication: 'af', interaction: 'no', crcl: 50.0004 }, now)), /CrCl 50\.0004 mL\/min is above 50/);
  assert.match(gabapentinoidRenalDose({ drug: 'gabapentin', hemodialysis: 'no', crcl: 14.96 }, now).band, /14\.96 ÷ 15/);
  assert.match(erOpioidLabelStart({ product: 'hysingla', oxycodoneMg: 39.999 }, now).band, /gives 29\.999 mg, rounded down to the 20 mg tablet/);
  assert.match(erOpioidLabelStart({ product: 'hysingla', oxycodoneMg: 133.34 }, now).band, /gives 100\.01 mg, above the largest/);
  assert.match(levothyroxineStartDose({ group: 'adult', weightKg: 125.02 }, now).band, /200\.03 mcg a day/);
  assert.match(hfGdmtTargetPercent({ ramipril: 10.004 }, now).band, /100\.04% of target/);
});

test('impossible inputs are refused: gabapentin at CrCl 0, a Keppra clearance with no weight, a pause before the start', () => {
  assert.equal(gabapentinoidRenalDose({ drug: 'gabapentin', hemodialysis: 'no', crcl: 0 }, now).valid, false);
  assert.equal(crclForLabel({ drug: 'levetiracetam', byWeight: { actual: 50 }, heightCm: 170 }, now).valid, false);
  assert.equal(taperCalendar({ drugClass: 'other', unit: 'mg', mode: 'fixed', startDose: 30, reduction: 5, intervalDays: 7, smallestDose: 5, startDate: '2026-10-20', pauses: '2020-01-01, 30' }, now).valid, false);
});

test('taper: step 0 is the dose taken now, and coarse rounding is held against the pace', () => {
  const r = taperCalendar({ drugClass: 'other', unit: 'mg', mode: 'percent-original', startDose: 25, reduction: 20, intervalDays: 7, smallestDose: 10, startDate: '2026-10-20' }, now);
  assert.equal(r.rows[0].dose, 25);
  const o = taperCalendar({ drugClass: 'opioid', duration: 'year-or-more', unit: 'mg', mode: 'percent-remaining', startDose: 30, reduction: 10, intervalDays: 28, smallestDose: 10, startDate: '2026-10-20' }, now);
  assert.equal(o.paceFaster, true);
  assert.ok(o.notes.some((n) => /largest step is 30 to 20 mg, 33\.3%/.test(n)));
});

test('dabigatran to warfarin: 50 mL/min is printed in two rows, as 30 is', () => {
  assert.deepEqual(anticoagSwitchClock({ from: 'dabigatran', to: 'warfarin', population: 'adult', crcl: 50 }, now).daysBefore, [3, 2]);
});
