// spec-v256: rheumatology + critical-care tools — the MASES enthesitis score, the
// Manual Muscle Testing-8 (MMT-8), the Intubation Difficulty Scale (IDS), and the
// CROP weaning index. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v256 runs no AI and makes no runtime network call.
//
// These score / grade / compute a value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   mases-enthesitis            - MASES enthesitis score (0-13)
//   mmt8-myositis               - Manual Muscle Testing-8 (0-80)
//   intubation-difficulty-scale - IDS (Adnet)
//   crop-index                  - CROP weaning index
//
// POINT SYSTEMS / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

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

// --- MASES enthesitis score --------------------------------------------------
// Heuft-Dorenbosch L, et al. Ann Rheum Dis. 2003: 13 entheseal sites (1st and 7th
// costochondral, posterior and anterior superior iliac spine, iliac crest, proximal
// Achilles - each left and right - plus the L5 spinous process), each tender (1) or
// non-tender (0). Total 0-13; >= 1 indicates enthesitis. Cross-verified: PMC9510351;
// Ann Rheum Dis 2003.
const MASES_ITEMS = ['cc1R', 'cc1L', 'cc7R', 'cc7L', 'psisR', 'psisL', 'asisR', 'asisL', 'iliacR', 'iliacL', 'achillesR', 'achillesL', 'l5'];
const MASES_NOTE = 'MASES enthesitis score (Heuft-Dorenbosch L, et al. Ann Rheum Dis. 2003): 13 entheseal sites (1st and 7th costochondral, posterior and anterior superior iliac spine, iliac crest, proximal Achilles - each left and right - plus the L5 spinous process), each tender (1) or non-tender (0). Total 0-13; >= 1 indicates enthesitis. An enthesitis count, not a diagnosis or treatment order.';
export function masesEnthesitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of MASES_ITEMS) if (bool(o[k])) s += 1;
  const score = Math.round(num('MASES', s, { min: 0, max: 13 }));
  const abnormal = score >= 1;
  return { valid: true, score, abnormal, bandLabel: `MASES ${score}`, band: `MASES enthesitis ${score} of 13 — ${abnormal ? 'enthesitis present (>= 1)' : 'no tender entheses (0)'}.`, detail: '13 entheseal sites, each tender = 1.', note: MASES_NOTE };
}

// --- Manual Muscle Testing-8 (MMT-8) -----------------------------------------
// IMACS core measure: 8 muscle groups (neck flexors, deltoid, biceps, wrist
// extensors, gluteus maximus, gluteus medius, quadriceps, ankle dorsiflexors), each
// graded 0-10 (Kendall expanded scale). Total 0-80; higher = stronger. Cross-
// verified: PM&R Online; NIH/NIEHS MMT-8 scoring sheet.
const MMT8_ITEMS = ['neck', 'deltoid', 'biceps', 'wrist', 'glutMax', 'glutMed', 'quad', 'ankle'];
const MMT8_NOTE = 'Manual Muscle Testing-8 (IMACS myositis core measure): 8 muscle groups (neck flexors, deltoid, biceps, wrist extensors, gluteus maximus, gluteus medius, quadriceps, ankle dorsiflexors), each graded 0-10 (Kendall expanded scale). Total 0-80; higher = stronger. A strength score, not a diagnosis or treatment order.';
export function mmt8(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of MMT8_ITEMS) s += lvl(o[k], 10);
  const score = Math.round(num('MMT-8', s, { min: 0, max: 80 }));
  return { valid: true, score, abnormal: false, bandLabel: `MMT-8 ${score}`, band: `MMT-8 score ${score} of 80 — higher = stronger.`, detail: '8 muscle groups each 0-10.', note: MMT8_NOTE };
}

// --- Intubation Difficulty Scale (IDS) ---------------------------------------
// Adnet F, et al. Anesthesiology. 1997: N1 (attempts beyond the first) + N2
// (operators beyond the first) + N3 (alternative techniques) + N4 (Cormack-Lehane
// grade - 1) + N5 (lifting force: normal 0 / increased 1) + N6 (external laryngeal
// pressure applied: no 0 / yes 1) + N7 (vocal cords: abduction 0 / adduction 1).
// Total 0 = easy, 1-5 = slight-to-moderate difficulty, > 5 = difficult. Cross-
// verified: Anesthesiology 1997; medicalalgorithms.
const IDS_NOTE = 'Intubation Difficulty Scale (Adnet F, et al. Anesthesiology. 1997): attempts beyond the first (N1) + operators beyond the first (N2) + alternative techniques (N3) + (Cormack-Lehane grade - 1) (N4) + lifting force (normal 0 / increased 1) (N5) + external laryngeal pressure (no 0 / yes 1) (N6) + vocal cords (abduction 0 / adduction 1) (N7). Total 0 = easy, 1-5 = slight-to-moderate difficulty, > 5 = difficult intubation. A complexity score, not a diagnosis or treatment order.';
export function intubationDifficultyScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const n1 = lvl(o.extraAttempts, 20);
  const n2 = lvl(o.extraOperators, 10);
  const n3 = lvl(o.altTechniques, 10);
  const cormack = fin(o.cormack, 1, 4);
  const n4 = cormack === null ? 0 : Math.round(cormack) - 1;
  const n5 = bool(o.liftingForce) ? 1 : 0;
  const n6 = bool(o.laryngealPressure) ? 1 : 0;
  const n7 = bool(o.cordsAdducted) ? 1 : 0;
  const score = Math.round(num('IDS', n1 + n2 + n3 + n4 + n5 + n6 + n7, { min: 0, max: 50 }));
  let tier; let abnormal = true;
  if (score > 5) tier = 'difficult intubation (> 5)';
  else if (score >= 1) tier = 'slight-to-moderate difficulty (1-5)';
  else { tier = 'easy intubation (0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `IDS ${score}`, band: `Intubation Difficulty Scale ${score} — ${tier}.`, detail: `N1 ${n1} + N2 ${n2} + N3 ${n3} + N4 ${n4} + N5 ${n5} + N6 ${n6} + N7 ${n7}.`, note: IDS_NOTE };
}

// --- CROP weaning index ------------------------------------------------------
// Yang KL, Tobin MJ. N Engl J Med. 1991: CROP = [dynamic compliance x PImax x
// (PaO2 / PAO2)] / respiratory rate, where PAO2 = (760 - 47) x FiO2 - PaCO2 / 0.85.
// An index >= 13 mL/breath/min favors successful extubation. Cross-verified: NEJM
// 1991; LITFL.
const CROP_NOTE = 'CROP weaning index (Yang KL, Tobin MJ. N Engl J Med. 1991) = [dynamic compliance (mL/cmH2O) x PImax (cmH2O) x (PaO2 / PAO2)] / respiratory rate, where PAO2 = (760 - 47) x FiO2 - PaCO2 / 0.85 (sea level). An index >= 13 mL/breath/min favors successful extubation. A weaning predictor, not a diagnosis or treatment order.';
export function cropIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cdyn = fin(o.compliance, 1, 200);
  const pimax = fin(o.pimax, 1, 200);
  const pao2 = fin(o.pao2, 20, 700);
  const fio2 = fin(o.fio2, 0.21, 1);
  const paco2 = fin(o.paco2, 10, 150);
  const rr = fin(o.rr, 1, 80);
  if (cdyn === null || pimax === null || pao2 === null || fio2 === null || paco2 === null || rr === null) {
    return { valid: false, message: 'Enter dynamic compliance, PImax, PaO2, FiO2 (fraction), PaCO2, and respiratory rate.' };
  }
  const paAlv = 713 * fio2 - paco2 / 0.85;
  if (paAlv <= 0) return { valid: false, message: 'Alveolar PO2 is non-positive for these inputs.' };
  const score = r1(num('CROP', cdyn * pimax * (pao2 / paAlv) / rr, { min: 0, max: 10000 }));
  const abnormal = score < 13;
  return { valid: true, score, abnormal, bandLabel: `CROP ${score}`, band: `CROP index ${score} mL/breath/min — ${abnormal ? 'below the weaning threshold (< 13)' : 'favors extubation (>= 13)'}.`, detail: `PAO2 ${r1(paAlv)} mmHg.`, note: CROP_NOTE };
}
