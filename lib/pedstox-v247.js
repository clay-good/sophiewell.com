// spec-v247: pediatric acute-care + toxicology tools — the Pediatric Trauma Score
// (Tepas), the BIND score for acute bilirubin encephalopathy, the Widmark blood-
// alcohol estimate, and the POVOC pediatric postoperative-vomiting score. Each id
// was verified absent by a fixed-string scan of the extracted app.js id/name lists
// AND the MCP adapter set first (spec-v85 §6.2). v247 runs no AI and makes no
// runtime network call.
//
// These score / estimate a value — they are NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   pediatric-trauma-score - Pediatric Trauma Score (Tepas)
//   bind-score             - Bilirubin-Induced Neurologic Dysfunction score
//   widmark-bac            - Widmark blood-alcohol estimate
//   povoc-ponv             - POVOC pediatric postoperative-vomiting score
//
// POINT SYSTEMS / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function signed(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return Math.round(n);
}
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Pediatric Trauma Score (Tepas) ------------------------------------------
// Tepas JJ, et al. J Pediatr Surg. 1987: weight, airway, systolic BP, CNS, open
// wound, and skeletal injury, each scored -1 / +1 / +2. Total -6..+12; a score
// <= 8 indicates increased mortality and prompts transfer to a pediatric trauma
// center. Cross-verified: PMC8446435; MDCalc.
const PTS_ITEMS = ['weight', 'airway', 'sbp', 'cns', 'wound', 'skeletal'];
const PTS_NOTE = 'Pediatric Trauma Score (Tepas JJ, et al. J Pediatr Surg. 1987): weight (< 10 kg -1, 10-20 kg +1, > 20 kg +2), airway (unmaintainable -1, maintainable +1, normal +2), systolic BP (< 50 -1, 50-90 +1, > 90 +2), CNS (comatose -1, obtunded +1, awake +2), open wound (major -1, minor +1, none +2), skeletal (open/multiple -1, closed +1, none +2). Total -6..+12; <= 8 indicates increased mortality / transfer to a pediatric trauma center. A triage score, not a diagnosis or treatment order.';
export function pediatricTraumaScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of PTS_ITEMS) s += signed(o[k], -1, 2);
  const score = Math.round(num('PTS', s, { min: -6, max: 12 }));
  const abnormal = score <= 8;
  return { valid: true, score, abnormal, bandLabel: `PTS ${score}`, band: `Pediatric Trauma Score ${score} — ${abnormal ? 'increased mortality risk (<= 8), transfer to a pediatric trauma center' : 'lower risk (> 8)'}.`, detail: '6 components, each -1 / +1 / +2.', note: PTS_NOTE };
}

// --- BIND score --------------------------------------------------------------
// Johnson L, Bhutani VK, et al. 1999: mental status, muscle tone, and cry pattern,
// each 0 (normal) to 3 (severe). Total 0-9; 1-3 mild/subtle, 4-6 moderate/
// progressing, 7-9 severe/advanced acute bilirubin encephalopathy. Cross-verified:
// PMC4389967; Bhutani/NNF references.
const BIND_ITEMS = ['mentalStatus', 'muscleTone', 'cry'];
const BIND_NOTE = 'Bilirubin-Induced Neurologic Dysfunction (BIND) score (Johnson L, Bhutani VK, et al. 1999): mental status, muscle tone, and cry pattern, each 0 (normal) to 3 (severe). Total 0-9; 1-3 mild/subtle, 4-6 moderate/progressing, 7-9 severe/advanced acute bilirubin encephalopathy. A severity score, not a diagnosis or treatment order.';
export function bindScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of BIND_ITEMS) s += lvl(o[k], 3);
  const score = Math.round(num('BIND', s, { min: 0, max: 9 }));
  let tier; let abnormal = true;
  if (score >= 7) tier = 'severe / advanced (7-9)';
  else if (score >= 4) tier = 'moderate / progressing (4-6)';
  else if (score >= 1) tier = 'mild / subtle (1-3)';
  else { tier = 'no signs (0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `BIND ${score}`, band: `BIND score ${score} of 9 — ${tier} acute bilirubin encephalopathy.`, detail: 'Mental status + muscle tone + cry, each 0-3.', note: BIND_NOTE };
}

// --- Widmark blood-alcohol estimate ------------------------------------------
// Widmark EMP. 1932: BAC (g/100 mL) = A / (r x W x 10) - 0.015 x t, where A =
// grams of pure alcohol, W = body weight (kg), r = 0.68 (male) / 0.55 (female),
// t = hours since drinking (beta ~ 0.015 %/h elimination). 0.08% is the common
// legal driving limit. Cross-verified: PMC4361698; Widmark 1932.
const WIDMARK_NOTE = 'Widmark blood-alcohol estimate (Widmark EMP. 1932): BAC (g/100 mL) = A / (r x weight-kg x 10) - 0.015 x t, where A = grams of pure alcohol, r = 0.68 (male) / 0.55 (female), t = hours since drinking. A population estimate (0.08% is the common legal driving limit); not a diagnosis or treatment order and not a legal measurement.';
export function widmarkBac(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const grams = fin(o.grams, 0, 1000);
  const weight = fin(o.weight, 20, 300);
  const hours = fin(o.hours, 0, 48);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (grams === null || weight === null || hours === null || sex === null) {
    return { valid: false, message: 'Enter grams of pure alcohol, body weight (kg), hours since drinking, and sex.' };
  }
  const r = sex === 'male' ? 0.68 : 0.55;
  const raw = grams / (r * weight * 10) - 0.015 * hours;
  const score = r2(num('BAC', Math.max(0, raw), { min: 0, max: 2 }));
  const abnormal = score >= 0.08;
  return { valid: true, score, abnormal, bandLabel: `BAC ${score}%`, band: `Estimated BAC ${score}% — ${abnormal ? 'at or above the 0.08% legal limit' : 'below the 0.08% legal limit'}.`, detail: `A ${grams} g / (r ${r} x ${weight} kg x 10) - 0.015 x ${hours} h.`, note: WIDMARK_NOTE };
}

// --- POVOC pediatric postoperative-vomiting score ----------------------------
// Eberhart LHJ, et al. Anesth Analg. 2004: surgery >= 30 min, age >= 3 years,
// history of POV/PONV (self or relative), and strabismus surgery, each 1 point.
// Total 0-4; POV incidence ~ 9 / 10 / 30 / 55 / 70% for 0-4 factors. Cross-
// verified: PubMed 18042855; medicalalgorithms.
const POVOC_NOTE = 'POVOC pediatric postoperative-vomiting score (Eberhart LHJ, et al. Anesth Analg. 2004): surgery >= 30 min, age >= 3 years, history of POV/PONV (self or relative), and strabismus surgery, each 1 point. Total 0-4; POV incidence rises ~ 9 / 10 / 30 / 55 / 70% for 0-4 factors. A risk score, not a diagnosis or treatment order.';
export function povocPonv(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.duration)) s += 1;
  if (bool(o.age)) s += 1;
  if (bool(o.history)) s += 1;
  if (bool(o.strabismus)) s += 1;
  const score = Math.round(num('POVOC', s, { min: 0, max: 4 }));
  const risk = [9, 10, 30, 55, 70][score];
  const abnormal = score >= 2;
  return { valid: true, score, abnormal, bandLabel: `POVOC ${score}`, band: `POVOC score ${score} of 4 — ~${risk}% postoperative-vomiting risk.`, detail: 'Duration >= 30 min, age >= 3 y, POV/PONV history, strabismus surgery.', note: POVOC_NOTE };
}
