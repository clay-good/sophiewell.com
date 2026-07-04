// spec-v250: obstetric calculators — the Pearl Index, the Robinson-Fleming crown-
// rump-length dating equation, the CARPREG II cardiac-risk score, and the Malinas
// imminent-delivery score. Each id was verified absent by a fixed-string scan of
// the extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v250 runs no AI and makes no runtime network call.
//
// These compute a rate / dating / score — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   pearl-index         - Pearl Index (contraceptive failure rate)
//   robinson-crl-dating - Robinson-Fleming CRL gestational-age dating
//   carpreg-ii          - CARPREG II cardiac-risk score
//   malinas-score       - Malinas imminent-delivery score
//
// FORMULAS / POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Pearl Index -------------------------------------------------------------
// Pearl R. 1933: Pearl Index = (number of accidental pregnancies x 1200) / total
// months of exposure = failures per 100 woman-years. A lower index is a more
// effective contraceptive method. Cross-verified: ScienceDirect; Drugs.com.
const PEARL_NOTE = 'Pearl Index (Pearl R. 1933) = (accidental pregnancies x 1200) / total woman-months of exposure = failures per 100 woman-years. A lower index reflects a more effective contraceptive method. A failure rate, not a diagnosis or treatment order.';
export function pearlIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const preg = fin(o.pregnancies, 0, 100000);
  const months = fin(o.months, 1, 10000000);
  if (preg === null || months === null) {
    return { valid: false, message: 'Enter the number of accidental pregnancies and total months of exposure.' };
  }
  const score = r2(num('Pearl', preg * 1200 / months, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `PI ${score}`, band: `Pearl index ${score} per 100 woman-years — lower = more effective.`, detail: `(${preg} pregnancies x 1200) / ${months} months.`, note: PEARL_NOTE };
}

// --- Robinson-Fleming CRL dating ---------------------------------------------
// Robinson HP, Fleming JEE. Br J Obstet Gynaecol. 1975: gestational age (days) =
// 8.052 x sqrt(1.037 x CRL) + 23.73, CRL in mm. Valid CRL 5-84 mm (6+2 to 14+0
// weeks); accurate to +/- 3-5 days. Cross-verified: Robinson 1975; Omnicalculator.
const CRL_NOTE = 'Robinson-Fleming CRL dating (Robinson HP, Fleming JEE. Br J Obstet Gynaecol. 1975): gestational age (days) = 8.052 x sqrt(1.037 x CRL) + 23.73, CRL in mm. Valid for CRL 5-84 mm (6+2 to 14+0 weeks); accurate to +/- 3-5 days. Adopted by NICE/RCOG/ISUOG. A dating estimate, not a diagnosis or treatment order.';
export function robinsonCrlDating(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const crl = fin(o.crl, 1, 120);
  if (crl === null) return { valid: false, message: 'Enter the crown-rump length (mm).' };
  const days = Math.round(num('CRL GA', 8.052 * Math.sqrt(1.037 * crl) + 23.73, { min: 0, max: 400 }));
  const weeks = Math.floor(days / 7);
  const rem = days - weeks * 7;
  const inRange = crl >= 5 && crl <= 84;
  return { valid: true, score: days, abnormal: false, bandLabel: `${weeks}w${rem}d`, band: `Robinson-Fleming gestational age ${weeks} weeks ${rem} days (${days} days) from CRL ${crl} mm.`, detail: inRange ? 'Within the validated CRL range (5-84 mm).' : 'Outside the validated CRL range (5-84 mm) — interpret with caution.', note: CRL_NOTE };
}

// --- CARPREG II --------------------------------------------------------------
// Silversides CK, et al. J Am Coll Cardiol. 2018: prior cardiac events/arrhythmias
// 3, NYHA III-IV or cyanosis 3, mechanical valve 3, ventricular dysfunction 2,
// high-risk left-sided valve / LVOT obstruction 2, pulmonary hypertension 2,
// high-risk aortopathy 2, coronary disease 2, no prior cardiac intervention 1,
// late pregnancy assessment 1. Risk: 0-1 = 5%, 2 = 10%, 3 = 15%, 4 = 22%, > 4 =
// 41%. Cross-verified: JACC 2018; MDApp.
const CARPREG_NOTE = 'CARPREG II score (Silversides CK, et al. J Am Coll Cardiol. 2018): prior cardiac events/arrhythmias 3, NYHA III-IV or cyanosis 3, mechanical valve 3, ventricular dysfunction 2, high-risk left-sided valve / LVOT obstruction 2, pulmonary hypertension 2, high-risk aortopathy 2, coronary disease 2, no prior cardiac intervention 1, late (> 20 wk) pregnancy assessment 1. Cardiac-complication risk: 0-1 = 5%, 2 = 10%, 3 = 15%, 4 = 22%, > 4 = 41%. A risk index, not a diagnosis or treatment order.';
export function carpregII(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.priorEvents)) s += 3;
  if (bool(o.nyha)) s += 3;
  if (bool(o.mechanicalValve)) s += 3;
  if (bool(o.ventricularDysfunction)) s += 2;
  if (bool(o.leftObstruction)) s += 2;
  if (bool(o.pulmonaryHypertension)) s += 2;
  if (bool(o.aortopathy)) s += 2;
  if (bool(o.coronary)) s += 2;
  if (bool(o.noPriorIntervention)) s += 1;
  if (bool(o.lateAssessment)) s += 1;
  const score = Math.round(num('CARPREG II', s, { min: 0, max: 21 }));
  let risk;
  if (score > 4) risk = 41; else if (score === 4) risk = 22; else if (score === 3) risk = 15; else if (score === 2) risk = 10; else risk = 5;
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `CARPREG ${score}`, band: `CARPREG II ${score} — ~${risk}% cardiac-complication risk${score > 4 ? ' (> 4)' : ''}.`, detail: 'Weighted maternal cardiac risk factors.', note: CARPREG_NOTE };
}

// --- Malinas score -----------------------------------------------------------
// Malinas Y: parity (1 = 0, 2 = 1, >= 3 = 2), duration of labour (< 3 h = 0, 3-5 h
// = 1, > 6 h = 2), contraction duration (< 1 min = 0, 1 min = 1, > 1 min = 2),
// interval between contractions (> 5 min = 0, 3-5 min = 1, < 3 min = 2), ruptured
// membranes (no = 0, recent = 1, > 1 h = 2). Total 0-10; < 5 transportable, >= 6
// delivery imminent. Cross-verified: Wikipedia; French SAMU obstetric guidelines.
const MALINAS_NOTE = 'Malinas score (Malinas Y): parity (1 = 0, 2 = 1, >= 3 = 2), duration of labour (< 3 h = 0, 3-5 h = 1, > 6 h = 2), contraction duration (< 1 min = 0, 1 min = 1, > 1 min = 2), interval between contractions (> 5 min = 0, 3-5 min = 1, < 3 min = 2), ruptured membranes (no = 0, recent = 1, > 1 h = 2). Total 0-10; < 5 transportable, >= 6 delivery likely imminent. A prehospital triage score, not a diagnosis or treatment order.';
const MALINAS_ITEMS = ['parity', 'duration', 'contraction', 'interval', 'membranes'];
export function malinasScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of MALINAS_ITEMS) s += lvl(o[k], 2);
  const score = Math.round(num('Malinas', s, { min: 0, max: 10 }));
  const abnormal = score >= 6;
  return { valid: true, score, abnormal, bandLabel: `Malinas ${score}`, band: `Malinas score ${score} of 10 — ${abnormal ? 'delivery likely imminent (>= 6)' : 'transport feasible (< 6)'}.`, detail: 'Parity + labour duration + contraction duration + interval + membranes.', note: MALINAS_NOTE };
}
