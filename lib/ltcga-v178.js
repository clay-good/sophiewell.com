// spec-v178 (sixth feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.6): geriatric-nutrition & dysphagia instruments
// for the long-term-care surface. v178 ships all six proposed tiles; every
// coefficient, cut-point, and band was re-fetched and cross-verified against
// >= 2 independent sources at implementation (spec-v97).
//
//   gnri        - Geriatric Nutritional Risk Index (albumin + weight/IBW), Group E.
//   pniOnodera  - Onodera Prognostic Nutritional Index (albumin + lymphocytes), Group E.
//   conut       - Controlling Nutritional Status score (albumin + cholesterol +
//                 lymphocytes -> 0-12), Group E.
//   snaq        - Simplified Nutritional Appetite Questionnaire, 4 items 1-5, Group G.
//   eat10       - Eating Assessment Tool dysphagia self-screen, 10 items 0-4, Group G.
//   determine   - DETERMINE Nutritional Health Checklist, 10 weighted items, Group G.
//
// Per the spec-v100 §2 doctrine each consumes labs / answers and returns a value
// or band; none authors a diet, feeding, or treatment order in Sophie's voice
// (spec-v11 §5.3). Citations live inline in lib/meta.js. No AI, no runtime network.
//
// FORMULAS / TABLES / CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - gnri: GNRI = 1.489 x albumin(g/L) + 41.7 x (weight / IBW), the weight/IBW
//     ratio capped at 1; IBW by the Lorentz equations (men 0.75*height_cm - 62.5,
//     women 0.60*height_cm - 40). Bands: > 98 no risk, 92-98 low, 82 to < 92
//     moderate, < 82 major (Bouillanne O, et al, Am J Clin Nutr 2005). The IBW
//     denominator is finite/positive-guarded.
//   - pniOnodera: PNI = 10 x albumin(g/dL) + 0.005 x lymphocytes(/mm^3). Onodera
//     thresholds: >= 45 no increased risk, 40 to < 45 moderate/borderline, < 40
//     high risk (Onodera T, et al, 1984).
//   - conut: points from albumin(g/dL) [>= 3.5:0, 3.0-3.49:2, 2.5-2.99:4, < 2.5:6],
//     total cholesterol(mg/dL) [>= 180:0, 140-179:1, 100-139:2, < 100:3], and
//     lymphocytes(/mm^3) [>= 1600:0, 1200-1599:1, 800-1199:2, < 800:3]; total
//     0-12; bands 0-1 normal, 2-4 mild, 5-8 moderate, 9-12 severe (Ignacio de
//     Ulibarri J, et al, Nutr Hosp 2005).
//   - snaq: 4 items each 1-5 (appetite, fullness, food taste, meals/day); total
//     4-20; <= 14 predicts >= 5% weight loss within 6 months (Wilson MM, et al,
//     Am J Clin Nutr 2005). This is the Simplified Nutritional Appetite
//     Questionnaire, not the Short Nutritional Assessment Questionnaire.
//   - eat10: 10 self-report items each 0-4; total 0-40; >= 3 abnormal swallowing /
//     aspiration risk (Belafsky PC, et al, Ann Otol Rhinol Laryngol 2008).
//   - determine: 10 weighted yes items (weights 2,3,2,2,2,4,1,1,2,2 = max 21,
//     verbatim from the ACL/NSI checklist); bands 0-2 good, 3-5 moderate, >= 6
//     high nutritional risk (Posner BM, et al, Am J Public Health 1993; NSI 1991).

import { r1 } from './num.js';

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function pos(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function yn(v) {
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null;
}

// --- 2.1 GNRI -----------------------------------------------------------------
const GNRI_NOTE = 'Geriatric Nutritional Risk Index (Bouillanne O, et al, Am J Clin Nutr 2005). GNRI = 1.489 × serum albumin (g/L) + 41.7 × (body weight ÷ ideal body weight), with the weight/ideal ratio capped at 1 and ideal body weight from the Lorentz equations. Bands: above 98 no risk, 92–98 low risk, 82 to below 92 moderate risk, below 82 major risk. It is a nutrition-related risk index, not a measure of malnutrition itself.';

export function gnri(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alb = pos(o.albuminGL);
  const weight = pos(o.weightKg);
  const height = pos(o.heightCm);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (alb === null || weight === null || height === null || !sex) {
    return { valid: false, message: 'Enter serum albumin (g/L), weight (kg), height (cm), and sex.' };
  }
  const ibw = sex === 'male' ? 0.75 * height - 62.5 : 0.60 * height - 40;
  if (!(ibw > 0)) {
    return { valid: false, message: 'Ideal body weight is non-positive for this height; check the inputs.' };
  }
  const ratio = Math.min(weight / ibw, 1);
  const value = r1(1.489 * alb + 41.7 * ratio);
  let band;
  if (value > 98) band = 'no risk (> 98)';
  else if (value >= 92) band = 'low risk (92–98)';
  else if (value >= 82) band = 'moderate risk (82 to < 92)';
  else band = 'major risk (< 82)';
  return {
    valid: true,
    value,
    bandLabel: `GNRI ${value}`,
    band: `GNRI ${value} — ${band}`,
    detail: `Ideal body weight ${r1(ibw)} kg (Lorentz); weight/ideal ratio ${r1(ratio)} (capped at 1).`,
    note: GNRI_NOTE,
  };
}

// --- 2.2 Onodera PNI ----------------------------------------------------------
const PNI_NOTE = 'Onodera Prognostic Nutritional Index (Onodera T, et al, 1984). PNI = 10 × serum albumin (g/dL) + 0.005 × total lymphocyte count (per mm³). Thresholds: 45 or more no increased risk, 40 to below 45 moderate / borderline, below 40 high nutritional and surgical risk (the original work treated below 40 as a contraindication to resection/anastomosis).';

export function pniOnodera(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alb = pos(o.albuminGdl);
  const lymph = pos(o.lymphocytes);
  if (alb === null || lymph === null) {
    return { valid: false, message: 'Enter serum albumin (g/dL) and total lymphocyte count (per mm³).' };
  }
  const value = r1(10 * alb + 0.005 * lymph);
  let band;
  if (value >= 45) band = 'no increased risk (≥ 45)';
  else if (value >= 40) band = 'moderate / borderline risk (40 to < 45)';
  else band = 'high risk (< 40)';
  return {
    valid: true,
    value,
    bandLabel: `PNI ${value}`,
    band: `PNI ${value} — ${band}`,
    detail: `10 × albumin ${alb} g/dL + 0.005 × lymphocytes ${lymph}/mm³.`,
    note: PNI_NOTE,
  };
}

// --- 2.3 CONUT ----------------------------------------------------------------
const CONUT_NOTE = 'Controlling Nutritional Status (CONUT) score (Ignacio de Ulíbarri J, et al, Nutr Hosp 2005). Points from serum albumin (g/dL): ≥ 3.5 = 0, 3.0–3.49 = 2, 2.5–2.99 = 4, < 2.5 = 6; total cholesterol (mg/dL): ≥ 180 = 0, 140–179 = 1, 100–139 = 2, < 100 = 3; total lymphocytes (per mm³): ≥ 1600 = 0, 1200–1599 = 1, 800–1199 = 2, < 800 = 3. Total 0–12: 0–1 normal, 2–4 mild, 5–8 moderate, 9–12 severe nutritional risk.';

function conutAlb(a) { return a >= 3.5 ? 0 : a >= 3.0 ? 2 : a >= 2.5 ? 4 : 6; }
function conutChol(c) { return c >= 180 ? 0 : c >= 140 ? 1 : c >= 100 ? 2 : 3; }
function conutLymph(l) { return l >= 1600 ? 0 : l >= 1200 ? 1 : l >= 800 ? 2 : 3; }

export function conut(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alb = pos(o.albuminGdl);
  const chol = pos(o.cholesterol);
  const lymph = pos(o.lymphocytes);
  if (alb === null || chol === null || lymph === null) {
    return { valid: false, message: 'Enter serum albumin (g/dL), total cholesterol (mg/dL), and total lymphocyte count (per mm³).' };
  }
  const aP = conutAlb(alb);
  const cP = conutChol(chol);
  const lP = conutLymph(lymph);
  const total = aP + cP + lP; // 0–12
  let band;
  if (total <= 1) band = 'normal (0–1)';
  else if (total <= 4) band = 'mild (2–4)';
  else if (total <= 8) band = 'moderate (5–8)';
  else band = 'severe (9–12)';
  return {
    valid: true,
    total,
    bandLabel: `CONUT ${total}/12`,
    band: `CONUT ${total}/12 — ${band}`,
    detail: `Albumin ${aP}, cholesterol ${cP}, lymphocytes ${lP} points.`,
    note: CONUT_NOTE,
  };
}

// --- 2.4 SNAQ -----------------------------------------------------------------
const SNAQ_ITEMS = ['appetite', 'fullness', 'taste', 'meals'];
const SNAQ_NOTE = 'Simplified Nutritional Appetite Questionnaire (Wilson MM, et al, Am J Clin Nutr 2005). Four appetite items — appetite, feeling full, how food tastes, and number of meals per day — each rated 1–5. Total 4–20; a score of 14 or less predicts clinically significant (≥ 5%) weight loss within 6 months. This is the appetite questionnaire, not the similarly named Short Nutritional Assessment Questionnaire.';

export function snaq(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = SNAQ_ITEMS.map((k) => intIn(o[k], 1, 5));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 4 SNAQ appetite items 1 to 5.' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 4–20
  const atRisk = total <= 14;
  return {
    valid: true,
    total,
    atRisk,
    bandLabel: `SNAQ ${total}/20`,
    band: `SNAQ ${total}/20 — ${atRisk ? 'predicts significant weight loss (≤ 14)' : 'below the weight-loss-risk cut (15–20)'}`,
    detail: `Four items each 1–5; ${total} of 20.`,
    note: SNAQ_NOTE,
  };
}

// --- 2.5 EAT-10 ---------------------------------------------------------------
const EAT10_ITEMS = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10'];
const EAT10_NOTE = 'Eating Assessment Tool (EAT-10) (Belafsky PC, et al, Ann Otol Rhinol Laryngol 2008). Ten patient self-report items — from "my swallowing problem has caused me to lose weight" to "swallowing is stressful" — each rated 0 (no problem) to 4 (severe problem). Total 0–40; a score of 3 or more indicates abnormal swallowing and possible aspiration risk. It is the patient self-report complement to a clinician swallow test.';

export function eat10(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = EAT10_ITEMS.map((k) => intIn(o[k], 0, 4));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 10 EAT-10 items 0 (no problem) to 4 (severe).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 0–40
  const abnormal = total >= 3;
  return {
    valid: true,
    total,
    abnormal,
    bandLabel: `EAT-10 ${total}/40`,
    band: `EAT-10 ${total}/40 — ${abnormal ? 'abnormal swallowing, aspiration risk (≥ 3)' : 'within normal limits (0–2)'}`,
    detail: `Ten items each 0–4; ${total} of 40.`,
    note: EAT10_NOTE,
  };
}

// --- 2.6 DETERMINE ------------------------------------------------------------
// Weights verbatim from the ACL / Nutrition Screening Initiative checklist.
const DETERMINE_WEIGHTS = {
  illness: 2,
  fewMeals: 3,
  fewFruitVeg: 2,
  alcohol: 2,
  toothMouth: 2,
  money: 4,
  eatAlone: 1,
  medications: 1,
  weightChange: 2,
  selfCare: 2,
};
const DETERMINE_NOTE = 'DETERMINE Your Nutritional Health Checklist (Nutrition Screening Initiative; Posner BM, et al, Am J Public Health 1993). Ten yes/no items with published weights — illness changing food (2), fewer than 2 meals a day (3), few fruits/vegetables/milk (2), 3+ alcoholic drinks most days (2), tooth/mouth problems (2), not enough money for food (4), eats alone most of the time (1), 3+ medications a day (1), unintended 10-lb weight change in 6 months (2), unable to shop/cook/feed self (2). Total 0–21: 0–2 good, 3–5 moderate, 6 or more high nutritional risk.';

export function determine(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const keys = Object.keys(DETERMINE_WEIGHTS);
  const answers = keys.map((k) => yn(o[k]));
  if (answers.some((x) => x === null)) {
    return { valid: false, message: 'Answer all 10 DETERMINE checklist items yes or no.' };
  }
  let total = 0;
  keys.forEach((k, i) => { if (answers[i]) total += DETERMINE_WEIGHTS[k]; });
  let band;
  if (total <= 2) band = 'good nutritional status (0–2)';
  else if (total <= 5) band = 'moderate nutritional risk (3–5)';
  else band = 'high nutritional risk (≥ 6)';
  return {
    valid: true,
    total,
    bandLabel: `DETERMINE ${total}/21`,
    band: `DETERMINE ${total}/21 — ${band}`,
    detail: `Sum of the published item weights; ${total} of 21.`,
    note: DETERMINE_NOTE,
  };
}
