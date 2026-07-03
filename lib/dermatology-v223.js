// spec-v223: dermatology activity, staging & screening instruments — UAS7,
// HiSCR, Hurley staging, POEM, ALDEN, PEST, and the weighted Glasgow 7-point
// melanoma checklist. Every id was verified absent by a direct scan of app.js
// first (spec-v85 §6.2). None duplicates a live tile; v223 runs no AI and makes no
// runtime network call. These score / classify / screen — they are NOT a treatment
// or referral order (spec-v11 §5.3).
//
//   uas7        - Urticaria Activity Score over 7 days
//   hiscr       - Hidradenitis Suppurativa Clinical Response
//   hurleyStage - Hurley staging (hidradenitis suppurativa)
//   poem        - Patient-Oriented Eczema Measure
//   alden       - Algorithm of Drug Causality for Epidermal Necrolysis
//   pest        - Psoriasis Epidemiology Screening Tool
//   glasgow7    - Weighted Glasgow 7-point checklist (melanoma)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function selN(v, lo, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return n;
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- UAS7 --------------------------------------------------------------------
// Mlynek A, et al, Allergy 2008;63(6):777-780 + Hawro T, et al, Am J Clin
// Dermatol 2018: daily wheal (0-3) + itch (0-3) summed over 7 days (0-42).
// 0 urticaria-free, 1-6 well-controlled, 7-15 mild, 16-27 moderate, 28-42 severe.
const UAS7_NOTE = 'UAS7 (Mlynek A, et al, Allergy 2008;63(6):777-780): daily wheal (0-3) plus itch (0-3) scores summed over 7 days (0-42). 0 urticaria-free, 1-6 well-controlled, 7-15 mild, 16-27 moderate, 28-42 severe. A disease-activity measure, not a treatment order.';
export function uas7(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wheals = pos(o.whealSum, 21);
  const itch = pos(o.itchSum, 21);
  if (wheals === null || itch === null) {
    return { valid: false, message: 'Enter the 7-day sum of daily wheal scores (0-21) and the 7-day sum of daily itch scores (0-21).' };
  }
  const score = Math.round(num('UAS7', wheals + itch, { min: 0, max: 42 }));
  let tier; let abnormal = true;
  if (score >= 28) tier = 'severe (28-42)';
  else if (score >= 16) tier = 'moderate (16-27)';
  else if (score >= 7) tier = 'mild (7-15)';
  else if (score >= 1) tier = 'well-controlled (1-6)';
  else { tier = 'urticaria-free (0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `UAS7 ${score}`, band: `UAS7 ${score} / 42 — ${tier}.`, detail: `wheals ${Math.round(wheals)} + itch ${Math.round(itch)} = ${score}.`, note: UAS7_NOTE };
}

// --- HiSCR -------------------------------------------------------------------
// Kimball AB, et al, Br J Dermatol 2014;171(6):1434-1442: AN count = abscesses +
// inflammatory nodules. Achieved if all: >= 50% reduction in AN count vs baseline;
// no increase in abscess count; no increase in draining-fistula count.
const HISCR_NOTE = 'HiSCR (Kimball AB, et al, Br J Dermatol 2014;171(6):1434-1442): with AN count = abscesses + inflammatory nodules, a responder has (1) >= 50% reduction in AN count vs baseline, (2) no increase in abscess count, and (3) no increase in draining-fistula count. Validated for baseline AN >= 3. A response endpoint, not a treatment order.';
export function hiscr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bAb = pos(o.baselineAbscess, 5000);
  const bNod = pos(o.baselineNodule, 5000);
  const cAb = pos(o.currentAbscess, 5000);
  const cNod = pos(o.currentNodule, 5000);
  const bFist = pos(o.baselineFistula, 5000);
  const cFist = pos(o.currentFistula, 5000);
  if ([bAb, bNod, cAb, cNod, bFist, cFist].some((x) => x === null)) {
    return { valid: false, message: 'Enter baseline and current abscess, inflammatory-nodule, and draining-fistula counts (0 or more).' };
  }
  const baseAN = bAb + bNod; const currAN = cAb + cNod;
  const reduction = baseAN > 0 ? (baseAN - currAN) / baseAN : 0;
  const achieved = baseAN > 0 && reduction >= 0.5 && cAb <= bAb && cFist <= bFist;
  return {
    valid: true, achieved, reduction: r1(reduction * 100), abnormal: !achieved,
    bandLabel: achieved ? 'HiSCR achieved' : 'HiSCR not achieved',
    band: achieved
      ? `HiSCR achieved — ${r1(reduction * 100)}% AN reduction with no increase in abscesses or draining fistulas.`
      : `HiSCR not achieved (AN reduction ${r1(reduction * 100)}%, abscess ${cAb <= bAb ? 'not increased' : 'increased'}, fistula ${cFist <= bFist ? 'not increased' : 'increased'}).`,
    detail: `baseline AN ${baseAN}, current AN ${currAN}.`, note: HISCR_NOTE,
  };
}

// --- Hurley staging ----------------------------------------------------------
// Hurley HJ, 1989 (Dermatologic Surgery) + Ovadja ZN, et al, Br J Dermatol
// 2019;181(2):344-349: Stage I abscess(es) without sinus tracts or scarring;
// Stage II recurrent abscesses with sinus tracts and scarring; Stage III diffuse
// involvement or multiple interconnected tracts and abscesses.
const HURLEY_NOTE = 'Hurley staging (Hurley HJ, 1989): Stage I = abscess(es) without sinus tracts or scarring; Stage II = recurrent abscesses with sinus-tract formation and scarring (single or widely separated lesions); Stage III = diffuse involvement, or multiple interconnected sinus tracts and abscesses across an area. Report the worst affected region. A staging classification, not a treatment order.';
export function hurleyStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const diffuse = bool(o.diffuse);
  const tractsScarring = bool(o.sinusTract) || bool(o.scarring);
  let stage; let abnormal = true;
  if (diffuse) stage = 'III';
  else if (tractsScarring) stage = 'II';
  else { stage = 'I'; abnormal = false; }
  const desc = stage === 'III' ? 'diffuse involvement or interconnected tracts/abscesses' : stage === 'II' ? 'recurrent abscesses with sinus tracts and scarring' : 'abscess(es) without sinus tracts or scarring';
  return { valid: true, stage, abnormal, bandLabel: `Hurley ${stage}`, band: `Hurley stage ${stage} — ${desc}.`, detail: `Stage ${stage}.`, note: HURLEY_NOTE };
}

// --- POEM --------------------------------------------------------------------
// Charman CR, et al, Arch Dermatol 2004;140(12):1513-1519 + Charman CR, et al,
// Br J Dermatol 2013: 7 symptom items each 0-4 (by days/week), total 0-28.
// 0-2 clear, 3-7 mild, 8-16 moderate, 17-24 severe, 25-28 very severe.
const POEM_NOTE = 'POEM (Charman CR, et al, Arch Dermatol 2004;140(12):1513-1519): 7 symptom items (itch, sleep disturbance, bleeding, weeping/oozing, cracking, flaking, dryness) each scored 0-4 by days affected in the past week (0-28). 0-2 clear/almost clear, 3-7 mild, 8-16 moderate, 17-24 severe, 25-28 very severe. A patient-reported eczema measure, not a treatment order.';
const POEM_ITEMS = ['itch', 'sleep', 'bleeding', 'weeping', 'cracking', 'flaking', 'dryness'];
export function poem(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of POEM_ITEMS) s += selN(o[k], 0, 4);
  const score = Math.round(num('POEM', s, { min: 0, max: 28 }));
  let tier; let abnormal = true;
  if (score >= 25) tier = 'very severe (25-28)';
  else if (score >= 17) tier = 'severe (17-24)';
  else if (score >= 8) tier = 'moderate (8-16)';
  else if (score >= 3) tier = 'mild (3-7)';
  else { tier = 'clear / almost clear (0-2)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `POEM ${score}`, band: `POEM ${score} / 28 — ${tier}.`, detail: `sum of 7 items = ${score}.`, note: POEM_NOTE };
}

// --- ALDEN -------------------------------------------------------------------
// Sassolas B, et al, Clin Pharmacol Ther 2010;88(1):60-68 (per-drug): delay to
// index day (suggestive 3, compatible 2, likely 1, unlikely -1, excluded -3);
// drug present on index day (definite 0, doubtful -1, excluded -3);
// pre/rechallenge (positive-specific 4, positive 2, positive-unspecific 1, none 0,
// negative -2); dechallenge (neutral 0, negative -2); drug notoriety (strong 3,
// associated 2, suspected 1, unknown 0, not-suspected -1); another cause more
// likely -1. Bands: < 0 very unlikely, 0-1 unlikely, 2-3 possible, 4-5 probable,
// >= 6 very probable.
const ALDEN_NOTE = 'ALDEN (Sassolas B, et al, Clin Pharmacol Ther 2010;88(1):60-68): a per-drug causality score for Stevens-Johnson syndrome / toxic epidermal necrolysis - delay to index day, drug present on index day, pre/rechallenge, dechallenge, drug notoriety, and whether another cause is more likely. < 0 very unlikely, 0-1 unlikely, 2-3 possible, 4-5 probable, >= 6 very probable. A causality assessment, not a treatment order.';
export function alden(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  s += selN(o.delay, -3, 3);
  s += selN(o.drugPresent, -3, 0);
  s += selN(o.challenge, -2, 4);
  s += selN(o.dechallenge, -2, 0);
  s += selN(o.notoriety, -1, 3);
  if (bool(o.otherCause)) s -= 1;
  const score = Math.round(num('ALDEN', s, { min: -12, max: 10 }));
  let tier; let abnormal = true;
  if (score >= 6) tier = 'very probable (>= 6)';
  else if (score >= 4) tier = 'probable (4-5)';
  else if (score >= 2) tier = 'possible (2-3)';
  else if (score >= 0) tier = 'unlikely (0-1)';
  else { tier = 'very unlikely (< 0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `ALDEN ${score}`, band: `ALDEN score ${score} — ${tier} drug causality.`, detail: `per-drug causality sum = ${score}.`, note: ALDEN_NOTE };
}

// --- PEST --------------------------------------------------------------------
// Ibrahim GH, et al, Clin Exp Rheumatol 2009;27(3):469-474 + Coates LC, et al, J
// Rheumatol 2011: 5 yes/no items (swollen joint ever, arthritis diagnosis, nail
// pits/holes, heel pain, dactylitis), 1 point each; >= 3 -> refer for possible
// psoriatic arthritis.
const PEST_NOTE = 'PEST (Ibrahim GH, et al, Clin Exp Rheumatol 2009;27(3):469-474): 5 yes/no items (ever a swollen joint, a doctor diagnosis of arthritis, nail pits/holes, heel pain, a finger/toe completely swollen and painful [dactylitis]), 1 point each. A total >= 3 flags possible psoriatic arthritis and prompts rheumatology referral. A screening tool, not a diagnosis.';
export function pest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, l) => { if (bool(o[c])) { s += 1; p.push(l); } };
  add('swollenJoint', 'ever a swollen joint'); add('arthritisDx', 'arthritis diagnosis'); add('nailPits', 'nail pits/holes');
  add('heelPain', 'heel pain'); add('dactylitis', 'dactylitis');
  const score = Math.round(num('PEST', s, { min: 0, max: 5 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `PEST ${score}`, band: `PEST score ${score} — ${abnormal ? 'positive (>= 3): refer for possible psoriatic arthritis' : 'negative (< 3)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No items.', note: PEST_NOTE };
}

// --- Weighted Glasgow 7-point checklist --------------------------------------
// MacKie RM, BMJ 1990;301(6759):1005-1006 + NICE NG12: major features (change in
// size, irregular shape/border, irregular color) 2 points each; minor features
// (diameter >= 7 mm, inflammation, oozing/crusting, change in sensation) 1 point
// each. A score >= 3 prompts referral for suspected melanoma.
const GLASGOW7_NOTE = 'Weighted Glasgow 7-point checklist (MacKie RM, BMJ 1990;301(6759):1005-1006; major-feature weighting): major features (change in size, irregular shape/border, irregular color) 2 points each; minor features (largest diameter >= 7 mm, inflammation, oozing/crusting, change in sensation) 1 point each. A score >= 3 prompts referral for a suspicious pigmented lesion. A screening checklist, not a diagnosis.';
export function glasgow7(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, pts, l) => { if (bool(o[c])) { s += pts; p.push(`${l} (+${pts})`); } };
  add('size', 2, 'change in size'); add('shape', 2, 'irregular shape/border'); add('color', 2, 'irregular color');
  add('diameter', 1, 'diameter >= 7 mm'); add('inflammation', 1, 'inflammation'); add('oozing', 1, 'oozing/crusting'); add('sensation', 1, 'change in sensation');
  const score = Math.round(num('Glasgow7', s, { min: 0, max: 10 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `Glasgow ${score}`, band: `Weighted Glasgow 7-point checklist ${score} — ${abnormal ? 'refer (>= 3): suspicious pigmented lesion' : 'below the referral threshold (< 3)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No features.', note: GLASGOW7_NOTE };
}
