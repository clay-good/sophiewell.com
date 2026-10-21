// Regression tests for the defects two independent reviews found in the spec-v1631, v1635 and v1636 dosing and
// radiation tools on 2026-10-20, each with the input that showed it. Most were a rounded value printed beside a
// decision made on the unrounded one; four were logic faults (a combination product's child cap, a prior dose
// ignored, a toxic target accepted, a dose time before dialysis began).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sigSafe, dpSafe } from '../../lib/cut-display.js';
import { hdmtxLeucovorinRescue } from '../../lib/hdmtx-leucovorin-rescue-v1635.js';
import { cumulativeDoseLimit } from '../../lib/cumulative-dose-limit-v1635.js';
import { nrcMedicalEventScreen } from '../../lib/nrc-medical-event-screen-v1635.js';
import { chemoDoseVerify } from '../../lib/chemo-dose-verify-v1635.js';
import { radiopharmDispenseVolume } from '../../lib/radiopharm-dispense-volume-v1635.js';
import { generatorBreakthroughCheck } from '../../lib/generator-breakthrough-check-v1635.js';
import { occupationalDoseLimitCheck } from '../../lib/occupational-dose-limit-check-v1635.js';
import { sealedSourceLeakTest } from '../../lib/sealed-source-leak-test-v1635.js';
import { radPackageReceiptCheck } from '../../lib/rad-package-receipt-check-v1635.js';
import { esaChemoDoseAdjust } from '../../lib/esa-chemo-dose-adjust-v1635.js';
import { idsAccountabilityReconcile } from '../../lib/ids-accountability-reconcile-v1635.js';
import { surgicalProphylaxisRedose } from '../../lib/surgical-prophylaxis-redose-v1636.js';
import { neostigmineReversalDose } from '../../lib/neostigmine-reversal-dose-v1636.js';
import { lithiumLevelCheck } from '../../lib/lithium-level-check-v1631.js';
import { fomepizoleSchedule } from '../../lib/fomepizole-schedule-v1636.js';
import { dantroleneMhVials } from '../../lib/dantrolene-mh-vials-v1636.js';
import { naloxoneInfusion } from '../../lib/naloxone-infusion-v1636.js';
import { auRateSaar } from '../../lib/au-rate-saar-v1636.js';

const now = new Date('2026-10-20T09:00:00Z');

test('cut-display: the fewest digits that keep the shown value on the raw value\'s side of each cut-off', () => {
  assert.equal(sigSafe(49.9956, [50]), 49.996);
  assert.equal(sigSafe(50, [50]), 50);
  assert.equal(sigSafe(12.34567, [50]), 12.35);
  assert.equal(dpSafe(19.96, [20], 1), 19.96);
  assert.equal(dpSafe(55.04, [20], 1), 55);
});

test('a printed level, total, variance or reading never sits on the cut-off the verdict says it misses', () => {
  assert.match(hdmtxLeucovorinRescue({ levelUnit: 'mg-l', hours: 24, level: 22.72, baselineCreatinine: 0.8, currentCreatinine: 0.9 }, now).band, /49\.996 µmol\/L is in no row/);
  assert.match(cumulativeDoseLimit({ agent: 'mitoxantrone', mitoxantroneUse: 'multiple-sclerosis', doses: '139.96' }, now).band, /total 139\.96 mg\/m²: 99\.97%/);
  assert.match(cumulativeDoseLimit({ agent: 'doxorubicin', doses: '550.04' }, now).band, /total 550\.04 mg\/m²: above/);
  const nrc = nrcMedicalEventScreen({ patientIntervention: 'no', wrongAdministration: 'none', doseKind: 'organ', doseRem: 60, prescribed: 100, delivered: 80.04 }, now);
  assert.ok(nrc.notes.some((n) => /off by 19\.96% \(20% or more needed\)\. Not met/.test(n)));
  assert.match(chemoDoseVerify({ basis: 'mg-kg', perUnitDose: 100, weight: 10, orderedDose: 1100.4, tolerance: 10 }, now).band, /variance \+10\.04%\. That is outside/);
  assert.match(chemoDoseVerify({ basis: 'mg-kg', perUnitDose: 100, weight: 10, orderedDose: 1050 }, now).band, /variance \+5%\./);
  assert.match(radiopharmDispenseVolume({ nuclide: 'other', halfLife: 6, halfLifeUnit: 'hours', unit: 'mci', vialActivity: 100, vialVolume: 10, prescribed: 20, calibration: '2026-10-20T08:00', draw: '2026-10-20T08:00', measured: 24.008 }, now).band, /\+20\.04% from prescribed, not acceptable/);
  assert.match(generatorBreakthroughCheck({ generator: 'tc-99m', mo99MicroCi: 150.4, tc99mMilliCi: 1000 }, now).band, /0\.1504 µCi\/mCi at elution is over the 0\.15 limit/);
  assert.match(sealedSourceLeakTest({ exemption: 'none', netCpm: 11090, efficiencyPercent: 100 }, now).band, /^0\.004995 µCi .*below the 0\.005/);
  assert.match(radPackageReceiptCheck({ emitter: 'beta-gamma', netCpm: 3606, efficiencyPercent: 50, areaCm2: 300 }, now).band, /240\.4 dpm\/cm², above the 240/);
  assert.match(esaChemoDoseAdjust({ schedule: 'epoetin-weekly', stage: 'on-therapy', hemoglobin: 10.06, hemoglobinTwoWeeksAgo: 9.02, currentDose: 40000, weeksOnTherapy: 3, transfusionLevel: 'below', transfusionsStillRequired: 'no', chemoCompleted: 'no' }, now).band, /rose 1\.04 g\/dL in 2 weeks \(more than 1 g\/dL\)/);
  assert.match(idsAccountabilityReconcile({ visits: 'S1,2400,481,2026-01-01,2026-10-28,8', rangeLow: 80, rangeHigh: 120 }, now).band, /compliance 79\.96%, 1 outside/);
  assert.match(dantroleneMhVials({ weight: 71.3, product: 'ryanodex', use: 'treatment', dosePerKg: 3, cumulativeGiven: 500 }, now).band, /to 10\.01 mg\/kg, past/);
  assert.match(auRateSaar({ scope: 'facwidein-all-inpatient', antimicrobialDays: 10004, daysPresent: 20000, predictedDays: 10000 }, now).band, /SAAR 1\.0004/);
});

test('occupational dose: 99.996% of the limit is below it, decided on the unrounded dose', () => {
  const r = occupationalDoseLimitCheck({ unit: 'msv', tede: 49.998 }, now);
  assert.equal(r.flag, 'below-limits');
  assert.match(r.band, /99\.996% of its limit/);
  assert.equal(occupationalDoseLimitCheck({ unit: 'mrem', tede: 5000 }, now).flag, 'limit-reached');
});

test('naloxone: mL/hour from the unrounded two-thirds of the bolus', () => {
  const r = naloxoneInfusion({ bolusMg: 0.04, concentration: 0.004 }, now);
  assert.deepEqual([r.mgPerHour, r.mlPerHour, r.labelMlPerHour], [0.0267, 6.67, 7]);
});

test('surgical prophylaxis: a combination product\'s child dose is capped at its component\'s adult amount', () => {
  const amp = surgicalProphylaxisRedose({ agent: 'ampicillin-sulbactam', patient: 'child', weightKg: 60 }, now);
  assert.equal(amp.doseMg, 2000);
  assert.match(amp.band, /capped at the 2 g of ampicillin in the usual adult dose of 3 g/);
  assert.equal(surgicalProphylaxisRedose({ agent: 'ampicillin-sulbactam', patient: 'child', weightKg: 20 }, now).doseMg, 1000);
  assert.equal(surgicalProphylaxisRedose({ agent: 'piperacillin-tazobactam', patient: 'child', pipAge: 'child', weightKg: 33 }, now).doseMg, 3000);
  assert.equal(surgicalProphylaxisRedose({ agent: 'cefoxitin', patient: 'child', weightKg: 60 }, now).doseMg, 2000);
});

test('neostigmine: a prior dose is checked against both doses when the label rows differ', () => {
  const r = neostigmineReversalDose({ weight: 70, twitch: 'first-twitch-near-10-percent', halfLife: 'shorter-acting-blocker', concentration: '1-mg-ml', priorDose: 3 }, now);
  assert.equal(r.flag, 'past-maximum-with-prior-dose');
  assert.match(r.band, /only 1\.9 mg remains/);
});

test('lithium: no proportional dose is worked out for a target at the toxic level', () => {
  assert.equal(lithiumLevelCheck({ phase: 'maintenance', level: 0.6, hoursSinceDose: 12, dailyDose: 900, target: 1.5 }, now).valid, false);
  const r = lithiumLevelCheck({ phase: 'maintenance', level: 0.6, hoursSinceDose: 12, dailyDose: 900, target: 1.2 }, now);
  assert.ok(r.notes.some((n) => /above the label's 0\.8 to 1 mEq\/L/.test(n)));
});

test('fomepizole: no "during dialysis" time that falls before dialysis began', () => {
  const late = fomepizoleSchedule({ weight: 70, dosesGiven: 2, dialysis: 'dialysis-begins', lastDoseTime: '2026-10-20T00:00', dialysisTime: '2026-10-20T05:30' }, now);
  assert.equal(late.at, null);
  assert.match(late.band, /4 hours from the last dose was before dialysis started/);
  assert.equal(fomepizoleSchedule({ weight: 70, dosesGiven: 2, dialysis: 'dialysis-begins', lastDoseTime: '2026-10-20T00:00', dialysisTime: '2026-10-20T02:00' }, now).at, '2026-10-20 04:00');
});
