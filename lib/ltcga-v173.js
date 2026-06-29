// spec-v173 (first feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program): deterministic cognition-screening and dementia-staging
// instruments for the long-term-care surface. v173 ships the three whose exact
// item-level scoring was re-fetched and cross-verified against >= 2 independent
// sources (spec-v97); the other five proposed tiles are deferred pending
// verbatim sourcing (see docs/spec-v173.md §4 / docs/scope-mdcalc-parity.md).
//
//   bims    - Brief Interview for Mental Status (MDS 3.0 §C), summary 0-15
//   ad8     - AD8 informant dementia screen, 0-8 (>= 2 suggests impairment)
//   cdrSob  - Clinical Dementia Rating - Sum of Boxes, 0-18 (O'Bryant staging)
//
// Per the spec-v100 §2 doctrine each consumes the clinician's / informant's
// observations and returns a score mapped to the source's published bands (the
// §2 classification clarification); none authors a diagnosis in Sophie's voice
// (spec-v11 §5.3). Each renderer renders the spec-v50 §3 posture note. Citations
// live inline in lib/meta.js. No AI, no runtime network call.
//
// SCORING / BANDS / PARTIAL-CREDIT RULES RE-FETCHED, NEVER RECALLED (spec-v97):
//   - bims: item scoring is the verbatim CMS MDS 3.0 Section C form (C0200
//     repetition 0-3; C0300A year 0-3; C0300B month 0-2; C0300C day 0-1;
//     C0400A/B/C recall 0-2 each, partial credit "1 = after cue, 2 = no cue");
//     summary C0500 = sum, 0-15. Bands: 13-15 cognitively intact, 8-12
//     moderately impaired, 0-7 severely impaired (Saliba JAMDA 2012; CMS RAI
//     Manual; cross-verified across >= 2 sources).
//   - ad8: sum of the 8 informant "Yes, a change" items, 0-8; cut >= 2 suggests
//     cognitive impairment, 0-1 normal (Galvin Neurology 2005; WashU Knight ADRC
//     AD8 instrument page).
//   - cdrSob: sum of the 6 CDR boxes (memory, orientation, judgment &
//     problem-solving, community affairs, home & hobbies each 0/0.5/1/2/3;
//     personal care 0/1/2/3, no 0.5), 0-18. O'Bryant 2008 (Arch Neurol) staging
//     of the global CDR from the SOB: 0 = none, 0.5-4.0 = questionable/very mild,
//     4.5-9.0 = mild, 9.5-15.5 = moderate, 16.0-18.0 = severe dementia (Morris
//     Neurology 1993 boxes; WashU CDR scoring rules; O'Bryant Arch Neurol 2008).

import { num } from './num.js';

void num; // shared numeric guard kept available for future tiles in this module

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
// Validate a value against an explicit allowed set (CDR boxes use 0.5 steps).
function oneOf(v, allowed) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && allowed.includes(n) ? n : null;
}
function yesNo(v) {
  if (v === true || v === 'yes' || v === '1') return true;
  if (v === false || v === 'no' || v === '0') return false;
  return null; // unanswered
}

// --- 2.1 BIMS — Brief Interview for Mental Status (MDS 3.0 §C) ----------------
const BIMS_NOTE = 'Brief Interview for Mental Status (Saliba D, et al, J Am Med Dir Assoc 2012; the MDS 3.0 Section C performance interview). Repetition of three words (0–3); temporal orientation — year (0–3), month (0–2), day of week (0–1); delayed recall of the three words with partial credit (2 = spontaneous, 1 = after a category cue, 0 = not recalled). Summary 0–15: 13–15 cognitively intact, 8–12 moderately impaired, 0–7 severely impaired.';

export function bims(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const repetition = intIn(o.repetition, 0, 3);
  const year = intIn(o.year, 0, 3);
  const month = intIn(o.month, 0, 2);
  const day = intIn(o.day, 0, 1);
  const sock = intIn(o.recallSock, 0, 2);
  const blue = intIn(o.recallBlue, 0, 2);
  const bed = intIn(o.recallBed, 0, 2);
  if ([repetition, year, month, day, sock, blue, bed].some((x) => x === null)) {
    return { valid: false, message: 'Score all BIMS items: word repetition (0–3), year (0–3), month (0–2), day (0–1), and recall of each word (0–2).' };
  }
  const total = repetition + year + month + day + sock + blue + bed; // 0–15
  let band;
  if (total >= 13) band = 'cognitively intact';
  else if (total >= 8) band = 'moderately impaired';
  else band = 'severely impaired';
  return {
    valid: true,
    total,
    repetition,
    orientation: year + month + day,
    recall: sock + blue + bed,
    bandLabel: `BIMS ${total}/15`,
    band: `BIMS ${total}/15 — ${band}`,
    detail: `Repetition ${repetition}/3, orientation ${year + month + day}/6 (year ${year}, month ${month}, day ${day}), recall ${sock + blue + bed}/6.`,
    note: BIMS_NOTE,
  };
}

// --- 2.2 AD8 — informant dementia screen --------------------------------------
const AD8_ITEMS = [
  ['judgment', 'Problems with judgment (e.g., bad financial decisions, problems with thinking)'],
  ['interest', 'Reduced interest in hobbies or activities'],
  ['repeating', 'Repeats the same things over and over (questions, stories, statements)'],
  ['learningTool', 'Trouble learning to use a tool, appliance, or gadget'],
  ['dateRecall', 'Forgets the correct month or year'],
  ['finances', 'Trouble handling complicated financial affairs (e.g., balancing checkbook, taxes, bills)'],
  ['appointments', 'Trouble remembering appointments'],
  ['dailyThinking', 'Daily problems with thinking and/or memory'],
];
const AD8_NOTE = 'AD8 Dementia Screening Interview (Galvin JE, et al, Neurology 2005; Washington University Knight ADRC). Eight informant items, each asking whether there has been a change — caused by cognitive (thinking/memory) problems — over the past several years. The total is the count of "Yes, a change" items, 0–8: 0–1 is normal and ≥ 2 suggests cognitive impairment warranting further evaluation.';

export function ad8(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const answers = AD8_ITEMS.map(([key]) => yesNo(o[key]));
  if (answers.some((a) => a === null)) {
    return { valid: false, message: 'Answer all 8 AD8 items (Yes = a change due to thinking/memory problems, or No).' };
  }
  const endorsed = answers.filter(Boolean).length; // 0–8
  const impaired = endorsed >= 2;
  return {
    valid: true,
    total: endorsed,
    impaired,
    bandLabel: `AD8 ${endorsed}/8`,
    band: `AD8 ${endorsed}/8 — ${impaired ? 'suggests cognitive impairment (≥ 2)' : 'normal (0–1)'}`,
    detail: `${endorsed} of 8 items endorsed as a change due to thinking/memory problems.`,
    note: AD8_NOTE,
  };
}

// --- 2.3 CDR-SOB — Clinical Dementia Rating, Sum of Boxes ----------------------
const CDR_BOX5 = [0, 0.5, 1, 2, 3]; // memory, orientation, judgment, community, home & hobbies
const CDR_BOX4 = [0, 1, 2, 3]; // personal care has no 0.5 level
const CDR_NOTE = 'Clinical Dementia Rating — Sum of Boxes (Morris JC, Neurology 1993; staging ranges O\'Bryant SE, et al, Arch Neurol 2008). Six boxes — memory, orientation, judgment & problem-solving, community affairs, home & hobbies (each 0 / 0.5 / 1 / 2 / 3) and personal care (0 / 1 / 2 / 3, no 0.5) — summed to 0–18. O\'Bryant staging of the global CDR: 0 none, 0.5–4.0 questionable to very mild, 4.5–9.0 mild, 9.5–15.5 moderate, 16.0–18.0 severe dementia.';

export function cdrSob(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const memory = oneOf(o.memory, CDR_BOX5);
  const orientation = oneOf(o.orientation, CDR_BOX5);
  const judgment = oneOf(o.judgment, CDR_BOX5);
  const community = oneOf(o.community, CDR_BOX5);
  const home = oneOf(o.home, CDR_BOX5);
  const personalCare = oneOf(o.personalCare, CDR_BOX4);
  if ([memory, orientation, judgment, community, home, personalCare].some((x) => x === null)) {
    return { valid: false, message: 'Rate all 6 CDR boxes: memory, orientation, judgment & problem-solving, community affairs, home & hobbies (0/0.5/1/2/3) and personal care (0/1/2/3).' };
  }
  const sob = memory + orientation + judgment + community + home + personalCare; // 0–18
  let band;
  if (sob === 0) band = 'no dementia (CDR 0)';
  else if (sob <= 4.0) band = 'questionable to very mild (CDR 0.5)';
  else if (sob <= 9.0) band = 'mild (CDR 1)';
  else if (sob <= 15.5) band = 'moderate (CDR 2)';
  else band = 'severe dementia (CDR 3)';
  return {
    valid: true,
    sob,
    bandLabel: `CDR-SOB ${sob}`,
    band: `CDR-SOB ${sob}/18 — ${band}`,
    detail: `Boxes: memory ${memory}, orientation ${orientation}, judgment ${judgment}, community ${community}, home & hobbies ${home}, personal care ${personalCare}.`,
    note: CDR_NOTE,
  };
}
