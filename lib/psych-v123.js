// spec-v123 (Wave 4 closer of the spec-v100 MDCalc Parity Completion program):
// five deterministic, confirmed public-domain / free-to-use psychiatry
// instruments -- the movement-side-effect, catatonia, eating-disorder, and
// depression scales a psychiatry service runs. The catalog had the free mood/risk
// screens (phq9, cssrs) but not these. None duplicates a live tile; each is
// cleared against the spec-v100 §8 permanent-exclusion list (the copyrighted
// instruments -- BDI, PANSS, MoCA, etc. -- are deliberately NOT shipped).
//
//   aimsTardive    - Abnormal Involuntary Movement Scale (AIMS), movement total 0-28
//   bfcrs          - Bush-Francis Catatonia Rating Scale (14-item screen + 23-item severity 0-69)
//   barsAkathisia  - Barnes Akathisia Rating Scale (subtotals + global 0-5)
//   scoff          - SCOFF eating-disorder screen (0-5; >= 2 positive)
//   cesD           - Center for Epidemiologic Studies Depression Scale (0-60; >= 16)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v123.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score /
// screen / rating and the source's stated framing; the diagnosis and the
// treatment decision stay with the clinician -- none authors that order in
// Sophie's voice (spec-v11 §5.3).
//
// ITEM LISTS / SCORING KEYS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. PROVENANCE / NO-FABRICATION:
//   - aimsTardive (Guy 1976, ECDEU Assessment Manual, NIMH): a US-government
//     PUBLIC-DOMAIN instrument. The movement-severity total is the sum of the
//     seven movement items (facial/oral 1-4, extremity 5-6, trunk 7), each 0-4,
//     range 0-28; item 8 is the global-severity judgment 0-4. The tile reports
//     the sum of the seven movement items (not "the AIMS total", which sources
//     define inconsistently) plus the global severity, and flags the commonly
//     cited probable-tardive-dyskinesia threshold (>= 2 in two or more items, or
//     >= 3 in any one item).
//   - bfcrs (Bush 1996, Acta Psychiatr Scand): the first 14 of the 23 items form
//     the Bush-Francis Catatonia Screening Instrument (present/absent); 2 or more
//     positive screen items suggest catatonia. The 23-item severity scale scores
//     each 0-3 (six items -- waxy flexibility, Mitgehen, Gegenhalten,
//     ambitendency, grasp reflex, perseveration -- are published 0/3 binary but
//     still top out at 3), maximum 69. SOURCE-ORDER CORRECTION: Immobility/stupor
//     is item 1 and Excitement is item 14 (the last screen item), not the reverse.
//   - barsAkathisia (Barnes 1989, Br J Psychiatry): objective restlessness,
//     subjective awareness, and subjective distress each 0-3 (sum 0-9), plus the
//     global clinical assessment 0-5 (0 absent, 1 questionable, 2 mild, 3
//     moderate, 4 marked, 5 severe). Verbatim global anchors.
//   - scoff (Morgan 1999, BMJ): five yes/no items, FREE-TO-USE (reproduced in the
//     open BMJ paper). 2 or more positive flags a likely eating disorder warranting
//     further assessment.
//   - cesD (Radloff 1977, Appl Psychol Meas): a NIMH PUBLIC-DOMAIN 20-item scale,
//     each 0-3 over the past week, total 0-60. The four positively-worded items
//     (4, 8, 12, 16) are reverse-scored (3-value) inside the compute per the
//     published key; >= 16 commonly flags clinically significant depressive
//     symptoms.

import { r1 } from './num.js';

void r1; // shared lib/num.js dependency (spec-v123 §6); the v123 outputs are bounded ordinal sums / item counts.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
const lvl = (v, max) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
};
const obj = (input) => (input && typeof input === 'object' ? input : {});

// --- 2.1 aims-tardive ---------------------------------------------------------
const AIMS_NOTE = 'Abnormal Involuntary Movement Scale (Guy W, ECDEU Assessment Manual for Psychopharmacology, NIMH 1976): a US-government public-domain scale for tardive-dyskinesia severity. The movement-severity total is the sum of the seven movement items -- four facial/oral (muscles of facial expression, lips/perioral, jaw, tongue), two extremity (upper, lower), and one trunk (neck/shoulders/hips) -- each rated 0 (none) to 4 (severe), for a range of 0-28; a separate global-severity judgment is also rated 0-4. Movements at or above moderate severity in two or more body areas, or severe in any one area, are a commonly cited threshold for probable tardive dyskinesia. It frames movement severity; the diagnosis and any medication change stay with the clinician.';
const AIMS_ITEMS = [
  ['face', 'muscles of facial expression', 'facial/oral'],
  ['lips', 'lips and perioral area', 'facial/oral'],
  ['jaw', 'jaw', 'facial/oral'],
  ['tongue', 'tongue', 'facial/oral'],
  ['upper', 'upper extremity (arms/wrists/hands/fingers)', 'extremity'],
  ['lower', 'lower extremity (legs/knees/ankles/toes)', 'extremity'],
  ['trunk', 'neck, shoulders, hips', 'trunk'],
];

export function aimsTardive(input = {}) {
  const o = obj(input);
  let total = 0;
  const involved = [];
  let countMod = 0; let anySevere = false;
  for (const [key, label] of AIMS_ITEMS) {
    const v = lvl(o[key], 4);
    total += v;
    if (v > 0) involved.push(`${label} (${v})`);
    if (v >= 2) countMod += 1;
    if (v >= 3) anySevere = true;
  }
  total = clamp(total, 0, 28);
  const global = lvl(o.global, 4);
  const probableTd = countMod >= 2 || anySevere;

  return {
    valid: true, total, global,
    abnormal: probableTd,
    band: `AIMS movement total ${total}/28 (global severity ${global}/4): ${probableTd ? 'movements meet the commonly cited threshold for probable tardive dyskinesia (>= 2 in two or more areas, or >= 3 in one)' : 'below the commonly cited probable-tardive-dyskinesia threshold'}.`,
    counted: involved.length ? involved.join(', ') : 'no abnormal movements (total 0)',
    note: AIMS_NOTE,
  };
}

// --- 2.2 bfcrs ----------------------------------------------------------------
const BFCRS_NOTE = 'Bush-Francis Catatonia Rating Scale (Bush G, Fink M, Petrides G, Dowling F, Francis A, Acta Psychiatr Scand 1996): the first 14 of the 23 items form the Bush-Francis Catatonia Screening Instrument, scored present or absent; 2 or more positive screen items suggest catatonia. The full 23-item severity scale scores each item 0-3 (six items -- waxy flexibility, Mitgehen, Gegenhalten, ambitendency, grasp reflex, perseveration -- are published as 0 or 3 only), for a maximum of 69. It frames a catatonia screen and severity; the diagnosis and treatment, including any lorazepam-challenge decision, stay with the clinician.';
// 23 items in published order; screen = the first 14. `bin` marks the 0/3-only items.
const BFCRS_ITEMS = [
  ['immobility', 'Immobility/stupor', false],
  ['mutism', 'Mutism', false],
  ['staring', 'Staring', false],
  ['posturing', 'Posturing/catalepsy', false],
  ['grimacing', 'Grimacing', false],
  ['echo', 'Echopraxia/echolalia', false],
  ['stereotypy', 'Stereotypy', false],
  ['mannerisms', 'Mannerisms', false],
  ['verbigeration', 'Verbigeration', false],
  ['rigidity', 'Rigidity', false],
  ['negativism', 'Negativism', false],
  ['waxy', 'Waxy flexibility', true],
  ['withdrawal', 'Withdrawal', false],
  ['excitement', 'Excitement', false],
  ['impulsivity', 'Impulsivity', false],
  ['autoObedience', 'Automatic obedience', false],
  ['mitgehen', 'Mitgehen (passive obedience)', true],
  ['gegenhalten', 'Gegenhalten (muscle resistance)', true],
  ['ambitendency', 'Ambitendency', true],
  ['grasp', 'Grasp reflex', true],
  ['perseveration', 'Perseveration', true],
  ['combativeness', 'Combativeness', false],
  ['autonomic', 'Autonomic abnormality', false],
];

export function bfcrs(input = {}) {
  const o = obj(input);
  let severity = 0;
  let screenCount = 0;
  const signs = [];
  BFCRS_ITEMS.forEach(([key, label], i) => {
    const v = lvl(o[key], 3);
    severity += v;
    if (v > 0) {
      signs.push(`${label} (${v})`);
      if (i < 14) screenCount += 1; // first 14 = the screening instrument
    }
  });
  severity = clamp(severity, 0, 69);
  const screenPositive = screenCount >= 2;

  return {
    valid: true, severity, screenCount,
    abnormal: screenPositive,
    band: `Bush-Francis: ${screenCount}/14 screen items present -- ${screenPositive ? 'catatonia is suggested (>= 2 screen items)' : 'below the >= 2 screen threshold'}; severity total ${severity}/69.`,
    counted: signs.length ? signs.join(', ') : 'no catatonic signs elicited',
    note: BFCRS_NOTE,
  };
}

// --- 2.3 bars-akathisia -------------------------------------------------------
const BARS_NOTE = 'Barnes Akathisia Rating Scale (Barnes TRE, Br J Psychiatry 1989): rates drug-induced akathisia from objective restlessness, subjective awareness of restlessness, and subjective distress related to restlessness (each 0-3, summed 0-9), plus a global clinical assessment scored 0 (absent), 1 (questionable), 2 (mild akathisia), 3 (moderate akathisia), 4 (marked akathisia), or 5 (severe akathisia). The global rating is the headline; the objective and subjective subtotals support it. It frames akathisia severity; the medication decision stays with the clinician.';
const BARS_GLOBAL = ['absent', 'questionable', 'mild akathisia', 'moderate akathisia', 'marked akathisia', 'severe akathisia'];

export function barsAkathisia(input = {}) {
  const o = obj(input);
  const objective = lvl(o.objective, 3);
  const awareness = lvl(o.awareness, 3);
  const distress = lvl(o.distress, 3);
  const subtotal = objective + awareness + distress; // 0-9
  const global = lvl(o.global, 5);
  const high = global >= 2;

  return {
    valid: true, objective, awareness, distress, subtotal, global,
    abnormal: high,
    band: `Barnes global rating ${global}/5: ${BARS_GLOBAL[global]} (objective + subjective subtotal ${subtotal}/9).`,
    counted: `objective ${objective}/3, subjective awareness ${awareness}/3, subjective distress ${distress}/3`,
    note: BARS_NOTE,
  };
}

// --- 2.4 scoff ----------------------------------------------------------------
const SCOFF_NOTE = 'SCOFF questionnaire (Morgan JF, Reid F, Lacey JH, BMJ 1999): a five-item yes/no eating-disorder screen, free to use (reproduced in full in the open BMJ paper). The items are Sick (make yourself sick because uncomfortably full), Control (lost control over how much you eat), One stone (lost more than one stone, about 6.35 kg, in three months), Fat (believe yourself fat when others say too thin), and Food (food dominates your life). A count of 2 or more flags a likely eating disorder warranting further assessment. It is a screen, not a diagnosis; the assessment stays with the clinician.';
const SCOFF_ITEMS = [
  ['sick', 'Sick -- making yourself sick because uncomfortably full'],
  ['control', 'Control -- lost control over how much you eat'],
  ['oneStone', 'One stone -- lost more than one stone (~6.35 kg) in 3 months'],
  ['fat', 'Fat -- believe yourself fat when others say too thin'],
  ['food', 'Food -- food dominates your life'],
];

export function scoff(input = {}) {
  const o = obj(input);
  const yes = [];
  for (const [key, label] of SCOFF_ITEMS) {
    if (onFlag(o[key])) yes.push(label);
  }
  const count = clamp(yes.length, 0, 5);
  const positive = count >= 2;
  return {
    valid: true, total: count,
    abnormal: positive,
    band: `SCOFF ${count}/5: ${positive ? '2 or more positive -- a likely eating disorder warranting further assessment' : 'below the 2-positive screening threshold'}.`,
    counted: yes.length ? yes.join(', ') : 'no SCOFF items positive (count 0)',
    note: SCOFF_NOTE,
  };
}

// --- 2.5 ces-d ----------------------------------------------------------------
const CESD_NOTE = 'Center for Epidemiologic Studies Depression Scale (Radloff LS, Appl Psychol Meas 1977): a NIMH public-domain 20-item self-report scale rated over the past week, each item 0 (rarely / less than 1 day) to 3 (most or all of the time / 5-7 days), for a total of 0-60. The four positively-worded items (4 "just as good as other people", 8 "hopeful about the future", 12 "happy", 16 "enjoyed life") are reverse-scored per the published key. A total of 16 or more commonly flags clinically significant depressive symptoms warranting further evaluation. It is a screen, not a diagnosis; the evaluation stays with the clinician.';
const CESD_REVERSE = new Set([4, 8, 12, 16]); // 1-indexed positively-worded items

export function cesD(input = {}) {
  const o = obj(input);
  let total = 0;
  let answered = 0;
  for (let i = 1; i <= 20; i += 1) {
    const raw = o[`q${i}`];
    if (raw !== undefined && raw !== '' && raw !== null) answered += 1;
    const v = lvl(raw, 3);
    total += CESD_REVERSE.has(i) ? (3 - v) : v;
  }
  total = clamp(total, 0, 60);
  const high = total >= 16;
  return {
    valid: true, total, answered,
    abnormal: high,
    band: `CES-D ${total}/60: ${high ? '16 or more -- clinically significant depressive symptoms warranting further evaluation' : 'below the 16-point screening threshold'}.`,
    note: CESD_NOTE,
  };
}
