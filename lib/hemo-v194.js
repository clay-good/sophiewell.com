// spec-v194: four deterministic invasive- and echocardiographic-hemodynamics
// instruments (Advanced Specialist Quantitation program, spec-v193 §1.1). Every
// id was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v194 runs no AI and makes no runtime network call.
// These quantify physiology — they are not support-device, listing, or
// management orders (spec-v11 §5.3).
//
//   papi                  - Pulmonary Artery Pulsatility Index
//   pressureGradients     - Transpulmonary (TPG) & diastolic (DPG) gradients
//   teiIndex              - Tei myocardial performance index (MPI)
//   shuntFraction         - Pulmonary shunt fraction (Qs/Qt, Berggren)
//
// FORMULAS / REFERENCE RANGES RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent sources at implementation:
//   - papi = (PASP - PADP) / RAP (Korabathina R, et al, Catheter Cardiovasc
//     Interv 2012;80(4):593-600; review Lim HS, Gustafsson F, Eur J Heart Fail
//     2020;22(1):32-38). PAPi < 1.0 flags severe RV dysfunction in acute RV/
//     inferior MI and post-LVAD RV failure; < 1.85 flags RV dysfunction in
//     advanced heart failure. Guards RAP > 0.
//   - TPG = mPAP - PCWP; DPG = PADP - PCWP (Naeije R, et al, Eur Respir J
//     2013;41(1):217-223). TPG > 12 mmHg historically flags a pulmonary-vascular
//     component; when PCWP > 15 (post-capillary PH), DPG >= 7 mmHg distinguishes
//     combined pre-/post-capillary from isolated post-capillary PH.
//   - MPI = (IVCT + IVRT) / ET (Tei C, et al, J Cardiol 1995;26(6):357-366). LV
//     normal ~0.39 +/- 0.05, RV normal ~0.28 +/- 0.04; higher = worse combined
//     systolic-diastolic function. Guards ET > 0.
//   - Qs/Qt = (CcO2 - CaO2) / (CcO2 - CvO2) with content CxO2 = 1.34 x Hb x SxO2
//     + 0.0031 x PxO2 (Berggren SM, Acta Physiol Scand 1942; Nunn's Applied
//     Respiratory Physiology). End-capillary saturation assumed 100%. Normal
//     ~4-10%. Guards (CcO2 - CvO2) > 0.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.1 PAPi ---------------------------------------------------------------
const PAPI_NOTE = 'Pulmonary artery pulsatility index (Korabathina R, et al, Catheter Cardiovasc Interv 2012;80(4):593-600; review Lim HS, Gustafsson F, Eur J Heart Fail 2020;22(1):32-38). PAPi = (PA systolic − PA diastolic) / right atrial pressure. The interpretation is population-dependent: PAPi < 1.0 flags severe right-ventricular dysfunction in acute RV / inferior MI and post-LVAD RV failure; < 1.85 flags RV dysfunction in advanced heart failure. A hemodynamic index, not an order.';

export function papi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pasp = pos(o.pasp, 300);
  const padp = pos(o.padp, 200);
  const rap = pos(o.rap, 100);
  const missing = [];
  if (pasp === null) missing.push('PA systolic pressure (mmHg)');
  if (padp === null) missing.push('PA diastolic pressure (mmHg)');
  if (rap === null) missing.push('right atrial pressure (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const pp = pasp - padp;
  const value = r2(num('PAPi', pp / rap, { min: -1000, max: 100000 }));
  const abnormal = value < 1.85;
  let band;
  if (value < 1.0) band = `PAPi ${value} — below 1.0: severe RV dysfunction in acute RV/inferior MI and post-LVAD RV-failure populations.`;
  else if (value < 1.85) band = `PAPi ${value} — below 1.85: reduced, flags RV dysfunction in advanced heart failure.`;
  else band = `PAPi ${value} — at or above 1.85.`;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `PAPi ${value}`,
    band,
    detail: `Pulse pressure ${r1(pp)} mmHg (PASP ${r1(pasp)} − PADP ${r1(padp)}) ÷ RAP ${r1(rap)} mmHg. The threshold is context-specific — name the population before acting.`,
    note: PAPI_NOTE,
  };
}

// --- 2.2 TPG / DPG ----------------------------------------------------------
const GRAD_NOTE = 'Transpulmonary (TPG = mean PAP − PCWP) and diastolic (DPG = PA diastolic − PCWP) pressure gradients (Naeije R, et al, Eur Respir J 2013;41(1):217-223). TPG > 12 mmHg historically flags a pulmonary-vascular component. In post-capillary pulmonary hypertension (PCWP > 15 mmHg), DPG ≥ 7 mmHg distinguishes combined pre-/post-capillary from isolated post-capillary PH. A classification aid, not an order.';

export function pressureGradients(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mpap = pos(o.mpap, 200);
  const padp = pos(o.padp, 200);
  const pcwp = pos(o.pcwp, 100);
  const missing = [];
  if (mpap === null) missing.push('mean PA pressure (mmHg)');
  if (padp === null) missing.push('PA diastolic pressure (mmHg)');
  if (pcwp === null) missing.push('mean PCWP (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const tpg = r1(num('TPG', mpap - pcwp, { min: -200, max: 200 }));
  const dpg = r1(num('DPG', padp - pcwp, { min: -200, max: 200 }));
  const postCap = pcwp > 15;
  const abnormal = tpg > 12 || (postCap && dpg >= 7);
  let band;
  if (postCap && dpg >= 7) band = `TPG ${tpg}, DPG ${dpg} mmHg — with PCWP > 15, DPG ≥ 7 marks a combined pre-/post-capillary component.`;
  else if (postCap) band = `TPG ${tpg}, DPG ${dpg} mmHg — post-capillary (PCWP > 15) with DPG < 7: isolated post-capillary pattern.`;
  else if (tpg > 12) band = `TPG ${tpg}, DPG ${dpg} mmHg — TPG > 12 flags a pulmonary-vascular component.`;
  else band = `TPG ${tpg}, DPG ${dpg} mmHg — within the historically normal transpulmonary range.`;
  return {
    valid: true,
    tpg,
    dpg,
    abnormal,
    bandLabel: `TPG ${tpg}, DPG ${dpg} mmHg`,
    band,
    detail: `TPG = mPAP ${r1(mpap)} − PCWP ${r1(pcwp)} = ${tpg} mmHg; DPG = PADP ${r1(padp)} − PCWP ${r1(pcwp)} = ${dpg} mmHg. The DPG classification applies only when PCWP > 15 mmHg.`,
    note: GRAD_NOTE,
  };
}

// --- 2.3 Tei index ----------------------------------------------------------
const TEI_NOTE = 'Tei myocardial performance index (MPI = (IVCT + IVRT) / ET) (Tei C, et al, J Cardiol 1995;26(6):357-366). Combined systolic-diastolic function; higher = worse. Reference: LV normal ~0.39 ± 0.05, RV normal ~0.28 ± 0.04; > 1.14 flags poor prognosis in severe LV dysfunction. A functional index, not an order.';

export function teiIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ivct = inRange(o.ivct, 0, 2000);
  const ivrt = inRange(o.ivrt, 0, 2000);
  const et = pos(o.et, 2000);
  const missing = [];
  if (ivct === null) missing.push('isovolumic contraction time (ms)');
  if (ivrt === null) missing.push('isovolumic relaxation time (ms)');
  if (et === null) missing.push('ejection time (ms)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r2(num('MPI', (ivct + ivrt) / et, { min: 0, max: 100000 }));
  const abnormal = value > 0.44; // above the LV normal band upper edge (~0.39 + 0.05)
  let band;
  if (value > 1.14) band = `Tei index ${value} — above 1.14: marks poor prognosis in severe LV dysfunction.`;
  else if (value > 0.44) band = `Tei index ${value} — above the LV normal band (~0.39 ± 0.05): worse combined function.`;
  else band = `Tei index ${value} — within the LV normal band (~0.39 ± 0.05).`;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `Tei index ${value}`,
    band,
    detail: `(IVCT ${r1(ivct)} + IVRT ${r1(ivrt)}) ÷ ET ${r1(et)} ms. Compare against the chamber-specific band (LV ~0.39 ± 0.05, RV ~0.28 ± 0.04).`,
    note: TEI_NOTE,
  };
}

// --- 2.4 Shunt fraction (Qs/Qt) --------------------------------------------
const SHUNT_NOTE = 'Pulmonary shunt fraction Qs/Qt (Berggren SM, Acta Physiol Scand 1942; restated in Nunn’s Applied Respiratory Physiology). Oxygen content CxO₂ = 1.34 × Hb × SxO₂ + 0.0031 × PxO₂; end-capillary saturation assumed 100%. Qs/Qt = (CcO₂ − CaO₂) / (CcO₂ − CvO₂). Normal ~4–10%; rises with true shunt. A gas-exchange measure, not an order.';

function content(hb, satFrac, po2) {
  return 1.34 * hb * satFrac + 0.0031 * po2;
}

export function shuntFraction(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hb = pos(o.hb, 30); // g/dL
  const pAO2 = pos(o.pAO2, 800); // alveolar / end-capillary O2 tension (mmHg)
  const sao2 = inRange(o.sao2, 1, 100); // %
  const pao2 = pos(o.pao2, 800); // mmHg
  const svo2 = inRange(o.svo2, 1, 100); // %
  const pvo2 = pos(o.pvo2, 800); // mmHg
  const missing = [];
  if (hb === null) missing.push('hemoglobin (g/dL)');
  if (pAO2 === null) missing.push('alveolar/end-capillary O₂ tension (mmHg)');
  if (sao2 === null) missing.push('arterial SaO₂ (%)');
  if (pao2 === null) missing.push('arterial PaO₂ (mmHg)');
  if (svo2 === null) missing.push('mixed-venous SvO₂ (%)');
  if (pvo2 === null) missing.push('mixed-venous PvO₂ (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const cco2 = content(hb, 1.0, pAO2); // end-capillary, Sc'O2 = 100%
  const cao2 = content(hb, sao2 / 100, pao2);
  const cvo2 = content(hb, svo2 / 100, pvo2);
  const denom = cco2 - cvo2;
  if (denom <= 0) return { valid: false, message: 'End-capillary minus mixed-venous O₂ content must be positive — check the entered saturations and tensions.' };
  const frac = (cco2 - cao2) / denom;
  const pct = r1(num('Qs/Qt %', frac * 100, { min: -1000, max: 1000 }));
  const abnormal = pct > 10;
  let band;
  if (pct > 10) band = `Shunt fraction ${pct}% — above the ~4–10% normal range.`;
  else if (pct < 0) band = `Shunt fraction ${pct}% — negative: recheck inputs (CaO₂ should not exceed CcO₂).`;
  else band = `Shunt fraction ${pct}% — within the ~4–10% normal range.`;
  return {
    valid: true,
    pct,
    cco2: r2(cco2),
    cao2: r2(cao2),
    cvo2: r2(cvo2),
    abnormal,
    bandLabel: `Qs/Qt ${pct}%`,
    band,
    detail: `CcO₂ ${r2(cco2)}, CaO₂ ${r2(cao2)}, CvO₂ ${r2(cvo2)} mL/dL (mL O₂ per 100 mL). Qs/Qt = (CcO₂ − CaO₂) / (CcO₂ − CvO₂).`,
    note: SHUNT_NOTE,
  };
}
