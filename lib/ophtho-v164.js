// spec-v164 (the second feature spec of the spec-v162 Cross-Discipline
// Completion program): three deterministic ophthalmology computes that fill a
// zero-tile gap — ophthalmology had no tile in the live catalog. None duplicates
// a live tile; v164 runs no AI and makes no runtime network call.
//
//   iolPower                - intraocular-lens power (SRK II regression formula)
//   visualAcuityConverter   - Snellen / logMAR / decimal visual-acuity notations
//   ocularPerfusionPressure - mean / systolic / diastolic OPP from BP and IOP
//
// Per the spec-v100 §2 doctrine each is closed-form arithmetic over standard
// biometry / clinical values. Citations live inline in lib/meta.js; the
// renderers in views/group-v164.js render the spec-v50 §3 posture note and defer
// the decision to the clinician (spec-v11 §5.3).
//
// SOURCE-GOVERNANCE (cross-verified, spec-v97):
//   - iolPower (Sanders/Retzlaff/Kraff; SRK II, J Cataract Refract Surg
//     1988;14(2):136-141): emmetropic power P = A1 − 0.9·K − 2.5·AL, where A1 is
//     the A-constant with the SRK II axial-length adjustment (AL < 20 → +3,
//     20–<21 → +2, 21–<22 → +1, 22–<24.5 → 0, ≥ 24.5 → −0.5). The K coefficient
//     0.9, AL coefficient 2.5, and the band table are confirmed across >= 2
//     sources (StatPearls NBK589643, AAO, Wikipedia). For a non-zero target
//     refraction the standard SRK refractive factor (~1.25 D of IOL per D of
//     refraction) is applied: P = P_emmetropia − 1.25·target — shipped with the
//     explicit caveat that the per-power breakpoint of the factor is not
//     uniformly published and that SRK II is a regression formula superseded by
//     optical/theoretical formulas (SRK/T, Barrett) and does NOT replace device
//     biometry.
//   - visualAcuityConverter (Holladay JT, J Cataract Refract Surg
//     2004;30(2):287-290): logMAR = log10(Snellen denominator / 20) = −log10
//     (decimal); decimal = 20 / denominator = 10^(−logMAR); the imperial 20/x and
//     metric 6/x references convert via the same ratio. Count-fingers / hand-
//     motion / light-perception are non-numeric low-vision anchors handled as
//     special cases so they never feed the log conversion.
//   - ocularPerfusionPressure (Costa VP, et al, Acta Ophthalmol 2014;92(4):
//     e252-266): MAP = DBP + ⅓·(SBP − DBP); mean OPP = ⅔·MAP − IOP; systolic OPP
//     = SBP − IOP; diastolic OPP = DBP − IOP. A low mean OPP is one of several
//     glaucoma-risk associations.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// A finite number that may be zero or negative (target refraction), bounded.
function finite(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.1 IOL power (SRK II) -------------------------------------------------
const IOL_NOTE = 'Intraocular-lens power, SRK II regression formula (Sanders/Retzlaff/Kraff 1988). Emmetropic power P = A1 − 0.9·K − 2.5·AL, where A1 is the lens A-constant adjusted for axial length (AL < 20 → +3, 20–<21 → +2, 21–<22 → +1, 22–<24.5 → 0, ≥ 24.5 → −0.5). For a non-zero target refraction the standard SRK refractive factor (≈ 1.25 D of IOL per dioptre of desired refraction) is applied. SRK II is a second-generation regression formula superseded by optical/theoretical formulas (SRK/T, Haigis, Barrett); it does NOT replace device biometry — enter the surgeon-measured AL, K, and A-constant.';

function srk2Adjust(al) {
  if (al < 20) return 3;
  if (al < 21) return 2;
  if (al < 22) return 1;
  if (al < 24.5) return 0;
  return -0.5;
}

export function iolPower(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const aConst = pos(o.aConst, 130);
  const al = pos(o.al, 40);
  const k = pos(o.k, 80);
  const target = o.target === '' || o.target === null || o.target === undefined ? 0 : finite(o.target, -10, 10);
  const missing = [];
  if (aConst === null) missing.push('A-constant');
  if (al === null) missing.push('axial length AL (mm)');
  if (k === null) missing.push('average keratometry K (D)');
  if (target === null) missing.push('target refraction between −10 and +10 D');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const adjust = srk2Adjust(al);
  const a1 = aConst + adjust;
  const emmetropic = r2(num('IOL power', a1 - 0.9 * k - 2.5 * al, { min: -50, max: 100 }));
  // Refractive-factor correction for a non-zero target (myopic target = more power).
  const RF = 1.25;
  const power = r2(num('IOL power', emmetropic - RF * target, { min: -50, max: 100 }));
  return {
    valid: true,
    emmetropic,
    power,
    adjust,
    target,
    bandLabel: 'IOL power',
    band: target === 0
      ? `Emmetropic IOL power ${emmetropic} D (A-constant adjusted ${adjust >= 0 ? '+' : ''}${adjust} for AL ${al} mm).`
      : `IOL power ${power} D for target ${target >= 0 ? '+' : ''}${target} D (emmetropic ${emmetropic} D; SRK refractive factor 1.25).`,
    detail: `SRK II: P = (A ${adjust >= 0 ? '+' : '−'} ${Math.abs(adjust)}) − 0.9·K − 2.5·AL = ${a1} − ${r1(0.9 * k)} − ${r1(2.5 * al)}. A regression formula superseded by optical formulas; it does not replace device biometry.`,
    note: IOL_NOTE,
  };
}

// --- 2.2 Visual acuity converter --------------------------------------------
const VA_NOTE = 'Visual-acuity converter (Holladay JT, J Cataract Refract Surg 2004;30(2):287-290). logMAR = log10(Snellen denominator / 20) = −log10(decimal); decimal = 20 / denominator = 10^(−logMAR); Snellen 20/x and metric 6/x are the same ratio expressed against a 20-ft or 6-m reference. Count-fingers, hand-motion, and light-perception are non-numeric low-vision categories below chart acuity and are not converted to a Snellen fraction.';

const VA_MODE = { snellen20: 'snellen20', snellen6: 'snellen6', decimal: 'decimal', logmar: 'logmar' };

export function visualAcuityConverter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = typeof o.mode === 'string' && VA_MODE[o.mode] ? o.mode : '';
  if (!mode) return { valid: false, message: 'Choose the notation you are entering (Snellen 20/x, Snellen 6/x, decimal, or logMAR).' };
  // Resolve a decimal acuity from whichever notation was entered.
  let decimal = null;
  if (mode === 'snellen20') {
    const denom = pos(o.value, 8000);
    if (denom === null) return { valid: false, message: 'Enter the Snellen denominator (e.g. 40 for 20/40).' };
    decimal = 20 / denom;
  } else if (mode === 'snellen6') {
    const denom = pos(o.value, 2400);
    if (denom === null) return { valid: false, message: 'Enter the metric Snellen denominator (e.g. 12 for 6/12).' };
    decimal = 6 / denom;
  } else if (mode === 'decimal') {
    const d = pos(o.value, 4);
    if (d === null) return { valid: false, message: 'Enter a decimal acuity greater than 0 (e.g. 0.5).' };
    decimal = d;
  } else { // logmar — may be negative (better than 20/20)
    const lm = finite(o.value, -1, 3);
    if (lm === null) return { valid: false, message: 'Enter a logMAR value between −1.0 and 3.0.' };
    decimal = 10 ** (-lm);
  }
  const logmarRaw = r2(num('logMAR', -Math.log10(decimal), { min: -2, max: 5 }));
  const logmar = logmarRaw === 0 ? 0 : logmarRaw; // normalize -0 -> 0
  const dec = r2(num('decimal', decimal, { min: 0, max: 10 }));
  const snellen20 = Math.round(20 / decimal);
  const snellen6 = r1(6 / decimal);
  return {
    valid: true,
    mode,
    decimal: dec,
    logmar,
    snellen20,
    snellen6,
    bandLabel: 'Visual acuity',
    band: `Snellen 20/${snellen20} (6/${snellen6}) = decimal ${dec} = logMAR ${logmar}.`,
    detail: 'logMAR = log10(denominator/20); a lower logMAR (and higher decimal) is better acuity. 20/20 = decimal 1.0 = logMAR 0.',
    note: VA_NOTE,
  };
}

// --- 2.3 Ocular perfusion pressure ------------------------------------------
const OPP_NOTE = 'Ocular perfusion pressure (Costa VP, et al, Acta Ophthalmol 2014;92(4):e252-266). Mean arterial pressure MAP = DBP + ⅓·(SBP − DBP); mean OPP = ⅔·MAP − IOP; systolic OPP = SBP − IOP; diastolic OPP = DBP − IOP. A low mean OPP (commonly cited below ≈ 50 mmHg) is one of several vascular associations with glaucoma risk; it is not by itself diagnostic.';

export function ocularPerfusionPressure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sbp = pos(o.sbp, 320);
  const dbp = pos(o.dbp, 220);
  const iop = pos(o.iop, 90);
  const missing = [];
  if (sbp === null) missing.push('systolic BP (mmHg)');
  if (dbp === null) missing.push('diastolic BP (mmHg)');
  if (iop === null) missing.push('intraocular pressure IOP (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  if (dbp >= sbp) return { valid: false, message: 'Diastolic BP must be below systolic BP.' };
  const map = dbp + (sbp - dbp) / 3;
  const meanOpp = r1(num('mean OPP', (2 / 3) * map - iop, { min: -200, max: 300 }));
  const systolicOpp = r1(num('systolic OPP', sbp - iop, { min: -200, max: 400 }));
  const diastolicOpp = r1(num('diastolic OPP', dbp - iop, { min: -200, max: 300 }));
  const low = meanOpp < 50;
  return {
    valid: true,
    map: r1(map),
    meanOpp,
    systolicOpp,
    diastolicOpp,
    abnormal: low,
    bandLabel: low ? 'Low mean OPP' : 'Mean OPP',
    band: `Mean OPP ${meanOpp} mmHg (systolic ${systolicOpp}, diastolic ${diastolicOpp}) — ${low ? 'low' : 'within the commonly cited range'}.`,
    detail: `MAP ${r1(map)} mmHg; mean OPP = ⅔·MAP − IOP. A mean OPP below ≈ 50 mmHg is one of several associations with glaucoma risk.`,
    note: OPP_NOTE,
  };
}
