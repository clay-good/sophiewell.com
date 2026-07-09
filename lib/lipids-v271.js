// spec-v271: the Castelli Risk Index (I and II) — the two classic atherogenic
// cholesterol-ratio indices, computed from a lipid panel already in hand. Joins the
// lipid tiles (non-HDL / remnant cholesterol) in the group-E lab family. The id was
// verified absent by a direct scan of app.js AND the MCP adapter set first
// (spec-v85 §6.2). v271 runs no AI and makes no runtime network call.
//
// This computes a lab-derived ratio — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   castelli - Risk Index-I = TC/HDL, Risk Index-II = LDL/HDL
//
// FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Castelli Risk Index -----------------------------------------------------
// Castelli Risk Index-I (the "cardiac risk ratio") = total cholesterol / HDL-C;
// Risk Index-II = LDL-C / HDL-C (Castelli WP, et al. Circulation. 1983;67(4):730-734,
// which established the total-cholesterol/HDL ratio as a coronary-risk predictor;
// the LDL/HDL form is the widely-reproduced companion index). Both ratios are unitless
// (numerator and denominator share the same units). A HIGHER ratio marks a more
// atherogenic profile. Cross-verified against the ratio reproduced in standard lipid
// references, which give identical definitions.
const CASTELLI_NOTE = 'Castelli Risk Index-I = total cholesterol / HDL-C; Risk Index-II = LDL-C / HDL-C (Castelli 1983). Both are unitless atherogenic ratios; a HIGHER ratio marks a more atherogenic profile. Commonly cited desirable ranges: Risk Index-I below ~5 (men) / ~4.5 (women), Risk Index-II below ~3, but there is no single universal cut-point. A lab-derived ratio, not a diagnosis or treatment order. Enter total cholesterol, LDL, and HDL in the same units.';
export function castelli(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tc = pos(o.tc, 20, 1000);
  const ldl = pos(o.ldl, 1, 800);
  const hdl = pos(o.hdl, 1, 500);
  if (tc === null || ldl === null || hdl === null) {
    return { valid: false, message: 'Enter total cholesterol, LDL cholesterol, and HDL cholesterol (same units).' };
  }
  const cri1 = r2(num('Castelli-I', tc / hdl, { min: 0, max: 100000 }));
  const cri2 = r2(num('Castelli-II', ldl / hdl, { min: 0, max: 100000 }));
  return { valid: true, score: cri1, cri2, abnormal: false, bandLabel: `Castelli-I ${cri1}`,
    band: `Castelli Risk Index-I ${cri1} (TC/HDL), Risk Index-II ${cri2} (LDL/HDL) — higher ratios mark a more atherogenic profile; interpretation is context-dependent.`,
    detail: `TC ${tc} / HDL ${hdl} = ${cri1}; LDL ${ldl} / HDL ${hdl} = ${cri2}.`, note: CASTELLI_NOTE };
}
