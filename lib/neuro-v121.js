// spec-v121 (Wave 4 of the spec-v100 MDCalc Parity Completion program): four
// deterministic neuromuscular-emergency instruments a neurology and neuro-
// critical-care service runs to predict respiratory failure and grade disease.
// v117-v120 covered stroke imaging, hemorrhagic grading, prehospital LVO triage,
// and the epilepsy / headache / vertigo gap; v121 fills the Guillain-Barre and
// myasthenia gap. None duplicates a live tile; each takes the clinician's bedside
// exam, MRC sum-score read, or paraclinical determination as input -- v121 parses
// no nerve-conduction waveform and no CSF assay feed (spec-v121 §7).
//
//   egris        - Erasmus GBS Respiratory Insufficiency Score (0-7)
//   megos        - modified Erasmus GBS Outcome Score (admission 0-9 / day-7 0-12)
//   brightonGbs  - Brighton Collaboration GBS diagnostic-certainty level (1-4)
//   mgfa         - MGFA clinical classification (I-V, a/b) + MG-ADL total (0-24)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v121.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score,
// risk band, certainty level, or class and the source's stated framing; the
// IVIG / PLEX / intubation / monitoring decision stays with the clinician and
// local protocol -- none authors that order in Sophie's voice (spec-v11 §5.3).
//
// POINT TABLES / CASE DEFINITION RE-FETCHED, NEVER RECALLED (spec-v97 lesson),
// each cross-verified across >= 2 independent sources (the derivation paper +
// open-access reproductions: the PMC "Ten Steps" GBS review Box 3, the Bangladesh
// and Frontiers mEGOS validations, the Fokke Brain 2014 Brighton-table reprint,
// and the official MGFA Foundation classification PDF). NO-FABRICATION notes:
//   - egris (Walgaard 2010, Ann Neurol 67:781): three items -- days from onset of
//     weakness to admission (> 7 d 0, 4-7 d 1, <= 3 d 2), facial and/or bulbar
//     weakness (+1), and the MRC sum-score band at admission (60-51 0, 50-41 1,
//     40-31 2, 30-21 3, <= 20 4); total 0-7. The paper publishes the probability
//     of mechanical ventilation within the first week only as banded category
//     rates -- LOW (0-2) about 4%, INTERMEDIATE (3-4) about 24%, HIGH (>= 5)
//     about 65% -- and as a continuous logistic curve with NO discrete per-score
//     table, so the tile reports the three published category rates and invents
//     no per-integer-score percentage.
//   - megos (Walgaard 2011, Neurology 76:968): three items -- age (<= 40 0, 41-60
//     1, > 60 2), preceding diarrhea (+1), and the MRC sum-score band, which is
//     weighted DIFFERENTLY by timing: at admission 51-60 0, 41-50 2, 31-40 4,
//     <= 30 6 (total 0-9); at day 7 / week 1 51-60 0, 41-50 3, 31-40 6, <= 30 9
//     (total 0-12). The probability of being unable to walk unaided at 4 and 26
//     weeks is published ONLY as continuous figure curves whose logistic
//     intercept/coefficients are not reported and which diverge by region, so --
//     per the v97 re-fetch discipline and the project no-fabrication governance --
//     the tile reports the total and a RELATIVE reading of its published range
//     (higher score -> higher probability of inability to walk), inventing no
//     per-score percentage (the v111 snakebite-severity relative-range pattern).
//   - brightonGbs (Sejvar 2011, Vaccine 29:599; Fokke 2014 Brain reprint): the
//     case definition has three core clinical features -- bilateral and flaccid
//     limb weakness, decreased or absent deep tendon reflexes in weak limbs, and a
//     monophasic course with onset-to-nadir 12 h-28 d -- plus the absence of an
//     identified alternative diagnosis, and two paraclinical supports: CSF
//     albuminocytologic dissociation (cell count < 50/uL with elevated protein)
//     and nerve-conduction studies consistent with a GBS subtype. Level 1 needs
//     ALL core features + absence-of-alternative + BOTH CSF dissociation AND
//     consistent NCS; Level 2 needs the core + absence-of-alternative + EITHER a
//     supportive CSF (cells < 50/uL, protein elevated or normal) OR consistent NCS
//     (if CSF is absent, NCS must be consistent); Level 3 needs only the core +
//     absence-of-alternative with CSF and NCS not done or unavailable; Level 4 =
//     "reported GBS but insufficient evidence to meet the case definition" when a
//     core feature is missing. The tile reports the certainty level and names the
//     features met; it does not diagnose.
//   - mgfa (Jaretzki 2000, Neurology 55:16; MG-ADL Wolfe 1999, Neurology 52:1487):
//     the MGFA clinical classification maps the predominant weakness pattern and
//     severity to Class I (ocular only), II (mild generalized), III (moderate),
//     IV (severe), or V (intubation, with or without mechanical ventilation),
//     with an a (limb/axial-predominant) or b (oropharyngeal/respiratory-
//     predominant) subtype on Classes II-IV; Class I and V carry no subtype. The
//     MG-ADL is the 8-item Activities-of-Daily-Living scale (talking, chewing,
//     swallowing, breathing, brushing teeth/combing hair, rising from a chair,
//     double vision, eyelid droop), each clamped 0-3 so the total cannot exceed
//     24. The tile reports the class and the MG-ADL total; it grades severity, not
//     management.

import { r1 } from './num.js';

void r1; // shared lib/num.js dependency (spec-v121 §6); the v121 scores are integer point-sums / classifications.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
const lvl = (v, max) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
};

// --- 2.1 egris ----------------------------------------------------------------
const EGRIS_NOTE = 'Erasmus GBS Respiratory Insufficiency Score (Walgaard C, Lingsma HF, Ruts L, et al, Ann Neurol 2010): a three-item score for the risk of mechanical ventilation within the first week of Guillain-Barre syndrome -- days from onset of weakness to admission (more than 7 days 0, 4 to 7 days 1, 3 days or fewer 2), facial and/or bulbar weakness (+1), and the MRC sum-score band at admission (60 to 51 = 0, 50 to 41 = 1, 40 to 31 = 2, 30 to 21 = 3, 20 or below = 4) -- for a total of 0 to 7. The published category rates are about 4% with a low score (0 to 2), about 24% with an intermediate score (3 to 4), and about 65% with a high score (5 or more); the paper reports a continuous curve and no discrete per-score table, so the tile quotes the three category rates. It frames respiratory-failure risk; the airway and monitoring decision stays with the clinician and local protocol.';
const EGRIS_MRC_LABELS = ['60-51', '50-41', '40-31', '30-21', '20 or below'];

export function egris(input = {}) {
  const counted = [];
  const days = lvl(input.daysOnset, 2); // 0 = >7d, 1 = 4-7d, 2 = <=3d
  if (days === 1) counted.push('onset 4-7 days before admission (+1)');
  else if (days === 2) counted.push('onset 3 days or fewer before admission (+2)');
  let total = days;
  if (onFlag(input.facialBulbar)) { total += 1; counted.push('facial and/or bulbar weakness (+1)'); }
  const mrc = lvl(input.mrc, 4); // 0..4 banded points
  if (mrc > 0) { total += mrc; counted.push(`MRC sum score ${EGRIS_MRC_LABELS[mrc]} (+${mrc})`); }
  total = clamp(total, 0, 7);

  let band; let high;
  if (total >= 5) { band = 'a high score (5 or more) -- about a 65% risk of needing mechanical ventilation within the first week'; high = true; }
  else if (total >= 3) { band = 'an intermediate score (3-4) -- about a 24% risk of needing mechanical ventilation within the first week'; high = true; }
  else { band = 'a low score (0-2) -- about a 4% risk of needing mechanical ventilation within the first week'; high = false; }

  return {
    valid: true, total,
    abnormal: high,
    band: `EGRIS ${total}/7: ${band}.`,
    counted: counted.length ? counted.join(', ') : 'onset more than 7 days before admission, no facial/bulbar weakness, MRC sum score 60-51 (total 0)',
    note: EGRIS_NOTE,
  };
}

// --- 2.2 megos ----------------------------------------------------------------
const MEGOS_NOTE = 'Modified Erasmus GBS Outcome Score (Walgaard C, Lingsma HF, Ruts L, van Doorn PA, Steyerberg EW, Jacobs BC, Neurology 2011): predicts the probability of being unable to walk unaided at 4 and 26 weeks in Guillain-Barre syndrome from age (40 or younger 0, 41 to 60 1, over 60 2), preceding diarrhea (+1), and the MRC sum-score band -- weighted by timing: at admission 51 to 60 = 0, 41 to 50 = 2, 31 to 40 = 4, 30 or below = 6 (total 0 to 9); at day 7 51 to 60 = 0, 41 to 50 = 3, 31 to 40 = 6, 30 or below = 9 (total 0 to 12). The per-score probability of inability to walk is published only as continuous figure curves whose coefficients are not reported and which diverge by region, so the tile reports the total and a relative reading of the published range -- a higher score means a higher probability of being unable to walk unaided at 4 and 26 weeks -- and invents no per-score percentage. It frames functional-outcome risk; the rehabilitation and treatment decisions stay with the clinician.';
const MEGOS_MRC_LABELS = ['51-60', '41-50', '31-40', '30 or below'];
const MEGOS_MRC_ADMISSION = [0, 2, 4, 6];
const MEGOS_MRC_DAY7 = [0, 3, 6, 9];

export function megos(input = {}) {
  const counted = [];
  const day7 = input.timing === 'day7';
  const age = lvl(input.age, 2); // 0 = <=40, 1 = 41-60, 2 = >60
  if (age === 1) counted.push('age 41-60 (+1)');
  else if (age === 2) counted.push('age over 60 (+2)');
  let total = age;
  if (onFlag(input.diarrhea)) { total += 1; counted.push('preceding diarrhea (+1)'); }
  const mrcBand = lvl(input.mrc, 3); // band index 0..3
  const mrcPts = (day7 ? MEGOS_MRC_DAY7 : MEGOS_MRC_ADMISSION)[mrcBand];
  if (mrcPts > 0) { total += mrcPts; counted.push(`MRC sum score ${MEGOS_MRC_LABELS[mrcBand]} (+${mrcPts})`); }
  const max = day7 ? 12 : 9;
  total = clamp(total, 0, max);

  // Relative reading of the published 0-max range (no per-score percentage exists
  // in open sources); the v111 snakebite-severity governance pattern.
  let tier; let high;
  if (total >= max * (2 / 3)) { tier = 'a high score'; high = true; }
  else if (total >= max / 3) { tier = 'an intermediate score'; high = false; }
  else { tier = 'a low score'; high = false; }

  return {
    valid: true, total, max,
    abnormal: high,
    band: `mEGOS ${total}/${max} (${day7 ? 'at day 7' : 'at admission'}): ${tier} within the published 0-${max} range; a higher score means a higher probability of being unable to walk unaided at 4 and 26 weeks.`,
    counted: counted.length ? counted.join(', ') : `age 40 or younger, no preceding diarrhea, MRC sum score 51-60 (total 0 ${day7 ? 'at day 7' : 'at admission'})`,
    note: MEGOS_NOTE,
  };
}

// --- 2.3 brighton-gbs ---------------------------------------------------------
const BRIGHTON_NOTE = 'Brighton Collaboration case definition for Guillain-Barre syndrome (Sejvar JJ, Kohl KS, Gidudu J, et al, Vaccine 2011; reproduced in Fokke C, et al, Brain 2014): grades diagnostic certainty by the features met -- three core clinical features (bilateral and flaccid limb weakness; decreased or absent deep tendon reflexes in weak limbs; a monophasic course with onset-to-nadir 12 hours to 28 days), the absence of an identified alternative diagnosis, and two paraclinical supports (CSF albuminocytologic dissociation -- cell count below 50 per microliter with elevated protein -- and nerve-conduction studies consistent with a GBS subtype). Level 1 (highest certainty) needs all core features, absence of an alternative diagnosis, and BOTH CSF dissociation and consistent nerve-conduction studies; Level 2 needs the core, absence of an alternative diagnosis, and EITHER a supportive CSF (cells below 50, protein elevated or normal) OR consistent nerve-conduction studies; Level 3 needs only the core and absence of an alternative diagnosis with CSF and nerve-conduction studies not done or unavailable; Level 4 means a reported case with insufficient evidence to meet the definition. It frames diagnostic certainty; the diagnosis stays with the clinician.';

export function brightonGbs(input = {}) {
  const met = [];
  const weakness = onFlag(input.weakness);
  const areflexia = onFlag(input.areflexia);
  const monophasic = onFlag(input.monophasic);
  const noAltDx = onFlag(input.noAltDx);
  if (weakness) met.push('bilateral flaccid limb weakness');
  if (areflexia) met.push('decreased/absent reflexes in weak limbs');
  if (monophasic) met.push('monophasic course, onset-to-nadir 12 h-28 d');
  if (noAltDx) met.push('no alternative diagnosis');

  const coreMet = weakness && areflexia && monophasic && noAltDx;
  const csf = input.csf; // 'not-done' | 'dissociation' | 'cells-normal-protein'
  const csfDissociation = csf === 'dissociation';
  const csfSupportive = csf === 'dissociation' || csf === 'cells-normal-protein';
  const ncs = onFlag(input.ncs);
  if (csfDissociation) met.push('CSF albuminocytologic dissociation');
  else if (csf === 'cells-normal-protein') met.push('CSF cells < 50/uL (protein normal)');
  if (ncs) met.push('nerve-conduction studies consistent with GBS');

  let level; let detail;
  if (!coreMet) {
    level = 4;
    detail = 'a reported case with insufficient evidence to meet the case definition -- a core clinical feature or the exclusion of an alternative diagnosis is missing';
  } else if (csfDissociation && ncs) {
    level = 1;
    detail = 'the highest diagnostic certainty -- all core features plus CSF albuminocytologic dissociation and consistent nerve-conduction studies';
  } else if (csfSupportive || ncs) {
    level = 2;
    detail = 'a supportive CSF or consistent nerve-conduction studies in addition to the core features';
  } else {
    level = 3;
    detail = 'the core clinical features with CSF and nerve-conduction studies not done or unavailable';
  }

  return {
    valid: true, level,
    abnormal: false,
    band: `Brighton Level ${level}: ${detail}.`,
    counted: met.length ? met.join(', ') : 'no Brighton features marked',
    note: BRIGHTON_NOTE,
  };
}

// --- 2.4 mgfa -----------------------------------------------------------------
const MGFA_NOTE = 'MGFA clinical classification (Jaretzki A 3rd, Barohn RJ, Ernstoff RM, et al, Neurology 2000) plus the MG-ADL (Wolfe GI, Herbelin L, Statland JM, et al, Neurology 1999): the classification maps the predominant weakness pattern and severity to Class I (any ocular weakness, all other strength normal), Class II (mild generalized weakness), Class III (moderate), Class IV (severe), or Class V (intubation, with or without mechanical ventilation), with an "a" (limb/axial-predominant) or "b" (oropharyngeal/respiratory-predominant) subtype on Classes II through IV; Class I and Class V carry no subtype. The MG-ADL is an 8-item patient-reported scale -- talking, chewing, swallowing, breathing, brushing teeth or combing hair, rising from a chair, double vision, and eyelid droop -- each scored 0 (normal) to 3 (most severe) for a total of 0 to 24, where a higher total means more severe symptoms. It grades disease severity and the symptomatic burden; the treatment and airway decisions stay with the clinician.';
const MGFA_ADL_ITEMS = [
  ['talking', 'talking'],
  ['chewing', 'chewing'],
  ['swallowing', 'swallowing'],
  ['breathing', 'breathing'],
  ['hygiene', 'brushing teeth / combing hair'],
  ['rising', 'rising from a chair'],
  ['diplopia', 'double vision'],
  ['ptosis', 'eyelid droop'],
];

export function mgfa(input = {}) {
  const sev = input && typeof input === 'object' ? input.severity : undefined; // 'ocular' | 'mild' | 'moderate' | 'severe' | 'intubation'
  const sub = (input && input.subtype) === 'b' ? 'b' : 'a';
  const subDesc = sub === 'b' ? 'oropharyngeal/respiratory-predominant' : 'limb/axial-predominant';
  // classText is set alongside cls so an unknown/absent severity falls cleanly to
  // Class I (ocular) without leaking an undefined into the rendered string.
  let cls; let high; let classText;
  if (sev === 'intubation') { cls = 'V'; high = true; classText = 'Class V -- intubation, with or without mechanical ventilation'; }
  else if (sev === 'severe') { cls = `IV${sub}`; high = true; classText = `Class ${cls} -- severe generalized weakness, ${subDesc}`; }
  else if (sev === 'moderate') { cls = `III${sub}`; high = false; classText = `Class ${cls} -- moderate generalized weakness, ${subDesc}`; }
  else if (sev === 'mild') { cls = `II${sub}`; high = false; classText = `Class ${cls} -- mild generalized weakness, ${subDesc}`; }
  else { cls = 'I'; high = false; classText = 'Class I -- ocular weakness only, all other strength normal'; }

  let adlTotal = 0;
  let scored = 0;
  for (const [key] of MGFA_ADL_ITEMS) {
    const raw = input && typeof input === 'object' ? input[key] : undefined;
    if (raw !== undefined && raw !== '' && raw !== null) {
      const v = lvl(raw, 3);
      adlTotal += v;
      if (v > 0) scored += 1;
    }
  }
  adlTotal = clamp(adlTotal, 0, 24);

  return {
    valid: true, cls, adlTotal,
    abnormal: high,
    band: `MGFA ${classText}; MG-ADL ${adlTotal}/24${scored ? '' : ' (all items at 0)'}.`,
    note: MGFA_NOTE,
  };
}
