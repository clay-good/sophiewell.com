// spec-v569: GAPP, the Grading system for Adrenal Pheochromocytoma and Paraganglioma. "gapp" and
// "pheochromocytoma" were both zero-hit across corpus.json, app.js and lib/meta.js;
// `grep -c "id: 'gapp'" app.js` and `grep -in "pheochrom" app.js` both returned nothing.
//
// A REVISED-SUCCESSOR GAP. GAPP was built to replace an earlier scaled score by dropping the histological
// features that concorded poorly between observers and adding a proliferation index and a biochemical
// phenotype. Neither instrument was in the catalog.
//
// **THE STATED MAXIMUM OF 10 ONLY WORKS IF THE TWO HISTOLOGICAL-PATTERN DESCRIPTORS ARE ADDITIVE, AND THIS
// LIB RESOLVES THAT RATHER THAN LEAVING IT AMBIGUOUS.** The published table lists three histological
// patterns -- zellballen at 0, large and irregular cell nest at 1, and pseudorosette at 1 -- laid out as
// though one is chosen. Summing every other category's maximum with a single histological point gives 9,
// not the 10 the same table states. The only reading that reaches 10 is that a tumor can show BOTH an
// irregular cell nest AND a pseudorosette, making the pattern term 0 to 2. An independent summary table
// lists the histological pattern maximum as 2, which settles it. So this lib takes the two features as
// SEPARATE yes/no findings that add, and a test asserts the maximum really is 10 (spec-v97).
//
// **THE CATECHOLAMINE TERM IS NON-MONOTONIC IN A WAY THAT READS AS A MISTAKE AND IS NOT ONE.** A
// non-functioning tumor scores 0 -- the SAME as an adrenergic tumor, and LESS than a noradrenergic one at 1.
// A hormonally silent tumor is therefore treated as low risk on this axis, although non-functioning disease
// is not clinically benign. The ordering is the published one and is not rearranged here.
//
// **A BIOCHEMICAL VARIABLE SITS INSIDE A HISTOPATHOLOGY GRADE, AND ITS DEFINITION LIVES IN A FOOTNOTE.**
// The catecholamine type comes from urine fractionated metanephrine and normetanephrine, not from the
// slide: raised metanephrine with or without raised normetanephrine is adrenergic; raised normetanephrine
// without raised metanephrine is noradrenergic. A pathologist reading only the slide cannot supply this
// field, so the lib carries the definition on the input rather than assuming it is known.
//
// CELLULARITY IS COUNTED IN CELLS PER UNIT AREA AT A SPECIFIED MAGNIFICATION. It is an operator-dependent
// count rather than a laboratory value, and it is stated as such.
//
// **SDHB IMMUNOHISTOCHEMISTRY IS NOT PART OF GAPP.** A modified version adds it, but that is a separate and
// unvalidated instrument. A GAPP score that included an SDHB term would not be a GAPP score.
//
// HIGH-STAKES: this grades METASTATIC POTENTIAL from a resected specimen. It does NOT diagnose
// pheochromocytoma or paraganglioma, and it does not establish that a tumor has metastasized -- it
// estimates a propensity. Crucially, **no grade excludes metastasis**: these tumors can metastasize years
// to decades after resection, well-differentiated tumors included, so a low grade is not a reason to stop
// surveillance, which is the decision this score would most damagingly be misused to settle. It says
// nothing about germline status, and hereditary syndromes carry their own risks and their own surveillance
// requirements that this does not capture. It does not select adjuvant therapy or an imaging interval
// (spec-v11 section 5.3). The oncologic decision stays with the clinician.
//
// PARAMETERS, POINTS AND GRADE BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from an
// open-access validation study reproducing the original table verbatim, with the histological-pattern
// maximum confirmed by a second independent review:
//   - Kimura N, Takayanagi R, Takizawa N, et al. Pathological grading for predicting metastasis in
//     phaeochromocytoma and paraganglioma. Endocr Relat Cancer. 2014;21(3):405-414.
//   - Koh JM, Ahn SH, Kim H, et al. Validation of pathological grading systems for predicting metastatic
//     potential in pheochromocytoma and paraganglioma. PLoS One. 2017;12(11):e0187398.

// The two pattern features add: zellballen alone is the 0-point baseline.
export const HISTOLOGICAL_FEATURES = [
  { key: 'largeIrregularNest', points: 1, text: 'Large and irregular cell nest' },
  { key: 'pseudorosette', points: 1, text: 'Pseudorosette, even if focal' },
];

export const CELLULARITY_LEVELS = [
  { value: 'low', points: 0, text: 'Low, under 150 cells per unit area' },
  { value: 'moderate', points: 1, text: 'Moderate, 150 to 250 cells per unit area' },
  { value: 'high', points: 2, text: 'High, over 250 cells per unit area' },
];

export const KI67_LEVELS = [
  { value: 'under-1', points: 0, text: 'Under 1 percent' },
  { value: '1-to-3', points: 1, text: '1 to 3 percent' },
  { value: 'over-3', points: 2, text: 'Over 3 percent' },
];

export const CATECHOLAMINE_TYPES = [
  { value: 'non-functioning', points: 0, text: 'Non-functioning' },
  { value: 'adrenergic', points: 0, text: 'Adrenergic: raised urine metanephrine, with or without raised normetanephrine' },
  { value: 'noradrenergic', points: 1, text: 'Noradrenergic: raised urine normetanephrine without raised metanephrine' },
];

export const COMEDO_NECROSIS_POINTS = 2;
export const INVASION_POINTS = 1;
export const GAPP_MAX = 10;

const GRADES = [
  { max: 2, code: 'WD', label: 'Well differentiated', survival: '100 percent five-year survival in the reported series' },
  { max: 6, code: 'MD', label: 'Moderately differentiated', survival: 'about 67 percent five-year survival in the reported series' },
  { max: GAPP_MAX, code: 'PD', label: 'Poorly differentiated', survival: 'about 22 percent five-year survival in the reported series' },
];

const ADDITIVITY_TEXT = `The two histological-pattern features ADD rather than being alternatives: a tumor showing both an irregular cell nest and a pseudorosette scores 2. That is the only reading under which the published maximum of ${GAPP_MAX} is reachable, since every other category summed with a single pattern point gives 9, and an independent summary table lists the pattern maximum as 2.`;

const CATECHOLAMINE_ODDITY = 'The catecholamine term is non-monotonic: a NON-FUNCTIONING tumor scores 0, the same as an adrenergic tumor and LESS than a noradrenergic one. A hormonally silent tumor is treated as low risk on this axis although non-functioning disease is not clinically benign. This is the published ordering and is not rearranged.';

const BIOCHEMICAL_TEXT = 'The catecholamine type is a BIOCHEMICAL variable inside a histopathology grade: it comes from urine fractionated metanephrine and normetanephrine, not from the slide, so a pathologist reading only the specimen cannot supply it.';

const NO_EXCLUSION = 'NO grade excludes metastasis. These tumors can metastasize years to decades after resection, well-differentiated tumors included, so a low grade is not a reason to stop surveillance.';

const NOT_GAPP = 'SDHB immunohistochemistry is NOT part of GAPP. A modified version adds it, but that is a separate and unvalidated instrument.';

const NOTE = 'GAPP (Kimura and colleagues 2014) grades the metastatic potential of a resected pheochromocytoma or paraganglioma from 0 to 10, and was built to replace an earlier scaled score by dropping features that concorded poorly between observers and adding a proliferation index and a biochemical phenotype. The parameters are histological pattern, with zellballen as the 0-point baseline and one point each for a large and irregular cell nest and for a pseudorosette even if focal; comedo-type necrosis, 2 points if present; cellularity, 0 for under 150 cells per unit area, 1 for 150 to 250 and 2 for over 250; Ki-67 labelling index, 0 for under 1 percent, 1 for 1 to 3 and 2 for over 3; vascular or capsular invasion, 1 point if present; and catecholamine type, 0 for non-functioning, 0 for adrenergic and 1 for noradrenergic. The two histological-pattern features add rather than being alternatives, which is the only reading under which the published maximum of 10 is reachable, since every other category summed with a single pattern point gives 9, and an independent summary table lists the pattern maximum as 2. The grades are well differentiated at 0 to 2, moderately differentiated at 3 to 6 and poorly differentiated at 7 to 10, with reported five-year survivals of about 100, 67 and 22 percent respectively. The catecholamine term is non-monotonic, since a non-functioning tumor scores the same as an adrenergic one and less than a noradrenergic one, although non-functioning disease is not clinically benign; that is the published ordering. It is also a biochemical variable inside a histopathology grade, derived from urine fractionated metanephrine and normetanephrine rather than from the slide, so a pathologist reading only the specimen cannot supply it. Cellularity is counted in cells per unit area at a specified magnification and is operator-dependent rather than a laboratory value. SDHB immunohistochemistry is not part of GAPP; a modified version adds it and is a separate, unvalidated instrument. This grades metastatic potential from a resected specimen. It does not diagnose pheochromocytoma or paraganglioma and does not establish that a tumor has metastasized, since it estimates a propensity. No grade excludes metastasis, because these tumors can metastasize years to decades after resection, well-differentiated tumors included, so a low grade is not a reason to stop surveillance. It says nothing about germline status, and hereditary syndromes carry their own risks and surveillance requirements that this does not capture. It does not select adjuvant therapy or an imaging interval.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function pick(list, raw, name) {
  if (raw === '' || raw === null || raw === undefined) return { missing: name };
  const found = list.find((x) => x.value === String(raw).trim().toLowerCase());
  return found ? { found } : { bad: name };
}

export function gapp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const features = [];
  for (const f of HISTOLOGICAL_FEATURES) {
    const v = readBool(o[f.key]);
    if (v === null) {
      return { valid: false, message: `Say whether each histological pattern feature is present. They ADD rather than being alternatives, which is how the maximum of ${GAPP_MAX} is reached. Still needed: ${f.key}.` };
    }
    if (Number.isNaN(v)) {
      return { valid: false, message: `Each histological pattern feature must be yes or no. Unrecognized: ${f.key}.` };
    }
    features.push({ key: f.key, present: v, points: v ? f.points : 0 });
  }

  const comedo = readBool(o.comedoNecrosis);
  if (comedo === null) return { valid: false, message: 'Say whether comedo-type necrosis is present.' };
  if (Number.isNaN(comedo)) return { valid: false, message: 'The comedo-necrosis answer must be yes or no.' };

  const invasion = readBool(o.vascularOrCapsularInvasion);
  if (invasion === null) return { valid: false, message: 'Say whether vascular or capsular invasion is present.' };
  if (Number.isNaN(invasion)) return { valid: false, message: 'The invasion answer must be yes or no.' };

  const cell = pick(CELLULARITY_LEVELS, o.cellularity, 'cellularity');
  if (cell.missing) return { valid: false, message: 'Choose the cellularity: low, moderate or high. It is counted in cells per unit area at a specified magnification and is operator-dependent.' };
  if (cell.bad) return { valid: false, message: `Cellularity must be one of: ${CELLULARITY_LEVELS.map((c) => c.value).join(', ')}.` };

  const ki67 = pick(KI67_LEVELS, o.ki67, 'ki67');
  if (ki67.missing) return { valid: false, message: 'Choose the Ki-67 labelling index band: under 1 percent, 1 to 3 percent, or over 3 percent.' };
  if (ki67.bad) return { valid: false, message: `Ki-67 must be one of: ${KI67_LEVELS.map((k) => k.value).join(', ')}.` };

  const catecholamine = pick(CATECHOLAMINE_TYPES, o.catecholamineType, 'catecholamineType');
  if (catecholamine.missing) return { valid: false, message: `Choose the catecholamine type. ${BIOCHEMICAL_TEXT}` };
  if (catecholamine.bad) return { valid: false, message: `Catecholamine type must be one of: ${CATECHOLAMINE_TYPES.map((c) => c.value).join(', ')}.` };

  const patternPoints = features.reduce((a, f) => a + f.points, 0);
  const total = patternPoints
    + (comedo ? COMEDO_NECROSIS_POINTS : 0)
    + cell.found.points
    + ki67.found.points
    + (invasion ? INVASION_POINTS : 0)
    + catecholamine.found.points;

  const grade = GRADES.find((g) => total <= g.max);
  const bothPatterns = features.every((f) => f.present);

  return {
    valid: true,
    total,
    max: GAPP_MAX,
    patternPoints,
    bothPatternFeatures: bothPatterns,
    grade: grade.code,
    gradeLabel: grade.label,
    survival: grade.survival,
    bandLabel: `GAPP ${total} of ${GAPP_MAX}, ${grade.code} (${grade.label.toLowerCase()})`,
    bandText: `GAPP ${total} of ${GAPP_MAX}: ${grade.code}, ${grade.label.toLowerCase()}. Reported ${grade.survival}. ${ADDITIVITY_TEXT} ${CATECHOLAMINE_ODDITY} ${BIOCHEMICAL_TEXT} ${NOT_GAPP} ${NO_EXCLUSION} This grades metastatic potential from a resected specimen and does not select adjuvant therapy or an imaging interval.`,
    note: NOTE,
  };
}
