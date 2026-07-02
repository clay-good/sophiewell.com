// spec-v197: five deterministic thyroid-homeostasis and beta-cell-function
// instruments (Advanced Specialist Quantitation program, spec-v193 §1.1). Every
// id was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v197 runs no AI and makes no runtime network call.
// These quantify physiology — they are not diagnostic or treatment orders
// (spec-v11 §5.3).
//
//   spinaGt              - SPINA-GT (thyroid secretory capacity)
//   spinaGd              - SPINA-GD (sum activity of peripheral deiodinases)
//   jostelTshIndex       - Jostel's TSH index (TSHI / standardized sTSHI)
//   homaBeta             - HOMA-B (steady-state beta-cell function)
//   oralDispositionIndex - oral disposition index (DIo)
//
// CONSTANTS / REFERENCE RANGES RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation, and the
// SPINA constant sets validated against the published SPINA worked examples:
//   - SPINA (Dietrich JW, et al, Front Endocrinol 2016;7:57). Constants (Table 1):
//     alphaT 0.1, betaT 1.1e-6, DT 2.75; alpha31 0.026, beta31 8e-6, KM1 500e-9;
//     protein-binding brackets 1+K41*[TBG]+K42*[TBPA]=6901 (T4) and 1+K30*[TBG]=
//     601 (T3). GT reference ~1.4-8.7 pmol/s; GD reference ~20-60 nmol/s.
//     Validated: GT(TSH 1, FT4 16.5)=4.70 pmol/s; GD(FT4 16.5, FT3 4.5)=25.22 nmol/s.
//   - jostel TSHI = ln(TSH) + 0.1345*FT4; sTSHI = (TSHI-2.7)/0.676 (Jostel A,
//     et al, Clin Endocrinol 2009;71(4):529-534). TSHI ~1.3-4.1; sTSHI -2..+2.
//   - homaBeta (%) = 20*insulin/(glucose_mmol - 3.5) (Matthews DR, et al,
//     Diabetologia 1985;28(7):412-419); the beta-cell arm of the homeostasis model.
//   - DIo = (insulinogenic index) x (1/fasting insulin), insulinogenic index =
//     dInsulin(0-30) / dGlucose(0-30) (Utzschneider KM, et al, Diabetes Care
//     2009;32(2):335-341).

import { num, r1, r2, r3 } from './num.js';

// SPINA constants (Dietrich 2016, Table 1)
const ALPHA_T = 0.1;
const BETA_T = 1.1e-6;
const DT = 2.75;
const T4_BINDING = 1 + 2e10 * 300e-9 + 2e8 * 4.5e-6; // = 6901
const ALPHA_31 = 0.026;
const BETA_31 = 8e-6;
const KM1 = 500e-9; // mol/L
const T3_BINDING = 1 + 2e9 * 300e-9; // = 601

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// --- 2.1 SPINA-GT -----------------------------------------------------------
const GT_NOTE = 'SPINA-GT — thyroid secretory capacity (Dietrich JW, et al, Front Endocrinol 2016;7:57). From TSH (mIU/L) and free T4 (pmol/L) via the published structure-parameter equation with its fixed constants (protein-binding factor 6901). Reference ~1.4–8.7 pmol/s; a low GT indicates reduced thyroid secretory capacity. A calculated structure parameter, not a diagnosis.';

export function spinaGt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tsh = pos(o.tsh, 1000); // mIU/L
  const ft4 = pos(o.ft4, 200); // pmol/L
  const missing = [];
  if (tsh === null) missing.push('TSH (mIU/L)');
  if (ft4 === null) missing.push('free T4 (pmol/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  // GT [pmol/s] = betaT*(DT+TSH)*binding*FT4_pmol / (alphaT*TSH); the 1e-12/1e12 cancel.
  const value = r2(num('GT', (BETA_T * (DT + tsh) * T4_BINDING * ft4) / (ALPHA_T * tsh), { min: 0, max: 100000 }));
  let label; let abnormal = false;
  if (value < 1.4) { label = 'below the reference band (reduced secretory capacity)'; abnormal = true; }
  else if (value > 8.7) { label = 'above the reference band'; abnormal = true; }
  else label = 'within the ~1.4–8.7 pmol/s reference band';
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `GT ${value} pmol/s`,
    band: `SPINA-GT ${value} pmol/s — ${label}.`,
    detail: `From TSH ${r2(tsh)} mIU/L and FT4 ${r2(ft4)} pmol/L. Maximum thyroid secretory capacity.`,
    note: GT_NOTE,
  };
}

// --- 2.2 SPINA-GD -----------------------------------------------------------
const GD_NOTE = 'SPINA-GD — sum activity of peripheral deiodinases (Dietrich JW, et al, Front Endocrinol 2016;7:57). From free T4 and free T3 (pmol/L) via the published equation with its fixed constants (T3 protein-binding factor 601). Reference ~20–60 nmol/s. A calculated structure parameter, not a diagnosis.';

export function spinaGd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ft4 = pos(o.ft4, 200); // pmol/L
  const ft3 = pos(o.ft3, 100); // pmol/L
  const missing = [];
  if (ft4 === null) missing.push('free T4 (pmol/L)');
  if (ft3 === null) missing.push('free T3 (pmol/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const ft4m = ft4 * 1e-12; // mol/L
  const ft3m = ft3 * 1e-12; // mol/L
  const gdMol = (BETA_31 * (KM1 + ft4m) * T3_BINDING * ft3m) / (ALPHA_31 * ft4m);
  const value = r2(num('GD', gdMol * 1e9, { min: 0, max: 100000 })); // nmol/s
  let label; let abnormal = false;
  if (value < 20) { label = 'below the reference band'; abnormal = true; }
  else if (value > 60) { label = 'above the reference band'; abnormal = true; }
  else label = 'within the ~20–60 nmol/s reference band';
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `GD ${value} nmol/s`,
    band: `SPINA-GD ${value} nmol/s — ${label}.`,
    detail: `From FT4 ${r2(ft4)} pmol/L and FT3 ${r2(ft3)} pmol/L. Sum activity of the step-up deiodinases.`,
    note: GD_NOTE,
  };
}

// --- 2.3 Jostel's TSH index -------------------------------------------------
const JOSTEL_NOTE = 'Jostel’s TSH index (Jostel A, et al, Clin Endocrinol 2009;71(4):529-534). TSHI = ln(TSH) + 0.1345 × FT4 (FT4 in pmol/L); standardized sTSHI = (TSHI − 2.7) / 0.676. Reference TSHI ~1.3–4.1, sTSHI −2 to +2; a low index suggests central (secondary) hypothyroidism / thyrotroph hypofunction. A pituitary-thyrotroph index, not a diagnosis.';

export function jostelTshIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tsh = pos(o.tsh, 1000); // mIU/L
  const ft4 = pos(o.ft4, 200); // pmol/L
  const missing = [];
  if (tsh === null) missing.push('TSH (mIU/L)');
  if (ft4 === null) missing.push('free T4 (pmol/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const tshi = r2(num('TSHI', Math.log(tsh) + 0.1345 * ft4, { min: -1000, max: 1000 }));
  const stshi = r2(num('sTSHI', (tshi - 2.7) / 0.676, { min: -1000, max: 1000 }));
  const low = tshi < 1.3;
  return {
    valid: true,
    tshi,
    stshi,
    abnormal: low,
    bandLabel: `TSHI ${tshi}`,
    band: low
      ? `TSH index ${tshi} (sTSHI ${stshi}) — below the ~1.3 lower reference: suggests central hypothyroidism.`
      : `TSH index ${tshi} (sTSHI ${stshi}) — within/above the reference band (TSHI ~1.3–4.1).`,
    detail: `TSHI = ln(TSH ${r2(tsh)}) + 0.1345 × FT4 ${r2(ft4)}; standardized sTSHI = (TSHI − 2.7) ÷ 0.676.`,
    note: JOSTEL_NOTE,
  };
}

// --- 2.4 HOMA-B -------------------------------------------------------------
const HOMAB_NOTE = 'HOMA-B — steady-state β-cell function (Matthews DR, et al, Diabetologia 1985;28(7):412-419). HOMA-B (%) = 20 × fasting insulin (µU/mL) / (fasting glucose (mmol/L) − 3.5). The β-cell arm complementing HOMA-IR; ~100% is the normal reference. A physiologic index, not a diagnosis.';

export function homaBeta(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const insulin = pos(o.insulin, 1000); // µU/mL
  const glucose = pos(o.glucose, 60); // mmol/L
  const missing = [];
  if (insulin === null) missing.push('fasting insulin (µU/mL)');
  if (glucose === null) missing.push('fasting glucose (mmol/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  if (glucose <= 3.5) return { valid: false, message: 'Fasting glucose must exceed 3.5 mmol/L for the HOMA-B denominator.' };
  const value = r1(num('HOMA-B', (20 * insulin) / (glucose - 3.5), { min: 0, max: 1000000 }));
  const abnormal = value < 100;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `HOMA-B ${value}%`,
    band: `HOMA-B ${value}% — steady-state β-cell function (~100% is the reference).`,
    detail: `20 × insulin ${r2(insulin)} µU/mL ÷ (glucose ${r2(glucose)} − 3.5) mmol/L. The β-cell arm complementing HOMA-IR.`,
    note: HOMAB_NOTE,
  };
}

// --- 2.5 Oral disposition index ---------------------------------------------
const DIO_NOTE = 'Oral disposition index DIo (Utzschneider KM, et al, Diabetes Care 2009;32(2):335-341). Insulinogenic index = ΔInsulin(0–30 min) / ΔGlucose(0–30 min); DIo = insulinogenic index × (1 / fasting insulin). A sensitivity-adjusted measure of β-cell secretion; a lower DIo predicts higher future-diabetes risk. A physiologic index, not a diagnosis.';

export function oralDispositionIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const i0 = pos(o.i0, 1000); // µU/mL (fasting insulin)
  const i30 = pos(o.i30, 5000); // µU/mL
  const g0 = pos(o.g0, 1000); // mg/dL
  const g30 = pos(o.g30, 2000); // mg/dL
  const missing = [];
  if (i0 === null) missing.push('fasting (0-min) insulin (µU/mL)');
  if (i30 === null) missing.push('30-min insulin (µU/mL)');
  if (g0 === null) missing.push('fasting (0-min) glucose (mg/dL)');
  if (g30 === null) missing.push('30-min glucose (mg/dL)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  if (g30 <= g0) return { valid: false, message: '30-min glucose must exceed fasting glucose for the insulinogenic-index denominator.' };
  const igi = (i30 - i0) / (g30 - g0);
  const value = r3(num('DIo', igi * (1 / i0), { min: -1000, max: 1000000 }));
  const igiOut = r3(num('IGI', igi, { min: -1000, max: 1000000 }));
  return {
    valid: true,
    value,
    igi: igiOut,
    abnormal: value < 0,
    bandLabel: `DIo ${value}`,
    band: `Oral disposition index ${value} — sensitivity-adjusted β-cell secretion; a lower value predicts higher future-diabetes risk.`,
    detail: `Insulinogenic index = (I30 ${r2(i30)} − I0 ${r2(i0)}) ÷ (G30 ${r1(g30)} − G0 ${r1(g0)}) = ${igiOut}; DIo = insulinogenic index × (1 / fasting insulin ${r2(i0)}).`,
    note: DIO_NOTE,
  };
}
