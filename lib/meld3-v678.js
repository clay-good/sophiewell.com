// spec-v678: MELD 3.0 (Model for End-Stage Liver Disease, 2021 update).
//
// The current OPTN/UNOS liver-allocation score (adopted 2023), successor to MELD-Na
// (the meld-na tile). MELD 3.0 adds female sex and serum albumin to MELD-Na and
// re-fits every coefficient, correcting the documented survival disadvantage women
// faced under MELD-Na. Source:
//   Kim WR, Mannalithara A, Heimbach JK, et al. MELD 3.0: The Model for End-Stage
//   Liver Disease Updated for the Modern Era. Gastroenterology. 2021;161(6):1887-1895.
//   (PMID 34481845). OPTN operational bounds per the UNOS/OPTN implementation.
//
// MELD 3.0 = 1.33*(female)
//          + 4.56*ln(bilirubin)  + 0.82*(137 - Na)  - 0.24*(137 - Na)*ln(bilirubin)
//          + 9.09*ln(INR)        + 11.14*ln(creatinine)
//          + 1.85*(3.5 - albumin) - 1.83*(3.5 - albumin)*ln(creatinine)
//          + 6
//
// Pre-calculation bounds (OPTN):
//   bilirubin, INR, creatinine floored at 1.0; creatinine capped at 3.0
//   (>= 2 dialysis sessions in the prior week, or 24h CVVHD, sets creatinine to 3.0);
//   sodium bounded to 125-137 mEq/L; albumin bounded to 1.5-3.5 g/dL.
// The final score is rounded to the nearest integer and bounded to 6-40.
//
// Pure: no DOM, no clock, no network.

export const MELD3_NOTE = 'MELD 3.0 (Model for End-Stage Liver Disease, updated form; Kim WR, Mannalithara A, Heimbach JK, et al, Gastroenterology 2021;161(6):1887-1895; OPTN/UNOS operational bounds). The current liver-allocation score, adopted by OPTN in 2023 as the successor to MELD-Na. It adds female sex and serum albumin to MELD-Na and refits every coefficient, correcting a survival disadvantage women faced under MELD-Na. MELD 3.0 = 1.33*(female) + 4.56*ln(bilirubin) + 0.82*(137 - sodium) - 0.24*(137 - sodium)*ln(bilirubin) + 9.09*ln(INR) + 11.14*ln(creatinine) + 1.85*(3.5 - albumin) - 1.83*(3.5 - albumin)*ln(creatinine) + 6. Before use, bilirubin, INR, and creatinine are floored at 1.0 mg/dL, creatinine is capped at 3.0 mg/dL (two or more dialysis sessions in the prior week, or 24 hours of continuous venovenous hemodialysis, set creatinine to 3.0), sodium is bounded to 125-137 mEq/L, and albumin is bounded to 1.5-3.5 g/dL. The result is rounded and bounded to 6-40; a higher score predicts higher 90-day waitlist mortality, and 15 or above is the conventional threshold at which transplant is generally expected to confer a survival benefit. It is a waitlist-mortality estimate for the transplant team; listing and organ allocation stay with the transplant center.';

function pos(v, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n <= 0 || (max !== undefined && n > max)) return null;
  return n;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function clamp(x, lo, hi) { return Math.min(Math.max(x, lo), hi); }

function band(score) {
  if (score < 15) return { tier: 'lower', label: 'lower waitlist priority' };
  if (score < 25) return { tier: 'high', label: 'higher waitlist priority' };
  return { tier: 'very-high', label: 'very high waitlist priority' };
}

export function meld3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const female = o.sex === 'female';
  if (!(o.sex === 'female' || o.sex === 'male')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex (female adds 1.33 points).', note: MELD3_NOTE };
  }
  const bili = pos(o.bilirubin, 100);
  if (bili === null) return { valid: false, code: 'MISSING_INPUT', field: 'bilirubin', message: 'Enter serum bilirubin in mg/dL.', note: MELD3_NOTE };
  const inr = pos(o.inr, 30);
  if (inr === null) return { valid: false, code: 'MISSING_INPUT', field: 'inr', message: 'Enter INR.', note: MELD3_NOTE };
  const creatRaw = pos(o.creatinine, 40);
  if (creatRaw === null) return { valid: false, code: 'MISSING_INPUT', field: 'creatinine', message: 'Enter serum creatinine in mg/dL.', note: MELD3_NOTE };
  const sodium = pos(o.sodium, 200);
  if (sodium === null) return { valid: false, code: 'MISSING_INPUT', field: 'sodium', message: 'Enter serum sodium in mEq/L.', note: MELD3_NOTE };
  const albRaw = pos(o.albumin, 10);
  if (albRaw === null) return { valid: false, code: 'MISSING_INPUT', field: 'albumin', message: 'Enter serum albumin in g/dL.', note: MELD3_NOTE };

  const dialysis = truthy(o.dialysis);
  const b = Math.max(bili, 1.0);
  const i = Math.max(inr, 1.0);
  const c = dialysis ? 3.0 : clamp(creatRaw, 1.0, 3.0);
  const na = clamp(sodium, 125, 137);
  const alb = clamp(albRaw, 1.5, 3.5);

  const lnB = Math.log(b);
  const lnI = Math.log(i);
  const lnC = Math.log(c);

  const raw = 1.33 * (female ? 1 : 0)
    + 4.56 * lnB
    + 0.82 * (137 - na)
    - 0.24 * (137 - na) * lnB
    + 9.09 * lnI
    + 11.14 * lnC
    + 1.85 * (3.5 - alb)
    - 1.83 * (3.5 - alb) * lnC
    + 6;

  const score = clamp(Math.round(raw), 6, 40);
  const bnd = band(score);

  return {
    valid: true,
    score,
    raw: Math.round(raw * 10) / 10,
    tier: bnd.tier,
    abnormal: score >= 15,
    bandLabel: `MELD 3.0 ${score}`,
    band: `MELD 3.0 ${score}/40 — ${bnd.label} (higher score = higher 90-day waitlist mortality).`,
    detail: `${dialysis ? 'Dialysis set creatinine to 3.0. ' : ''}Bilirubin, INR, and creatinine are floored at 1.0; creatinine is capped at 3.0; sodium is bounded to 125–137; albumin is bounded to 1.5–3.5. Score bounded to 6–40. A score of 15 or above is the conventional transplant-benefit threshold.`,
    note: MELD3_NOTE,
  };
}
