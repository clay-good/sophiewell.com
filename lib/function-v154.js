// spec-v154 (the fourth implementation spec of the spec-v150 Post-Parity
// Coverage program): four deterministic performance-based function / falls /
// palliative instruments that fill a confirmed gap — the catalog carried fall
// *risk-prediction* scores (morse-falls, hendrich-ii) and frailty screens but
// NO performance-based mobility/balance measure, and palliative care had
// ecog-karnofsky but NOT the Palliative Performance Scale that anchors hospice
// eligibility. None duplicates a live tile; v154 runs no AI and makes no
// runtime network call.
//
//   berg-balance  - Berg Balance Scale (BBS), 14 tasks 0-4, total 0-56
//   tug           - Timed Up & Go, measured seconds with CDC STEADI threshold
//   tinetti-poma  - Tinetti Performance-Oriented Mobility Assessment, 0-28
//   pps           - Palliative Performance Scale v2 (PPSv2), 0%-100%
//
// Per the spec-v100 §2 doctrine each is a bounded item sum, a thresholded
// single measure (TUG), or a deterministic input->level mapping (PPS) over
// fixed-range inputs (spec-v29 §3 one-line test). A blank/unanswered input
// renders a surfaced valid:false complete-the-fields fallback rather than a
// spurious score (spec-v59 output safety). Citations live inline in
// lib/meta.js; the renderers in views/group-v154.js render the spec-v50 §3
// posture note (a performance observation, not a prognosis order) and defer the
// disposition to the clinician (spec-v11 §5.3).
//
// ITEM SCORING AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-
// verified across >= 2 independent sources at implementation (the original
// validation papers, the Shirley Ryan AbilityLab Rehab Measures database,
// StatPearls, the CDC STEADI materials, and the Victoria Hospice PPSv2 sample).
// SOURCE-GOVERNANCE:
//   - berg-balance (Berg K, Wood-Dauphinee S, Williams JI, Maki B, Can J Public
//     Health 1992;83 Suppl 2:S7-11): FOURTEEN tasks each 0-4 summed 0-56; strata
//     0-20 wheelchair-bound / high fall risk, 21-40 walking with assistance,
//     41-56 walking independently. The widely quoted fall-risk cutoff is
//     STRICT < 45 (a score of exactly 45 sits on the lower-risk side); the
//     literature also notes a lower < 40 cutoff with higher specificity, but the
//     45/56 figure is the canonical one and the only one surfaced.
//   - tug (Podsiadlo D, Richardson S, J Am Geriatr Soc 1991;39(2):142-148):
//     the measured time in seconds to rise, walk 3 m, turn, return, and sit. CDC
//     STEADI flags increased fall risk at >= 12 s (inclusive); the community-
//     dwelling research cutoff is >= 13.5 s (Shumway-Cook 2000); the original
//     functional banding rates >= 30 s as dependent in transfers/ADLs. Higher
//     time = higher risk (one secondary source inverts this — it is wrong).
//   - tinetti-poma (Tinetti ME, J Am Geriatr Soc 1986;34(2):119-126): the 28-
//     point version — balance subscale 0-16, gait subscale 0-12, total 0-28.
//     Bands (MDCalc / StatPearls): <= 18 high fall risk, 19-23 moderate, >= 24
//     low. (The printed POMA form classifies a score of 24 as moderate; this
//     tile follows the MDCalc/StatPearls 24 = low convention. A 30-point balance
//     variant exists; this is the 28-point total — do not mix.)
//   - pps (Anderson F, Downing GM, Hill J, et al, J Palliat Care 1996;12(1):5-11;
//     PPSv2 Victoria Hospice Society 2001): FIVE columns read left-to-right with
//     LEFTWARD PRECEDENCE — ambulation, activity & evidence of disease, self-
//     care, intake, conscious level — resolving to a level 0%-100% in 10%
//     decrements (0% = death). Each column descriptor maps to a SET of levels
//     (e.g. ambulation "Full" spans 100/90/80), so the level is the best
//     horizontal fit: the running candidate set is intersected column-by-column
//     from the left, and a rightward column that conflicts with the leftward-
//     established set is overridden (leftward precedence) and flagged rather than
//     forcing an empty result.

import { num } from './num.js';

// Read one fixed-range item: '' / null / undefined -> null (so a caller can
// surface a complete-the-fields fallback); otherwise clamp to [0, max] integer.
function item(v, max) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(0, Math.round(n)));
}

// Sum a fixed list of items, collecting the 1-based positions still missing.
function sumItems(o, keys, max) {
  const missing = [];
  let total = 0;
  keys.forEach((k, i) => {
    const v = item(o[k], max);
    if (v === null) missing.push(`#${i + 1}`);
    else total += v;
  });
  return { total, missing };
}

const cap = (s) => s.replace(/^./, (m) => m.toUpperCase());

// --- 2.1 Berg Balance Scale (BBS) --------------------------------------------
const BERG_NOTE = 'Berg Balance Scale (Berg K, Wood-Dauphinee S, Williams JI, Maki B. Measuring balance in the elderly: validation of an instrument. Can J Public Health. 1992;83 Suppl 2:S7-11) — a 14-task performance battery, each task scored 0 (unable) to 4 (independent and safe), summed 0–56. The total is read as 0–20 wheelchair-bound / high fall risk, 21–40 walking with assistance, and 41–56 walking independently; a total below 45 is the canonical threshold for increased fall risk (the literature also notes a lower, more specific cut-off near 40). It is a measured performance observation; the fall-prevention plan stays with the care team.';
const BERG_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14'];

export function bergBalance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, missing } = sumItems(o, BERG_KEYS, 4);
  if (missing.length) {
    return { valid: false, message: `Score all 14 tasks 0–4 — ${missing.length} still needed (${missing.join(', ')}).` };
  }
  const t = num('Berg total', total, { min: 0, max: 56 });
  let band;
  if (t <= 20) band = 'wheelchair-bound / high fall risk';
  else if (t <= 40) band = 'walking with assistance';
  else band = 'walking independently';
  const increasedRisk = t < 45; // Berg 1992: < 45/56 = increased fall risk
  let bandText = `Berg Balance ${t}/56 — ${band}.`;
  bandText += increasedRisk
    ? ' Below 45 — increased fall risk.'
    : ' At or above 45 — lower fall-risk band.';
  return {
    valid: true,
    score: t,
    bandLabel: cap(band),
    abnormal: increasedRisk,
    increasedRisk,
    band: bandText,
    detail: `sum of fourteen 0–4 task scores = ${t}.`,
    note: BERG_NOTE,
  };
}

// --- 2.2 Timed Up & Go (TUG) -------------------------------------------------
const TUG_NOTE = 'Timed Up & Go (Podsiadlo D, Richardson S. The Timed "Up & Go": a test of basic functional mobility for frail elderly persons. J Am Geriatr Soc. 1991;39(2):142-148) — the time in seconds to rise from a standard armchair, walk 3 m, turn, walk back, and sit. The CDC STEADI program flags increased fall risk at ≥ 12 s; the community-dwelling research cut-off is ≥ 13.5 s (Shumway-Cook 2000); the original functional bands rate ≥ 30 s as dependent in transfers and ADLs. A longer time means higher risk. Standardize the chair height, allow the usual walking aid, and use a single timed trial; it is one measure alongside the clinical assessment.';

export function tug(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = o.seconds;
  if (typeof s !== 'number' || !Number.isFinite(s)) {
    return { valid: false, message: 'Enter the measured Timed Up & Go time in seconds.' };
  }
  if (s < 0 || s > 600) {
    return { valid: false, message: 'Enter a time in seconds within a plausible range (0–600).' };
  }
  const secs = num('TUG seconds', s, { min: 0, max: 600 });
  const steadi = secs >= 12; // CDC STEADI: >= 12 s
  const community = secs >= 13.5; // Shumway-Cook 2000 community-dwelling cutoff
  const dependent = secs >= 30; // original functional band: dependent in ADLs
  let band;
  if (!steadi) band = `TUG ${secs} s — below the 12 s CDC STEADI threshold; not flagged for increased fall risk on this measure alone.`;
  else if (!community) band = `TUG ${secs} s — at or above the 12 s CDC STEADI threshold; increased fall risk.`;
  else if (!dependent) band = `TUG ${secs} s — at or above the 13.5 s community-dwelling cut-off; increased fall risk.`;
  else band = `TUG ${secs} s — ≥ 30 s; the original functional band rates this as dependent in transfers/ADLs.`;
  return {
    valid: true,
    seconds: secs,
    abnormal: steadi,
    steadi,
    community,
    dependent,
    band,
    detail: `measured time = ${secs} s (STEADI ≥ 12; community ≥ 13.5; dependent ≥ 30).`,
    note: TUG_NOTE,
  };
}

// --- 2.3 Tinetti POMA --------------------------------------------------------
const POMA_NOTE = 'Tinetti Performance-Oriented Mobility Assessment (Tinetti ME. Performance-oriented assessment of mobility problems in elderly patients. J Am Geriatr Soc. 1986;34(2):119-126) — the 28-point version: a balance subscale (0–16) plus a gait subscale (0–12), summed 0–28. Fall-risk bands: ≤ 18 high, 19–23 moderate, ≥ 24 low (MDCalc / StatPearls; a score of 24 is classed low here). A 30-point balance variant exists, so confirm which form a quoted score uses. It is a measured performance observation; the fall-prevention plan stays with the care team.';

export function tinettiPoma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const balance = item(o.balance, 16);
  const gait = item(o.gait, 12);
  const missing = [];
  if (balance === null) missing.push('balance subscore (0–16)');
  if (gait === null) missing.push('gait subscore (0–12)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(' and the ')}.` };
  }
  const total = num('POMA total', balance + gait, { min: 0, max: 28 });
  let band; let abnormal;
  if (total <= 18) { band = 'high fall risk'; abnormal = true; }
  else if (total <= 23) { band = 'moderate fall risk'; abnormal = true; }
  else { band = 'low fall risk'; abnormal = false; }
  return {
    valid: true,
    score: total,
    balance,
    gait,
    bandLabel: cap(band),
    abnormal,
    band: `Tinetti POMA ${total}/28 (balance ${balance}/16 + gait ${gait}/12) — ${band}.`,
    detail: `balance ${balance} + gait ${gait} = ${total}; bands ≤18 high, 19–23 moderate, ≥24 low.`,
    note: POMA_NOTE,
  };
}

// --- 2.4 Palliative Performance Scale v2 (PPSv2) -----------------------------
const PPS_NOTE = 'Palliative Performance Scale, version 2 (Anderson F, Downing GM, Hill J, et al. Palliative Performance Scale (PPS): a new tool. J Palliat Care. 1996;12(1):5-11; PPSv2 © Victoria Hospice Society, 2001) — five columns (ambulation; activity & evidence of disease; self-care; intake; conscious level) read left-to-right for the best horizontal fit, with leftward columns taking precedence, to assign a level from 100% down to 0% in 10% decrements (0% = death). A lower PPS is associated with shorter survival and frames the hospice-eligibility discussion. It is a functional observation distinct from ECOG/Karnofsky; the prognosis and care plan stay with the clinician.';

// Each column descriptor maps to the SET of PPS levels it is consistent with
// (e.g. ambulation "Full" appears at 100/90/80). Verified verbatim against the
// Victoria Hospice PPSv2 sample and the HIGN "Try This" reproduction.
const PPS_AMBULATION = {
  full: [100, 90, 80],
  reduced: [70, 60],
  'mainly-sit': [50],
  'mainly-bed': [40],
  'bed-bound': [30, 20, 10],
  death: [0],
};
const PPS_ACTIVITY = {
  'normal-no-evidence': [100],
  'normal-some-evidence': [90],
  'normal-effort': [80],
  'unable-job': [70],
  'unable-hobby': [60],
  'unable-any-work': [50],
  'unable-most': [40],
  'unable-any': [30, 20, 10],
};
const PPS_SELFCARE = {
  full: [100, 90, 80, 70],
  occasional: [60],
  considerable: [50],
  mainly: [40],
  total: [30, 20, 10],
};
const PPS_INTAKE = {
  normal: [100, 90],
  reduced: [80, 70, 60, 50, 40, 30],
  minimal: [20],
  'mouth-care': [10],
};
const PPS_CONSCIOUS = {
  full: [100, 90, 80, 70],
  confusion: [60, 50],
  drowsy: [40, 30, 20],
  coma: [10],
};

const PPS_COLUMNS = [
  { key: 'ambulation', label: 'ambulation', map: PPS_AMBULATION },
  { key: 'activity', label: 'activity & evidence of disease', map: PPS_ACTIVITY },
  { key: 'selfCare', label: 'self-care', map: PPS_SELFCARE },
  { key: 'intake', label: 'intake', map: PPS_INTAKE },
  { key: 'conscious', label: 'conscious level', map: PPS_CONSCIOUS },
];

function ppsBand(level) {
  if (level === 0) return 'death';
  if (level >= 70) return 'stable / ambulatory';
  if (level >= 40) return 'transitional / reduced ambulation';
  return 'end-of-life / bed-bound';
}

export function pps(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sets = [];
  const missing = [];
  for (const col of PPS_COLUMNS) {
    const v = o[col.key];
    const set = (v != null && v !== '') ? col.map[v] : undefined;
    if (!set) missing.push(col.label);
    sets.push(set);
  }
  if (missing.length) {
    return { valid: false, message: `Choose a level for each column — still needed: ${missing.join(', ')}.` };
  }
  // Ambulation "Death" dominates by leftward precedence -> PPS 0%.
  if (o.ambulation === 'death') {
    return {
      valid: true,
      level: 0,
      bandLabel: cap('death'),
      abnormal: true,
      conflicts: [],
      band: 'PPS 0% — death.',
      detail: 'ambulation = death; PPS resolves to 0% regardless of the other columns.',
      note: PPS_NOTE,
    };
  }
  // Best horizontal fit with leftward precedence: intersect the running
  // candidate set left-to-right; a rightward column that conflicts with the
  // leftward-established set is overridden (and flagged) rather than emptying it.
  let candidates = sets[0].slice();
  const conflicts = [];
  for (let i = 1; i < sets.length; i += 1) {
    const next = candidates.filter((l) => sets[i].includes(l));
    if (next.length) candidates = next;
    else conflicts.push(PPS_COLUMNS[i].label);
  }
  // Read downward to the highest (least-impaired) level still consistent.
  const level = num('PPS level', Math.max(...candidates), { min: 0, max: 100 });
  const ambiguous = candidates.length > 1;
  const bandName = ppsBand(level);
  let bandText = `PPS ${level}% — ${bandName}.`;
  if (conflicts.length) {
    bandText += ` Columns disagree (${conflicts.join(', ')}); resolved by leftward precedence per the PPSv2 rule.`;
  }
  return {
    valid: true,
    level,
    bandLabel: cap(bandName),
    abnormal: level <= 40,
    conflicts,
    ambiguous,
    band: bandText,
    detail: `best horizontal fit with leftward precedence = ${level}%${ambiguous ? ` (consistent levels ${candidates.slice().sort((a, b) => b - a).join('/')}%)` : ''}.`,
    note: PPS_NOTE,
  };
}
