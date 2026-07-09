// spec-v276: the Buzby Nutritional Risk Index (NRI) — the original VA-TPN
// perioperative undernutrition index, computed from serum albumin and the current /
// usual weight ratio. Joins the nutrition tiles (GNRI / PNI / CONUT) in the group-E lab
// family. The id was verified absent by a direct scan of app.js AND the MCP adapter set
// first (spec-v85 §6.2). v276 runs no AI and makes no runtime network call.
//
// This computes a nutrition-risk index with source-quoted bands — it is NOT a diagnosis
// and NOT a treatment order (spec-v11 §5.3).
//
//   nri - 1.519 x albumin (g/L) + 41.7 x (current weight / usual weight)
//
// FORMULA / BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Nutritional Risk Index (Buzby) ------------------------------------------
// NRI = 1.519 x serum albumin (g/L) + 41.7 x (current body weight / usual body weight)
// (Buzby GP, et al., for the Veterans Affairs Total Parenteral Nutrition Cooperative Study
// Group. Perioperative total parenteral nutrition in surgical patients. N Engl J Med.
// 1991;325(8):525-532; the NRI grading is from Detsky/VA-TPN). Bands: > 100 no risk,
// 97.5-100 mild, 83.5 to < 97.5 moderate, < 83.5 severe. A LOWER NRI marks greater risk.
// Cross-verified against standard nutrition references, which reuse the identical formula
// and bands.
const NRI_NOTE = 'Nutritional Risk Index (Buzby, VA-TPN) = 1.519 x albumin (g/L) + 41.7 x (current weight / usual weight). Bands: > 100 no nutritional risk, 97.5-100 mild, 83.5 to < 97.5 moderate, < 83.5 severe. A LOWER value marks greater perioperative nutritional risk. A screening index, not a diagnosis or treatment order. Note the units: albumin in g/L (multiply a g/dL value by 10); weights in any consistent unit.';
function nriBand(s) {
  if (s > 100) return 'no nutritional risk';
  if (s >= 97.5) return 'mild nutritional risk';
  if (s >= 83.5) return 'moderate nutritional risk';
  return 'severe nutritional risk';
}
export function nri(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const albumin = pos(o.albumin, 5, 80);
  const current = pos(o.currentWeight, 1, 500);
  const usual = pos(o.usualWeight, 1, 500);
  if (albumin === null || current === null || usual === null) {
    return { valid: false, message: 'Enter serum albumin (g/L), current weight, and usual weight (same unit).' };
  }
  const ratio = current / usual;
  const score = r2(num('NRI', (1.519 * albumin) + (41.7 * ratio), { min: 0, max: 100000 }));
  const label = nriBand(score);
  return { valid: true, score, abnormal: score <= 100, bandLabel: `NRI ${score}`,
    band: `Nutritional Risk Index ${score} — ${label} (bands: >100 none, 97.5-100 mild, 83.5-97.5 moderate, <83.5 severe).`,
    detail: `1.519 x albumin ${albumin} g/L + 41.7 x (weight ${current} / usual ${usual} = ${r2(num('ratio', ratio, { min: 0, max: 1000 }))}).`, note: NRI_NOTE };
}
