// spec-v257: diving / hyperbaric-medicine formulas — the nitrox maximum operating
// depth (MOD), the equivalent air depth (EAD), and the pulmonary oxygen-toxicity
// units (OTU). Each id was verified absent by a fixed-string scan of the extracted
// app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v257 runs no
// AI and makes no runtime network call.
//
// These compute a depth / exposure value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   maximum-operating-depth  - nitrox MOD
//   equivalent-air-depth     - nitrox EAD
//   oxygen-toxicity-units    - pulmonary OTU
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Maximum operating depth (MOD) -------------------------------------------
// MOD (metres of sea water) = 10 x (PO2max / FO2 - 1), where PO2max is the accepted
// oxygen partial-pressure limit (typically 1.4 bar working, 1.6 contingency) and
// FO2 is the oxygen fraction of the mix. Cross-verified: Wikipedia "Maximum
// operating depth"; TDI/SDI.
const MOD_NOTE = 'Maximum operating depth (nitrox) = 10 x (PO2max / FO2 - 1) metres of sea water, where PO2max is the accepted oxygen partial-pressure limit (typically 1.4 bar working, 1.6 contingency) and FO2 is the oxygen fraction. Below the MOD the inspired PO2 exceeds the CNS oxygen-toxicity limit. A depth limit, not a diagnosis or treatment order.';
export function maximumOperatingDepth(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fo2 = fin(o.fo2, 0.21, 1);
  const po2max = fin(o.po2max, 1.0, 2.0);
  if (fo2 === null || po2max === null) {
    return { valid: false, message: 'Enter the oxygen fraction (FO2, e.g. 0.32) and the PO2 limit (bar, e.g. 1.4).' };
  }
  const score = r1(num('MOD', 10 * (po2max / fo2 - 1), { min: 0, max: 500 }));
  return { valid: true, score, abnormal: false, bandLabel: `${score} m`, band: `Maximum operating depth ${score} m (FO2 ${fo2} at PO2 ${po2max} bar).`, detail: `10 x (${po2max} / ${fo2} - 1).`, note: MOD_NOTE };
}

// --- Equivalent air depth (EAD) ----------------------------------------------
// EAD (metres) = (depth + 10) x (FN2 / 0.79) - 10, where FN2 = 1 - FO2. It is the
// air depth giving the same inspired nitrogen partial pressure as the nitrox mix at
// the actual depth, for use with air decompression tables. Cross-verified:
// Wikipedia "Equivalent air depth"; medicalalgorithms.
const EAD_NOTE = 'Equivalent air depth (nitrox) = (depth + 10) x (FN2 / 0.79) - 10 metres, where FN2 = 1 - FO2. It is the air depth giving the same inspired nitrogen partial pressure as the nitrox mix at the actual depth, for use with air decompression tables. A depth value, not a diagnosis or treatment order.';
export function equivalentAirDepth(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const depth = fin(o.depth, 0, 200);
  const fo2 = fin(o.fo2, 0.21, 1);
  if (depth === null || fo2 === null) {
    return { valid: false, message: 'Enter the actual depth (m) and the oxygen fraction (FO2).' };
  }
  const fn2 = 1 - fo2;
  const score = r1(num('EAD', (depth + 10) * (fn2 / 0.79) - 10, { min: -20, max: 300 }));
  return { valid: true, score, abnormal: false, bandLabel: `EAD ${score} m`, band: `Equivalent air depth ${score} m (at ${depth} m on FO2 ${fo2}).`, detail: `(${depth} + 10) x (${r1(fn2)} / 0.79) - 10.`, note: EAD_NOTE };
}

// --- Pulmonary oxygen-toxicity units (OTU) -----------------------------------
// OTU = t x [(PO2 - 0.5) / 0.5]^0.83, where t is the exposure time in minutes and
// PO2 is the oxygen partial pressure in ATA (0 when PO2 <= 0.5). A single-dive limit
// of ~615 OTU is commonly used. Cross-verified: PMC6881196; DMAC 35.
const OTU_NOTE = 'Pulmonary oxygen-toxicity units = t x [(PO2 - 0.5) / 0.5]^0.83, where t is the exposure time (minutes) and PO2 is the oxygen partial pressure (ATA); 0 when PO2 <= 0.5. A single-dive limit of ~615 OTU is commonly used (with lower multi-day REPEX averages). An exposure value, not a diagnosis or treatment order.';
export function oxygenToxicityUnits(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const po2 = fin(o.po2, 0.1, 3);
  const time = fin(o.time, 0, 6000);
  if (po2 === null || time === null) {
    return { valid: false, message: 'Enter the oxygen partial pressure (PO2, ATA) and the exposure time (minutes).' };
  }
  const raw = po2 <= 0.5 ? 0 : time * Math.pow((po2 - 0.5) / 0.5, 0.83);
  const score = r1(num('OTU', raw, { min: 0, max: 100000 }));
  const abnormal = score > 615;
  return { valid: true, score, abnormal, bandLabel: `OTU ${score}`, band: `Oxygen toxicity units ${score} — ${abnormal ? 'above the ~615 single-dive limit' : 'within the ~615 single-dive limit'}.`, detail: `${time} min x ((${po2} - 0.5) / 0.5)^0.83.`, note: OTU_NOTE };
}
