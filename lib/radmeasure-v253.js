// spec-v253: radiologic measurements & scores — NASCET carotid stenosis, the
// Helsinki CT score (TBI), the Genant vertebral-fracture grade, and testicular
// volume. Each id was verified absent by a fixed-string scan of the extracted
// app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v253 runs no
// AI and makes no runtime network call.
//
// These compute a percentage / score / grade / volume — they are NOT a diagnosis
// and NOT a treatment order (spec-v11 §5.3).
//
//   nascet-carotid-stenosis     - NASCET % carotid stenosis
//   helsinki-ct-score           - Helsinki CT score (TBI)
//   genant-vertebral-fracture   - Genant semiquantitative grade
//   testicular-volume           - testicular volume (Lambert)
//
// FORMULAS / POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function pick(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return Math.round(n);
}

// --- NASCET carotid stenosis -------------------------------------------------
// NASCET (NEJM 1991): % stenosis = (1 - narrowest residual lumen / normal distal
// ICA diameter) x 100. < 50% mild, 50-69% moderate, >= 70% severe (surgical
// threshold for symptomatic disease). Cross-verified: PMC7976065; Life (MDPI) 2024.
const NASCET_NOTE = 'NASCET carotid stenosis (NASCET, NEJM 1991): % stenosis = (1 - narrowest residual lumen / normal distal ICA diameter) x 100. < 50% mild, 50-69% moderate, >= 70% severe (the surgical threshold for symptomatic disease). A measurement, not a diagnosis or treatment order.';
export function nascetCarotidStenosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const narrow = fin(o.narrowest, 0, 30);
  const distal = fin(o.distal, 0.5, 30);
  if (narrow === null || distal === null) {
    return { valid: false, message: 'Enter the narrowest residual lumen and the normal distal ICA diameter (same units).' };
  }
  if (narrow > distal) return { valid: false, message: 'Residual lumen cannot exceed the distal ICA diameter.' };
  const score = r1(num('NASCET', (1 - narrow / distal) * 100, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 70) tier = 'severe (50-99%, >= 70% surgical threshold)';
  else if (score >= 50) tier = 'moderate (50-69%)';
  else { tier = 'mild (< 50%)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `${score}%`, band: `NASCET carotid stenosis ${score}% — ${tier}.`, detail: `(1 - ${narrow} / ${distal}) x 100.`, note: NASCET_NOTE };
}

// --- Helsinki CT score (TBI) -------------------------------------------------
// Raj R, et al. Neurosurgery. 2014: mass lesion type (subdural +2, intracerebral
// +2, epidural -3), mass volume > 25 mL (+2), intraventricular hemorrhage (+3),
// suprasellar cisterns (normal 0, compressed 1, obliterated 5). Range -3 to +14;
// higher = higher predicted mortality / unfavorable outcome. Cross-verified:
// PubMed 25181434; PMC9519640.
const HELSINKI_NOTE = 'Helsinki CT score (Raj R, et al. Neurosurgery. 2014): mass lesion type (subdural +2, intracerebral +2, epidural -3), mass volume > 25 mL (+2), intraventricular hemorrhage (+3), suprasellar cisterns (normal 0, compressed 1, obliterated 5). Range -3 to +14; a higher score predicts higher mortality / unfavorable 6-month outcome. A prognostic score, not a diagnosis or treatment order.';
export function helsinkiCtScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mass = pick(o.massType, -3, 2); // select supplies 0 / 2 / -3
  const size = bool(o.largeMass) ? 2 : 0;
  const ivh = bool(o.ivh) ? 3 : 0;
  const cisterns = pick(o.cisterns, 0, 5); // 0 / 1 / 5
  const score = Math.round(num('Helsinki', mass + size + ivh + cisterns, { min: -3, max: 14 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `Helsinki ${score}`, band: `Helsinki CT score ${score} — ${abnormal ? 'higher predicted mortality (>= 3)' : 'lower predicted mortality (< 3)'}.`, detail: 'Mass type + volume + IVH + suprasellar cisterns.', note: HELSINKI_NOTE };
}

// --- Genant vertebral-fracture grade -----------------------------------------
// Genant HK, et al. J Bone Miner Res. 1993: semiquantitative grade by vertebral
// height loss: grade 0 < 20%, grade 1 (mild) 20-25%, grade 2 (moderate) 26-40%,
// grade 3 (severe) > 40%. Cross-verified: QIMS 2013; radiologykey.
const GENANT_NOTE = 'Genant semiquantitative vertebral-fracture grade (Genant HK, et al. J Bone Miner Res. 1993): grade 0 < 20% height loss, grade 1 (mild) 20-25%, grade 2 (moderate) 26-40%, grade 3 (severe) > 40%. A radiographic grade, not a diagnosis or treatment order.';
export function genantVertebralFracture(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const loss = fin(o.heightLoss, 0, 100);
  if (loss === null) return { valid: false, message: 'Enter the vertebral height loss (%).' };
  let grade; let abnormal = true;
  if (loss > 40) grade = 3; else if (loss > 25) grade = 2; else if (loss >= 20) grade = 1; else { grade = 0; abnormal = false; }
  const labels = ['no fracture (< 20%)', 'mild (20-25%)', 'moderate (26-40%)', 'severe (> 40%)'];
  return { valid: true, score: grade, abnormal, bandLabel: `Genant ${grade}`, band: `Genant grade ${grade} — ${r1(loss)}% height loss, ${labels[grade]}.`, detail: 'Semiquantitative by vertebral height loss.', note: GENANT_NOTE };
}

// --- Testicular volume (Lambert) ---------------------------------------------
// Lambert B. 1951: volume (mL) = length x width x height (cm) x 0.71 (the Lambert
// constant; the ellipsoid 0.52 underestimates by ~27%). Prepubertal < 4 mL,
// pubertal onset ~4 mL, normal adult ~12-30 mL. Cross-verified: PMC3538616;
// PMC3735018.
const TV_NOTE = 'Testicular volume (Lambert formula) = length x width x height (cm) x 0.71 (the Lambert constant; the ellipsoid 0.52 underestimates by ~27%). Prepubertal < 4 mL, pubertal onset ~4 mL, normal adult ~12-30 mL (< 12 mL is hypotrophic in adults). A measurement, not a diagnosis or treatment order.';
export function testicularVolume(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const l = fin(o.length, 0.5, 15);
  const w = fin(o.width, 0.5, 15);
  const h = fin(o.height, 0.5, 15);
  if (l === null || w === null || h === null) {
    return { valid: false, message: 'Enter length, width, and height (cm).' };
  }
  const score = r2(num('Testicular volume', l * w * h * 0.71, { min: 0, max: 500 }));
  return { valid: true, score, abnormal: false, bandLabel: `${score} mL`, band: `Testicular volume ${score} mL — normal adult ~12-30 mL.`, detail: `${l} x ${w} x ${h} x 0.71.`, note: TV_NOTE };
}
