// spec-v236: ophthalmology / refractive calculators — the spherical equivalent,
// the vertex-distance power conversion, the percent tissue altered (LASIK ectasia
// risk), and the Randleman Ectasia Risk Score System. Each id was verified absent
// by a fixed-string scan of the extracted app.js id/name lists AND the MCP adapter
// set first (spec-v85 §6.2). v236 runs no AI and makes no runtime network call.
//
// These compute an optical value or a risk score — they are NOT a diagnosis and
// NOT a treatment order (spec-v11 §5.3).
//
//   spherical-equivalent  - spherical equivalent (S + C/2)
//   vertex-distance       - vertex-distance power conversion
//   percent-tissue-altered - PTA (LASIK ectasia risk metric)
//   randleman-erss        - Randleman Ectasia Risk Score System
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Spherical equivalent ----------------------------------------------------
// SE = sphere + cylinder / 2 (the cylinder acts in one meridian, so half of it is
// added to the sphere; axis is dropped). StatPearls "The Spherical Equivalent".
const SE_NOTE = 'Spherical equivalent = sphere + cylinder / 2 (half the cylinder is added to the sphere; the axis is dropped). It lands the eye at the circle of least confusion. An optical value, not a diagnosis or treatment order.';
export function sphericalEquivalent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sph = fin(o.sphere, -40, 40);
  const cyl = fin(o.cylinder, -20, 20);
  if (sph === null || cyl === null) {
    return { valid: false, message: 'Enter sphere and cylinder power in diopters.' };
  }
  const score = r2(num('SE', sph + cyl / 2, { min: -60, max: 60 }));
  return { valid: true, score, abnormal: false, bandLabel: `SE ${score} D`, band: `Spherical equivalent ${score} D.`, detail: `Sphere ${sph} + cylinder ${cyl} / 2.`, note: SE_NOTE };
}

// --- Vertex-distance power conversion ----------------------------------------
// Fc = Fs / (1 - d·Fs), where Fs is the spectacle-plane power (D) and d is the
// vertex distance in meters (mm / 1000). Clinically significant beyond ~+/-4 D.
// Wikipedia "Vertex distance"; Omnicalculator.
const VERTEX_NOTE = 'Vertex-corrected power = Fs / (1 - d·Fs), where Fs is the spectacle-plane power (diopters) and d is the vertex distance in meters. Applied per meridian for a toric Rx; clinically significant beyond about +/- 4 D. Round to the nearest 0.25 D in practice. An optical value, not a diagnosis or treatment order.';
export function vertexDistance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fs = fin(o.power, -40, 40);
  const mm = fin(o.vertexMm, 0, 30);
  if (fs === null || mm === null) {
    return { valid: false, message: 'Enter spectacle power (D) and vertex distance (mm).' };
  }
  const d = mm / 1000;
  const denom = 1 - d * fs;
  if (denom === 0) {
    return { valid: false, message: 'Undefined for this power/vertex combination (1 - d·Fs = 0).' };
  }
  const score = r2(num('Vertex power', fs / denom, { min: -60, max: 60 }));
  return { valid: true, score, abnormal: false, bandLabel: `${score} D`, band: `Vertex-corrected power ${score} D.`, detail: `Fs ${fs} D at ${mm} mm.`, note: VERTEX_NOTE };
}

// --- Percent tissue altered (PTA) --------------------------------------------
// Santhiago MR, et al. Am J Ophthalmol. 2014: PTA = (flap thickness + ablation
// depth) / central corneal thickness x 100. PTA >= 40% is the strongest single
// predictor of post-LASIK ectasia in a normal-topography eye. AAO EyeNet.
const PTA_NOTE = 'Percent tissue altered (Santhiago MR, et al. Am J Ophthalmol. 2014) = (flap thickness + ablation depth) / central corneal thickness x 100. PTA >= 40% is the strongest single predictor of post-LASIK ectasia in a normal-topography eye (a lower threshold may apply if topography is abnormal). A risk metric, not a diagnosis or treatment order.';
export function percentTissueAltered(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ft = fin(o.flap, 1, 400);
  const ad = fin(o.ablation, 0, 400);
  const cct = fin(o.cct, 200, 800);
  if (ft === null || ad === null || cct === null) {
    return { valid: false, message: 'Enter flap thickness, ablation depth, and central corneal thickness (um).' };
  }
  const score = r1(num('PTA', (ft + ad) / cct * 100, { min: 0, max: 200 }));
  const abnormal = score >= 40;
  return { valid: true, score, abnormal, bandLabel: `PTA ${score}%`, band: `Percent tissue altered ${score}% — ${abnormal ? 'at or above the 40% high-risk threshold' : 'below the 40% high-risk threshold'}.`, detail: `(flap ${ft} + ablation ${ad}) / CCT ${cct}.`, note: PTA_NOTE };
}

// --- Randleman Ectasia Risk Score System (ERSS) ------------------------------
// Randleman JB, et al. Ophthalmology. 2008: topography (normal/SBT 0, ABT 2, INF
// steepening/SRA 3, abnormal 4), residual stromal bed (< 240 = 4, 240-259 = 3,
// 260-279 = 2, 280-299 = 1, >= 300 = 0), age (18-21 = 4, 22-25 = 3, 26-29 = 2,
// >= 30 = 0), corneal thickness (< 450 = 4, 451-480 = 3, 481-510 = 2, >= 510 = 0),
// and MRSE myopia magnitude (> 14 = 4, > 12-14 = 3, > 10-12 = 2, > 8-10 = 1,
// <= 8 = 0). Total: 0-2 low, 3 moderate, >= 4 high. Cross-verified: PMC3748728;
// PMC7591850.
const ERSS_NOTE = 'Randleman Ectasia Risk Score System (Randleman JB, et al. Ophthalmology. 2008): topography (0-4) + residual stromal bed (0-4) + age (0-4) + corneal thickness (0-4) + MRSE myopia magnitude (0-4). Total 0-2 low, 3 moderate, >= 4 high risk of post-LASIK ectasia. Topography grade is a clinician judgment. A risk score, not a diagnosis or treatment order.';
function binRSB(x) { if (x < 240) return 4; if (x < 260) return 3; if (x < 280) return 2; if (x < 300) return 1; return 0; }
function binAge(x) { if (x <= 21) return 4; if (x <= 25) return 3; if (x <= 29) return 2; return 0; }
function binCCT(x) { if (x < 451) return 4; if (x <= 480) return 3; if (x <= 510) return 2; return 0; }
function binMRSE(m) { if (m > 14) return 4; if (m > 12) return 3; if (m > 10) return 2; if (m > 8) return 1; return 0; }
export function randlemanErss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const topo = fin(o.topo, 0, 4);
  const rsb = fin(o.rsb, 100, 500);
  const age = fin(o.age, 10, 90);
  const cct = fin(o.cct, 200, 800);
  const mrse = fin(o.mrse, -40, 40);
  if (topo === null || rsb === null || age === null || cct === null || mrse === null) {
    return { valid: false, message: 'Enter topography grade, residual stromal bed (um), age, corneal thickness (um), and MRSE (D).' };
  }
  const pts = Math.round(topo) + binRSB(rsb) + binAge(age) + binCCT(cct) + binMRSE(-mrse);
  const score = Math.round(num('ERSS', pts, { min: 0, max: 20 }));
  let tier; let abnormal = true;
  if (score >= 4) tier = 'high ectasia risk (>= 4)';
  else if (score >= 3) tier = 'moderate ectasia risk';
  else { tier = 'low ectasia risk (0-2)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `ERSS ${score}`, band: `Randleman ERSS ${score} — ${tier}.`, detail: `Topography ${Math.round(topo)}, RSB ${binRSB(rsb)}, age ${binAge(age)}, CCT ${binCCT(cct)}, MRSE ${binMRSE(-mrse)}.`, note: ERSS_NOTE };
}
