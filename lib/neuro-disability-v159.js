// spec-v159 (second feature spec of the spec-v157 Subspecialty Depth program):
// four deterministic neurology / spine disability classification scales. MS,
// spinal-cord-injury, and cervical-myelopathy clinics use these standard ordinal
// scales; none was in the catalog. v159 runs no AI and makes no runtime network
// call.
//
//   edss            - Expanded Disability Status Scale (Kurtzke 1983), 0–10 in
//                     0.5 steps
//   asiaImpairment  - ASIA Impairment Scale A–E (ISNCSCI, Kirshblum 2011)
//   mjoa            - modified Japanese Orthopaedic Association score (cervical
//                     myelopathy), 0–18
//   nurick          - Nurick grade 0–5 (cervical spondylotic myelopathy)
//
// Per the spec-v100 §2 doctrine each is a deterministic input -> grade/step/band
// mapping (the §2 classification clarification: every valid combination resolves
// to exactly one defined grade). Citations live inline in lib/meta.js; the
// renderers in views/group-v159.js render the spec-v50 §3 posture note (the
// clinician's exam findings drive the grade) and defer the management decision
// (DMT escalation, decompression timing, rehab plan) to the clinician
// (spec-v11 §5.3).
//
// SCALES / BAND BOUNDARIES / GRADE DEFINITIONS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent sources at
// implementation.
// SOURCE-GOVERNANCE:
//   - mjoa (Benzel EC, et al, J Spinal Disord 1991;4(3):286-295; bands Kato/
//     Tetreault): four domains — motor UE 0-5, motor LE 0-7, sensory UE 0-3,
//     sphincter 0-3; total 0-18, HIGHER = BETTER (inverted vs most scores).
//     Severity: mild >= 15, moderate 12-14, severe <= 11.
//   - nurick (Nurick S, Brain 1972;95(1):87-100): grades 0-5 (0 root signs no
//     cord involvement; 1 cord signs, normal gait; 2 mild gait difficulty, fully
//     employed; 3 gait difficulty preventing employment; 4 walks only with
//     assistance; 5 chairbound / bedridden).
//   - asiaImpairment (Kirshblum SC, et al, ISNCSCI revised 2011, J Spinal Cord
//     Med 2011;34(6):535-546): A complete (no sacral sparing at S4-S5); B sensory
//     incomplete (sacral sparing, no motor below level); C motor incomplete,
//     < half of key muscles below the single NLI grade >= 3; D motor incomplete,
//     >= half grade >= 3; E normal in a patient with prior deficit. Sacral
//     sparing is the complete-vs-incomplete gate; the half-of-key-muscles
//     proportion is the C-vs-D gate.
//   - edss (Kurtzke JF, Neurology 1983;33(11):1444-1452): 0-10 in 0.5 steps. The
//     low range is governed by the Functional-System (FS) grade counts; the
//     4.0-9.5 range is governed by AMBULATION. A precise FS->step rating is not
//     reliably algorithmic (the Neurostatus algorithm has many combination
//     clauses); this tile implements the standard simplified FS-count table for
//     the low range and the authoritative ambulation anchors for >= 4.0, and
//     resolves an inconsistent FS/ambulation pair to the HIGHER of the two steps
//     (published precedence: a wheelchair-dependent patient is not EDSS 2.0 just
//     because the FS table is low). The renderer states this simplification.

import { num } from './num.js';

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function yesNo(v) {
  if (v === true || v === 'yes' || v === '1') return true;
  if (v === false || v === 'no' || v === '0') return false;
  return null; // unanswered
}

// --- 2.3 mJOA ----------------------------------------------------------------
const MJOA_NOTE = 'modified Japanese Orthopaedic Association score (Benzel EC, et al, J Spinal Disord 1991;4(3):286-295) for cervical (spondylotic) myelopathy: four domains — motor upper extremity (0–5), motor lower extremity (0–7), sensory upper extremity (0–3), and sphincter/bladder (0–3) — summed to 0–18. HIGHER is BETTER (a normal patient scores 18), the opposite of most scores. Severity: mild ≥ 15, moderate 12–14, severe ≤ 11.';

export function mjoa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ue = intIn(o.motorUe, 0, 5);
  const le = intIn(o.motorLe, 0, 7);
  const sensory = intIn(o.sensoryUe, 0, 3);
  const sphincter = intIn(o.sphincter, 0, 3);
  const missing = [];
  if (ue === null) missing.push('motor upper extremity (0–5)');
  if (le === null) missing.push('motor lower extremity (0–7)');
  if (sensory === null) missing.push('sensory upper extremity (0–3)');
  if (sphincter === null) missing.push('sphincter / bladder (0–3)');
  if (missing.length) {
    return { valid: false, message: `Choose the ${missing.join(', ')}.` };
  }
  const total = num('mJOA', ue + le + sensory + sphincter, { min: 0, max: 18 });
  let band; let abnormal;
  if (total === 18) { band = 'no dysfunction'; abnormal = false; }
  else if (total >= 15) { band = 'mild'; abnormal = true; }
  else if (total >= 12) { band = 'moderate'; abnormal = true; }
  else { band = 'severe'; abnormal = true; }
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: total === 18 ? 'mJOA 18/18 — no dysfunction.' : `mJOA ${total}/18 — ${band} cervical myelopathy.`,
    detail: 'Higher is better (18 = no dysfunction). Severity: mild ≥ 15, moderate 12–14, severe ≤ 11.',
    note: MJOA_NOTE,
  };
}

// --- 2.4 Nurick --------------------------------------------------------------
const NURICK_NOTE = 'Nurick grade (Nurick S, Brain 1972;95(1):87-100) for cervical spondylotic myelopathy, a gait-focused 0–5 ordinal scale: 0 root signs/symptoms with no cord involvement; 1 signs of cord disease but normal gait; 2 mild gait difficulty, fully employed; 3 gait difficulty preventing employment; 4 able to walk only with assistance; 5 chairbound or bedridden.';

const NURICK_DESC = {
  0: 'Root signs/symptoms; no evidence of cord involvement.',
  1: 'Signs of cord disease; normal gait.',
  2: 'Mild gait difficulty; does not prevent full-time employment.',
  3: 'Gait difficulty preventing full-time employment; walks unaided.',
  4: 'Able to walk only with assistance.',
  5: 'Chairbound or bedridden.',
};

export function nurick(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const grade = intIn(o.grade, 0, 5);
  if (grade === null) {
    return { valid: false, message: 'Choose the Nurick grade (0–5) from the gait/ambulation description.' };
  }
  return {
    valid: true,
    grade,
    abnormal: grade >= 2,
    bandLabel: `Grade ${grade}`,
    band: `Nurick grade ${grade} — ${NURICK_DESC[grade]}`,
    detail: 'A gait-focused myelopathy scale; grade 2+ marks gait difficulty, grade 3 prevents employment, grade 4–5 loses independent ambulation.',
    note: NURICK_NOTE,
  };
}

// --- 2.2 ASIA Impairment Scale ----------------------------------------------
const ASIA_NOTE = 'ASIA Impairment Scale (ISNCSCI, Kirshblum SC, et al, J Spinal Cord Med 2011;34(6):535-546): A complete — no sensory or motor function in the sacral segments S4–S5; B sensory incomplete — sacral sparing but no motor function preserved below the neurological level; C motor incomplete — motor preserved below the level but fewer than half of the key muscles below the single neurological level are grade ≥ 3; D motor incomplete — at least half are grade ≥ 3; E normal in a patient with a prior documented deficit. Sacral sparing (S4–S5 sensation, deep anal pressure, or voluntary anal contraction) is the complete-vs-incomplete gate; the proportion of key muscles ≥ 3 is the C-vs-D gate. This is the AIS grade from the clinician’s exam; it does not re-derive the full dermatome/myotome worksheet.';

export function asiaImpairment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const allNormal = yesNo(o.allNormal);
  const sacralSparing = yesNo(o.sacralSparing);
  const motorIncomplete = yesNo(o.motorIncomplete);
  const halfGrade3 = yesNo(o.halfGrade3);

  // E first: a patient with a prior documented deficit whose exam is now normal.
  if (allNormal === true) {
    return finishAsia('E', 'Normal — sensory and motor function normal in a patient with a prior documented deficit.', false);
  }
  if (sacralSparing === null) {
    return { valid: false, message: 'Indicate whether there is sacral sparing at S4–S5 (sensation, deep anal pressure, or voluntary anal contraction).' };
  }
  if (sacralSparing === false) {
    return finishAsia('A', 'Complete — no sensory or motor function preserved in the sacral segments S4–S5.', true);
  }
  // Sacral sparing present -> incomplete. Sensory vs motor incomplete.
  if (motorIncomplete === null) {
    return { valid: false, message: 'Indicate whether motor function is preserved below the neurological level (voluntary anal contraction, or motor function more than 3 levels below the motor level).' };
  }
  if (motorIncomplete === false) {
    return finishAsia('B', 'Sensory incomplete — sacral sparing but no motor function preserved below the neurological level.', true);
  }
  // Motor incomplete -> C vs D by proportion of key muscles >= grade 3.
  if (halfGrade3 === null) {
    return { valid: false, message: 'Indicate whether at least half of the key muscles below the neurological level are grade ≥ 3.' };
  }
  return halfGrade3
    ? finishAsia('D', 'Motor incomplete — at least half of the key muscles below the level are grade ≥ 3.', true)
    : finishAsia('C', 'Motor incomplete — fewer than half of the key muscles below the level are grade ≥ 3.', true);
}

function finishAsia(grade, desc, abnormal) {
  return {
    valid: true,
    grade,
    abnormal,
    bandLabel: `Grade ${grade}`,
    band: `ASIA Impairment Scale grade ${grade} — ${desc}`,
    detail: 'Complete vs incomplete turns on sacral sparing at S4–S5; C vs D turns on whether at least half of the key muscles below the level are grade ≥ 3.',
    note: ASIA_NOTE,
  };
}

// --- 2.1 EDSS ----------------------------------------------------------------
const EDSS_NOTE = 'Expanded Disability Status Scale (Kurtzke JF, Neurology 1983;33(11):1444-1452), 0–10 in 0.5 steps. The low range is governed by the eight Functional-System (FS) grades; the 4.0–9.5 range is governed by ambulation. A precise FS→step rating is not fully algorithmic (the Neurostatus algorithm has many combination clauses), so this tile uses the standard simplified FS-count table for the low range and the authoritative ambulation anchors for ≥ 4.0, taking the HIGHER of the two when they disagree (a wheelchair-dependent patient is not EDSS 2.0 because the FS table is low). For a definitive rating use a trained Neurostatus assessment.';

// Ambulation categories pinned to their EDSS step. 'unrestricted' yields 0 so
// the FS table governs the low range; every other category pins a step >= 4.5.
const AMBULATION = {
  unrestricted: { step: 0, text: 'Fully ambulatory without aid (~500 m or more), self-sufficient' },
  'walk-300': { step: 4.5, text: 'Ambulatory without aid ~300 m; some limitation of full activity' },
  'walk-200': { step: 5.0, text: 'Ambulatory without aid ~200 m; disability impairs full daily activities' },
  'walk-100': { step: 5.5, text: 'Ambulatory without aid ~100 m; precludes full daily activities' },
  'unilateral-100': { step: 6.0, text: 'Unilateral assistance (cane/crutch/brace) to walk ~100 m' },
  'bilateral-20': { step: 6.5, text: 'Bilateral assistance to walk ~20 m without resting' },
  'wheelchair-5': { step: 7.0, text: 'Unable to walk beyond ~5 m even with aid; essentially restricted to wheelchair, wheels self' },
  'wheelchair-transfer': { step: 7.5, text: 'Unable to take more than a few steps; restricted to wheelchair, may need aid to transfer' },
  'bed-chair-arms': { step: 8.0, text: 'Essentially restricted to bed/chair/wheelchair but out of bed much of the day; effective use of arms' },
  'bed-some-arms': { step: 8.5, text: 'Restricted to bed much of the day; some effective use of arms; some self-care' },
  'helpless-comm': { step: 9.0, text: 'Helpless, bed-bound; can still communicate and eat' },
  'helpless-nocomm': { step: 9.5, text: 'Totally helpless; unable to communicate effectively or eat/swallow' },
  death: { step: 10.0, text: 'Death due to MS' },
};

const FS_KEYS = ['pyramidal', 'cerebellar', 'brainstem', 'sensory', 'bowelBladder', 'visual', 'cerebral', 'other'];
const FS_MAX = { pyramidal: 6, cerebellar: 5, brainstem: 5, sensory: 6, bowelBladder: 6, visual: 6, cerebral: 5, other: 1 };

// Simplified FS-count -> low-range EDSS step (0.0–4.0). Standard calculator table.
function fsStep(grades) {
  const maxGrade = Math.max(...grades);
  const nAtLeast = (g) => grades.filter((x) => x >= g).length;
  if (maxGrade <= 0) return 0;
  if (maxGrade === 1) return nAtLeast(1) === 1 ? 1.0 : 1.5;
  if (maxGrade === 2) {
    const n2 = nAtLeast(2);
    if (n2 === 1) return 2.0;
    if (n2 === 2) return 2.5;
    if (n2 <= 4) return 3.0;
    return 3.5;
  }
  if (maxGrade === 3) {
    const n3 = nAtLeast(3);
    const n2 = grades.filter((x) => x === 2).length;
    return n3 === 1 && n2 === 0 ? 3.0 : 3.5;
  }
  return 4.0; // any FS grade >= 4
}

function edssBandLabel(step) {
  if (step === 0) return 'Normal neurological exam';
  if (step <= 1.5) return 'No disability, minimal signs';
  if (step <= 2.5) return 'Minimal disability';
  if (step <= 4.5) return 'Moderate disability, fully ambulatory';
  if (step <= 5.5) return 'Ambulation limited, no aid';
  if (step <= 6.5) return 'Walking aid required';
  if (step <= 7.5) return 'Restricted to wheelchair';
  if (step <= 8.5) return 'Restricted to bed/chair';
  if (step <= 9.5) return 'Helpless, bed-bound';
  return 'Death due to MS';
}

export function edss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ambKey = typeof o.ambulation === 'string' && AMBULATION[o.ambulation] ? o.ambulation : '';
  if (!ambKey) {
    return { valid: false, message: 'Choose the ambulation status (the 4.0–9.5 range is governed by walking ability).' };
  }
  const grades = [];
  const missing = [];
  for (const k of FS_KEYS) {
    const g = intIn(o[k], 0, FS_MAX[k]);
    if (g === null) { missing.push(k); }
    grades.push(g === null ? 0 : g);
  }
  if (missing.length) {
    return { valid: false, message: `Choose every Functional-System grade — still needed: ${missing.join(', ')}.` };
  }
  const amb = AMBULATION[ambKey];
  const low = fsStep(grades);
  const step = num('EDSS', Math.max(low, amb.step), { min: 0, max: 10 });
  const display = step.toFixed(1);
  return {
    valid: true,
    score: step,
    fsStep: low,
    ambulationStep: amb.step,
    abnormal: step >= 6.0,
    bandLabel: edssBandLabel(step),
    band: `EDSS ${display} — ${edssBandLabel(step).toLowerCase()}.`,
    detail: `Ambulation: ${amb.text}. FS-derived step ${low.toFixed(1)}; the reported EDSS is the higher of the FS and ambulation steps.`,
    note: EDSS_NOTE,
  };
}
