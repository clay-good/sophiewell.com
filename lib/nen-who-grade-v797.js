// spec-v797: WHO 2022 grade for gastroenteropancreatic neuroendocrine neoplasms.
//
// Source:
//   Rindi G, Mete O, Uccella S, et al. Overview of the 2022 WHO classification of
//   neuroendocrine neoplasms. Endocr Pathol. 2022;33(1):115-154. (PMID 35294740.)
//
// Grade comes from TWO proliferation indices, and the HIGHER of the two wins:
//
//   grade    mitoses per 2 mm2      Ki-67 index
//   G1       under 2                under 3%
//   G2       2 to 20                3% to 20%
//   G3       over 20                over 20%
//
// A Ki-67 of 25% with only one mitosis is still G3. That "or" is the rule people miss when
// they read only one of the two numbers off a report.
//
// DIFFERENTIATION is a separate axis and it decides the entity, not the grade:
//   well differentiated    -> neuroendocrine TUMOR (NET), graded G1, G2 or G3
//   poorly differentiated  -> neuroendocrine CARCINOMA (NEC), high grade by definition
//
// NEC is not graded by these thresholds at all; it is classified morphologically as
// small-cell or large-cell. So this tile reports NEC for a poorly differentiated neoplasm
// and says the proliferation indices did not set that answer.
//
// Pure: no DOM, no clock, no network.

export const NEN_NOTE = 'The WHO 2022 grade for a gastroenteropancreatic neuroendocrine neoplasm (Rindi G, Mete O, Uccella S, et al, Endocr Pathol 2022;33(1):115-154) comes from two proliferation measures, the mitotic count per 2 square millimeters and the Ki-67 index, and the higher of the two decides the grade. Grade 1 needs under 2 mitoses and a Ki-67 under 3 percent; grade 2 is 2 to 20 mitoses or a Ki-67 of 3 to 20 percent; grade 3 is over 20 mitoses or a Ki-67 over 20 percent. A Ki-67 of 25 percent with a single mitosis is still grade 3, which is the rule most often missed by reading only one of the two numbers off a report. Differentiation is a separate axis and decides the entity rather than the grade: a well-differentiated neoplasm is a neuroendocrine tumor graded 1, 2 or 3, while a poorly differentiated one is a neuroendocrine carcinoma, which is high grade by definition and classified as small-cell or large-cell on morphology rather than by these thresholds. This reads numbers a pathologist has already reported and does not examine tissue or decide treatment.';

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

function gradeFromKi67(k) {
  if (k > 20) return 3;
  if (k >= 3) return 2;
  return 1;
}
function gradeFromMitoses(m) {
  if (m > 20) return 3;
  if (m >= 2) return 2;
  return 1;
}

export function nenWhoGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const differentiation = o.differentiation === undefined || o.differentiation === null || o.differentiation === ''
    ? 'well' : String(o.differentiation).trim();
  if (differentiation !== 'well' && differentiation !== 'poor') {
    return { valid: false, code: 'INVALID_INPUT', field: 'differentiation', message: 'Differentiation must be well or poor.', note: NEN_NOTE };
  }

  const ki67 = optNum(o.ki67, 0, 100);
  if (ki67 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'ki67', message: 'Enter a Ki-67 index between 0 and 100 percent.', note: NEN_NOTE };
  const mitoses = optNum(o.mitoses, 0, 500);
  if (mitoses === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'mitoses', message: 'Enter a mitotic count between 0 and 500 per 2 mm2.', note: NEN_NOTE };
  if (ki67 === null && mitoses === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ki67', message: 'Enter a Ki-67 index, a mitotic count, or both.', note: NEN_NOTE };
  }

  const ki67Grade = ki67 === null ? null : gradeFromKi67(ki67);
  const mitoticGrade = mitoses === null ? null : gradeFromMitoses(mitoses);
  const grade = Math.max(ki67Grade || 0, mitoticGrade || 0);

  let driver;
  if (ki67Grade !== null && mitoticGrade !== null && ki67Grade !== mitoticGrade) {
    driver = ki67Grade > mitoticGrade
      ? `the Ki-67 index drives the grade up: Ki-67 gives G${ki67Grade} where the mitotic count alone gives G${mitoticGrade}`
      : `the mitotic count drives the grade up: it gives G${mitoticGrade} where Ki-67 alone gives G${ki67Grade}`;
  } else if (ki67Grade === null) driver = 'graded on the mitotic count alone';
  else if (mitoticGrade === null) driver = 'graded on the Ki-67 index alone';
  else driver = 'both indices give the same grade';

  const entity = differentiation === 'poor' ? 'NEC' : `NET G${grade}`;
  const band = differentiation === 'poor'
    ? 'Poorly differentiated: neuroendocrine carcinoma (NEC) — high grade by definition, and classified as small-cell or large-cell on morphology rather than by these thresholds.'
    : `NET G${grade} — ${driver}.`;

  return {
    valid: true,
    entity,
    grade: differentiation === 'poor' ? null : grade,
    ki67Grade,
    mitoticGrade,
    differentiation,
    driver,
    abnormal: differentiation === 'poor' || grade >= 2,
    bandLabel: differentiation === 'poor' ? 'Neuroendocrine carcinoma (NEC)' : `NET G${grade}`,
    band,
    detail: 'G1 is under 2 mitoses per 2 mm2 AND a Ki-67 under 3 percent. G2 is 2 to 20 mitoses OR a Ki-67 of 3 to 20 percent. G3 is over 20 mitoses OR a Ki-67 over 20 percent. The higher of the two indices wins, so a Ki-67 of 25 percent with one mitosis is still G3. Differentiation is a separate axis: well differentiated is a NET and is graded, poorly differentiated is a NEC and is high grade by definition.',
    note: NEN_NOTE,
  };
}
