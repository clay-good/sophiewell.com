// spec-v277: measured (timed-urine) creatinine clearance — the direct
// clearance-from-a-collection calculation, distinct from the Cockcroft-Gault ESTIMATE
// the catalog already carries. Joins the renal tiles (group E). The id was verified
// absent by a direct scan of app.js AND the MCP adapter set first (spec-v85 §6.2). v277
// runs no AI and makes no runtime network call.
//
// This computes a clearance value — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   measured-crcl - (urine Cr x urine volume) / (serum Cr x collection time)
//
// FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r1 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Measured (timed) creatinine clearance -----------------------------------
// CrCl (mL/min) = (urine creatinine [mg/dL] x urine volume [mL]) / (serum creatinine
// [mg/dL] x collection time [min]) — the textbook renal clearance identity C = (U x V) / P.
// Reviewed for measured clearance in Stevens LA, Levey AS. Measured GFR as a confirmatory
// test for estimated GFR. J Am Soc Nephrol. 2009;20(11):2305-2313. Because the urine
// creatinine and serum creatinine units cancel, only their ratio matters; volume is mL and
// time is minutes so the result is mL/min. Not body-surface-area normalized unless corrected.
const CRCL_NOTE = 'Measured creatinine clearance = (urine creatinine x urine volume) / (serum creatinine x collection time), the direct C = (U x V) / P clearance from a timed urine collection. With urine and serum creatinine in the same units, volume in mL, and time in minutes, the result is mL/min. Typical adult clearance is ~90-140 mL/min and falls with age; it is NOT body-surface-area normalized here. Distinct from the Cockcroft-Gault estimate. A clearance value, not a diagnosis or treatment order.';
export function measuredCrcl(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const uCr = pos(o.urineCr, 1, 1000);
  const uVol = pos(o.urineVolume, 1, 20000);
  const sCr = pos(o.serumCr, 0.1, 30);
  const hours = pos(o.hours, 0.5, 72);
  if (uCr === null || uVol === null || sCr === null || hours === null) {
    return { valid: false, message: 'Enter urine creatinine (mg/dL), urine volume (mL), serum creatinine (mg/dL), and collection time (hours).' };
  }
  const minutes = hours * 60;
  const score = r1(num('CrCl', (uCr * uVol) / (sCr * minutes), { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: score < 60, bandLabel: `CrCl ${score} mL/min`,
    band: `Measured creatinine clearance ${score} mL/min (${r1(num('hrs', hours, { min: 0, max: 100 }))}-hour timed collection; not BSA-normalized).`,
    detail: `(urine Cr ${uCr} x volume ${uVol} mL) / (serum Cr ${sCr} x ${r1(num('min', minutes, { min: 0, max: 100000 }))} min).`, note: CRCL_NOTE };
}
