// spec-v652: USC/Van Nuys Prognostic Index (VNPI) for ductal carcinoma in situ (DCIS).
//
// The 4-factor 2003 update (adds age to the original 1996 3-factor VNPI). A companion
// to the built breast-cancer grading tiles (nottingham-grade, nottingham-prognostic-
// index). Source:
//   Silverstein MJ. The University of Southern California/Van Nuys prognostic index
//   for ductal carcinoma in situ of the breast. Am J Surg. 2003;186(4):337-343.
//   PMID 14553846.
//
// Four factors, each scored 1-3, summed to 4-12:
//   size (mm): <= 15 = 1, 16-40 = 2, >= 41 = 3;
//   margin width (mm): >= 10 = 1, 1 to < 10 = 2, < 1 = 3;
//   pathologic classification: non-high grade without necrosis = 1, non-high grade
//     with necrosis = 2, high grade (nuclear grade 3) with or without necrosis = 3;
//   age (years): > 60 = 1, 40-60 = 2, < 40 = 3.
// Total 4-6 = low, 7-9 = intermediate, 10-12 = high.
//
// Size, margin, and age are entered as raw values and binned; the pathologic
// classification is entered as a 1-3 score. Pure: no DOM, no clock, no network.

const CLASS = {
  1: 'non-high grade (nuclear grade 1-2) without necrosis',
  2: 'non-high grade (nuclear grade 1-2) with necrosis',
  3: 'high grade (nuclear grade 3), with or without necrosis',
};

export const VNPI_MIN = 4;
export const VNPI_MAX = 12;

function sizeScore(mm) { if (mm <= 15) return 1; if (mm <= 40) return 2; return 3; }
function marginScore(mm) { if (mm >= 10) return 1; if (mm >= 1) return 2; return 3; }
function ageScore(yr) { if (yr > 60) return 1; if (yr >= 40) return 2; return 3; }

const GROUP = (total) => {
  if (total <= 6) return { group: 'low', label: 'low risk' };
  if (total <= 9) return { group: 'intermediate', label: 'intermediate risk' };
  return { group: 'high', label: 'high risk' };
};

export const VNPI_NOTE = 'USC/Van Nuys Prognostic Index for ductal carcinoma in situ (DCIS); the 4-factor 2003 update (Silverstein MJ, Am J Surg 2003;186(4):337-343). Four factors are each scored 1 to 3 and summed. Tumor size: 15 mm or less is 1, 16 to 40 mm is 2, 41 mm or more is 3. Margin width: 10 mm or more is 1, 1 to under 10 mm is 2, under 1 mm is 3. Pathologic classification: non-high grade (nuclear grade 1 or 2) without necrosis is 1, non-high grade with necrosis is 2, high grade (nuclear grade 3, with or without necrosis) is 3. Age: over 60 years is 1, 40 to 60 is 2, under 40 is 3. The sum is 4 to 12: 4 to 6 is low, 7 to 9 is intermediate, and 10 to 12 is high. The index summarizes local-recurrence risk to support the treatment discussion; it is decision support, not a treatment order, and is read with the full pathology report and the patient.';

export function vanNuysVnpi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // Size (mm): required non-negative number.
  const sRaw = o.size;
  if (sRaw === '' || sRaw === null || sRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'size', message: 'Enter the tumor size in mm.' };
  }
  const size = typeof sRaw === 'number' ? sRaw : Number(String(sRaw).trim());
  if (!Number.isFinite(size) || size <= 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'size', message: `Tumor size is a positive number of mm. Got "${sRaw}".` };
  }

  // Margin width (mm): required non-negative number.
  const mRaw = o.margin;
  if (mRaw === '' || mRaw === null || mRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'margin', message: 'Enter the margin width in mm.' };
  }
  const margin = typeof mRaw === 'number' ? mRaw : Number(String(mRaw).trim());
  if (!Number.isFinite(margin) || margin < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'margin', message: `Margin width is a number of mm (0 or more). Got "${mRaw}".` };
  }

  // Pathologic classification: required 1-3 enum.
  const cRaw = o.classification;
  if (cRaw === '' || cRaw === null || cRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'classification', message: 'Score the pathologic classification 1 to 3.' };
  }
  const cls = typeof cRaw === 'number' ? cRaw : Number(String(cRaw).trim());
  if (!Number.isInteger(cls) || cls < 1 || cls > 3) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'classification', message: `Pathologic classification is 1, 2, or 3. Got "${cRaw}".` };
  }

  // Age (years): required positive number.
  const aRaw = o.age;
  if (aRaw === '' || aRaw === null || aRaw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Enter the age in years.' };
  }
  const age = typeof aRaw === 'number' ? aRaw : Number(String(aRaw).trim());
  if (!Number.isFinite(age) || age <= 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'age', message: `Age is a positive number of years. Got "${aRaw}".` };
  }

  const sScore = sizeScore(size);
  const mScore = marginScore(margin);
  const aScore = ageScore(age);
  const total = sScore + mScore + cls + aScore;
  const g = GROUP(total);
  const parts = [
    `size ${size} mm -> ${sScore}`,
    `margin ${margin} mm -> ${mScore}`,
    `classification: ${CLASS[cls]} (${cls})`,
    `age ${age} y -> ${aScore}`,
  ];
  return {
    valid: true,
    total,
    min: VNPI_MIN,
    max: VNPI_MAX,
    sizeScore: sScore,
    marginScore: mScore,
    classificationScore: cls,
    ageScore: aScore,
    group: g.group,
    groupLabel: g.label,
    abnormal: g.group === 'high',
    bandLabel: `USC/VNPI ${total} of ${VNPI_MAX} — ${g.label}`,
    detail: parts.join('; ') + '.',
    note: VNPI_NOTE,
  };
}
