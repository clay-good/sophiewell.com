// spec-v141 (fourth and final feature spec of Wave 7 of the spec-v100 MDCalc
// Parity Completion program): pediatric growth and developmental-age instruments
// that fill confirmed gaps. None duplicates a live tile; v141 parses no report
// and runs no AI.
//
//   pedsBmiPercentile  - CDC 2000 BMI-for-age z-score & percentile (2-20 yr)
//   whoGrowthZscore    - WHO 2006 weight/length-for-age z-score & percentile (0-24 mo)
//   midParentalHeight  - Tanner mid-parental target height with its target range
//   correctedAge       - AAP corrected gestational age for the preterm infant
//
// SCOPE NOTE (spec-v85 §6.2 collision check + spec-v100 "none duplicates a live
// tile"): of the six tiles docs/spec-v141.md proposed, two are NOT shipped here:
//   - peds-weight-est (APLS age-based weight) is ALREADY LIVE -- it shipped in
//     spec-v149 (Group I, lib/ems-*; see lib/meta.js 'peds-weight-est'). Re-adding
//     it would duplicate a live tile, so it is skipped, not re-implemented.
//   - gail-bcrat (NCI Gail/BCRAT 5-yr breast-cancer risk) is DEFERRED on
//     source-governance + safety grounds: the model's race-specific composite
//     incidence (lambda1) and competing-mortality (lambda2) tables ship only as
//     binary .rda objects in the public-domain NCI BCRA package (not cleanly
//     fetchable as verbatim text to cross-verify per spec-v97), and its
//     recode/relative-risk/attributable-risk pipeline is intricate enough that a
//     subtly-wrong cancer-risk percentage is a real harm. Parked alongside the
//     other deferred ids (crib-ii, gwtg-hf, roks) until the coefficient block can
//     be sourced and cross-verified verbatim.
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v141.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the z/percentile/height/age and the source's
// framing; the management decision stays with the clinician (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97). The CDC 2000 / WHO 2006 LMS
// tables are compiled constants in lib/growth-lms-data.js, transcribed byte-for-
// byte from the published data files (see that module's header for the per-table
// sources). The LMS z-transform and its L -> 0 branch live there and are fuzzed.

import { r1, r2 } from './num.js';
import { CDC_BMI_AGE, WHO_WT_AGE, WHO_LEN_AGE, interpLMS, lmsToZ } from './growth-lms-data.js';

const fin = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => {
  const n = fin(v);
  return n !== null && n > 0 ? n : null;
};
const sexKey = (s) => (s === 'female' || s === 'f' ? 'female' : s === 'male' || s === 'm' ? 'male' : null);

// Standard-normal CDF via the Abramowitz & Stegun 7.1.26 erf approximation
// (|error| < 1.5e-7 -- ample for a percentile reported to one decimal). Clamped
// away from the exact 0/100 endpoints so a copied percentile never reads as a
// certainty.
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
function pctFromZ(z) {
  const p = 100 * 0.5 * (1 + erf(z / Math.SQRT2));
  return p < 0.1 ? 0.1 : p > 99.9 ? 99.9 : p;
}
// Round a percentile: one decimal in the tails (<1 or >99), whole number elsewhere.
const pctStr = (p) => (p < 1 || p > 99 ? p.toFixed(1) : String(Math.round(p)));
// Percentile with the correct ordinal suffix (1st, 2nd, 3rd, 11th, 21st, 98th);
// decimal tail values (0.1, 99.9) read with "th".
function ordinalPct(p) {
  const s = pctStr(p);
  if (s.includes('.')) return s + 'th';
  const n = Number(s), m100 = n % 100, m10 = n % 10;
  const suf = (m10 === 1 && m100 !== 11) ? 'st' : (m10 === 2 && m100 !== 12) ? 'nd' : (m10 === 3 && m100 !== 13) ? 'rd' : 'th';
  return s + suf;
}

// --- 2.1 peds-bmi-percentile --------------------------------------------------
const BMI_NOTE = 'Pediatric BMI-for-age percentile and z-score (2000 CDC growth charts; Kuczmarski RJ, Ogden CL, Guo SS, et al, Vital Health Stat 11, 2002). The measured BMI is converted to an age- and sex-specific z-score by the CDC LMS transform z = ((BMI/M)^L - 1) / (L·S), and the percentile is the standard-normal CDF of that z. The CDC weight-status bands are: under the 5th percentile underweight, 5th to under the 85th healthy weight, 85th to under the 95th overweight, and 95th percentile or above obese. It reports the percentile, z-score, and band for a child 2 to 20 years; the management decision stays with the clinician.';

export function pedsBmiPercentile(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexKey(o.sex);
  const ageY = fin(o.ageYears);
  if (sex === null) return { valid: false, message: 'Choose the child’s sex.' };
  if (ageY === null) return { valid: false, message: 'Enter the child’s age in years (2 to 20).' };
  if (ageY < 2 || ageY > 20) return { valid: false, message: 'BMI-for-age applies to ages 2 to 20 years (use the WHO 0–2 yr tool below 2).' };
  // BMI may be entered directly, or computed from weight (kg) and height (cm).
  let bmi = pos(o.bmi);
  let derived = false;
  if (bmi === null) {
    const wt = pos(o.weightKg);
    const ht = pos(o.heightCm);
    if (wt === null || ht === null) return { valid: false, message: 'Enter BMI, or both weight (kg) and height (cm).' };
    const m = ht / 100;
    bmi = wt / (m * m);
    derived = true;
  }
  if (!Number.isFinite(bmi) || bmi <= 0) return { valid: false, message: 'BMI is out of range.' };
  const lms = interpLMS(CDC_BMI_AGE[sex], ageY * 12);
  if (lms === null) return { valid: false, message: 'Age is outside the CDC BMI-for-age table (2 to 20 years).' };
  const z = lmsToZ(lms.L, lms.M, lms.S, bmi);
  if (z === null) return { valid: false, message: 'BMI is out of range.' };
  const pct = pctFromZ(z);
  const band = pct >= 95 ? 'obese (95th percentile or above)'
    : pct >= 85 ? 'overweight (85th to under the 95th percentile)'
    : pct >= 5 ? 'healthy weight (5th to under the 85th percentile)'
    : 'underweight (under the 5th percentile)';
  const abnormal = pct >= 85 || pct < 5;
  return {
    valid: true,
    bmi: r1(bmi),
    derived,
    z: r2(z),
    percentile: ordinalPct(pct),
    abnormal,
    band: `BMI ${r1(bmi)} kg/m² at age ${r1(ageY)} y: ${ordinalPct(pct)} percentile (z ${r2(z)}) — ${band}.`,
    note: BMI_NOTE,
  };
}

// --- 2.2 who-growth-zscore ----------------------------------------------------
const WHO_NOTE = 'WHO weight-for-age and length-for-age z-score (WHO Child Growth Standards; WHO Multicentre Growth Reference Study Group, Acta Paediatr Suppl, 2006). The measured weight or recumbent length is converted to an age- and sex-specific z-score by the WHO LMS transform z = ((X/M)^L - 1) / (L·S) (length-for-age uses L = 1), and the percentile is the standard-normal CDF of that z. The WHO flags a z-score below −2 as low (underweight for weight-for-age, stunted for length-for-age) and below −3 as severely low; above +2 is high. It reports the z-score, percentile, and band for an infant 0 to 24 months; the management decision stays with the clinician.';

export function whoGrowthZscore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexKey(o.sex);
  const ageM = fin(o.ageMonths);
  const measure = o.measure === 'length' ? 'length' : o.measure === 'weight' ? 'weight' : null;
  if (sex === null) return { valid: false, message: 'Choose the infant’s sex.' };
  if (measure === null) return { valid: false, message: 'Choose the measurement (weight or length).' };
  if (ageM === null) return { valid: false, message: 'Enter the infant’s age in months (0 to 24).' };
  if (ageM < 0 || ageM > 24) return { valid: false, message: 'WHO weight/length-for-age applies to ages 0 to 24 months (use the CDC BMI tool at 2 years and above).' };
  const val = pos(o.value);
  const unit = measure === 'weight' ? 'kg' : 'cm';
  if (val === null) return { valid: false, message: `Enter the measured ${measure} in ${unit}.` };
  const table = measure === 'weight' ? WHO_WT_AGE : WHO_LEN_AGE;
  const lms = interpLMS(table[sex], ageM);
  if (lms === null) return { valid: false, message: 'Age is outside the WHO 0–24 month table.' };
  const z = lmsToZ(lms.L, lms.M, lms.S, val);
  if (z === null) return { valid: false, message: `${measure === 'weight' ? 'Weight' : 'Length'} is out of range.` };
  const pct = pctFromZ(z);
  const lowWord = measure === 'weight' ? 'underweight' : 'stunted (low length-for-age)';
  const band = z < -3 ? `severely low (z below −3) — severely ${lowWord}`
    : z < -2 ? `low (z below −2) — ${lowWord}`
    : z <= 2 ? 'within the WHO reference range (z −2 to +2)'
    : `high (z above +2)`;
  const abnormal = z < -2 || z > 2;
  const label = measure === 'weight' ? 'weight-for-age' : 'length-for-age';
  return {
    valid: true,
    z: r2(z),
    percentile: ordinalPct(pct),
    measure: label,
    abnormal,
    band: `${val} ${unit} ${label} at age ${r1(ageM)} mo: z ${r2(z)} (${ordinalPct(pct)} percentile) — ${band}.`,
    note: WHO_NOTE,
  };
}

// --- 2.3 mid-parental-height --------------------------------------------------
const MPH_NOTE = 'Mid-parental target height (Tanner JM, Goldstein H, Whitehouse RH, Arch Dis Child, 1970). The predicted adult height is the average of the parents’ heights with a 13 cm sex adjustment: for a boy (father + mother + 13) / 2, for a girl (father + mother − 13) / 2. The child’s own adult height is expected to fall within about ± 8.5 cm of this value (roughly the 3rd to 97th percentile target range). It reports the target height and range; it is a genetic-potential estimate, not a guarantee, and the growth assessment stays with the clinician.';

export function midParentalHeight(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexKey(o.sex);
  const mom = pos(o.motherCm);
  const dad = pos(o.fatherCm);
  if (sex === null) return { valid: false, message: 'Choose the child’s sex.' };
  if (mom === null || dad === null) return { valid: false, message: 'Enter the mother’s and father’s heights in cm.' };
  if (mom < 100 || mom > 230 || dad < 100 || dad > 230) return { valid: false, message: 'Parent heights should be between 100 and 230 cm.' };
  const adj = sex === 'male' ? 13 : -13;
  const mph = (mom + dad + adj) / 2;
  const lo = mph - 8.5;
  const hi = mph + 8.5;
  return {
    valid: true,
    targetHeight: r1(mph),
    rangeLow: r1(lo),
    rangeHigh: r1(hi),
    abnormal: false,
    band: `Target adult height ${r1(mph)} cm (expected range ${r1(lo)}–${r1(hi)} cm, ± 8.5 cm).`,
    note: MPH_NOTE,
  };
}

// --- 2.4 corrected-age --------------------------------------------------------
const WEEKS_PER_MONTH = 365.25 / 12 / 7; // ~4.348 weeks per calendar month
const CA_NOTE = 'Corrected (adjusted) gestational age for the preterm infant (Engle WA; AAP Committee on Fetus and Newborn, Pediatrics, 2004). Correction subtracts the weeks of prematurity from the chronological age: corrected age = chronological age − (40 − gestational age at birth in weeks). It aligns developmental expectations with a 40-week term reference and is conventionally applied through about 24 months of age. It reports the corrected age; the developmental interpretation stays with the clinician.';

export function correctedAge(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const chronoM = fin(o.chronoMonths);
  const ga = fin(o.gaWeeks);
  if (chronoM === null || ga === null) return { valid: false, message: 'Enter the chronological age (months) and the gestational age at birth (weeks).' };
  if (chronoM < 0) return { valid: false, message: 'Chronological age cannot be negative.' };
  if (ga < 22 || ga > 42) return { valid: false, message: 'Gestational age at birth should be between 22 and 42 weeks.' };
  const prematurityWeeks = 40 - ga; // negative/zero for >= 40 wk (no correction)
  const corr = prematurityWeeks > 0 ? prematurityWeeks : 0;
  const correctedM = chronoM - corr / WEEKS_PER_MONTH;
  const cappedNote = chronoM > 24 ? ' Correction is conventionally no longer applied beyond about 24 months.' : '';
  const cm = correctedM < 0 ? 0 : correctedM;
  const tail = corr === 0 ? ' — term birth at or beyond 40 weeks, no correction.' : '.';
  return {
    valid: true,
    correctedMonths: r1(cm),
    prematurityWeeks: r1(corr),
    abnormal: false,
    band: `Corrected age ${r1(cm)} months (chronological ${r1(chronoM)} mo − ${r1(corr)} wk of prematurity)${tail}${cappedNote}`,
    note: CA_NOTE,
  };
}
