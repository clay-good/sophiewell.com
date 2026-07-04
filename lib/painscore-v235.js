// spec-v235: pain / disability screening instruments — the DN4 neuropathic-pain
// screen, the LANSS pain scale, the Roland-Morris Disability Questionnaire, and
// the Neck Disability Index. Each id was verified absent by a fixed-string scan of
// the extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v235 runs no AI and makes no runtime network call.
//
// These screen / grade — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   dn4-neuropathic-pain   - DN4 (Douleur Neuropathique 4) screen (0-10)
//   lanss-pain-scale       - LANSS pain scale (0-24)
//   roland-morris-disability - Roland-Morris Disability Questionnaire (0-24)
//   neck-disability-index  - Neck Disability Index (0-50 raw, %)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}

// --- DN4 ----------------------------------------------------------------------
// Bouhassira D, et al. Pain. 2005: 7 interview items (burning, painful cold,
// electric shocks; tingling, pins-and-needles, numbness, itching) and 3 exam items
// (hypoesthesia to touch, hypoesthesia to pinprick, brush allodynia), each 1 point.
// Total 0-10; >= 4 suggests neuropathic pain. Cross-verified: physio-pedia;
// PMC2217518.
const DN4_ITEMS = ['burning', 'cold', 'shocks', 'tingling', 'pins', 'numbness', 'itching', 'hypoTouch', 'hypoPinprick', 'brushAllodynia'];
const DN4_NOTE = 'DN4 (Bouhassira D, et al. Pain. 2005): 7 interview items (burning, painful cold, electric shocks; tingling, pins-and-needles, numbness, itching) and 3 exam items (hypoesthesia to touch, hypoesthesia to pinprick, brush allodynia), each 1 point. Total 0-10; a score >= 4 suggests neuropathic pain. A screening tool, not a diagnosis or treatment order.';
export function dn4(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of DN4_ITEMS) if (bool(o[k])) s += 1;
  const score = Math.round(num('DN4', s, { min: 0, max: 10 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `DN4 ${score}`, band: `DN4 ${score} of 10 — ${abnormal ? 'neuropathic pain likely (>= 4)' : 'neuropathic pain unlikely (< 4)'}.`, detail: `${score} of 10 items positive.`, note: DN4_NOTE };
}

// --- LANSS --------------------------------------------------------------------
// Bennett M. Pain. 2001: 5 weighted symptom items — dysesthesia (pricking /
// tingling / pins-and-needles) 5, autonomic skin-color change 5, evoked allodynia
// (abnormally sensitive to touch) 3, paroxysmal electric-shock bursts 2, thermal /
// burning 1 — plus 2 exam items: brush allodynia 5, altered pin-prick threshold 3.
// Total 0-24; >= 12 suggests pain of predominantly neuropathic origin. Cross-
// verified: mdapp; NIHR GM-SAT S-LANSS.
const LANSS_NOTE = 'LANSS pain scale (Bennett M. Pain. 2001): dysesthesia (pricking/tingling/pins-and-needles) 5, autonomic skin-color change 5, evoked allodynia 3, paroxysmal electric-shock bursts 2, thermal/burning 1, plus exam brush allodynia 5 and altered pin-prick threshold 3. Total 0-24; a score >= 12 suggests pain of predominantly neuropathic origin. A screening tool, not a diagnosis or treatment order.';
const LANSS_ITEMS = [['dysesthesia', 5], ['autonomic', 5], ['allodyniaReport', 3], ['paroxysmal', 2], ['thermal', 1], ['brushAllodynia', 5], ['pinprick', 3]];
export function lanss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const [k, w] of LANSS_ITEMS) if (bool(o[k])) s += w;
  const score = Math.round(num('LANSS', s, { min: 0, max: 24 }));
  const abnormal = score >= 12;
  return { valid: true, score, abnormal, bandLabel: `LANSS ${score}`, band: `LANSS ${score} of 24 — ${abnormal ? 'neuropathic mechanisms likely (>= 12)' : 'neuropathic mechanisms unlikely (< 12)'}.`, detail: 'Weighted symptom + exam items.', note: LANSS_NOTE };
}

// --- Roland-Morris Disability Questionnaire ----------------------------------
// Roland M, Morris R. Spine. 1983: 24 statements about how low-back pain limits
// daily activity; each applicable statement scores 1. Total 0-24 (higher = more
// disability); minimal detectable change ~5 points. Public domain. Cross-verified:
// Shirley Ryan AbilityLab; physio-pedia.
const RMDQ_NOTE = 'Roland-Morris Disability Questionnaire (Roland M, Morris R. Spine. 1983): 24 statements about how low-back pain limits daily activity; each applicable statement scores 1 point. Total 0-24 (higher = more disability); minimal detectable change ~5 points. Public domain. A disability measure, not a diagnosis or treatment order.';
export function rolandMorris(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const score = Math.round(num('RMDQ', lvl(o.count, 24), { min: 0, max: 24 }));
  return { valid: true, score, abnormal: score >= 14, bandLabel: `RMDQ ${score}`, band: `Roland-Morris ${score} of 24 — higher = more disability.`, detail: 'Each applicable statement scores 1; MDC ~5 points.', note: RMDQ_NOTE };
}

// --- Neck Disability Index ----------------------------------------------------
// Vernon H, Mior S. J Manipulative Physiol Ther. 1991: 10 sections (pain
// intensity, personal care, lifting, reading, headaches, concentration, work,
// driving, sleeping, recreation) each 0-5. Raw total 0-50; percentage = raw x 2.
// 0-8% none, 10-28% mild, 30-48% moderate, 50-68% severe, 70-100% complete.
// Cross-verified: Shirley Ryan AbilityLab; physio-pedia.
const NDI_NOTE = 'Neck Disability Index (Vernon H, Mior S. J Manipulative Physiol Ther. 1991): 10 sections (pain intensity, personal care, lifting, reading, headaches, concentration, work, driving, sleeping, recreation) each 0-5. Raw 0-50; percentage = raw x 2. 0-8% none, 10-28% mild, 30-48% moderate, 50-68% severe, 70-100% complete disability. A disability index, not a diagnosis or treatment order.';
const NDI_SECTIONS = ['pain', 'care', 'lifting', 'reading', 'headaches', 'concentration', 'work', 'driving', 'sleeping', 'recreation'];
export function neckDisabilityIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let raw = 0;
  for (const k of NDI_SECTIONS) raw += lvl(o[k], 5);
  raw = Math.round(num('NDI raw', raw, { min: 0, max: 50 }));
  const pctScore = Math.round(num('NDI pct', raw * 2, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (raw >= 35) tier = 'complete disability';
  else if (raw >= 25) tier = 'severe disability';
  else if (raw >= 15) tier = 'moderate disability';
  else if (raw >= 5) { tier = 'mild disability'; abnormal = false; }
  else { tier = 'no disability'; abnormal = false; }
  return { valid: true, score: pctScore, abnormal, bandLabel: `NDI ${pctScore}%`, band: `Neck Disability Index ${pctScore}% (${raw} of 50) — ${tier}.`, detail: '10 sections each 0-5; percentage = raw x 2.', note: NDI_NOTE };
}
