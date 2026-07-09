// spec-v267: the HALP score — a composite hemoglobin / albumin / lymphocyte /
// platelet prognostic index that extends the spec-v229/v230 inflammation-index
// family (NLR/PLR/SII/LMR/SIRI/PIV/CAR). It computes from CBC + serum-albumin
// values already in hand. The id was verified absent by a direct scan of app.js
// AND the MCP adapter set first (spec-v85 §6.2). v267 runs no AI and makes no
// runtime network call.
//
// This computes a lab value — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   halp - hemoglobin x albumin x lymphocytes / platelets
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

// --- HALP score --------------------------------------------------------------
// HALP = hemoglobin (g/L) x albumin (g/L) x absolute lymphocyte count (10^9/L)
// / platelet count (10^9/L) (Chen X-L, et al. Oncotarget. 2015;6(38):41370-41382,
// the derivation in resectable gastric cancer; cross-verified against Guo Y, et al.
// J Cancer. 2019;10(1):81-91 and subsequent pan-cancer validations, which reuse the
// same product/quotient definition and g/L + 10^9/L units). Unlike the neutrophil-
// based indices, a LOWER HALP marks a worse profile (less hemoglobin/albumin/
// lymphocyte reserve relative to platelets).
const HALP_NOTE = 'HALP score = hemoglobin (g/L) x albumin (g/L) x absolute lymphocyte count (10^9/L) / platelet count (10^9/L) (Chen 2015, gastric cancer derivation; validated pan-cancer since). A combined nutrition / inflammation / immune-reserve marker; unlike the neutrophil-based ratios, a LOWER HALP marks a worse profile and tracks with a worse prognosis across many conditions. The cutoff is cohort- and cancer-specific — no universal threshold. A lab value, not a diagnosis or treatment order. Note the units: hemoglobin and albumin in g/L (multiply a g/dL value by 10), counts in 10^9/L.';
export function halp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hgb = pos(o.hgb, 1, 300);
  const alb = pos(o.albumin, 1, 100);
  const alc = pos(o.alc, 0.001, 500);
  const plt = pos(o.plt, 0.1, 3000);
  if (hgb === null || alb === null || alc === null || plt === null) {
    return { valid: false, message: 'Enter hemoglobin (g/L), albumin (g/L), absolute lymphocyte count (10^9/L), and platelet count (10^9/L).' };
  }
  const score = r1(num('HALP', (hgb * alb * alc) / plt, { min: 0, max: 100000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `HALP ${score}`,
    band: `HALP score ${score} — interpretation is context-dependent (a lower value is less favorable).`,
    detail: `Hemoglobin ${hgb} g/L x albumin ${alb} g/L x ALC ${alc} / platelets ${plt}.`, note: HALP_NOTE };
}
