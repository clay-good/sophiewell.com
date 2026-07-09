// spec-v272: the waist-to-height ratio (WHtR) — the single best-validated
// central-adiposity screening ratio, with the "keep your waist to less than half your
// height" 0.5 boundary. Joins the anthropometric/adiposity tiles (group G). The id was
// verified absent by a direct scan of app.js AND the MCP adapter set first
// (spec-v85 §6.2). v272 runs no AI and makes no runtime network call.
//
// This computes an anthropometric ratio with a source-quoted boundary — it is NOT a
// diagnosis and NOT a treatment order (spec-v11 §5.3).
//
//   whtr - waist circumference / height
//
// BOUNDARIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Waist-to-height ratio ---------------------------------------------------
// WHtR = waist circumference / height, both in the same units (the ratio is unitless).
// The 0.5 boundary ("keep your waist to less than half your height") and the Ashwell shape
// chart bands are from Ashwell M, Gibson S. Waist-to-height ratio as an indicator of 'early
// health risk': simpler and more predictive than using a 'matrix' based on BMI and waist
// circumference. BMJ Open. 2016;6(3):e010159; cross-verified against national public-health
// guidance that endorses the same 0.5 boundary. A HIGHER ratio marks greater central
// adiposity.
const WHTR_NOTE = 'Waist-to-height ratio = waist circumference / height (same units). The 0.5 boundary — "keep your waist to less than half your height" — and the Ashwell shape-chart bands are from Ashwell & Gibson 2016. Bands: below 0.4 (below the healthy range), 0.4 to below 0.5 (healthy), 0.5 to below 0.6 (increased central-adiposity risk), 0.6 or above (high risk). A HIGHER ratio marks greater central adiposity. An anthropometric ratio, not a diagnosis or treatment order.';
function whtrBand(r) {
  if (r < 0.4) return 'below the healthy range (Ashwell "take care")';
  if (r < 0.5) return 'healthy range';
  if (r < 0.6) return 'increased central-adiposity risk';
  return 'high central-adiposity risk';
}
export function whtr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const waist = pos(o.waist, 20, 300);
  const height = pos(o.height, 50, 260);
  if (waist === null || height === null) {
    return { valid: false, message: 'Enter waist circumference and height in the same units.' };
  }
  const score = r2(num('WHtR', waist / height, { min: 0, max: 100 }));
  const label = whtrBand(score);
  return { valid: true, score, abnormal: score >= 0.5, bandLabel: `WHtR ${score}`,
    band: `Waist-to-height ratio ${score} — ${label} (boundary 0.5; Ashwell).`,
    detail: `Waist ${waist} / height ${height}.`, note: WHTR_NOTE };
}
