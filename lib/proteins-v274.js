// spec-v274: the albumin-to-globulin ratio (A/G ratio) — a routine serum-protein ratio
// and prognostic inflammation/nutrition marker, computed from total protein and albumin
// already on a metabolic panel. Joins the group-E lab family. The id was verified absent
// by a direct scan of app.js AND the MCP adapter set first (spec-v85 §6.2). v274 runs no
// AI and makes no runtime network call.
//
// This computes a lab-derived ratio — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   agr - albumin / globulin, where globulin = total protein - albumin
//
// DEFINITION RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Albumin-to-globulin ratio -----------------------------------------------
// A/G ratio = serum albumin / globulin, where globulin = total protein - albumin (both in
// the same units, so the ratio is unitless). The calculated-globulin identity is standard
// clinical chemistry; a LOW / reversed ratio (< ~1) is a recognized flag (inflammation,
// paraproteinemia, nephrotic loss, chronic liver disease) and a lower A/G tracks with a
// worse prognosis across many conditions. Cross-verified against standard laboratory
// references, which give the identical definition and a typical reference interval of
// roughly 1.1-2.5.
const AGR_NOTE = 'Albumin-to-globulin ratio = albumin / globulin, where globulin = total protein - albumin (same units; the ratio is unitless). Typical reference interval roughly 1.1-2.5. A LOW or reversed ratio (< ~1) is a recognized flag (inflammation, paraproteinemia, nephrotic protein loss, chronic liver disease), and a lower A/G tracks with a worse prognosis across many conditions. A lab-derived ratio, not a diagnosis or treatment order. Enter total protein and albumin in the same units.';
export function agr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const albumin = pos(o.albumin, 0.1, 8);
  const totalProtein = pos(o.totalProtein, 1, 20);
  if (albumin === null || totalProtein === null) {
    return { valid: false, message: 'Enter serum albumin and total protein in the same units (g/dL).' };
  }
  const globulin = totalProtein - albumin;
  if (!(globulin > 0)) {
    return { valid: false, message: 'Total protein must be greater than albumin (globulin = total protein - albumin).' };
  }
  const glob = r2(num('globulin', globulin, { min: 0, max: 20 }));
  const score = r2(num('A/G', albumin / globulin, { min: 0, max: 100000 }));
  return { valid: true, score, globulin: glob, abnormal: score < 1, bandLabel: `A/G ${score}`,
    band: `Albumin-to-globulin ratio ${score} (globulin ${glob} g/dL) — a lower value is less favorable; interpretation is context-dependent (typical range ~1.1-2.5).`,
    detail: `Albumin ${albumin} / globulin ${glob} (total protein ${totalProtein} - albumin ${albumin}).`, note: AGR_NOTE };
}
