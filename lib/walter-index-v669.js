// spec-v669: Walter Index — 1-year mortality after hospitalization in older adults.
//
// A weighted point sum applied AT HOSPITAL DISCHARGE in adults >= 70 admitted to
// general medical services. Companion to the built Lee 4-Year Mortality Index
// (lee-mortality-index), which estimates community-dwelling 4-year mortality.
// Source:
//   Walter LC, Brand RJ, Counsell SR, Palmer RM, Landefeld CS, Fortinsky RH,
//   Covinsky KE. Development and validation of a prognostic index for 1-year
//   mortality in older adults after hospitalization. JAMA. 2001;285(23):2987-2994.
//   PMID 11410097.
//
// Points (JAMA 2001, Table 3):
//   male sex 1; ADL dependence at discharge: 1-4 of 5 = 2, all 5 = 5;
//   congestive heart failure 2; cancer: solitary 3, metastatic 8;
//   serum creatinine > 3.0 mg/dL 2; serum albumin: 3.0-3.4 g/dL = 1, < 3.0 = 2.
//   Total 0-20.
// Validation-cohort 1-year mortality bands (Table 4): 0-1 = 4%, 2-3 = 19%,
//   4-6 = 34%, > 6 (>= 7) = 64%.
// The five ADLs are the basic (Katz) ADLs: bathing, dressing, transferring,
// toileting, and eating.
//
// Pure: no DOM, no clock, no network.

export const WALTER_NOTE = 'Walter Index (Walter LC, et al., JAMA 2001;285(23):2987-2994). A weighted point sum applied at hospital discharge to estimate 1-year all-cause mortality in adults 70 or older admitted to general medical services: male sex (1) + dependence in 1 to 4 of the 5 basic ADLs (2) or all 5 ADLs (5) + congestive heart failure (2) + solitary cancer (3) or metastatic cancer (8) + serum creatinine above 3.0 mg/dL (2) + serum albumin 3.0 to 3.4 g/dL (1) or below 3.0 g/dL (2), total 0 to 20. The total maps to the validation-cohort 1-year mortality bands: 0 to 1 point about 4%, 2 to 3 about 19%, 4 to 6 about 34%, and 7 or more about 64%. The five ADLs are bathing, dressing, transferring, toileting, and eating. It was derived and validated at discharge and is not validated for surgical or ICU-only populations; it estimates prognosis to inform care planning and is not a prediction of an individual patient\'s death.';

const ADL_PTS = { none: 0, some: 2, all: 5 };
const CANCER_PTS = { none: 0, solitary: 3, metastatic: 8 };

// Point-total -> validation-cohort 1-year mortality band (JAMA 2001, Table 4).
function walterBand(total) {
  if (total <= 1) return { pct: '4%', label: '0-1 points' };
  if (total <= 3) return { pct: '19%', label: '2-3 points' };
  if (total <= 6) return { pct: '34%', label: '4-6 points' };
  return { pct: '64%', label: '>= 7 points' };
}

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function walterIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (!(o.sex === 'male' || o.sex === 'female')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex (male or female).' };
  }
  if (!(o.adl in ADL_PTS)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'adl', message: 'Select ADL dependence at discharge: none, 1-4 of 5, or all 5.' };
  }
  if (!(o.cancer in CANCER_PTS)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'cancer', message: 'Select cancer status: none, solitary, or metastatic.' };
  }
  const creat = num(o.creatinine);
  if (!Number.isFinite(creat) || creat <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'creatinine', message: 'Enter serum creatinine in mg/dL (a positive number).' };
  }
  const alb = num(o.albumin);
  if (!Number.isFinite(alb) || alb <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'albumin', message: 'Enter serum albumin in g/dL (a positive number).' };
  }

  let total = 0;
  const factors = [];
  const add = (pts, label) => { if (pts > 0) { total += pts; factors.push(`${label} (${pts})`); } };

  add(o.sex === 'male' ? 1 : 0, 'male sex');
  add(ADL_PTS[o.adl], o.adl === 'all' ? 'dependent in all 5 ADLs' : 'dependent in 1-4 ADLs');
  add(o.chf === true || o.chf === 1 || o.chf === '1' || o.chf === 'on' ? 2 : 0, 'congestive heart failure');
  add(CANCER_PTS[o.cancer], o.cancer === 'metastatic' ? 'metastatic cancer' : 'solitary cancer');
  add(creat > 3.0 ? 2 : 0, 'creatinine > 3.0 mg/dL');
  add(alb < 3.0 ? 2 : (alb <= 3.4 ? 1 : 0), alb < 3.0 ? 'albumin < 3.0 g/dL' : 'albumin 3.0-3.4 g/dL');

  const band = walterBand(total);
  return {
    valid: true,
    score: total,
    mortality: band.pct,
    // Flag the two higher-mortality bands (>= 4 points -> 34% / 64%).
    abnormal: total >= 4,
    factors,
    band: `Walter index ${total}/20 -> 1-year all-cause mortality about ${band.pct} (${band.label}).`,
    note: WALTER_NOTE,
  };
}
