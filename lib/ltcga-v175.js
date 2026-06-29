// spec-v175 (third feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.3): observational pain-assessment instruments
// for the cognitively impaired / nonverbal elder. v175 ships all three proposed
// tiles; each item list, per-item range, and band was re-fetched and
// cross-verified against >= 2 independent sources at implementation (spec-v97).
//
//   abbeyPain  - Abbey Pain Scale, 6 items 0-3, total 0-18, mapped to
//                no-pain / mild / moderate / severe bands.
//   cnpi       - Checklist of Nonverbal Pain Indicators, 6 behaviors scored
//                present/absent both at rest and with movement; two independent
//                0-6 sums plus a 0-12 combined total.
//   doloplus2  - DOLOPLUS-2 behavioral pain scale, 10 items 0-3 across somatic
//                / psychomotor / psychosocial domains, total 0-30, threshold
//                >= 5 indicates pain.
//
// Per the spec-v100 §2 doctrine each consumes the clinician's / nurse's
// observations and returns a score mapped to the source's published bands (the
// §2 classification clarification); none authors an analgesic order in Sophie's
// voice (spec-v11 §5.3). Each renderer renders the spec-v50 §3 posture note.
// Citations live inline in lib/meta.js. No AI, no runtime network call.
//
// SCORING / BANDS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - abbeyPain: 6 observed items (vocalization, facial expression, change in
//     body language, behavioral change, physiological change, physical change),
//     each 0 (absent) / 1 (mild) / 2 (moderate) / 3 (severe); total 0-18; bands
//     0-2 no pain, 3-7 mild, 8-13 moderate, 14+ severe (Abbey J, et al, Int J
//     Palliat Nurs 2004; geriatricpain.org admin form; cross-verified).
//   - cnpi: 6 behaviors (nonverbal vocal complaints, facial grimacing/wincing,
//     bracing, restlessness, rubbing, verbal vocal complaints), each present(1)/
//     absent(0) observed separately at rest and with movement; rest 0-6,
//     movement 0-6, combined 0-12; any indicator present in either condition is
//     clinically meaningful (Feldt KS, Pain Manag Nurs 2000; geriatricpain.org
//     form; cross-verified).
//   - doloplus2: 10 items, each 0-3, across somatic (5 items, 0-15), psychomotor
//     (2 items, 0-6) and psychosocial (3 items, 0-9) reactions; total 0-30;
//     a score >= 5 / 30 indicates the presence of pain (Wary B, Doloplus
//     collective, Eur J Palliat Care 2001; doloplus.fr; cross-verified).

import { num } from './num.js';

void num; // shared numeric guard kept available for future tiles in this module

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function present(v) {
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null; // unanswered
}

// --- 2.1 Abbey Pain Scale -----------------------------------------------------
const ABBEY_ITEMS = ['vocalization', 'facialExpression', 'bodyLanguage', 'behavioralChange', 'physiologicalChange', 'physicalChange'];
const ABBEY_NOTE = 'Abbey Pain Scale (Abbey J, et al, Int J Palliat Nurs 2004). Six items observed in people with end-stage dementia — vocalization, facial expression, change in body language, behavioral change, physiological change, and physical change — each rated 0 (absent), 1 (mild), 2 (moderate), or 3 (severe). Total 0–18, mapped to no pain (0–2), mild (3–7), moderate (8–13), or severe (14+).';

export function abbeyPain(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = ABBEY_ITEMS.map((k) => intIn(o[k], 0, 3));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 6 Abbey items 0 (absent), 1 (mild), 2 (moderate), or 3 (severe).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 0–18
  let band;
  if (total <= 2) band = 'no pain (0–2)';
  else if (total <= 7) band = 'mild pain (3–7)';
  else if (total <= 13) band = 'moderate pain (8–13)';
  else band = 'severe pain (14+)';
  return {
    valid: true,
    total,
    bandLabel: `Abbey ${total}/18`,
    band: `Abbey ${total}/18 — ${band}`,
    detail: `Vocalization ${vals[0]}, facial expression ${vals[1]}, body language ${vals[2]}, behavioral change ${vals[3]}, physiological change ${vals[4]}, physical change ${vals[5]}.`,
    note: ABBEY_NOTE,
  };
}

// --- 2.2 CNPI — Checklist of Nonverbal Pain Indicators ------------------------
// Each of 6 behaviors is observed twice: once at rest and once with movement.
// The two conditions are scored independently (0–6 each); the combined total is
// 0–12. A blank condition never inherits the other's score.
const CNPI_BEHAVIOURS = ['nonverbalVocal', 'facialGrimace', 'bracing', 'restlessness', 'rubbing', 'verbalVocal'];
const CNPI_NOTE = 'Checklist of Nonverbal Pain Indicators (Feldt KS, Pain Manag Nurs 2000). Six behaviors — nonverbal vocal complaints, facial grimacing or wincing, bracing, restlessness, rubbing, and verbal vocal complaints — each scored present (1) or absent (0), observed separately at rest and with movement. The rest score and the with-movement score each run 0–6, summing to a 0–12 combined total. The scale has no formal cut: any indicator present in either condition is clinically meaningful and warrants further pain assessment.';

export function cnpi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rest = CNPI_BEHAVIOURS.map((k) => present(o[`${k}Rest`]));
  const move = CNPI_BEHAVIOURS.map((k) => present(o[`${k}Move`]));
  if (rest.some((x) => x === null) || move.some((x) => x === null)) {
    return { valid: false, message: 'Mark each of the 6 behaviors present or absent in both conditions: at rest and with movement.' };
  }
  const restScore = rest.filter(Boolean).length; // 0–6
  const moveScore = move.filter(Boolean).length; // 0–6
  const total = restScore + moveScore; // 0–12
  const positive = total > 0;
  return {
    valid: true,
    restScore,
    moveScore,
    total,
    positive,
    bandLabel: `CNPI ${total}/12`,
    band: `CNPI ${total}/12 — ${positive ? 'pain indicators observed; assess further' : 'no pain indicators observed'}`,
    detail: `At rest ${restScore}/6, with movement ${moveScore}/6.`,
    note: CNPI_NOTE,
  };
}

// --- 2.3 DOLOPLUS-2 -----------------------------------------------------------
const DOLO_SOMATIC = ['somaticComplaints', 'protectivePostureRest', 'protectionSoreAreas', 'facialExpression', 'sleepPattern'];
const DOLO_PSYCHOMOTOR = ['washingDressing', 'mobility'];
const DOLO_PSYCHOSOCIAL = ['communication', 'socialLife', 'behaviorProblems'];
const DOLO_ITEMS = [...DOLO_SOMATIC, ...DOLO_PSYCHOMOTOR, ...DOLO_PSYCHOSOCIAL];
const DOLO_NOTE = 'DOLOPLUS-2 behavioral pain assessment (Wary B, Doloplus collective, Eur J Palliat Care 2001). Ten items across three reaction domains — somatic (5 items: complaints, protective posture at rest, protection of sore areas, facial expression, sleep pattern), psychomotor (2 items: washing/dressing, mobility), and psychosocial (3 items: communication, social life, behavioral problems) — each rated 0–3. Total 0–30 (somatic 0–15, psychomotor 0–6, psychosocial 0–9); a score of 5 or more out of 30 indicates the presence of pain.';

export function doloplus2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const map = {};
  for (const k of DOLO_ITEMS) map[k] = intIn(o[k], 0, 3);
  if (DOLO_ITEMS.some((k) => map[k] === null)) {
    return { valid: false, message: 'Rate all 10 DOLOPLUS-2 items 0 to 3.' };
  }
  const somatic = DOLO_SOMATIC.reduce((a, k) => a + map[k], 0); // 0–15
  const psychomotor = DOLO_PSYCHOMOTOR.reduce((a, k) => a + map[k], 0); // 0–6
  const psychosocial = DOLO_PSYCHOSOCIAL.reduce((a, k) => a + map[k], 0); // 0–9
  const total = somatic + psychomotor + psychosocial; // 0–30
  const pain = total >= 5;
  return {
    valid: true,
    total,
    somatic,
    psychomotor,
    psychosocial,
    pain,
    bandLabel: `DOLOPLUS-2 ${total}/30`,
    band: `DOLOPLUS-2 ${total}/30 — ${pain ? 'pain indicated (≥ 5)' : 'below the pain threshold (0–4)'}`,
    detail: `Somatic ${somatic}/15, psychomotor ${psychomotor}/6, psychosocial ${psychosocial}/9.`,
    note: DOLO_NOTE,
  };
}
