// spec-v244: sports-medicine / MSK measures — the Lysholm knee score, the Marx
// activity rating scale, the Foot Posture Index (FPI-6), and the Balance Error
// Scoring System (BESS). Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v244 runs no AI and makes no runtime network call.
//
// These score / grade — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   lysholm-knee-score   - Lysholm knee scoring scale (0-100)
//   marx-activity-rating - Marx activity rating scale (0-16)
//   foot-posture-index   - Foot Posture Index (FPI-6, -12..+12)
//   bess-balance-error   - Balance Error Scoring System (0-60)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function pick(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function signed(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return Math.round(n);
}
function errs(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10) return 0;
  return Math.round(n);
}

// --- Lysholm knee score ------------------------------------------------------
// Lysholm J, Gillquist J. Am J Sports Med. 1982: limp (5), support (5), locking
// (15), instability (25), pain (25), swelling (10), stair climbing (10),
// squatting (5). Total 0-100; >= 95 excellent, 84-94 good, 65-83 fair, < 65 poor.
// Cross-verified: physiotutors; sciencedirect.
const LYS_MAX = { limp: 5, support: 5, locking: 15, instability: 25, pain: 25, swelling: 10, stair: 10, squat: 5 };
const LYS_NOTE = 'Lysholm knee score (Lysholm J, Gillquist J. Am J Sports Med. 1982): limp (0-5), support (0-5), locking (0-15), instability (0-25), pain (0-25), swelling (0-10), stair climbing (0-10), squatting (0-5). Total 0-100; >= 95 excellent, 84-94 good, 65-83 fair, < 65 poor. A knee-function score, not a diagnosis or treatment order.';
export function lysholm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of Object.keys(LYS_MAX)) s += pick(o[k], LYS_MAX[k]);
  const score = Math.round(num('Lysholm', s, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 95) { tier = 'excellent (>= 95)'; abnormal = false; }
  else if (score >= 84) { tier = 'good (84-94)'; abnormal = false; }
  else if (score >= 65) tier = 'fair (65-83)';
  else tier = 'poor (< 65)';
  return { valid: true, score, abnormal, bandLabel: `Lysholm ${score}`, band: `Lysholm knee score ${score} of 100 — ${tier}.`, detail: '8 functional items.', note: LYS_NOTE };
}

// --- Marx activity rating scale ----------------------------------------------
// Marx RG, et al. Am J Sports Med. 2001: running, cutting, deceleration, and
// pivoting, each 0-4 by frequency in the healthiest past-year state. Total 0-16;
// higher = greater knee demand. Cross-verified: PMC4547111; APTA.
const MARX_NOTE = 'Marx activity rating scale (Marx RG, et al. Am J Sports Med. 2001): running, cutting, deceleration, and pivoting, each 0-4 (0 = < 1/month, 4 = >= 4/week) in the healthiest past-year state. Total 0-16; higher = greater functional demand on the knee. An activity rating, not a diagnosis or treatment order.';
export function marxActivity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = pick(o.running, 4) + pick(o.cutting, 4) + pick(o.deceleration, 4) + pick(o.pivoting, 4);
  const score = Math.round(num('Marx', s, { min: 0, max: 16 }));
  return { valid: true, score, abnormal: false, bandLabel: `Marx ${score}`, band: `Marx activity rating ${score} of 16 — higher = more knee demand.`, detail: 'Running + cutting + deceleration + pivoting, each 0-4.', note: MARX_NOTE };
}

// --- Foot Posture Index (FPI-6) ----------------------------------------------
// Redmond AC, et al. Clin Biomech. 2006: 6 observations (talar-head palpation,
// supra/infra-lateral malleolar curvature, calcaneal inversion/eversion,
// talonavicular bulge, medial-arch congruence, forefoot abduction/adduction), each
// -2..+2. Total -12..+12; >= +10 highly pronated, +6..+9 pronated, 0..+5 normal,
// -1..-4 supinated, <= -5 highly supinated. Cross-verified: PMC4004124; Nature 2022.
const FPI_ITEMS = ['talar', 'supra', 'calcaneal', 'talonavicular', 'arch', 'forefoot'];
const FPI_NOTE = 'Foot Posture Index (Redmond AC, et al. Clin Biomech. 2006): 6 observations (talar-head palpation, supra/infra-lateral malleolar curvature, calcaneal inversion/eversion, talonavicular bulge, medial-arch congruence, forefoot abduction/adduction), each -2..+2. Total -12..+12; >= +10 highly pronated, +6..+9 pronated, 0..+5 normal, -1..-4 supinated, <= -5 highly supinated. A posture index, not a diagnosis or treatment order.';
export function footPostureIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of FPI_ITEMS) s += signed(o[k], -2, 2);
  const score = Math.round(num('FPI', s, { min: -12, max: 12 }));
  let tier; let abnormal = true;
  if (score >= 10) tier = 'highly pronated (>= +10)';
  else if (score >= 6) tier = 'pronated (+6 to +9)';
  else if (score >= 0) { tier = 'normal (0 to +5)'; abnormal = false; }
  else if (score >= -4) tier = 'supinated (-1 to -4)';
  else tier = 'highly supinated (<= -5)';
  return { valid: true, score, abnormal, bandLabel: `FPI ${score}`, band: `Foot Posture Index ${score} — ${tier}.`, detail: '6 observations each -2 to +2.', note: FPI_NOTE };
}

// --- Balance Error Scoring System (BESS) -------------------------------------
// Riemann BL, Guskiewicz KM. 1999: error counts (max 10 each) across 6 conditions
// (double-leg / single-leg / tandem stance on firm and foam surfaces, 20 s each,
// eyes closed). Total 0-60; higher = worse postural stability. Cross-verified:
// APTA; Shirley Ryan AbilityLab.
const BESS_ITEMS = ['dlFirm', 'slFirm', 'tandemFirm', 'dlFoam', 'slFoam', 'tandemFoam'];
const BESS_NOTE = 'Balance Error Scoring System (Riemann BL, Guskiewicz KM. 1999): error counts (max 10 each) across 6 conditions (double-leg / single-leg / tandem stance on firm and foam surfaces, 20 s each, eyes closed). Total 0-60; higher = worse postural stability (used in concussion assessment). A performance measure, not a diagnosis or treatment order.';
export function bess(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of BESS_ITEMS) s += errs(o[k]);
  const score = Math.round(num('BESS', s, { min: 0, max: 60 }));
  return { valid: true, score, abnormal: false, bandLabel: `BESS ${score}`, band: `BESS ${score} errors — higher = worse postural stability.`, detail: '6 conditions, up to 10 errors each.', note: BESS_NOTE };
}
