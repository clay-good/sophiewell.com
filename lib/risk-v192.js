// spec-v192: four deterministic screening / bedside-risk instruments. Every id
// was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v192 runs no AI and makes no runtime network call.
// These score and stratify — they are not a screening, delivery-mode, or
// disposition order (spec-v11 §5.3).
//
//   findrisc            - Finnish Diabetes Risk Score (0-26, 10-yr T2DM band)
//   grobmanVbac         - Grobman race-free 2021 VBAC success probability
//   marburgHeartScore   - Marburg Heart Score (rule out CAD in primary-care chest pain)
//   adhereHf            - ADHERE in-hospital HF mortality (CART tree)
//
// NOTE: the fifth proposed tile (GWTG-HF, spec-v192 §2.4) is DEFERRED. Its full
// row-by-row point table (Peterson 2010 Table 3 — the per-sub-range points for
// age / SBP / BUN / heart rate / sodium) is paywalled on ahajournals.org and is
// not reproduced verbatim in any two independent open sources; only the
// categorical pieces (COPD +2, non-Black +3, 0-100 range, band map) could be
// cross-verified. A continuous-variable approximation would misreport the total
// and fail the spec-v97 fidelity bar, so GWTG-HF is parked with `precise-dapt` /
// `bvas` / `crib-ii`, not shipped from an approximation. Recorded in
// docs/scope-post-parity.md.
//
// COEFFICIENTS / POINT TABLES / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation:
//   - findrisc (Lindström J, Tuomilehto J, Diabetes Care 2003;26(3):725-731):
//     age <45 0 / 45-54 2 / 55-64 3 / >64 4; BMI <25 0 / 25-30 1 / >30 3; waist
//     men <94 0 / 94-102 3 / >102 4, women <80 0 / 80-88 3 / >88 4; inactive +2;
//     no daily fruit/veg +1; antihypertensives +2; prior high glucose +5; family
//     history 2nd-degree +3 / 1st-degree +5. Bands: <7 low ~1%, 7-11 slightly
//     elevated ~4%, 12-14 moderate ~17%, 15-20 high ~33%, >20 very high ~50%.
//   - grobmanVbac (Grobman WA, et al, Am J Obstet Gynecol 2021;225(6):664.e1-e7;
//     the race/ethnicity-free MFMU model): logit w = −5.952 − 0.023·age(y) −
//     0.024·weight(kg) + 0.056·height(cm) − 0.597·arrest-indication + 0.868·prior
//     vaginal delivery only before the cesarean + 1.869·prior VBAC − 0.966·treated
//     chronic hypertension; probability = e^w / (1 + e^w). Computed in odds space
//     (spec-v140). The 2021 model uses weight + height (NOT BMI), splits the two
//     prior-vaginal-delivery categories, and includes the arrest-indication term.
//   - marburgHeartScore (Bösner S, et al, CMAJ 2010;182(12):1295-1300): five
//     criteria each +1 — female ≥ 65 or male ≥ 55, known vascular disease
//     (CAD/CVD/PAD), pain worse with exercise, pain NOT reproducible by palpation,
//     patient assumes the pain is cardiac. 0-2 CAD unlikely (~3%), ≥ 3 higher
//     (~23%), warrants further evaluation.
//   - adhereHf (Fonarow GC, et al, JAMA 2005;293(5):572-580; CART): BUN ≥ 43 mg/dL
//     then SBP < 115 mmHg then creatinine ≥ 2.75 mg/dL. Terminal-node in-hospital
//     mortality (derivation Figure): BUN<43 & SBP≥115 low ~2.1%; BUN<43 & SBP<115
//     ~5.5%; BUN≥43 & SBP≥115 ~6.4%; BUN≥43 & SBP<115 & creat<2.75 ~12.4%;
//     BUN≥43 & SBP<115 & creat≥2.75 high ~21.9%.

import { r1 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
// Odds-space logistic (spec-v140): odds = e^bx clamped so exp() never overflows;
// probability = odds/(1+odds) — never a 1 − sigmoid complement leak.
const logisticOdds = (bx) => Math.exp(bx > 700 ? 700 : bx < -700 ? -700 : bx);
const probFromOdds = (odds) => odds / (1 + odds);

// --- 2.1 FINDRISC -----------------------------------------------------------
const FINDRISC_NOTE = 'Finnish Diabetes Risk Score / FINDRISC (Lindström J, Tuomilehto J, Diabetes Care 2003;26(3):725-731). Points: age < 45 = 0, 45–54 = 2, 55–64 = 3, > 64 = 4; BMI < 25 = 0, 25–30 = 1, > 30 = 3; waist (men) < 94 = 0, 94–102 = 3, > 102 = 4 cm (women) < 80 = 0, 80–88 = 3, > 88 = 4 cm; not physically active ≥ 30 min/day + 2; no daily fruit/vegetables + 1; on antihypertensive medication + 2; history of high blood glucose + 5; family history of diabetes 2nd-degree + 3 or 1st-degree + 5. Total 0–26. Bands (10-year type-2-diabetes risk): < 7 low ≈ 1%, 7–11 slightly elevated ≈ 4%, 12–14 moderate ≈ 17%, 15–20 high ≈ 33%, > 20 very high ≈ 50%. A screening score, not a screening order.';

function findriscAgePts(age) { return age < 45 ? 0 : age <= 54 ? 2 : age <= 64 ? 3 : 4; }
function findriscBmiPts(bmi) { return bmi < 25 ? 0 : bmi <= 30 ? 1 : 3; }
function findriscWaistPts(waist, sex) {
  if (sex === 'male') return waist < 94 ? 0 : waist <= 102 ? 3 : 4;
  return waist < 80 ? 0 : waist <= 88 ? 3 : 4;
}
const FAMILY_PTS = { none: 0, second: 3, first: 5 };

export function findrisc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bmi = pos(o.bmi, 100);
  const waist = pos(o.waist, 300);
  const sex = o.sex === 'male' ? 'male' : 'female';
  if (age === null || bmi === null || waist === null) return { valid: false, note: FINDRISC_NOTE };
  let score = findriscAgePts(age) + findriscBmiPts(bmi) + findriscWaistPts(waist, sex);
  if (!truthy(o.active)) score += 2;
  if (!truthy(o.fruitVeg)) score += 1;
  if (truthy(o.bpMed)) score += 2;
  if (truthy(o.highGlucose)) score += 5;
  const fam = Object.prototype.hasOwnProperty.call(FAMILY_PTS, String(o.familyHistory)) ? String(o.familyHistory) : 'none';
  score += FAMILY_PTS[fam];
  let band; let risk;
  if (score < 7) { band = 'low'; risk = '≈ 1%'; }
  else if (score <= 11) { band = 'slightly elevated'; risk = '≈ 4%'; }
  else if (score <= 14) { band = 'moderate'; risk = '≈ 17%'; }
  else if (score <= 20) { band = 'high'; risk = '≈ 33%'; }
  else { band = 'very high'; risk = '≈ 50%'; }
  return {
    valid: true,
    score,
    riskBand: band,
    risk,
    abnormal: score >= 12,
    bandLabel: `FINDRISC ${score}`,
    band: `FINDRISC ${score} — ${band} risk; 10-year type-2-diabetes risk ${risk}.`,
    detail: 'Best used as a screening prompt; a fasting glucose or HbA1c confirms. The bands are the source’s.',
    note: FINDRISC_NOTE,
  };
}

// --- 2.2 Grobman VBAC (race-free 2021) --------------------------------------
const GROBMAN_NOTE = 'VBAC success calculator, race/ethnicity-free 2021 MFMU model (Grobman WA, et al, Am J Obstet Gynecol 2021;225(6):664.e1-664.e7). Logit = −5.952 − 0.023·age(years) − 0.024·pre-pregnancy weight(kg) + 0.056·height(cm) − 0.597·(prior cesarean for an arrest disorder) + 0.868·(prior vaginal delivery only before the cesarean) + 1.869·(prior VBAC) − 0.966·(treated chronic hypertension); success probability = e^logit / (1 + e^logit). It is the race-free successor to the live Flamm score and a counseling aid, not a delivery-mode order.';
const VAG_HISTORY = { none: 0, before: 0.868, vbac: 1.869 };

export function grobmanVbac(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 70);
  const weight = pos(o.weight, 400);   // kg, pre-pregnancy
  const height = pos(o.height, 250);   // cm
  if (age === null || weight === null || height === null) return { valid: false, note: GROBMAN_NOTE };
  const vagKey = Object.prototype.hasOwnProperty.call(VAG_HISTORY, String(o.vaginalHistory)) ? String(o.vaginalHistory) : 'none';
  const w = -5.952
    - 0.023 * age
    - 0.024 * weight
    + 0.056 * height
    - 0.597 * (truthy(o.arrestIndication) ? 1 : 0)
    + VAG_HISTORY[vagKey]
    - 0.966 * (truthy(o.chronicHtn) ? 1 : 0);
  const prob = probFromOdds(logisticOdds(w));
  const pct = r1(prob * 100);
  return {
    valid: true,
    probability: pct,
    abnormal: false,
    bandLabel: `${pct}% success`,
    band: `Predicted VBAC success probability ${pct}%.`,
    detail: `${vagKey === 'vbac' ? 'A prior VBAC is the strongest positive predictor. ' : vagKey === 'before' ? 'A prior vaginal delivery (before the cesarean) raises the estimate. ' : ''}The race-free successor to the Flamm score; a counseling aid, not a delivery-mode order.`,
    note: GROBMAN_NOTE,
  };
}

// --- 2.3 Marburg Heart Score ------------------------------------------------
const MARBURG_NOTE = 'Marburg Heart Score (Bösner S, et al, CMAJ 2010;182(12):1295-1300): rules out coronary artery disease in primary-care chest pain. Five criteria, each 1 point — female ≥ 65 or male ≥ 55 (age/sex), known vascular disease (CAD, cerebrovascular disease, or peripheral arterial disease), pain worse with exercise, pain NOT reproducible by palpation, and the patient assumes the pain is cardiac. Score 0–2 makes CAD unlikely (≈ 3%; high negative predictive value); ≥ 3 (≈ 23%) warrants further evaluation. A primary-care rule-out aid, not a disposition order.';
const MARBURG_ITEMS = [
  { key: 'ageSex', label: 'female ≥ 65 or male ≥ 55' },
  { key: 'vascular', label: 'known vascular disease' },
  { key: 'worseExercise', label: 'pain worse with exercise' },
  { key: 'notPalpable', label: 'pain not reproducible by palpation' },
  { key: 'assumesCardiac', label: 'patient assumes pain is cardiac' },
];

export function marburgHeartScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parts = MARBURG_ITEMS.filter((it) => truthy(o[it.key])).map((it) => it.label);
  const score = parts.length;
  const unlikely = score <= 2;
  return {
    valid: true,
    score,
    abnormal: !unlikely,
    bandLabel: unlikely ? 'CAD unlikely' : 'Higher risk',
    band: `Marburg Heart Score ${score} — ${unlikely ? 'CAD unlikely (≈ 3%)' : 'higher risk (≈ 23%), warrants further evaluation'}.`,
    detail: `${parts.length ? `Criteria met: ${parts.join(', ')}.` : 'No criteria met.'} 0–2 is a rule-out band; ≥ 3 warrants further cardiac evaluation.`,
    note: MARBURG_NOTE,
  };
}

// --- 2.4 ADHERE (CART) ------------------------------------------------------
const ADHERE_NOTE = 'ADHERE in-hospital mortality classification (Fonarow GC, et al, JAMA 2005;293(5):572-580): a three-node classification-and-regression tree from admission labs. BUN ≥ 43 mg/dL, then systolic BP < 115 mmHg, then creatinine ≥ 2.75 mg/dL. Terminal-node in-hospital mortality (derivation): BUN < 43 & SBP ≥ 115 low ≈ 2.1%; BUN < 43 & SBP < 115 ≈ 5.5%; BUN ≥ 43 & SBP ≥ 115 ≈ 6.4%; BUN ≥ 43 & SBP < 115 & creatinine < 2.75 ≈ 12.4%; BUN ≥ 43 & SBP < 115 & creatinine ≥ 2.75 high ≈ 21.9%. A fast bedside triage complement to the point-based GWTG-HF. A mortality estimate for the team, not a disposition order.';

export function adhereHf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bun = pos(o.bun, 400);
  const sbp = pos(o.sbp, 300);
  const creat = pos(o.creatinine, 40);
  if (bun === null || sbp === null) return { valid: false, note: ADHERE_NOTE };
  let group; let mortality; let branch;
  if (bun < 43) {
    if (sbp >= 115) { group = 'low'; mortality = '≈ 2.1%'; branch = 'BUN < 43, SBP ≥ 115'; }
    else { group = 'intermediate'; mortality = '≈ 5.5%'; branch = 'BUN < 43, SBP < 115'; }
  } else {
    if (sbp >= 115) { group = 'intermediate'; mortality = '≈ 6.4%'; branch = 'BUN ≥ 43, SBP ≥ 115'; }
    else {
      // The deepest split needs creatinine.
      if (creat === null) return { valid: false, note: ADHERE_NOTE };
      if (creat < 2.75) { group = 'intermediate'; mortality = '≈ 12.4%'; branch = 'BUN ≥ 43, SBP < 115, creatinine < 2.75'; }
      else { group = 'high'; mortality = '≈ 21.9%'; branch = 'BUN ≥ 43, SBP < 115, creatinine ≥ 2.75'; }
    }
  }
  return {
    valid: true,
    group,
    mortality,
    abnormal: group === 'high',
    bandLabel: `${group.replace(/^./, (m) => m.toUpperCase())} risk`,
    band: `ADHERE ${group} risk — in-hospital mortality ${mortality} (${branch}).`,
    detail: 'A fast bedside triage tree; a complement to point-based heart-failure mortality models. The mortality estimate is the source’s.',
    note: ADHERE_NOTE,
  };
}
