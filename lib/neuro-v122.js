// spec-v122 (Wave 4 of the spec-v100 MDCalc Parity Completion program): three
// general-neurology and rehabilitation instruments that cross specialty lines --
// dementia type, spasticity grading, and brainstem-encephalitis diagnosis. v117-
// v121 covered stroke imaging, hemorrhagic grading, prehospital LVO triage, the
// epilepsy/headache/vertigo gap, and the GBS/myasthenia gap; v122 fills the
// general-neurology / rehab gap. None duplicates a live tile; each takes the
// clinician's exam or history findings as input -- v122 parses no imaging and no
// EMG feed (spec-v122 §7).
//
//   hachinski        - Hachinski Ischemic Score (0-18; vascular vs degenerative dementia)
//   modifiedAshworth - Modified Ashworth Scale (ordinal 0 / 1 / 1+ / 2 / 3 / 4)
//   bickerstaff      - Bickerstaff brainstem encephalitis diagnostic checklist
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v122.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score,
// grade, or determination and the source's stated framing; the diagnosis and the
// management decision stay with the clinician and local protocol -- none authors
// that order in Sophie's voice (spec-v11 §5.3).
//
// POINT WEIGHTS / ORDINAL WORDING / CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97
// lesson), each cross-verified across >= 2 independent sources. NO-FABRICATION /
// SOURCE-GOVERNANCE notes:
//   - hachinski (Hachinski 1975, Arch Neurol): thirteen weighted features. Five
//     carry 2 points -- abrupt onset, fluctuating course, history of strokes,
//     focal neurological symptoms, and focal neurological signs -- and eight carry
//     1 point -- stepwise deterioration, nocturnal confusion, relative
//     preservation of personality, depression, somatic complaints, emotional
//     incontinence, hypertension, and associated atherosclerosis -- for a maximum
//     of 18. SOURCE CORRECTION: stepwise deterioration is 1 point, NOT 2 (a common
//     mis-recall; the official ARIC/NIH form and multiple reproductions agree on
//     1), which is why the weights are re-fetched and not recalled. The canonical
//     three-band cut is <= 4 (primary degenerative / Alzheimer-type), 5-6
//     (indeterminate / mixed), and >= 7 (vascular / multi-infarct).
//   - modifiedAshworth (Bohannon & Smith 1987, Phys Ther): the six-level ordinal
//     spasticity scale 0 / 1 / 1+ / 2 / 3 / 4. The "1+" level is the 1987
//     modification of the original 1964 five-point Ashworth scale and is rendered
//     as a DISTINCT ordinal step, never arithmetically summed or averaged -- the
//     compute maps the single selection to its published verbatim description.
//   - bickerstaff (Odaka 2003, Brain; spectrum framework Wakerley 2014, Nat Rev
//     Neurol): a diagnostic checklist, not a score. The required core is
//     progressive, relatively symmetric external ophthalmoplegia AND ataxia
//     (developing within ~4 weeks) PLUS altered consciousness OR hyperreflexia (one
//     of the two central features suffices). Anti-GQ1b IgG antibody, a brainstem
//     MRI lesion, and CSF albuminocytologic dissociation are SUPPORTIVE only --
//     never required (seronegative BBE is recognized; the antibody is positive in
//     about two-thirds and MRI abnormal in about a third). There is no consensus
//     validated gold-standard criteria set, so the tile frames the determination as
//     a research/classification reading, names the GQ1b spectrum link to Miller
//     Fisher syndrome and GBS, and does not diagnose. Cross-links brighton-gbs.

import { r1 } from './num.js';

void r1; // shared lib/num.js dependency (spec-v122 §6); the v122 outputs are an integer point-sum, an ordinal label, and a checklist verdict.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// --- 2.1 hachinski ------------------------------------------------------------
const HACHINSKI_NOTE = 'Hachinski Ischemic Score (Hachinski VC, Iliff LD, Zilhka E, et al, Arch Neurol 1975): a thirteen-item weighted score distinguishing a vascular (multi-infarct) from a primary degenerative (Alzheimer-type) dementia. Five features score 2 points each -- abrupt onset, fluctuating course, a history of strokes, focal neurological symptoms, and focal neurological signs -- and eight score 1 point each -- stepwise deterioration, nocturnal confusion, relative preservation of personality, depression, somatic complaints, emotional incontinence, hypertension, and associated atherosclerosis -- for a maximum of 18. A total of 4 or below favors a primary degenerative (Alzheimer-type) dementia, 5 to 6 is indeterminate or mixed, and 7 or above favors a vascular (multi-infarct) cause. It frames the likely dementia type; the diagnosis stays with the clinician and the workup.';
const HACHINSKI_ITEMS = [
  ['abruptOnset', 2, 'abrupt onset (+2)'],
  ['stepwise', 1, 'stepwise deterioration (+1)'],
  ['fluctuating', 2, 'fluctuating course (+2)'],
  ['nocturnal', 1, 'nocturnal confusion (+1)'],
  ['preservedPersonality', 1, 'relative preservation of personality (+1)'],
  ['depression', 1, 'depression (+1)'],
  ['somatic', 1, 'somatic complaints (+1)'],
  ['emotionalIncontinence', 1, 'emotional incontinence (+1)'],
  ['hypertension', 1, 'history/presence of hypertension (+1)'],
  ['strokeHistory', 2, 'history of strokes (+2)'],
  ['atherosclerosis', 1, 'associated atherosclerosis (+1)'],
  ['focalSymptoms', 2, 'focal neurological symptoms (+2)'],
  ['focalSigns', 2, 'focal neurological signs (+2)'],
];

export function hachinski(input = {}) {
  const counted = [];
  let total = 0;
  for (const [key, wt, label] of HACHINSKI_ITEMS) {
    if (onFlag(input && typeof input === 'object' ? input[key] : undefined)) { total += wt; counted.push(label); }
  }
  total = clamp(total, 0, 18);

  let band; let high;
  if (total >= 7) { band = 'favors a vascular (multi-infarct) dementia'; high = true; }
  else if (total >= 5) { band = 'is indeterminate or mixed'; high = false; }
  else { band = 'favors a primary degenerative (Alzheimer-type) dementia'; high = false; }

  return {
    valid: true, total,
    abnormal: high,
    band: `Hachinski ${total}/18: a score that ${band}.`,
    counted: counted.length ? counted.join(', ') : 'no ischemic features marked (total 0)',
    note: HACHINSKI_NOTE,
  };
}

// --- 2.2 modified-ashworth ----------------------------------------------------
const ASHWORTH_NOTE = 'Modified Ashworth Scale (Bohannon RW, Smith MB, Phys Ther 1987): the bedside ordinal scale for muscle spasticity, graded per muscle group on resistance to passive movement. The six levels are 0 (no increase in muscle tone), 1 (slight increase, a catch and release or minimal resistance at the end of range), 1+ (slight increase, a catch followed by minimal resistance through less than half the range), 2 (more marked increase through most of the range, but the part is easily moved), 3 (considerable increase, passive movement difficult), and 4 (the part is rigid in flexion or extension). The "1+" level is the 1987 modification of the original 1964 five-point scale and is a distinct ordinal step, not an average. It is an ordinal grade, not an interval score; the management decision stays with the clinician and therapist.';
const ASHWORTH_GRADES = {
  '0': { grade: '0', desc: 'no increase in muscle tone' },
  '1': { grade: '1', desc: 'slight increase in muscle tone -- a catch and release, or minimal resistance at the end of the range of motion' },
  '1plus': { grade: '1+', desc: 'slight increase in muscle tone -- a catch, followed by minimal resistance through less than half of the range of motion' },
  '2': { grade: '2', desc: 'more marked increase in muscle tone through most of the range of motion, but the affected part is easily moved' },
  '3': { grade: '3', desc: 'considerable increase in muscle tone -- passive movement is difficult' },
  '4': { grade: '4', desc: 'the affected part is rigid in flexion or extension' },
};

export function modifiedAshworth(input = {}) {
  const key = input && typeof input === 'object' ? input.grade : undefined;
  const entry = ASHWORTH_GRADES[key] || ASHWORTH_GRADES['0'];
  const high = entry.grade === '3' || entry.grade === '4';
  return {
    valid: true, grade: entry.grade,
    abnormal: high,
    band: `Modified Ashworth grade ${entry.grade}: ${entry.desc}.`,
    note: ASHWORTH_NOTE,
  };
}

// --- 2.3 bickerstaff ----------------------------------------------------------
const BICKERSTAFF_NOTE = 'Bickerstaff brainstem encephalitis diagnostic checklist (Odaka M, Yuki N, Yamada M, et al, Brain 2003; placed within the anti-GQ1b antibody syndrome spectrum by Wakerley BR, Uncini A, Yuki N, Nat Rev Neurol 2014): the required core is progressive, relatively symmetric external ophthalmoplegia AND ataxia developing within about 4 weeks, PLUS altered consciousness OR hyperreflexia (one of the two central features suffices). A positive serum anti-GQ1b IgG antibody, a brainstem MRI lesion, and CSF albuminocytologic dissociation are supportive only -- never required, since seronegative cases are recognized (the antibody is positive in about two-thirds and MRI is abnormal in about a third). Bickerstaff encephalitis sits on a continuous spectrum with Miller Fisher syndrome and Guillain-Barre syndrome, unified by the anti-GQ1b antibody. There is no consensus validated gold-standard criteria set, so this is a research/classification reading; the diagnosis stays with the clinician.';

export function bickerstaff(input = {}) {
  const ok = input && typeof input === 'object' ? input : {};
  const ophthalmoplegia = onFlag(ok.ophthalmoplegia);
  const ataxia = onFlag(ok.ataxia);
  const consciousness = onFlag(ok.consciousness);
  const hyperreflexia = onFlag(ok.hyperreflexia);
  const central = consciousness || hyperreflexia;

  const supportive = [];
  if (onFlag(ok.gq1b)) supportive.push('anti-GQ1b IgG antibody');
  if (onFlag(ok.mri)) supportive.push('brainstem MRI lesion');
  if (onFlag(ok.csf)) supportive.push('CSF albuminocytologic dissociation');

  const coreMet = ophthalmoplegia && ataxia && central;
  let detail; let met;
  if (coreMet) {
    const centralNames = [];
    if (consciousness) centralNames.push('altered consciousness');
    if (hyperreflexia) centralNames.push('hyperreflexia');
    met = ['external ophthalmoplegia', 'ataxia', centralNames.join(' and ')];
    detail = `features consistent with Bickerstaff brainstem encephalitis -- the required core (ophthalmoplegia, ataxia, and a central feature: ${centralNames.join(' or ')}) is met${supportive.length ? `, with supporting ${supportive.join(', ')}` : ''}`;
  } else {
    const missing = [];
    if (!ophthalmoplegia) missing.push('external ophthalmoplegia');
    if (!ataxia) missing.push('ataxia');
    if (!central) missing.push('a central feature (altered consciousness or hyperreflexia)');
    met = [];
    detail = `the required core is not met -- missing ${missing.join(', ')}`;
  }

  return {
    valid: true, consistent: coreMet,
    abnormal: false,
    band: `Bickerstaff brainstem encephalitis: ${detail}.`,
    counted: coreMet ? met.filter(Boolean).join(', ') : (supportive.length ? `supportive only: ${supportive.join(', ')}` : 'no core features met'),
    note: BICKERSTAFF_NOTE,
  };
}
