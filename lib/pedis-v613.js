// spec-v613: the PEDIS diabetic foot classification and score (IWGDF). A COMPANION-WITH-A-DIFFERENT-SHAPE
// gap: `sinbad-score` sums to 0-6, `ut-diabetic-foot` (spec-v612) does not sum at all, and the five-category
// research classification that does both was missing. Every slug spelling returned 0.
//
// **THE GRADE AND THE SCORE ARE OFF BY ONE, AND THE PUBLISHED TABLE PRINTS BOTH COLUMNS SIDE BY SIDE.**
// Grades are 1-based - grade 1 is the wholly intact category - while the score contribution is GRADE MINUS
// ONE. Reporting the grades as the score inflates every category by 1 and the total by 5: a minimum ulcer
// would read 5 instead of 0, and the maximum 17 instead of 12. That is the single easiest error here, and a
// test pins both totals.
//
// **THE FIVE CATEGORIES DO NOT HAVE THE SAME NUMBER OF GRADES, SO THEY ARE NOT EQUALLY WEIGHTED.** Extent,
// depth and infection each run to 4 grades and can contribute 3 points; perfusion runs to 3 and can
// contribute 2; sensation runs to 2 and can contribute only 1.
//
// **SENSATION CARRIES THE LEAST WEIGHT IN THE SCORE - ONE POINT OF TWELVE - EVEN THOUGH THE NEUROPATHY IT
// MEASURES IS WHAT DEFINES THE DIABETIC FOOT.** It is binary: sensation intact, or lost. Anyone reading the
// total as a severity ladder should know that the defining feature of the condition moves it by one point.
//
// **PEDIS HAS TWO IDENTITIES.** It was built by the International Working Group on the Diabetic Foot as a
// research CLASSIFICATION - a profile, reported category by category so that studies enroll comparable
// patients - and the summed SCORE was added later by a validation study. This lib returns BOTH: the profile
// and the total, clearly separated.
//
// **EXTENT HAS AN EXPLICIT MEASUREMENT RULE**: the largest diameter multiplied by the second largest
// diameter measured perpendicular to the first, in square centimetres. It is an area, not a length.
//
// HIGH-STAKES: this describes an ulcer for research comparability. It does NOT diagnose infection or
// peripheral arterial disease - those are the assessments that feed INTO the grades - does NOT decide
// antibiotics, revascularization or amputation, and its prognostic value in ordinary clinical practice is
// NOT established (spec-v11 section 5.3).
//
// CATEGORIES, GRADES AND THE GRADE-TO-SCORE OFFSET RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED
// (spec-v97). Both sources give the same five categories with 3, 4, 4, 4 and 2 grades and the same maximum
// total of 12:
//   - Schaper NC. Diabetic foot ulcer classification system for research purposes: a progress report on
//     criteria for including patients in research studies. Diabetes Metab Res Rev. 2004;20(Suppl 1):S90-S95.

export const CATEGORIES = [
  {
    key: 'perfusion', letter: 'P', name: 'Perfusion',
    grades: [
      { grade: 1, text: 'No signs of peripheral arterial disease' },
      { grade: 2, text: 'Peripheral arterial disease, but no critical limb ischemia' },
      { grade: 3, text: 'Critical limb ischemia' },
    ],
  },
  {
    key: 'extent', letter: 'E', name: 'Extent',
    grades: [
      { grade: 1, text: 'Skin intact' },
      { grade: 2, text: 'Under 1 square centimetre' },
      { grade: 3, text: '1 to 3 square centimetres' },
      { grade: 4, text: 'Over 3 square centimetres' },
    ],
  },
  {
    key: 'depth', letter: 'D', name: 'Depth',
    grades: [
      { grade: 1, text: 'Skin intact' },
      { grade: 2, text: 'Superficial' },
      { grade: 3, text: 'Fascia, muscle or tendon' },
      { grade: 4, text: 'Bone or joint' },
    ],
  },
  {
    key: 'infection', letter: 'I', name: 'Infection',
    grades: [
      { grade: 1, text: 'None' },
      { grade: 2, text: 'Surface infection' },
      { grade: 3, text: 'Abscess, fasciitis or septic arthritis' },
      { grade: 4, text: 'Systemic inflammatory response syndrome' },
    ],
  },
  {
    key: 'sensation', letter: 'S', name: 'Sensation',
    grades: [
      { grade: 1, text: 'No loss of protective sensation' },
      { grade: 2, text: 'Loss of protective sensation' },
    ],
  },
];

export const MAX_SCORE = CATEGORIES.reduce((a, c) => a + (c.grades.length - 1), 0); // 12
export const MIN_SCORE = 0;
export const GRADE_SUM_AT_MINIMUM = CATEGORIES.length;                              // 5
export const GRADE_SUM_AT_MAXIMUM = CATEGORIES.reduce((a, c) => a + c.grades.length, 0); // 17

export const OFFSET_NOTE = `THE GRADE AND THE SCORE ARE OFF BY ONE and the published table prints both columns side by side: grades are 1-based, with grade 1 meaning the category is wholly intact, while the score contribution is GRADE MINUS ONE. Adding the grades instead of the scores inflates every category by 1 and the total by ${GRADE_SUM_AT_MINIMUM}, so a minimum ulcer reads ${GRADE_SUM_AT_MINIMUM} instead of ${MIN_SCORE} and a maximum one reads ${GRADE_SUM_AT_MAXIMUM} instead of ${MAX_SCORE}.`;
export const WEIGHT_NOTE = `THE FIVE CATEGORIES DO NOT HAVE THE SAME NUMBER OF GRADES, SO THEY ARE NOT EQUALLY WEIGHTED: ${CATEGORIES.map((c) => `${c.name} ${c.grades.length} grades, up to ${c.grades.length - 1} point${c.grades.length - 1 === 1 ? '' : 's'}`).join('; ')}.`;
export const SENSATION_NOTE = `SENSATION CARRIES THE LEAST WEIGHT IN THE SCORE - one point of ${MAX_SCORE} - even though the neuropathy it measures is what defines the diabetic foot. It is binary: intact, or lost.`;
export const IDENTITY_NOTE = 'PEDIS HAS TWO IDENTITIES. It was built as a research CLASSIFICATION - a profile reported category by category so that studies enroll comparable patients - and the summed SCORE was added later by a validation study. Both are returned here, kept separate.';
export const EXTENT_NOTE = 'EXTENT HAS AN EXPLICIT MEASUREMENT RULE: the largest diameter multiplied by the second largest diameter measured perpendicular to the first, in square centimetres. It is an area, not a length.';

const NOTE = `PEDIS (International Working Group on the Diabetic Foot) grades a diabetic foot ulcer on five categories - perfusion, extent, depth, infection and sensation - and is reported as a profile, with a summed score from ${MIN_SCORE} to ${MAX_SCORE} added later. ${OFFSET_NOTE} ${WEIGHT_NOTE} ${SENSATION_NOTE} ${IDENTITY_NOTE} ${EXTENT_NOTE} This describes an ulcer for research comparability. It does not diagnose infection or peripheral arterial disease, which are the assessments that feed into the grades, does not decide antibiotics, revascularization or amputation, and its prognostic value in ordinary clinical practice is not established.`;

export function findGrade(category, value) {
  const n = Number(String(value === undefined || value === null ? '' : value).trim());
  if (!Number.isInteger(n)) return null;
  return category.grades.find((g) => g.grade === n) || null;
}

// input: one grade per CATEGORIES key, using the published 1-based grade numbers.
export function pedis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const chosen = {};
  for (const c of CATEGORIES) chosen[c.key] = findGrade(c, o[c.key]);
  const missing = CATEGORIES.filter((c) => !chosen[c.key]);
  if (missing.length) {
    return {
      valid: false,
      message: `Grade all ${CATEGORIES.length} categories using the published grade numbers: ${CATEGORIES.map((c) => `${c.name} 1 to ${c.grades.length}`).join(', ')}. ${missing.length} still ungraded. ${OFFSET_NOTE}`,
    };
  }

  const perCategory = CATEGORIES.map((c) => ({
    key: c.key,
    letter: c.letter,
    name: c.name,
    grade: chosen[c.key].grade,
    gradeText: chosen[c.key].text,
    score: chosen[c.key].grade - 1,
    maxScore: c.grades.length - 1,
  }));
  const score = perCategory.reduce((a, r) => a + r.score, 0);
  const gradeSum = perCategory.reduce((a, r) => a + r.grade, 0);
  const profile = perCategory.map((r) => `${r.letter}${r.grade}`).join(' ');

  const parts = [];
  parts.push(`PEDIS profile ${profile}. Summed score ${score} of ${MAX_SCORE}.`);
  parts.push(`Per category: ${perCategory.map((r) => `${r.name} grade ${r.grade} (${r.gradeText}) scoring ${r.score} of ${r.maxScore}`).join('; ')}.`);
  parts.push(`Adding the grades instead would give ${gradeSum}, which is ${gradeSum - score} too high. ${OFFSET_NOTE}`);
  parts.push(WEIGHT_NOTE);
  parts.push(SENSATION_NOTE);
  parts.push(IDENTITY_NOTE);
  parts.push(EXTENT_NOTE);
  parts.push('This describes an ulcer for research comparability. It does not diagnose infection or peripheral arterial disease, does not decide antibiotics, revascularization or amputation, and its prognostic value in ordinary clinical practice is not established.');

  return {
    valid: true,
    profile,
    score,
    maxScore: MAX_SCORE,
    gradeSum,
    perCategory,
    band: profile,
    bandLabel: `PEDIS ${profile} — score ${score} of ${MAX_SCORE}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
