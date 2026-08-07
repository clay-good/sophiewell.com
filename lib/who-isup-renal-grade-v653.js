// spec-v653: WHO/ISUP nucleolar grade for renal cell carcinoma.
//
// The four-tier grade that replaced Fuhrman grading in WHO 2016; a companion to the
// built renal-cancer tiles (leibovich-rcc) and the histologic-grading vein
// (nottingham-grade, fnclcc-grade, gleason-grade-group). Source:
//   Delahunt B, Cheville JC, Martignoni G, et al. The International Society of
//   Urological Pathology (ISUP) grading system for renal cell carcinoma and other
//   prognostic parameters. Am J Surg Pathol. 2013;37(10):1490-1504. PMID 24025520.
//   (Adopted in the WHO 2016/2022 classification.)
//
// A decision-logic classifier returning grade 1-4. Grading is driven by nucleolar
// prominence at magnification (the basophilic/eosinophilic color terms are descriptive,
// not gating):
//   grade 1: nucleoli absent or inconspicuous at 400x;
//   grade 2: nucleoli conspicuous at 400x but inconspicuous at 100x;
//   grade 3: nucleoli conspicuous at 100x;
//   grade 4: extreme nuclear pleomorphism, tumor giant cells, and/or rhabdoid and/or
//     sarcomatoid differentiation (any such feature sets grade 4 regardless of nucleoli).
// Applies to clear-cell and papillary RCC; chromophobe RCC is NOT graded this way.
//
// Pure: no DOM, no clock, no network.

const NUCLEOLI = {
  inconspicuous: { grade: 1, text: 'nucleoli absent or inconspicuous at 400x' },
  'conspicuous-400': { grade: 2, text: 'nucleoli conspicuous at 400x but inconspicuous at 100x' },
  'conspicuous-100': { grade: 3, text: 'nucleoli conspicuous at 100x' },
};

const GRADE_LABEL = {
  1: 'grade 1 (nucleoli inconspicuous at 400x)',
  2: 'grade 2 (nucleoli conspicuous at 400x)',
  3: 'grade 3 (nucleoli conspicuous at 100x)',
  4: 'grade 4 (extreme pleomorphism, giant cells, rhabdoid, and/or sarcomatoid)',
};

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

export const WHOISUP_NOTE = 'WHO/ISUP nucleolar grade for renal cell carcinoma (Delahunt B, et al., Am J Surg Pathol 2013;37(10):1490-1504; adopted in WHO 2016, replacing Fuhrman grade). A four-tier grade. Grade 1 has nucleoli that are absent or inconspicuous at 400x magnification; grade 2 has nucleoli conspicuous at 400x but inconspicuous at 100x; grade 3 has nucleoli conspicuous at 100x; and grade 4 has extreme nuclear pleomorphism, tumor giant cells, and/or rhabdoid and/or sarcomatoid differentiation (any of which sets grade 4 regardless of the nucleoli). Grading is driven by nucleolar prominence at magnification. The system is validated for clear-cell and papillary RCC and is not applied to chromophobe RCC. This is a pathologist grade read with the full pathology report.';

export function whoIsupRenalGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const grade4 = toBool(o.grade4Features);
  if (grade4) {
    return {
      valid: true,
      grade: 4,
      byNucleoli: null,
      grade4Features: true,
      abnormal: true,
      gradeLabel: GRADE_LABEL[4],
      bandLabel: 'WHO/ISUP grade 4',
      detail: 'Grade 4: extreme nuclear pleomorphism, tumor giant cells, and/or rhabdoid and/or sarcomatoid differentiation.',
      note: WHOISUP_NOTE,
    };
  }

  const raw = o.nucleoli;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'nucleoli', message: 'Select the nucleolar prominence (or mark a grade-4 feature).' };
  }
  const key = String(raw).trim();
  const entry = NUCLEOLI[key];
  if (!entry) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'nucleoli', message: `Nucleoli must be inconspicuous, conspicuous-400, or conspicuous-100. Got "${raw}".` };
  }

  return {
    valid: true,
    grade: entry.grade,
    byNucleoli: entry.grade,
    grade4Features: false,
    abnormal: entry.grade >= 3,
    gradeLabel: GRADE_LABEL[entry.grade],
    bandLabel: `WHO/ISUP grade ${entry.grade}`,
    detail: `${entry.text} -> grade ${entry.grade}.`,
    note: WHOISUP_NOTE,
  };
}
