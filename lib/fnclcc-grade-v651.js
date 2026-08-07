// spec-v651: FNCLCC histologic grade for soft-tissue sarcoma.
//
// The standard grading system for adult soft-tissue sarcomas (Federation Nationale
// des Centres de Lutte Contre le Cancer). A companion to the built oncologic staging
// tiles (Enneking musculoskeletal staging, Gleason grade group). Source:
//   Trojani M, Coindre JM, Bui NB, et al. Soft-tissue sarcomas of adults; study of
//   pathological prognostic variables and definition of a histopathological grading
//   system. Int J Cancer. 1984;33(1):37-42. PMID 6693192.
//   Coindre JM. Grading of soft tissue sarcomas: review and update. Arch Pathol Lab
//   Med. 2006;130(10):1448-1453. PMID 17090186.
//
// Three components summed to 2-8:
//   tumor differentiation (1-3): 1 = closely resembles normal adult mesenchymal
//     tissue, 2 = histologic typing is certain, 3 = embryonal/undifferentiated,
//     synovial, or doubtful-type sarcoma;
//   mitotic count per 10 high-power fields (scored 1-3): 0-9 = 1, 10-19 = 2, >= 20 = 3
//     (entered as a raw count and binned);
//   tumor necrosis (0-2): none = 0, < 50% = 1, >= 50% = 2.
// Total 2-3 = grade 1, 4-5 = grade 2, 6-8 = grade 3.
//
// Pure: no DOM, no clock, no network.

const DIFF = {
  1: 'closely resembles normal adult mesenchymal tissue',
  2: 'histologic typing is certain',
  3: 'embryonal / undifferentiated, synovial, or doubtful-type sarcoma',
};
const NECROSIS = { 0: 'no necrosis', 1: '< 50% tumor necrosis', 2: '>= 50% tumor necrosis' };

export const FNCLCC_MIN = 2;
export const FNCLCC_MAX = 8;

function mitoticScore(n) {
  if (n <= 9) return 1;
  if (n <= 19) return 2;
  return 3;
}

const GRADE = (total) => {
  if (total <= 3) return { grade: 1, label: 'low grade' };
  if (total <= 5) return { grade: 2, label: 'intermediate grade' };
  return { grade: 3, label: 'high grade' };
};

export const FNCLCC_NOTE = 'FNCLCC histologic grade for adult soft-tissue sarcoma (Federation Nationale des Centres de Lutte Contre le Cancer; Trojani M, Coindre JM, et al., Int J Cancer 1984;33(1):37-42; Coindre JM, Arch Pathol Lab Med 2006;130(10):1448-1453). Three components are summed. Tumor differentiation is scored 1 to 3 (1 = the sarcoma closely resembles normal adult mesenchymal tissue, 2 = histologic typing is certain, 3 = embryonal or undifferentiated, synovial, or doubtful-type sarcomas). The mitotic count per 10 high-power fields is scored 1 to 3 (0 to 9 is 1, 10 to 19 is 2, 20 or more is 3). Tumor necrosis is scored 0 to 2 (none is 0, less than 50% is 1, 50% or more is 2). The sum is 2 to 8: 2 to 3 is grade 1, 4 to 5 is grade 2, and 6 to 8 is grade 3. This is a pathologist grade applied to a resection or biopsy specimen, read with the full pathology report; core-biopsy grading can underestimate the resection grade.';

export function fnclccGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // Tumor differentiation: required 1-3 enum.
  const dRaw = o.differentiation;
  if (dRaw === '' || dRaw === null || dRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'differentiation', message: 'Score tumor differentiation 1 to 3.' };
  }
  const diff = typeof dRaw === 'number' ? dRaw : Number(String(dRaw).trim());
  if (!Number.isInteger(diff) || diff < 1 || diff > 3) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'differentiation', message: `Tumor differentiation is 1, 2, or 3. Got "${dRaw}".` };
  }

  // Mitotic count: required non-negative integer (mitoses per 10 HPF).
  const mRaw = o.mitoticCount;
  if (mRaw === '' || mRaw === null || mRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'mitoticCount', message: 'Enter the mitotic count (mitoses per 10 high-power fields).' };
  }
  const mit = typeof mRaw === 'number' ? mRaw : Number(String(mRaw).trim());
  if (!Number.isInteger(mit) || mit < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'mitoticCount', message: `Mitotic count is a whole number of mitoses per 10 HPF (0 or more). Got "${mRaw}".` };
  }

  // Tumor necrosis: required 0-2 enum.
  const nRaw = o.necrosis;
  if (nRaw === '' || nRaw === null || nRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'necrosis', message: 'Score tumor necrosis 0 to 2.' };
  }
  const nec = typeof nRaw === 'number' ? nRaw : Number(String(nRaw).trim());
  if (!Number.isInteger(nec) || nec < 0 || nec > 2) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'necrosis', message: `Tumor necrosis is 0, 1, or 2. Got "${nRaw}".` };
  }

  const mScore = mitoticScore(mit);
  const total = diff + mScore + nec;
  const g = GRADE(total);
  const parts = [
    `differentiation: ${DIFF[diff]} (${diff})`,
    `mitotic count: ${mit} per 10 HPF -> score ${mScore}`,
    `necrosis: ${NECROSIS[nec]} (${nec})`,
  ];
  return {
    valid: true,
    total,
    min: FNCLCC_MIN,
    max: FNCLCC_MAX,
    differentiationScore: diff,
    mitoticScore: mScore,
    necrosisScore: nec,
    grade: g.grade,
    gradeLabel: g.label,
    abnormal: g.grade === 3,
    bandLabel: `FNCLCC total ${total} of ${FNCLCC_MAX} — grade ${g.grade} (${g.label})`,
    detail: parts.join('; ') + '.',
    note: FNCLCC_NOTE,
  };
}
