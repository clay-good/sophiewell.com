// spec-v169 (feature spec of the spec-v168 Data-Sourced Reference-Table
// program): CDC 2000 stature-for-age and weight-for-age percentiles (2-20 yr) --
// the companions to the already-shipped peds-bmi-percentile (CDC BMI-for-age)
// and who-growth-zscore (WHO 0-2 yr). None duplicates a live tile; v169 parses
// no report and runs no AI.
//
//   cdcStatureForAge  - CDC 2000 stature-for-age z-score & percentile (2-20 yr)
//   cdcWeightForAge   - CDC 2000 weight-for-age z-score & percentile (2-20 yr)
//
// SCOPE NOTE (spec-v168 §3 / spec-v97 sourcing gate): the third tile docs/
// spec-v169.md proposed -- pediatric-bp-percentile -- is DEFERRED, not shipped
// here. The AAP 2017 / NHLBI Fourth Report blood-pressure percentile requires
// the verbatim regression-coefficient set (intercept + age-polynomial + height-Z
// terms by sex for SBP and DBP), which is published only inside PDF appendices
// that resisted a clean, programmatic, cross-verifiable fetch in the build
// environment. Per the spec-v97 >=2-source rule and the crib-ii/gail-bcrat
// precedent, a clinically-load-bearing table that cannot be sourced verbatim is
// parked, not approximated -- a wrong BP percentile mis-stages hypertension. It
// re-opens the moment a verbatim, cross-verifiable coefficient source is
// reachable. The two CDC growth tiles below ARE cleanly sourceable (the CDC
// LMS data files fetch verbatim and self-cross-verify against their own
// published percentile columns), so they ship.
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97). The CDC 2000 stature/
// weight LMS tables are compiled constants in lib/growth-lms-data.js, parsed
// programmatically from the verbatim-fetched CDC NCHS data files and
// cross-verified against the same files' published percentile columns (see that
// module's header). The LMS z-transform and its L -> 0 branch live there and
// are fuzzed.
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v169.js render the spec-v50 §3 clinical-
// posture note (a single percentile is not a diagnosis); the management decision
// stays with the clinician (spec-v11 §5.3).

import { r2 } from './num.js';
import { CDC_STATURE_AGE, CDC_WEIGHT_AGE, interpLMS, lmsToZ } from './growth-lms-data.js';

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
// (|error| < 1.5e-7), clamped away from the exact 0/100 endpoints so a copied
// percentile never reads as a certainty.
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
function pctFromZ(z) {
  const p = 100 * 0.5 * (1 + erf(z / Math.SQRT2));
  return p < 0.1 ? 0.1 : p > 99.9 ? 99.9 : p;
}
const pctStr = (p) => (p < 1 || p > 99 ? p.toFixed(1) : String(Math.round(p)));
// Percentile with the correct ordinal suffix (1st, 2nd, 3rd, 11th, 21st, 98th).
function ordinalPct(p) {
  const s = pctStr(p);
  if (s.includes('.')) return s + 'th';
  const n = Number(s), m100 = n % 100, m10 = n % 10;
  const suf = (m10 === 1 && m100 !== 11) ? 'st' : (m10 === 2 && m100 !== 12) ? 'nd' : (m10 === 3 && m100 !== 13) ? 'rd' : 'th';
  return s + suf;
}

// The CDC reference cutoffs shared by both stature- and weight-for-age: the
// charted 5th and 95th percentile lines bound the conventional reference range.
function bandFor(pct, measureWord) {
  if (pct < 5) return { band: `below the 5th percentile (low ${measureWord}-for-age)`, abnormal: true };
  if (pct >= 95) return { band: `95th percentile or above (high ${measureWord}-for-age)`, abnormal: true };
  return { band: 'within the CDC reference range (5th to under the 95th percentile)', abnormal: false };
}

// --- 2.2 cdc-stature-for-age --------------------------------------------------
const STATURE_NOTE = 'CDC stature-for-age percentile and z-score (2000 CDC growth charts; Kuczmarski RJ, Ogden CL, Guo SS, et al, Vital Health Stat 11, 2002). The measured standing height is converted to an age- and sex-specific z-score by the CDC LMS transform z = ((height/M)^L - 1) / (L·S), and the percentile is the standard-normal CDF of that z. The charted reference lines run from the 3rd to the 97th percentile; below the 5th or at/above the 95th percentile is conventionally flagged. It reports the percentile, z-score, and band for a child 2 to 20 years; the growth assessment stays with the clinician.';

export function cdcStatureForAge(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexKey(o.sex);
  const ageY = fin(o.ageYears);
  if (sex === null) return { valid: false, message: 'Choose the child’s sex.' };
  if (ageY === null) return { valid: false, message: 'Enter the child’s age in years (2 to 20).' };
  if (ageY < 2 || ageY > 20) return { valid: false, message: 'Stature-for-age applies to ages 2 to 20 years (use the WHO 0–2 yr tool below 2).' };
  const ht = pos(o.heightCm);
  if (ht === null) return { valid: false, message: 'Enter the measured standing height in cm.' };
  const lms = interpLMS(CDC_STATURE_AGE[sex], ageY * 12);
  if (lms === null) return { valid: false, message: 'Age is outside the CDC stature-for-age table (2 to 20 years).' };
  const z = lmsToZ(lms.L, lms.M, lms.S, ht);
  if (z === null) return { valid: false, message: 'Height is out of range.' };
  const pct = pctFromZ(z);
  const { band, abnormal } = bandFor(pct, 'stature');
  return {
    valid: true,
    z: r2(z),
    percentile: ordinalPct(pct),
    abnormal,
    band: `Height ${ht} cm at age ${r2(ageY)} y: ${ordinalPct(pct)} percentile (z ${r2(z)}) — ${band}.`,
    note: STATURE_NOTE,
  };
}

// --- 2.3 cdc-weight-for-age ---------------------------------------------------
const WEIGHT_NOTE = 'CDC weight-for-age percentile and z-score (2000 CDC growth charts; Kuczmarski RJ, Ogden CL, Guo SS, et al, Vital Health Stat 11, 2002). The measured weight is converted to an age- and sex-specific z-score by the CDC LMS transform z = ((weight/M)^L - 1) / (L·S), and the percentile is the standard-normal CDF of that z. The charted reference lines run from the 3rd to the 97th percentile; below the 5th or at/above the 95th percentile is conventionally flagged. Beyond about 10 years the CDC pairs weight with BMI-for-age rather than weight-for-age alone. It reports the percentile, z-score, and band for a child 2 to 20 years; the growth assessment stays with the clinician.';

export function cdcWeightForAge(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexKey(o.sex);
  const ageY = fin(o.ageYears);
  if (sex === null) return { valid: false, message: 'Choose the child’s sex.' };
  if (ageY === null) return { valid: false, message: 'Enter the child’s age in years (2 to 20).' };
  if (ageY < 2 || ageY > 20) return { valid: false, message: 'Weight-for-age applies to ages 2 to 20 years (use the WHO 0–2 yr tool below 2).' };
  const wt = pos(o.weightKg);
  if (wt === null) return { valid: false, message: 'Enter the measured weight in kg.' };
  const lms = interpLMS(CDC_WEIGHT_AGE[sex], ageY * 12);
  if (lms === null) return { valid: false, message: 'Age is outside the CDC weight-for-age table (2 to 20 years).' };
  const z = lmsToZ(lms.L, lms.M, lms.S, wt);
  if (z === null) return { valid: false, message: 'Weight is out of range.' };
  const pct = pctFromZ(z);
  const { band, abnormal } = bandFor(pct, 'weight');
  return {
    valid: true,
    z: r2(z),
    percentile: ordinalPct(pct),
    abnormal,
    band: `Weight ${wt} kg at age ${r2(ageY)} y: ${ordinalPct(pct)} percentile (z ${r2(z)}) — ${band}.`,
    note: WEIGHT_NOTE,
  };
}
