// spec-v237: cardiology ECG / echo bedside calculators — the Romhilt-Estes LVH
// point score, the Wilkins mitral-valve echo score, the mitral valve area by
// pressure half-time, the aortic dimensionless index, and the rate-pressure
// product. Each id was verified absent by a fixed-string scan of the extracted
// app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v237 runs no
// AI and makes no runtime network call.
//
// These score / classify / compute a value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   romhilt-estes         - Romhilt-Estes LVH point score
//   wilkins-score         - Wilkins mitral-valve echo score
//   mitral-valve-area-pht - mitral valve area by pressure half-time
//   aortic-dvi            - aortic dimensionless index (velocity ratio)
//   rate-pressure-product - rate-pressure product (double product)
//
// POINT SYSTEMS / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r2, gradeFault } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function lvl(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return lo;
  return Math.round(n);
}
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
// spec-v1236: the local reader above returns one `null` for a blank field, a
// non-number AND a value outside its own bounds, and every caller reads `null`
// as absent -- so a reader who typed an impossible number was told to *enter* it,
// retyped it, and got the same sentence. `gradeFault` (lib/num.js, spec-v1209)
// SKIPS a blank, so it goes BEFORE each function's own branch: a blank falls
// through to the caller's message, which still names every empty field at once,
// and only the out-of-range value is called out here.
//
// The bounds are the callers' own. The LABELS come from the field registry each
// tile already publishes to agents, read per CALCULATOR and never merged across
// the catalog -- two tiles can both have an arg called `pre`, and an arg name
// means nothing outside the tile it belongs to.


// --- Romhilt-Estes LVH point score -------------------------------------------
// Romhilt DW, Estes EH. Am Heart J. 1968: voltage criterion 3; ST-T strain 3
// (1 if on digitalis); left atrial abnormality 3; left axis >= -30 deg 2; QRS
// >= 90 ms 1; intrinsicoid deflection V5/V6 >= 50 ms 1. >= 5 definite LVH, 4
// probable. Cross-verified: PMC5495629; my-ekg.
const RE_NOTE = 'Romhilt-Estes LVH point score (Romhilt DW, Estes EH. Am Heart J. 1968): voltage criterion 3, ST-T strain 3 (1 if on digitalis), left atrial abnormality 3, left axis >= -30 deg 2, QRS >= 90 ms 1, intrinsicoid deflection V5/V6 >= 50 ms 1. Total 0-13; >= 5 definite LVH, 4 probable. An ECG score, not a diagnosis or treatment order.';
export function romhiltEstes(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.voltage)) s += 3;
  s += lvl(o.strain, 0, 3); // 0 none / 3 typical / 1 on digitalis (select supplies 0/1/3)
  if (bool(o.laAbnormality)) s += 3;
  if (bool(o.leftAxis)) s += 2;
  if (bool(o.qrs)) s += 1;
  if (bool(o.intrinsicoid)) s += 1;
  const score = Math.round(num('Romhilt-Estes', s, { min: 0, max: 13 }));
  let tier; let abnormal = true;
  if (score >= 5) tier = 'definite LVH (>= 5)';
  else if (score >= 4) tier = 'probable LVH (4)';
  else { tier = 'LVH not met (<= 3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `RE ${score}`, band: `Romhilt-Estes ${score} — ${tier}.`, detail: 'Voltage 3, ST-T strain 3 (1 on digitalis), LA abnormality 3, LAD 2, QRS 1, intrinsicoid 1.', note: RE_NOTE };
}

// --- Wilkins mitral-valve echo score -----------------------------------------
// Wilkins GT, et al. Br Heart J. 1988: leaflet mobility, leaflet thickening,
// leaflet calcification, subvalvular thickening, each 1-4; total 4-16. <= 8
// favorable for percutaneous balloon mitral valvuloplasty, 9-12 intermediate,
// >= 13 unfavorable. Cross-verified: appcardio; johnsonfrancis.
const WILKINS_NOTE = 'Wilkins mitral-valve echo score (Wilkins GT, et al. Br Heart J. 1988): leaflet mobility, leaflet thickening, leaflet calcification, subvalvular thickening, each 1-4; total 4-16. <= 8 favorable for percutaneous balloon mitral valvuloplasty, 9-12 intermediate, >= 13 unfavorable. An anatomy score, not a diagnosis or treatment order.';
export function wilkinsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // spec-v1131: `lvl(v, 1, 4)` returns its LOW bound for a non-finite value, and
  // 1 on each Wilkins characteristic is the best appearance there is -- fully
  // mobile leaflets, near-normal thickness, no calcification, minimal
  // subvalvular disease. Four ungraded characteristics therefore answered
  // "Wilkins score 4 -- favorable for balloon valvuloplasty (<= 8)", which is
  // the most favourable reading the instrument has, and the one that chooses a
  // percutaneous procedure over open surgery.
  //
  // Each component is 1 to 4, so what has been graded is a FLOOR: unfavourable
  // (>= 13) rules in from a subset (rule 13), and "favorable" is the reading an
  // ungraded characteristic can undo.
  // null and '' are both "nobody graded this"; `Number(null)` is 0, so test the
  // value before testing the number.
  const graded = (v) => v !== null && v !== undefined && String(v).trim() !== ''
    && Number.isFinite(Number(v));
  const COMPONENTS = [
    [o.mobility, 'leaflet mobility'], [o.thickening, 'leaflet thickening'],
    [o.calcification, 'leaflet calcification'], [o.subvalvular, 'subvalvular thickening'],
  ];
  const ungraded = COMPONENTS.filter(([v]) => !graded(v)).map(([, label]) => label);
  const s = lvl(o.mobility, 1, 4) + lvl(o.thickening, 1, 4) + lvl(o.calcification, 1, 4) + lvl(o.subvalvular, 1, 4);
  const score = Math.round(num('Wilkins', s, { min: 4, max: 16 }));
  let tier; let abnormal = true;
  if (score >= 13) tier = 'unfavorable for balloon valvuloplasty (>= 13)';
  else if (score >= 9) tier = 'intermediate (9-12)';
  else { tier = 'favorable for balloon valvuloplasty (<= 8)'; abnormal = false; }
  const floored = ungraded.length > 0 && score < 13;
  return {
    valid: true,
    score,
    ungraded,
    floorOnly: floored,
    abnormal,
    bandLabel: floored ? `Wilkins at least ${score}` : `Wilkins ${score}`,
    band: floored
      ? `Wilkins score at least ${score} on what was graded: ${ungraded.join(', ')} `
        + `${ungraded.length === 1 ? 'is' : 'are'} not graded, and each scores 1 to 4, so the `
        + 'valvuloplasty suitability cannot be read off this total yet.'
      : `Wilkins score ${score} — ${tier}.`,
    detail: 'Mobility + thickening + calcification + subvalvular, each 1-4.',
    note: WILKINS_NOTE,
  };
}

// --- Mitral valve area by pressure half-time ---------------------------------
// Hatle L, et al. Circulation. 1979: MVA (cm^2) = 220 / pressure half-time (ms).
// > 1.5 mild, 1.0-1.5 moderate, < 1.0 severe mitral stenosis (ASE grading).
// Unreliable immediately post-valvotomy or with significant AR. Cross-verified:
// johnsonfrancis; e-echocardiography.
const MVA_NOTE = 'Mitral valve area by pressure half-time (Hatle L, et al. Circulation. 1979) = 220 / pressure half-time (ms). > 1.5 cm^2 mild, 1.0-1.5 moderate, < 1.0 severe mitral stenosis (ASE grading). Unreliable immediately post-valvotomy or with significant aortic regurgitation. A hemodynamic estimate, not a diagnosis or treatment order.';
export function mitralValveAreaPht(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pht = fin(o.pht, 1, 2000);
  const fault = gradeFault([
    ['Pressure half-time (ms)', o.pht, 1, 2000],
  ]);
  if (fault) return { valid: false, message: fault };
  if (pht === null) return { valid: false, message: 'Enter the mitral pressure half-time (ms).' };
  const score = r2(num('MVA', 220 / pht, { min: 0, max: 20 }));
  let tier; let abnormal = true;
  if (score < 1.0) tier = 'severe mitral stenosis (< 1.0)';
  else if (score <= 1.5) tier = 'moderate mitral stenosis (1.0-1.5)';
  else { tier = 'mild or no significant mitral stenosis (> 1.5)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `MVA ${score}`, band: `Mitral valve area ${score} cm^2 — ${tier}.`, detail: `220 / PHT ${pht} ms.`, note: MVA_NOTE };
}

// --- Aortic dimensionless index (velocity ratio) -----------------------------
// Otto CM, et al: DVI = LVOT VTI / aortic-valve VTI (or peak velocities). <= 0.25
// severe aortic stenosis, 0.25-0.50 moderate, > 0.50 mild. Area-free (avoids the
// LVOT-diameter-squared error); also used for prosthetic-valve surveillance.
// Cross-verified: PMC8674501; cardioserv.
const DVI_NOTE = 'Aortic dimensionless index = LVOT VTI / aortic-valve VTI (or peak velocities). <= 0.25 severe aortic stenosis, 0.25-0.50 moderate, > 0.50 mild. Area-free (avoids the LVOT-diameter-squared error); also used for prosthetic-valve surveillance. A hemodynamic ratio, not a diagnosis or treatment order.';
export function aorticDvi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lvot = fin(o.lvot, 0.1, 200);
  const av = fin(o.av, 0.1, 1000);
  const fault = gradeFault([
    ['LVOT VTI (or peak velocity)', o.lvot, 0.1, 200],
    ['Aortic-valve VTI (or peak velocity)', o.av, 0.1, 1000],
  ]);
  if (fault) return { valid: false, message: fault };
  if (lvot === null || av === null) return { valid: false, message: 'Enter LVOT VTI (or velocity) and aortic-valve VTI (or velocity).' };
  const score = r2(num('DVI', lvot / av, { min: 0, max: 10 }));
  let tier; let abnormal = true;
  if (score <= 0.25) tier = 'severe aortic stenosis (<= 0.25)';
  else if (score <= 0.50) tier = 'moderate aortic stenosis (0.25-0.50)';
  else { tier = 'mild or no significant aortic stenosis (> 0.50)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `DVI ${score}`, band: `Aortic dimensionless index ${score} — ${tier}.`, detail: `LVOT ${lvot} / AV ${av}.`, note: DVI_NOTE };
}

// --- Rate-pressure product (double product) ----------------------------------
// RPP = heart rate (bpm) x systolic BP (mmHg); a surrogate for myocardial oxygen
// demand. Resting typically < 10000; a peak-exercise RPP > 20000 reflects good
// reserve, < 16000 may indicate impaired reserve. Cross-verified: Wikipedia;
// Omnicalculator.
const RPP_NOTE = 'Rate-pressure product = heart rate (bpm) x systolic BP (mmHg); a surrogate for myocardial oxygen demand. Resting typically < 10000; a peak-exercise RPP > 20000 reflects good reserve, < 16000 may indicate impaired reserve. A physiologic value, not a diagnosis or treatment order.';
export function ratePressureProduct(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hr = fin(o.hr, 10, 350);
  const sbp = fin(o.sbp, 30, 320);
  const fault = gradeFault([
    ['Heart rate (bpm)', o.hr, 10, 350],
    ['Systolic BP (mmHg)', o.sbp, 30, 320],
  ]);
  if (fault) return { valid: false, message: fault };
  if (hr === null || sbp === null) return { valid: false, message: 'Enter heart rate (bpm) and systolic BP (mmHg).' };
  const score = Math.round(num('RPP', hr * sbp, { min: 0, max: 200000 }));
  return { valid: true, score, abnormal: false, bandLabel: `RPP ${score}`, band: `Rate-pressure product ${score} — myocardial oxygen demand surrogate.`, detail: `HR ${hr} x SBP ${sbp}.`, note: RPP_NOTE };
}
