// spec-v612: the University of Texas diabetic foot wound classification. A THIN-CLUSTER gap: the catalog
// carried `wifi`, which stages limb THREAT in chronic limb-threatening ischemia, and NO diabetic foot ULCER
// classification at all. Every slug spelling and filename search returned 0.
//
// **IT IS A TWO-DIMENSIONAL MATRIX, AND A SINGLE NUMBER CANNOT EXPRESS IT.** Depth is the GRADE (0 to III)
// and the complications are the STAGE (A to D), giving 16 cells that are reported together as a pair - "2B",
// "3D". The Wagner classification it extends is one-dimensional, so a reader who carries a bare grade across
// from Wagner has silently dropped the entire infection-and-ischemia axis.
//
// **THE STAGE AXIS ADDS EXACTLY THE TWO THINGS DEPTH CANNOT SEE**: infection and ischemia. A = neither,
// B = infection, C = ischemia, D = both. That is the whole reason this classification exists.
//
// **GRADE 0 DOES NOT MEAN "NO PROBLEM".** It is a pre-ulcerative or POST-ulcerative lesion that is
// completely epithelialized - a foot at risk, or a healed ulcer site - and it still carries a stage. A
// healed ulcer on an ischemic foot is 0C, not "resolved".
//
// **THE GRADE LADDER IS ABOUT WHAT THE ULCER REACHES, AND ONE PUBLISHED RENDERING BLURS TWO RUNGS.** Grade I
// stops above tendon, capsule and bone; grade II reaches tendon or capsule but not bone; grade III probes to
// bone. One reproduction writes grade II as reaching "capsule or bone", which overlaps grade III and cannot
// be right, so the non-overlapping ladder is used and the blur is disclosed (spec-v97).
//
// **THE WAGNER GRADE TABLE IS DELIBERATELY NOT REPRODUCED HERE.** Independent renderings of Wagner conflict
// on whether grade 2 involves bone, and that is a genuine value disagreement rather than a wording variant,
// so this tile names Wagner as the predecessor it extends and does not print its grades.
//
// **NO OUTCOME PERCENTAGES ARE REPORTED.** The healing and amputation figures quoted for individual cells
// are single-sourced. The direction both sources agree on - risk rises across BOTH axes, so the two axes are
// read together and never traded against each other - is stated instead.
//
// HIGH-STAKES: this describes an ulcer. It does NOT diagnose infection or ischemia - those are the clinical
// and vascular assessments that feed INTO the stage - does NOT decide antibiotics, revascularization, or
// amputation, and does NOT predict an individual patient's outcome (spec-v11 section 5.3).
//
// GRADES AND STAGES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97):
//   - Armstrong DG, Lavery LA, Harkless LB. Validation of a diabetic wound classification system. The
//     contribution of depth, infection, and ischemia to risk of amputation. Diabetes Care.
//     1998;21(5):855-859.

export const GRADES = [
  { value: '0', text: 'Pre-ulcerative or post-ulcerative lesion, completely epithelialized' },
  { value: 'I', text: 'Superficial ulcer, not involving tendon, capsule or bone' },
  { value: 'II', text: 'Ulcer penetrating to tendon or capsule, without palpable bone' },
  { value: 'III', text: 'Ulcer probing to bone' },
];

export const STAGES = [
  { value: 'A', text: 'No infection and no ischemia' },
  { value: 'B', text: 'Infection - cellulitis, abscess or osteomyelitis' },
  { value: 'C', text: 'Ischemia' },
  { value: 'D', text: 'Both infection and ischemia' },
];

export const MATRIX_NOTE = `IT IS A TWO-DIMENSIONAL MATRIX AND A SINGLE NUMBER CANNOT EXPRESS IT: depth is the GRADE (${GRADES.map((g) => g.value).join(', ')}) and the complications are the STAGE (${STAGES.map((s) => s.value).join(', ')}), giving ${GRADES.length * STAGES.length} cells reported together as a pair such as 2B or 3D. The Wagner classification it extends is ONE-dimensional, so carrying a bare grade across from Wagner silently drops the whole infection-and-ischemia axis.`;
export const STAGE_NOTE = 'THE STAGE AXIS ADDS EXACTLY THE TWO THINGS DEPTH CANNOT SEE: infection and ischemia. That is the whole reason this classification exists.';
export const GRADE_ZERO_NOTE = 'GRADE 0 DOES NOT MEAN "NO PROBLEM". It is a pre-ulcerative or POST-ulcerative lesion that is completely epithelialized - a foot at risk, or a healed ulcer site - and it still carries a stage. A healed ulcer on an ischemic foot is 0C, not "resolved".';
export const LADDER_NOTE = 'THE GRADE LADDER IS ABOUT WHAT THE ULCER REACHES: I stops above tendon, capsule and bone; II reaches tendon or capsule but not bone; III probes to bone. One published reproduction writes II as reaching "capsule or bone", which overlaps III and cannot be right, so the non-overlapping ladder is used here.';
export const WAGNER_NOTE = 'The Wagner grade table is deliberately NOT reproduced: independent renderings of Wagner conflict on whether its grade 2 involves bone, which is a value disagreement rather than a wording variant. Wagner is named here as the predecessor this classification extends, and nothing more.';
export const OUTCOME_NOTE = 'NO OUTCOME PERCENTAGES ARE REPORTED - the healing and amputation figures quoted for individual cells are single-sourced. What both sources agree on is the DIRECTION: risk rises across BOTH axes, so the two are read together and never traded against each other.';

const NOTE = `The University of Texas diabetic foot wound classification (Armstrong and colleagues 1998) describes an ulcer on two axes at once: a GRADE for depth and a STAGE for infection and ischemia, reported as a pair such as 2B. ${MATRIX_NOTE} ${STAGE_NOTE} ${GRADE_ZERO_NOTE} ${LADDER_NOTE} ${WAGNER_NOTE} ${OUTCOME_NOTE} This describes an ulcer. It does not diagnose infection or ischemia, which are the clinical and vascular assessments that feed into the stage, does not decide antibiotics, revascularization or amputation, and does not predict an individual patient's outcome.`;

export function findGrade(value) {
  const v = String(value === undefined || value === null ? '' : value).trim().toUpperCase();
  return GRADES.find((g) => g.value.toUpperCase() === v) || null;
}
export function findStage(value) {
  const v = String(value === undefined || value === null ? '' : value).trim().toUpperCase();
  return STAGES.find((s) => s.value.toUpperCase() === v) || null;
}

// input: grade (0, I, II, III) and stage (A, B, C, D).
export function utDiabeticFoot(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const grade = findGrade(o.grade);
  const stage = findStage(o.stage);
  if (!grade || !stage) {
    const missing = [];
    if (!grade) missing.push(`a grade (${GRADES.map((g) => g.value).join(', ')})`);
    if (!stage) missing.push(`a stage (${STAGES.map((s) => s.value).join(', ')})`);
    return { valid: false, message: `Choose ${missing.join(' and ')}. ${MATRIX_NOTE}` };
  }

  const cell = `${grade.value}${stage.value}`;
  const parts = [];
  parts.push(`University of Texas ${cell}. Grade ${grade.value}: ${grade.text}. Stage ${stage.value}: ${stage.text}.`);
  parts.push(MATRIX_NOTE);
  parts.push(STAGE_NOTE);
  if (grade.value === '0') parts.push(GRADE_ZERO_NOTE);
  parts.push(LADDER_NOTE);
  parts.push(WAGNER_NOTE);
  parts.push(OUTCOME_NOTE);
  parts.push('This describes an ulcer. It does not diagnose infection or ischemia, does not decide antibiotics, revascularization or amputation, and does not predict an individual outcome.');

  return {
    valid: true,
    cell,
    grade: grade.value,
    gradeText: grade.text,
    stage: stage.value,
    stageText: stage.text,
    infection: stage.value === 'B' || stage.value === 'D',
    ischemia: stage.value === 'C' || stage.value === 'D',
    band: cell,
    bandLabel: `University of Texas ${cell}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
