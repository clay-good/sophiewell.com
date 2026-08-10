// spec-v685: Free Androgen Index (FAI).
//
// A simple index of the biologically available fraction of testosterone, used mainly in
// the workup of androgen excess (hirsutism, PCOS) in women. Source: standard endocrinology
// (Wilke TJ, Utley DJ. Clin Chem. 1987; and widely reproduced).
//
//   FAI = 100 x (total testosterone / SHBG),  both in the SAME molar unit (nmol/L)
//
// The index is unitless and REQUIRES both values in nmol/L. US labs often report total
// testosterone in ng/dL; divide ng/dL by 28.84 to get nmol/L before use.
//
// Interpretation (sex-specific, advisory, lab-range-dependent):
//   Women: roughly <= 5 is normal; > 5 supports androgen excess (e.g. PCOS, hirsutism).
//   Men: roughly 30-150 is typical; markedly low values may reflect deficiency.
// FAI is unreliable when SHBG is very low or very high, and it is not recommended as a
// stand-alone measure of free testosterone in men (equilibrium-dialysis or a calculated
// free testosterone is preferred there).
//
// Pure: no DOM, no clock, no network.

export const FAI_NOTE = 'Free Androgen Index (FAI) is a simple index of the biologically available fraction of testosterone, used mainly in the workup of androgen excess such as hirsutism and polycystic ovary syndrome in women. FAI = 100 x (total testosterone / SHBG), with both values in the same molar unit (nmol/L); the index is unitless. US labs often report total testosterone in ng/dL, which must be divided by 28.84 to get nmol/L before use. In women, an FAI of about 5 or less is generally normal while an FAI above 5 supports androgen excess; in men a value of roughly 30 to 150 is typical. FAI is unreliable when SHBG is very low or very high, and it is not recommended as a stand-alone measure of free testosterone in men, where a calculated or equilibrium-dialysis free testosterone is preferred. Reference ranges are assay- and lab-dependent, so it supports rather than replaces clinical judgment.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function freeAndrogenIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (!(o.sex === 'female' || o.sex === 'male')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex (interpretation is sex-specific).', note: FAI_NOTE };
  }
  const testosterone = pos(o.testosterone);
  if (!Number.isFinite(testosterone) || testosterone <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'testosterone', message: 'Enter total testosterone in nmol/L (ng/dL / 28.84).', note: FAI_NOTE };
  }
  const shbg = pos(o.shbg);
  if (!Number.isFinite(shbg) || shbg <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'shbg', message: 'Enter SHBG in nmol/L.', note: FAI_NOTE };
  }

  const fai = 100 * (testosterone / shbg);
  const rounded = Math.round(fai * 10) / 10;

  let tier, band;
  if (o.sex === 'female') {
    if (fai <= 5) { tier = 'normal'; band = `FAI ${rounded} — within the typical female range (~5 or less).`; }
    else { tier = 'elevated'; band = `FAI ${rounded} — above the typical female upper limit (~5), supporting androgen excess.`; }
  } else {
    if (fai < 30) { tier = 'low'; band = `FAI ${rounded} — below the typical male range (~30-150); consider deficiency in context.`; }
    else if (fai <= 150) { tier = 'normal'; band = `FAI ${rounded} — within the typical male range (~30-150).`; }
    else { tier = 'elevated'; band = `FAI ${rounded} — above the typical male range (~30-150).`; }
  }

  return {
    valid: true,
    fai: rounded,
    tier,
    abnormal: o.sex === 'female' ? fai > 5 : (fai < 30 || fai > 150),
    bandLabel: `FAI ${rounded}`,
    band,
    detail: 'FAI = 100 x testosterone / SHBG (both nmol/L). It is unreliable at SHBG extremes and is not a stand-alone measure of free testosterone in men. Reference ranges are lab-dependent.',
    note: FAI_NOTE,
  };
}
