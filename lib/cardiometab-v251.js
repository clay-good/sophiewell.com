// spec-v251: cardiometabolic formulas — the corrected TIMI frame count, the
// Tp-e/QT ratio, the single-point insulin sensitivity estimator (SPISE), and the
// atherogenic index of plasma (AIP). Each id was verified absent by a fixed-string
// scan of the extracted app.js id/name lists AND the MCP adapter set first (spec-
// v85 §6.2). v251 runs no AI and makes no runtime network call.
//
// These compute a value — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   corrected-timi-frame-count    - corrected TIMI frame count (cTFC)
//   tpe-qt-ratio                  - Tp-e/QT ratio
//   spise                         - single-point insulin sensitivity estimator
//   atherogenic-index-of-plasma   - atherogenic index of plasma
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
const log10 = (x) => Math.log(x) / Math.LN10;

// --- Corrected TIMI frame count (cTFC) ---------------------------------------
// Gibson CM, et al. Circulation. 1996: number of cine frames for contrast to reach
// the standardized distal landmark, normalized to 30 frames/s; for the LAD divide
// by 1.7 (it is longer). Corrected normal ~21 +/- 3; higher = slower coronary flow.
// Cross-verified: Circulation 1996; PMC2499881.
const CTFC_NOTE = 'Corrected TIMI frame count (Gibson CM, et al. Circulation. 1996): cine frames for contrast to reach the standardized distal landmark, normalized to 30 frames/s; for the LAD divide by 1.7 (it is longer than the RCA/LCx). Corrected normal ~21 +/- 3; higher = slower coronary flow (> ~27 abnormal). A flow index, not a diagnosis or treatment order.';
export function correctedTimiFrameCount(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const frames = fin(o.frames, 1, 500);
  const fps = fin(o.fps, 5, 120);
  const lad = o.vessel === 'lad';
  if (frames === null || fps === null) {
    return { valid: false, message: 'Enter the frame count and the acquisition frame rate (frames/s).' };
  }
  const normalized = frames * (30 / fps);
  const score = r2(num('cTFC', lad ? normalized / 1.7 : normalized, { min: 0, max: 1000 }));
  const abnormal = score > 27;
  return { valid: true, score, abnormal, bandLabel: `cTFC ${score}`, band: `Corrected TIMI frame count ${score} — ${abnormal ? 'slow coronary flow (> ~27)' : 'normal flow (~21)'}.`, detail: lad ? `${frames} frames x 30/${fps}, / 1.7 (LAD).` : `${frames} frames x 30/${fps}.`, note: CTFC_NOTE };
}

// --- Tp-e/QT ratio -----------------------------------------------------------
// Gupta P, et al. J Electrocardiol. 2008: Tp-e (T-peak to T-end interval) / QT. A
// marker of transmural dispersion of repolarization; the precordial reference is
// ~0.21, and an increased ratio is associated with greater ventricular-arrhythmia
// risk. Cross-verified: PubMed 18790499; PMC5477084.
const TPE_NOTE = 'Tp-e/QT ratio (Gupta P, et al. J Electrocardiol. 2008): the T-peak-to-T-end interval divided by the QT interval, a marker of transmural dispersion of repolarization. The precordial reference is ~0.21; an increased ratio (> ~0.25) is associated with greater ventricular-arrhythmia risk. An ECG index, not a diagnosis or treatment order.';
export function tpeQtRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tpe = fin(o.tpe, 20, 400);
  const qt = fin(o.qt, 200, 800);
  if (tpe === null || qt === null) {
    return { valid: false, message: 'Enter the Tp-e interval and the QT interval (ms).' };
  }
  const score = r2(num('Tp-e/QT', tpe / qt, { min: 0, max: 2 }));
  const abnormal = score > 0.25;
  return { valid: true, score, abnormal, bandLabel: `Tp-e/QT ${score}`, band: `Tp-e/QT ratio ${score} — ${abnormal ? 'increased (> 0.25)' : 'near the 0.21 reference'}.`, detail: `Tp-e ${tpe} / QT ${qt} ms.`, note: TPE_NOTE };
}

// --- SPISE -------------------------------------------------------------------
// Paulmichl K, et al. Clin Chem. 2016: SPISE = 600 x HDL^0.185 / (TG^0.2 x
// BMI^1.338), with HDL and TG in mg/dL. A lower SPISE = greater insulin resistance;
// a cutoff ~5.4 flags insulin resistance / metabolic syndrome in adolescents
// (adult cutoffs differ). Cross-verified: PMC6771329; PMC9945119.
const SPISE_NOTE = 'SPISE (Paulmichl K, et al. Clin Chem. 2016) = 600 x HDL^0.185 / (TG^0.2 x BMI^1.338), with HDL and triglycerides in mg/dL. A lower SPISE = greater insulin resistance; a cutoff ~5.4 flags insulin resistance / metabolic syndrome in adolescents (adult cutoffs differ). A surrogate index, not a diagnosis or treatment order.';
export function spise(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hdl = fin(o.hdl, 5, 150);
  const tg = fin(o.tg, 10, 2000);
  const bmi = fin(o.bmi, 8, 100);
  if (hdl === null || tg === null || bmi === null) {
    return { valid: false, message: 'Enter HDL (mg/dL), triglycerides (mg/dL), and BMI.' };
  }
  const score = r2(num('SPISE', 600 * Math.pow(hdl, 0.185) / (Math.pow(tg, 0.2) * Math.pow(bmi, 1.338)), { min: 0, max: 100 }));
  const abnormal = score < 5.4;
  return { valid: true, score, abnormal, bandLabel: `SPISE ${score}`, band: `SPISE ${score} — ${abnormal ? 'suggests insulin resistance (< 5.4 in adolescents)' : 'above the 5.4 insulin-resistance cutoff'}.`, detail: `HDL ${hdl}, TG ${tg}, BMI ${bmi}.`, note: SPISE_NOTE };
}

// --- Atherogenic index of plasma (AIP) ---------------------------------------
// Dobiasova M, Frohlich J. Clin Biochem. 2001: AIP = log10(triglycerides / HDL),
// both in mmol/L. < 0.11 low, 0.11-0.21 intermediate, > 0.21 high cardiovascular
// risk (correlates with small dense LDL). Cross-verified: PubMed 16526201; Mayo
// Clin Proc 2017.
const AIP_NOTE = 'Atherogenic index of plasma (Dobiasova M, Frohlich J. Clin Biochem. 2001) = log10(triglycerides / HDL), both in mmol/L (to convert mg/dL: TG / 88.57, HDL / 38.67). < 0.11 low, 0.11-0.21 intermediate, > 0.21 high cardiovascular risk (correlates with small dense LDL). A lipid index, not a diagnosis or treatment order.';
export function atherogenicIndexOfPlasma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tg = fin(o.tg, 0.1, 30);
  const hdl = fin(o.hdl, 0.1, 5);
  if (tg === null || hdl === null) {
    return { valid: false, message: 'Enter triglycerides and HDL (mmol/L).' };
  }
  const score = r2(num('AIP', log10(tg / hdl), { min: -2, max: 2 }));
  let tier; let abnormal = true;
  if (score > 0.21) tier = 'high cardiovascular risk (> 0.21)';
  else if (score >= 0.11) tier = 'intermediate risk (0.11-0.21)';
  else { tier = 'low risk (< 0.11)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `AIP ${score}`, band: `Atherogenic index of plasma ${score} — ${tier}.`, detail: `log10(TG ${tg} / HDL ${hdl}) mmol/L.`, note: AIP_NOTE };
}
