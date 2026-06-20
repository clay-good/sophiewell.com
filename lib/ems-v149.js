// spec-v149: three pre-hospital / field bedside calculators ported from the
// roughlogic.com EMS group (calc-ems.js) to close the last confirmed gaps in
// sophiewell's EMS & Field surface (Group I). None duplicates a live tile.
//
//   pedsWeightEst - Pediatric weight estimate from age (APLS formulas)
//   pedsVitals    - Pediatric normal HR/RR/SBP by age + PALS hypotension SBP
//   doseVolume    - Bolus draw-up volume = ordered dose / stock concentration
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v149.js. Each tile reports a planning
// estimate, a reference range, or a draw-up cross-check; the drug, dose, route,
// rate, and clinical action stay with the licensed provider and local protocol
// (spec-v11 §5.3). The formulas are re-implemented verbatim from roughlogic's
// computePediatricWeight / computePedsVitals / computeDrugConcentration and
// re-grounded in their primary clinical sources:
//   - pedsWeightEst (APLS, Advanced Paediatric Life Support 6th ed.):
//     0-12 mo -> (months / 2) + 4 kg; 1-5 yr -> (2 x years) + 8 kg;
//     6-12 yr -> (3 x years) + 7 kg. A calibrated field weighing is the gold
//     standard; this is a resuscitation-planning estimate when no scale is
//     available. The licensed Broselow (length-based) tape is NOT bundled.
//   - pedsVitals (AHA PALS Provider Manual 2020): age-banded normal heart rate
//     (awake / asleep), respiratory rate, and systolic-BP ranges, plus the PALS
//     hypotensive-SBP definition (< 60 neonate, < 70 infant, < 70 + 2 x age for
//     ages 1-10, < 90 at >= 10 yr) -- the band-specific cutoff is the COMPUTED
//     element (this is a calculator, not a static table).
//   - doseVolume (first-principles arithmetic): volume_mL = dose_mg /
//     concentration_mg_per_mL, with an optional weight x per-kg-dose derivation
//     of the ordered dose. Distinct from the conc-rate tile (which solves an
//     infusion RATE in mL/hr, not a bolus draw-up volume).

import { r1, r2 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v)
  ? v
  : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null));
const LB_PER_KG = 2.2046226218;

// --- 2.1 peds-weight-est ------------------------------------------------------
const PWE_NOTE = 'Pediatric weight estimate (Advanced Paediatric Life Support, APLS 6th ed.): estimates body weight from age when no scale is available, by the published age-band formulas -- 0-12 months: (months / 2) + 4 kg; 1-5 years: (2 x years) + 8 kg; 6-12 years: (3 x years) + 7 kg. A calibrated field weighing is the gold standard; this is a resuscitation-planning starting point. The licensed Broselow tape uses length-based estimation and is not bundled. The drug-dose decisions stay with the licensed provider and local protocol.';

export function pedsWeightEst(input = {}) {
  const mo = fin(input.months);
  const yr = fin(input.years);
  let kg;
  let formula;
  let flag = null;
  if (mo != null && mo >= 0 && mo <= 12) {
    kg = (mo / 2) + 4;
    formula = '(months / 2) + 4';
  } else if (yr == null || yr < 0 || yr > 14) {
    return {
      valid: false,
      band: 'Enter age in months (0-12) or in years (1-14) to estimate weight.',
      note: PWE_NOTE,
    };
  } else if (yr < 1) {
    kg = ((yr * 12) / 2) + 4;
    formula = '(months / 2) + 4 [years converted to months]';
  } else if (yr <= 5) {
    kg = (2 * yr) + 8;
    formula = '(2 x years) + 8';
  } else if (yr <= 12) {
    kg = (3 * yr) + 7;
    formula = '(3 x years) + 7';
  } else {
    kg = (3 * yr) + 7;
    formula = '(3 x years) + 7';
    flag = 'Age over 12 years: consider adult-weight dosing per APLS convention.';
  }
  const lb = kg * LB_PER_KG;
  return {
    valid: true,
    kg, lb, formula, flag,
    band: `Estimated weight ${r1(kg)} kg (${r1(lb)} lb) by APLS: ${formula}.`,
    note: PWE_NOTE,
  };
}

// --- 2.2 peds-vitals ----------------------------------------------------------
const PEDS_VITALS_NOTE = 'Pediatric vital-sign reference (American Heart Association PALS Provider Manual, 2020): normal heart-rate (awake / asleep), respiratory-rate, and systolic-BP ranges by age band, with the PALS hypotensive-SBP definition computed for the entered age -- systolic BP below 60 mmHg in the neonate, below 70 mmHg in the infant, below 70 + (2 x age in years) from 1 to 10 years, and below 90 mmHg at 10 years and older. Ranges are a reference; a single value outside a band is a prompt to reassess, not a diagnosis. The clinical action stays with the provider and local protocol.';

// AHA PALS 2020 normal ranges. hr = awake / asleep.
const PEDS_VITALS = [
  { key: 'neonate',    label: 'Neonate (0-28 days)',   hr: '100-205 awake / 90-160 asleep', rr: '30-60', sbp: '67-84' },
  { key: 'infant',     label: 'Infant (1-12 mo)',      hr: '100-180 awake / 90-160 asleep', rr: '30-53', sbp: '72-104' },
  { key: 'toddler',    label: 'Toddler (1-2 yr)',      hr: '98-140 awake / 80-120 asleep',  rr: '22-37', sbp: '86-106' },
  { key: 'preschool',  label: 'Preschool (3-5 yr)',    hr: '80-120 awake / 65-100 asleep',  rr: '20-28', sbp: '89-112' },
  { key: 'school',     label: 'School age (6-11 yr)',  hr: '75-118 awake / 58-90 asleep',   rr: '18-25', sbp: '97-115' },
  { key: 'adolescent', label: 'Adolescent (12-15 yr)', hr: '60-100 awake / 50-90 asleep',   rr: '12-20', sbp: '110-131' },
];

const NEONATE_YEARS = 28 / 365; // 28 days expressed in years

function bandForAge(age) {
  if (age < NEONATE_YEARS) return PEDS_VITALS[0];
  if (age < 1) return PEDS_VITALS[1];
  if (age < 3) return PEDS_VITALS[2];
  if (age < 6) return PEDS_VITALS[3];
  if (age < 12) return PEDS_VITALS[4];
  return PEDS_VITALS[5];
}

export function pedsVitals(input = {}) {
  const age = fin(input.ageYears);
  if (age == null || age < 0 || age > 18) {
    return {
      valid: false,
      band: 'Enter the age in years (0-18; use a decimal such as 0.5 for a 6-month-old) for the age-band ranges and the PALS hypotension threshold.',
      note: PEDS_VITALS_NOTE,
    };
  }
  const row = bandForAge(age);
  let hypotensionSbp;
  if (age < NEONATE_YEARS) hypotensionSbp = 60;
  else if (age < 1) hypotensionSbp = 70;
  else if (age <= 10) hypotensionSbp = 70 + (2 * Math.floor(age));
  else hypotensionSbp = 90;
  return {
    valid: true,
    bandKey: row.key,
    label: row.label,
    hr: row.hr,
    rr: row.rr,
    sbp: row.sbp,
    hypotensionSbp,
    band: `${row.label}: PALS hypotension if systolic BP < ${hypotensionSbp} mmHg.`,
    note: PEDS_VITALS_NOTE,
  };
}

// --- 2.3 dose-volume ----------------------------------------------------------
const DOSE_VOLUME_NOTE = 'Draw-up volume (first-principles dosing arithmetic): volume to draw (mL) = ordered dose (mg) / stock concentration (mg per mL). Optionally derive the ordered dose from weight x a per-kg dose. This is a calm draw-volume cross-check before the syringe goes near the patient; it is distinct from an infusion-rate calculation. The drug, dose, route, and rate are clinical decisions of the licensed provider and the receiving facility, verified against the current local protocol.';

export function doseVolume(input = {}) {
  const conc = fin(input.concentration);
  if (conc == null || conc <= 0) {
    return {
      valid: false,
      band: 'Enter a stock concentration in mg/mL greater than zero.',
      note: DOSE_VOLUME_NOTE,
    };
  }
  let doseMg = fin(input.doseMg);
  let derivation = null;
  if (doseMg == null || doseMg === 0) {
    const w = fin(input.weightKg);
    const perKg = fin(input.doseMgPerKg);
    if (w != null && w > 0 && perKg != null && perKg > 0) {
      doseMg = w * perKg;
      derivation = `Ordered dose derived: ${r2(perKg)} mg/kg x ${r2(w)} kg = ${r2(doseMg)} mg.`;
    } else if (doseMg === 0) {
      return { valid: false, band: 'Ordered dose must be greater than zero.', note: DOSE_VOLUME_NOTE };
    } else {
      return {
        valid: false,
        band: 'Enter an ordered dose (mg), or enter both weight (kg) and a per-kg dose (mg/kg) to derive it.',
        note: DOSE_VOLUME_NOTE,
      };
    }
  }
  if (!(doseMg > 0)) {
    return { valid: false, band: 'Ordered dose must be greater than zero.', note: DOSE_VOLUME_NOTE };
  }
  const volumeMl = doseMg / conc;
  if (!Number.isFinite(volumeMl)) {
    return { valid: false, band: 'Inputs out of range; check the dose and concentration.', note: DOSE_VOLUME_NOTE };
  }
  const flags = [];
  if (volumeMl > 50) flags.push('Volume over 50 mL: very large draw -- verify carefully.');
  if (volumeMl < 0.05) flags.push('Volume under 0.05 mL: typically a tuberculin-syringe draw -- verify.');
  return {
    valid: true,
    volumeMl, doseMg, concentration: conc, derivation, flags,
    abnormal: flags.length > 0,
    band: `Draw ${r2(volumeMl)} mL: ${r2(doseMg)} mg from a ${r2(conc)} mg/mL concentration.`,
    note: DOSE_VOLUME_NOTE,
  };
}
