// spec-v241: geriatric assessment tools — the Groningen Frailty Indicator (GFI),
// the Short Physical Performance Battery (SPPB), the Osteoporosis Self-assessment
// Tool (OST), and the five-times sit-to-stand test. Each id was verified absent by
// a fixed-string scan of the extracted app.js id/name lists AND the MCP adapter set
// first (spec-v85 §6.2). v241 runs no AI and makes no runtime network call.
//
// These screen / score / estimate a value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   groningen-frailty-indicator      - GFI (0-15)
//   short-physical-performance-battery - SPPB (0-12)
//   osteoporosis-self-assessment-tool - OST index
//   five-times-sit-to-stand          - 5x sit-to-stand time
//
// SCORING / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// >= 2 independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

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

// --- Groningen Frailty Indicator (GFI) ---------------------------------------
// Steverink N, Slaets JP, et al. 2001: 15 items (mobility, multimorbidity, vision,
// hearing, nutrition, cognition, and psychosocial), scored to a total 0-15; a
// total >= 4 indicates frailty. Cross-verified: Peters 2012 (J Am Med Dir Assoc);
// clinicaltoolslibrary.
const GFI_NOTE = 'Groningen Frailty Indicator (Steverink N, Slaets JP, et al. 2001): 15 items across physical (mobility, multimorbidity, fatigue, vision, hearing), cognitive, social, and psychological domains, total 0-15. A total >= 4 indicates frailty. A screening tool, not a diagnosis or treatment order.';
export function groningen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const score = Math.round(num('GFI', lvl(o.count, 15), { min: 0, max: 15 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `GFI ${score}`, band: `Groningen Frailty Indicator ${score} of 15 — ${abnormal ? 'frail (>= 4)' : 'not frail (< 4)'}.`, detail: '15 items across physical, cognitive, social, psychological domains.', note: GFI_NOTE };
}

// --- Short Physical Performance Battery (SPPB) -------------------------------
// Guralnik JM, et al. J Gerontol. 1994: balance, 4-meter gait speed, and five
// chair stands, each scored 0-4. Total 0-12; higher = better function; < 10
// indicates mobility limitation and predicts mortality. Cross-verified:
// PMC8535355; clinicaltoolslibrary. (US government work.)
const SPPB_NOTE = 'Short Physical Performance Battery (Guralnik JM, et al. J Gerontol. 1994): standing balance, 4-meter gait speed, and five chair stands, each scored 0-4. Total 0-12; higher = better function; < 10 indicates mobility limitation and predicts mortality (10-12 minimal, 7-9 mild-to-moderate, <= 6 severe). A performance battery, not a diagnosis or treatment order.';
export function sppb(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const balance = lvl(o.balance, 4), gait = lvl(o.gait, 4), chair = lvl(o.chair, 4);
  const score = Math.round(num('SPPB', balance + gait + chair, { min: 0, max: 12 }));
  let tier; let abnormal = true;
  if (score <= 6) tier = 'severe limitation (<= 6)';
  else if (score <= 9) tier = 'mild-to-moderate limitation (7-9)';
  else { tier = 'minimal limitation (10-12)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `SPPB ${score}`, band: `SPPB ${score} of 12 — ${tier}.`, detail: `Balance ${balance}, gait ${gait}, chair ${chair}.`, note: SPPB_NOTE };
}

// --- Osteoporosis Self-assessment Tool (OST) ---------------------------------
// Koh LK, et al. Osteoporos Int. 2001: OST = (weight kg - age years) x 0.2,
// truncated to an integer. > -1 low risk, -1 to -4 moderate, < -4 high risk of
// low bone mineral density. Cross-verified: PMC6068473; APTA.
const OST_NOTE = 'Osteoporosis Self-assessment Tool (Koh LK, et al. Osteoporos Int. 2001) = (weight kg - age years) x 0.2, truncated to an integer. > -1 low risk, -1 to -4 moderate, < -4 high risk of low bone mineral density (a prompt for BMD testing). A screening index, not a diagnosis or treatment order.';
export function ost(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const weight = fin(o.weight, 25, 300);
  const age = fin(o.age, 18, 120);
  if (weight === null || age === null) {
    return { valid: false, message: 'Enter weight (kg) and age (years).' };
  }
  const score = Math.trunc(num('OST', (weight - age) * 0.2, { min: -100, max: 100 }));
  let tier; let abnormal = true;
  if (score < -4) tier = 'high risk (< -4)';
  else if (score <= -1) tier = 'moderate risk (-1 to -4)';
  else { tier = 'low risk (> -1)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `OST ${score}`, band: `Osteoporosis self-assessment index ${score} — ${tier} of low bone density.`, detail: `(weight ${weight} - age ${age}) x 0.2.`, note: OST_NOTE };
}

// --- Five-times sit-to-stand test --------------------------------------------
// Csuka M, McCarty DJ. Am J Med. 1985: time (seconds) to complete five sit-to-
// stand cycles with arms folded. A time >= 12 s indicates increased fall risk in
// older adults; >= 15 s marks recurrent-faller risk. Cross-verified: Shirley Ryan
// AbilityLab; Buatois 2008.
const FTSTS_NOTE = 'Five-times sit-to-stand test (Csuka M, McCarty DJ. Am J Med. 1985): time (seconds) to complete five sit-to-stand cycles with arms folded. A time >= 12 s indicates increased fall risk in older adults; >= 15 s marks recurrent-faller risk (age-specific norms exist). A performance measure, not a diagnosis or treatment order.';
export function fiveTimesSitToStand(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const time = fin(o.time, 1, 120);
  if (time === null) return { valid: false, message: 'Enter the time to complete five sit-to-stand cycles (seconds).' };
  const score = r1(num('5xSTS', time, { min: 0, max: 120 }));
  let tier; let abnormal = true;
  if (score >= 15) tier = 'recurrent-faller risk (>= 15 s)';
  else if (score >= 12) tier = 'increased fall risk (>= 12 s)';
  else { tier = 'below the 12 s fall-risk cutoff'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `${score} s`, band: `Five-times sit-to-stand ${score} s — ${tier}.`, detail: 'Arms folded; age-specific norms also apply.', note: FTSTS_NOTE };
}
