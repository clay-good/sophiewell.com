// spec-v684: Fractional excretion of potassium (FEK).
//
// The missing member of the fractional-excretion family (the catalog already has FENa,
// FEurea, FEMg, and fractional excretion of phosphate / uric acid). FEK is the fraction of
// filtered potassium that is excreted, used to distinguish renal from extrarenal potassium
// handling in dyskalemia.
//
//   FEK (%) = (urine K x plasma creatinine) / (plasma K x urine creatinine) x 100
//
// The four concentration units cancel, so only internal consistency is required (urine and
// plasma potassium in the same unit; urine and plasma creatinine in the same unit).
//
// Interpretation is CONTEXT-DEPENDENT and advisory (Lin SH, et al. and standard references):
//   Normal on a typical diet averages ~8% (roughly 4-16%).
//   In HYPOkalemia: FEK < ~10% (some use < 6.5%) suggests extrarenal loss; FEK > ~20%
//     suggests renal potassium wasting.
//   In HYPERkalemia: a low FEK (< ~10%) with preserved renal function suggests impaired
//     renal potassium excretion.
// Because the meaning flips with the serum potassium, this tile reports the value and states
// the advisory cut-points; it does not assert a single normal/abnormal verdict.
//
// Pure: no DOM, no clock, no network.

export const FEK_NOTE = 'Fractional excretion of potassium (FEK) is the fraction of filtered potassium that appears in the urine, used to tell renal from extrarenal potassium handling in low or high serum potassium. FEK (%) = (urine potassium x plasma creatinine) / (plasma potassium x urine creatinine) x 100; the concentration units cancel, so only internal consistency is needed. On a typical diet it averages about 8 percent (roughly 4 to 16 percent). In hypokalemia, an FEK below about 10 percent (some use below 6.5 percent) points to extrarenal loss while an FEK above about 20 percent points to renal potassium wasting; in hyperkalemia, a low FEK (below about 10 percent) with preserved renal function points to impaired renal excretion. Because the interpretation flips with the serum potassium, the value should be read alongside the potassium and the clinical picture; it supports rather than replaces clinical judgment.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

import { boundsAdvisory } from './bounds.js';

// spec-v1234: this tile's criteria are threshold comparisons, so past a
// threshold the size of the number stops mattering. Envelope and wording from
// BOUNDS + boundsAdvisory in lib/bounds.js; nothing clinical is decided here,
// and the check runs after the tile's own missing-value branch (spec-v1207) so a
// blank field is still asked for by name.
function envelopeFault(rows, note) {
  for (const [key, v] of rows) {
    // spec-v1234: `Number('')` is 0 and 0 is finite, so a blank field reached
    // `boundsAdvisory` as a measurement of zero -- which is BELOW several
    // envelopes. `phoenix-sepsis`'s own worked example leaves the INR out, and
    // this printed "Input below the plausible range for INR (0.5 to 20)" over the
    // whole tile. The repo has hit this exact trap at spec-v1038, spec-v1040 and
    // spec-v1213; `measured()` in lib/num.js exists for it.
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (!Number.isFinite(Number(v))) continue;
    const fault = boundsAdvisory(key, Number(v));
    if (fault) return { valid: false, code: 'INVALID_INPUT', message: fault, band: fault, note };
  }
  return null;
}

export function fractionalExcretionPotassium(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const urineK = pos(o.urineK);
  if (!Number.isFinite(urineK) || urineK <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'urineK', message: 'Enter urine potassium (mEq/L).', note: FEK_NOTE };
  }
  const plasmaK = pos(o.plasmaK);
  if (!Number.isFinite(plasmaK) || plasmaK <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'plasmaK', message: 'Enter plasma/serum potassium (mEq/L).', note: FEK_NOTE };
  }
  const urineCr = pos(o.urineCr);
  if (!Number.isFinite(urineCr) || urineCr <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'urineCr', message: 'Enter urine creatinine (mg/dL).', note: FEK_NOTE };
  }
  const plasmaCr = pos(o.plasmaCr);
  if (!Number.isFinite(plasmaCr) || plasmaCr <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'plasmaCr', message: 'Enter plasma/serum creatinine (mg/dL).', note: FEK_NOTE };
  }
  // A fraction has two ends (spec-v1233): BOUNDS.potassium is a SERUM potassium
  // and BOUNDS.scr a SERUM creatinine, so the plasma pair is checked and the
  // urine pair -- where a potassium of 40 mEq/L and a creatinine in the hundreds
  // are both normal -- is not.
  const fekFault = envelopeFault([['potassium', plasmaK], ['scr', plasmaCr]], FEK_NOTE);
  if (fekFault) return fekFault;

  const fek = (urineK * plasmaCr) / (plasmaK * urineCr) * 100;
  const rounded = Math.round(fek * 10) / 10;

  return {
    valid: true,
    fek: rounded,
    // No single verdict — interpretation depends on the serum potassium.
    abnormal: false,
    bandLabel: `FEK ${rounded}%`,
    band: `FEK ${rounded}% — read alongside the serum potassium (interpretation is context-dependent).`,
    detail: 'In hypokalemia: below ~10% suggests extrarenal loss, above ~20% suggests renal potassium wasting. In hyperkalemia: a low FEK with preserved renal function suggests impaired renal excretion. Typical diet averages ~8%.',
    note: FEK_NOTE,
  };
}
