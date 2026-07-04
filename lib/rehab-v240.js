// spec-v240: palliative / rehabilitation functional measures — the Edmonton
// Symptom Assessment System (ESAS), the Rivermead Mobility Index, the predicted
// six-minute walk distance (Enright-Sherrill), and QuickDASH. Each id was verified
// absent by a fixed-string scan of the extracted app.js id/name lists AND the MCP
// adapter set first (spec-v85 §6.2). v240 runs no AI and makes no runtime network
// call.
//
// These sum / estimate a value — they are NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   esas-symptom-assessment   - Edmonton Symptom Assessment System (0-90)
//   rivermead-mobility-index  - Rivermead Mobility Index (0-15)
//   six-minute-walk-predicted - predicted 6MWD (Enright-Sherrill)
//   quickdash                 - QuickDASH (0-100)
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

// --- Edmonton Symptom Assessment System (ESAS) -------------------------------
// Bruera E, et al. J Palliat Care. 1991: 9 symptoms (pain, tiredness, drowsiness,
// nausea, lack of appetite, shortness of breath, depression, anxiety, wellbeing),
// each 0-10. Total symptom distress 0-90; higher = worse. Cross-verified: Alberta
// Health Services; PMC5337174.
const ESAS_ITEMS = ['pain', 'tiredness', 'drowsiness', 'nausea', 'appetite', 'dyspnea', 'depression', 'anxiety', 'wellbeing'];
const ESAS_NOTE = 'Edmonton Symptom Assessment System (Bruera E, et al. J Palliat Care. 1991): 9 symptoms (pain, tiredness, drowsiness, nausea, lack of appetite, shortness of breath, depression, anxiety, wellbeing), each 0-10. Total symptom distress 0-90; higher = greater symptom burden. A symptom inventory, not a diagnosis or treatment order.';
export function esas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of ESAS_ITEMS) s += lvl(o[k], 10);
  const score = Math.round(num('ESAS', s, { min: 0, max: 90 }));
  return { valid: true, score, abnormal: false, bandLabel: `ESAS ${score}`, band: `Edmonton Symptom Assessment total ${score} of 90 — higher = greater symptom burden.`, detail: '9 symptoms each 0-10.', note: ESAS_NOTE };
}

// --- Rivermead Mobility Index (RMI) ------------------------------------------
// Collen FM, et al. Int Disabil Stud. 1991: 15 items (14 self-reported + 1
// observed) scored yes = 1 / no = 0. Total 0-15; higher = more independent
// mobility. Cross-verified: Shirley Ryan AbilityLab; SCIRE.
const RMI_NOTE = 'Rivermead Mobility Index (Collen FM, et al. Int Disabil Stud. 1991): 15 mobility items (14 self-reported + 1 observed stand), each yes = 1 / no = 0. Total 0-15; higher = more independent mobility. A mobility measure, not a diagnosis or treatment order.';
export function rivermead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const score = Math.round(num('RMI', lvl(o.count, 15), { min: 0, max: 15 }));
  return { valid: true, score, abnormal: false, bandLabel: `RMI ${score}`, band: `Rivermead Mobility Index ${score} of 15 — higher = more independent mobility.`, detail: 'Each achieved item scores 1.', note: RMI_NOTE };
}

// --- Predicted six-minute walk distance (Enright-Sherrill) -------------------
// Enright PL, Sherrill DL. Am J Respir Crit Care Med. 1998;158(5):1384-1387:
// men 6MWD = 7.57 x height(cm) - 5.02 x age - 1.76 x weight(kg) - 309; women
// 6MWD = 2.11 x height(cm) - 2.29 x weight(kg) - 5.78 x age + 667. Lower limit of
// normal = predicted - 153 m (men) / - 139 m (women). Cross-verified: Am J Respir
// Crit Care Med 1998; medicalalgorithms.
const SMWD_NOTE = 'Predicted six-minute walk distance (Enright PL, Sherrill DL. Am J Respir Crit Care Med. 1998;158:1384-1387): men = 7.57 x height(cm) - 5.02 x age - 1.76 x weight(kg) - 309; women = 2.11 x height(cm) - 2.29 x weight(kg) - 5.78 x age + 667. Lower limit of normal = predicted - 153 m (men) / - 139 m (women). A reference value, not a diagnosis or treatment order.';
export function sixMinuteWalkPredicted(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  const height = fin(o.height, 100, 250);
  const age = fin(o.age, 18, 110);
  const weight = fin(o.weight, 20, 300);
  if (sex === null || height === null || age === null || weight === null) {
    return { valid: false, message: 'Enter sex, height (cm), age (years), and weight (kg).' };
  }
  let pred; let lln;
  if (sex === 'male') { pred = 7.57 * height - 5.02 * age - 1.76 * weight - 309; lln = pred - 153; }
  else { pred = 2.11 * height - 2.29 * weight - 5.78 * age + 667; lln = pred - 139; }
  const score = Math.round(num('6MWD', pred, { min: 0, max: 1200 }));
  const llnR = Math.round(num('6MWD LLN', Math.max(0, lln), { min: 0, max: 1200 }));
  return { valid: true, score, abnormal: false, bandLabel: `${score} m`, band: `Predicted 6-minute walk ${score} m (lower limit ${llnR} m).`, detail: `${sex}, height ${height} cm, age ${age}, weight ${weight} kg.`, note: SMWD_NOTE };
}

// --- QuickDASH ---------------------------------------------------------------
// Beaton DE, et al (Institute for Work & Health): 11 items each 1-5; score =
// [(sum of responses / n) - 1] x 25, where n items are answered (>= 10 required).
// 0-100; higher = greater upper-limb disability. Cross-verified: dash.iwh.on.ca;
// orthotoolkit.
const QUICKDASH_ITEMS = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10', 'i11'];
const QUICKDASH_NOTE = 'QuickDASH (Beaton DE, et al; Institute for Work & Health): 11 items each 1-5; score = [(sum of responses / n) - 1] x 25, with n answered items (>= 10 required). 0-100; higher = greater upper-limb disability. A disability measure, not a diagnosis or treatment order.';
export function quickDash(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let sum = 0; let n = 0;
  for (const k of QUICKDASH_ITEMS) {
    const v = fin(o[k], 1, 5);
    if (v !== null) { sum += v; n += 1; }
  }
  if (n < 10) return { valid: false, message: 'Answer at least 10 of the 11 items (each 1-5).' };
  const score = r1(num('QuickDASH', (sum / n - 1) * 25, { min: 0, max: 100 }));
  return { valid: true, score, abnormal: false, bandLabel: `QuickDASH ${score}`, band: `QuickDASH ${score} of 100 — higher = greater upper-limb disability.`, detail: `${n} items answered.`, note: QUICKDASH_NOTE };
}
