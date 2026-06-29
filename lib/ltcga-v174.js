// spec-v174 (second feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program): behavioral-symptom and observational delirium / mood
// instruments for the long-term-care surface. v174 ships all five proposed
// tiles; each item value, per-item range, and band was re-fetched and
// cross-verified against >= 2 independent sources at implementation (spec-v97).
//
//   nuDesc       - Nursing Delirium Screening Scale, 5 items 0-2, total 0-10
//   doss         - Delirium Observation Screening Scale (13-item short form),
//                  0/1 each, total 0-13
//   cornellCsdd  - Cornell Scale for Depression in Dementia, 19 items a/0/1/2,
//                  total 0-38
//   interraiAbs  - interRAI Aggressive Behavior Scale, 4 items 0-3, total 0-12
//   cmai         - Cohen-Mansfield Agitation Inventory (29-item long form),
//                  each 1-7, total 29-203
//
// Per the spec-v100 §2 doctrine each consumes the clinician's / nurse's
// observations and returns a score mapped to the source's published bands (the
// §2 classification clarification); none authors a diagnosis in Sophie's voice
// (spec-v11 §5.3). Each renderer renders the spec-v50 §3 posture note. Citations
// live inline in lib/meta.js. No AI, no runtime network call.
//
// SCORING / BANDS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - nuDesc: 5 items (disorientation, inappropriate behavior, inappropriate
//     communication, illusions/hallucinations, psychomotor retardation), each
//     0 (absent) / 1 (mild) / 2 (severe); total 0-10; >= 2 is a positive
//     delirium screen (Gaudreau J Pain Symptom Manage 2005; PMC validation
//     studies, cross-verified).
//   - doss: the standard 13-item short form, each item present(1)/absent(0)
//     over a nursing shift; total 0-13; >= 3 suggests delirium. Three items on
//     the original form are reverse-scored (the normal behaviors "maintains
//     attention", "knows the time of day", "remembers recent event"); here each
//     of those three is phrased in its abnormal/scoring direction so a "present"
//     answer scores 1, leaving the published net 0/1 per-item mapping unchanged
//     (Schuurmans Res Theory Nurs Pract 2003; BEST-project verbatim form;
//     cross-verified).
//   - cornellCsdd: 19 items in five domains, each rated a (unable to evaluate,
//     contributes 0) / 0 (absent) / 1 (mild or intermittent) / 2 (severe);
//     total 0-38; > 10 probable major depression, > 18 definite (Alexopoulos
//     Biol Psychiatry 1988; Cornell admin-and-scoring form; cross-verified).
//   - interraiAbs: 4 items (verbal abuse, physical abuse, socially inappropriate
//     or disruptive behavior, resists care), each 0-3 on the MDS/interRAI 7-day
//     behavior-frequency scale (0 not exhibited, 1 = 1-3 days, 2 = 4-6 days but
//     not daily, 3 = daily); total 0-12. The original Perlman & Hirdes JAGS 2008
//     scale defines no named bands; the none/mild/moderate/severe banding
//     (0 / 1-2 / 3-5 / 6-12) is the secondary nursing-home-literature convention
//     and is attributed as such (CIHI interRAI job aid; PMC review;
//     cross-verified — the draft 0-4 per-item range was corrected to 0-3).
//   - cmai: the 29-item long form, each behavior rated for frequency 1 (never)
//     to 7 (several times an hour); total 29-203. The CMAI manual explicitly
//     advises against a total severity cut — it is a continuous frequency
//     quantifier; this tile reports the total plus the most-cited three-factor
//     subscale sums (aggressive / physically non-aggressive / verbally agitated;
//     Cohen-Mansfield J Gerontol 1989; 1991 CMAI manual; factor membership
//     varies by population and is noted).

import { num } from './num.js';

void num; // shared numeric guard kept available for future tiles in this module

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function present(v) {
  // A present/absent observation: 'yes'/'1'/1/true -> present; 'no'/'0'/0/false -> absent.
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null; // unanswered
}

// --- 2.1 Nu-DESC — Nursing Delirium Screening Scale ---------------------------
const NUDESC_ITEMS = ['disorientation', 'inappropriateBehavior', 'inappropriateCommunication', 'illusionsHallucinations', 'psychomotorRetardation'];
const NUDESC_NOTE = 'Nursing Delirium Screening Scale (Gaudreau JD, et al, J Pain Symptom Manage 2005). Five features observed over a nursing shift — disorientation, inappropriate behavior, inappropriate communication, illusions or hallucinations, and psychomotor retardation — each rated 0 (absent), 1 (mild), or 2 (severe). Total 0–10; a total of 2 or more is a positive screen for delirium.';

export function nuDesc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = NUDESC_ITEMS.map((k) => intIn(o[k], 0, 2));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 5 Nu-DESC features 0 (absent), 1 (mild), or 2 (severe).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 0–10
  const positive = total >= 2;
  return {
    valid: true,
    total,
    positive,
    bandLabel: `Nu-DESC ${total}/10`,
    band: `Nu-DESC ${total}/10 — ${positive ? 'positive screen, delirium indicated (≥ 2)' : 'negative screen (0–1)'}`,
    detail: `Disorientation ${vals[0]}, inappropriate behavior ${vals[1]}, inappropriate communication ${vals[2]}, illusions/hallucinations ${vals[3]}, psychomotor retardation ${vals[4]}.`,
    note: NUDESC_NOTE,
  };
}

// --- 2.2 DOSS — Delirium Observation Screening Scale (13-item short form) ------
// Each item phrased in its abnormal/scoring direction: a "present" answer scores
// 1. Items 3, 8, 9 are the three reverse-scored items on the original form (the
// normal behaviors "maintains attention", "knows the time of day", "remembers
// recent event"), here written as their abnormal complement so the published net
// 0/1 mapping is preserved.
const DOSS_ITEMS = [
  'dozesOff', 'distracted', 'noAttention', 'unfinishedAnswers', 'mismatchedAnswers',
  'slowReactions', 'thinksElsewhere', 'unknownTimeOfDay', 'noRecentRecall',
  'restlessPicking', 'pullsTubes', 'suddenEmotion', 'seesHearsThings',
];
const DOSS_NOTE = 'Delirium Observation Screening Scale (Schuurmans MJ, et al, Res Theory Nurs Pract 2003), 13-item short form. Each behavior observed over a nursing shift is scored present (1) or absent (0); total 0–13, and a total of 3 or more suggests delirium. Three items (attention, time-of-day orientation, recent recall) are reverse-scored on the original form and are phrased here in their abnormal direction so a "present" answer scores 1.';

export function doss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = DOSS_ITEMS.map((k) => present(o[k]));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Mark each of the 13 DOSS behaviors present or absent for this shift.' };
  }
  const total = vals.filter(Boolean).length; // 0–13
  const positive = total >= 3;
  return {
    valid: true,
    total,
    positive,
    bandLabel: `DOSS ${total}/13`,
    band: `DOSS ${total}/13 — ${positive ? 'suggests delirium (≥ 3)' : 'below the delirium cut (0–2)'}`,
    detail: `${total} of 13 behaviors observed present this shift.`,
    note: DOSS_NOTE,
  };
}

// --- 2.3 Cornell CSDD — Cornell Scale for Depression in Dementia ---------------
const CSDD_ITEMS = [
  'anxiety', 'sadness', 'noReactivity', 'irritability', // A. mood-related signs
  'agitation', 'retardation', 'physicalComplaints', 'lossOfInterest', // B. behavioral disturbance
  'appetiteLoss', 'weightLoss', 'lackOfEnergy', // C. physical signs
  'diurnalVariation', 'difficultyFallingAsleep', 'multipleAwakenings', 'earlyAwakening', // D. cyclic functions
  'suicide', 'selfDepreciation', 'pessimism', 'delusions', // E. ideational disturbance
];
const CSDD_NOTE = 'Cornell Scale for Depression in Dementia (Alexopoulos GS, et al, Biol Psychiatry 1988). Nineteen items across five domains (mood-related signs, behavioral disturbance, physical signs, cyclic functions, ideational disturbance), each rated absent (0), mild or intermittent (1), or severe (2); an item that cannot be evaluated scores 0 and is reported as unrated. Total 0–38: above 10 suggests probable major depression, above 18 definite major depression. Unlike gds15 / phq9, the Cornell scale is built for moderate-to-severe dementia, drawing on observation and a caregiver informant rather than self-report.';

// 'a' (unable to evaluate) contributes 0 and is reported as an unrated item.
function csddItem(v) {
  if (v === 'a') return { score: 0, rated: false };
  const n = intIn(v, 0, 2);
  return n === null ? null : { score: n, rated: true };
}

export function cornellCsdd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parsed = CSDD_ITEMS.map((k) => csddItem(o[k]));
  if (parsed.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 19 Cornell items: absent (0), mild/intermittent (1), severe (2), or unable to evaluate.' };
  }
  const total = parsed.reduce((a, b) => a + b.score, 0); // 0–38
  const unrated = parsed.filter((x) => !x.rated).length;
  let band;
  if (total > 18) band = 'definite major depression (> 18)';
  else if (total > 10) band = 'probable major depression (> 10)';
  else if (total >= 6) band = 'some depressive symptoms (below the probable-depression cut)';
  else band = 'no significant depressive symptoms (< 6)';
  return {
    valid: true,
    total,
    unrated,
    bandLabel: `Cornell CSDD ${total}/38`,
    band: `Cornell CSDD ${total}/38 — ${band}`,
    detail: unrated > 0
      ? `${unrated} of 19 items marked unable to evaluate (scored 0); ${19 - unrated} rated.`
      : 'All 19 items rated.',
    note: CSDD_NOTE,
  };
}

// --- 2.4 interRAI ABS — Aggressive Behavior Scale ------------------------------
const ABS_ITEMS = ['verbalAbuse', 'physicalAbuse', 'sociallyInappropriate', 'resistsCare'];
const ABS_NOTE = 'interRAI Aggressive Behavior Scale (Perlman CM, Hirdes JP, J Am Geriatr Soc 2008). Four behaviors — verbal abuse, physical abuse, socially inappropriate or disruptive behavior, and resisting care — each rated on the MDS/interRAI 7-day frequency scale: 0 not exhibited, 1 exhibited 1–3 days, 2 exhibited 4–6 days but not daily, 3 exhibited daily. Total 0–12. The original scale defines no named severity bands; the none / mild / moderate / severe banding (0 / 1–2 / 3–5 / 6–12) is a secondary nursing-home-literature convention.';

export function interraiAbs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = ABS_ITEMS.map((k) => intIn(o[k], 0, 3));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 4 ABS behaviors 0 (not exhibited) to 3 (daily).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 0–12
  let band;
  if (total === 0) band = 'none';
  else if (total <= 2) band = 'mild (1–2)';
  else if (total <= 5) band = 'moderate (3–5)';
  else band = 'severe (6–12)';
  return {
    valid: true,
    total,
    bandLabel: `ABS ${total}/12`,
    band: `ABS ${total}/12 — ${band}`,
    detail: `Verbal abuse ${vals[0]}, physical abuse ${vals[1]}, socially inappropriate/disruptive ${vals[2]}, resists care ${vals[3]}.`,
    note: ABS_NOTE,
  };
}

// --- 2.5 CMAI — Cohen-Mansfield Agitation Inventory (29-item long form) --------
// Item order follows the official 1991 manual's "Detailed Descriptions of
// Behaviors" (1..29). The three-factor subscale membership is the manual's
// most-cited nursing-home solution; factor membership varies by population.
const CMAI_ITEMS = [
  'pacing', 'dressing', 'spitting', 'cursing', 'requests', 'repetitive', 'hitting',
  'kicking', 'grabbing', 'pushing', 'throwing', 'noises', 'screaming', 'biting',
  'scratching', 'tryingToGet', 'falling', 'complaining', 'negativism', 'eatingSubstances',
  'hurting', 'handlingThings', 'hiding', 'hoarding', 'tearing', 'mannerisms',
  'verbalSexual', 'physicalSexual', 'restlessness',
];
const CMAI_FACTORS = {
  aggressive: ['hitting', 'kicking', 'pushing', 'scratching', 'tearing', 'cursing', 'grabbing', 'biting', 'spitting'],
  physicalNonaggressive: ['pacing', 'dressing', 'tryingToGet', 'handlingThings', 'restlessness', 'mannerisms'],
  verballyAgitated: ['complaining', 'requests', 'negativism', 'repetitive', 'screaming'],
};
const CMAI_NOTE = 'Cohen-Mansfield Agitation Inventory, 29-item long form (Cohen-Mansfield J, et al, J Gerontol 1989; 1991 CMAI manual). Each agitated behavior is rated for frequency over the prior two weeks: 1 never, 2 less than once a week, 3 once or twice a week, 4 several times a week, 5 once or twice a day, 6 several times a day, 7 several times an hour. The total ranges 29 (every behavior never) to 203 — the floor is 29, not 0. The CMAI manual advises against a total severity cut-point; it is a continuous frequency quantifier, also read by its three factor subscales (aggressive, physically non-aggressive, verbally agitated; membership varies by population).';

export function cmai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const map = {};
  for (const k of CMAI_ITEMS) map[k] = intIn(o[k], 1, 7);
  if (CMAI_ITEMS.some((k) => map[k] === null)) {
    return { valid: false, message: 'Rate all 29 CMAI behaviors for frequency, 1 (never) to 7 (several times an hour).' };
  }
  const total = CMAI_ITEMS.reduce((a, k) => a + map[k], 0); // 29–203
  const factors = {};
  for (const [name, keys] of Object.entries(CMAI_FACTORS)) {
    factors[name] = keys.reduce((a, k) => a + map[k], 0);
  }
  return {
    valid: true,
    total,
    factors,
    bandLabel: `CMAI ${total}/203`,
    band: `CMAI ${total}/203 — frequency quantifier (floor 29; the CMAI is not banded by total severity)`,
    detail: `Factor sums — aggressive ${factors.aggressive}, physically non-aggressive ${factors.physicalNonaggressive}, verbally agitated ${factors.verballyAgitated}.`,
    note: CMAI_NOTE,
  };
}
