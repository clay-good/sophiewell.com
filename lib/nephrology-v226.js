// spec-v226: nephrology, electrolyte & fluid formulas — Watson total body water,
// the Salazar-Corcoran obese creatinine clearance, estimated plasma volume status,
// the furosemide stress test, the fractional excretion of bicarbonate, and the
// pH-corrected serum potassium. Every id was verified absent by a direct scan of
// app.js first (spec-v85 §6.2). None duplicates a live tile; v226 runs no AI and
// makes no runtime network call. These estimate / stratify — they are NOT a fluid,
// dosing, or dialysis order (spec-v11 §5.3).
//
//   watsonTbw   - Watson total body water
//   salazarCorcoran - Salazar-Corcoran creatinine clearance (obese)
//   epvs        - estimated plasma volume status (Duarte)
//   furosemideStressTest - furosemide stress test
//   feBicarbonate - fractional excretion of bicarbonate
//   correctedPotassiumPh - pH-corrected serum potassium
//
// FORMULAS / COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function
// headers).

import { num, r1, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}
function real(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Watson TBW --------------------------------------------------------------
// Watson PE, Watson ID, Batt RD, Am J Clin Nutr 1980;33(1):27-39: Men TBW(L) =
// 2.447 - 0.09156*age + 0.1074*height(cm) + 0.3362*weight(kg); Women TBW(L) =
// -2.097 + 0.1069*height(cm) + 0.2466*weight(kg).
const WATSON_NOTE = 'Watson total body water (Watson PE, Watson ID, Batt RD, Am J Clin Nutr 1980;33(1):27-39): Men TBW(L) = 2.447 - 0.09156*age + 0.1074*height(cm) + 0.3362*weight(kg); Women TBW(L) = -2.097 + 0.1069*height(cm) + 0.2466*weight(kg). An estimate of body water for dosing and sodium calculations, not a fluid order.';
export function watsonTbw(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const ht = pos(o.height, 300);
  const wt = pos(o.weight, 700);
  if (age === null || ht === null || wt === null) {
    return { valid: false, message: 'Enter age (years), height (cm), and weight (kg), and select sex.' };
  }
  const male = !bool(o.female);
  const tbw = male
    ? 2.447 - 0.09156 * age + 0.1074 * ht + 0.3362 * wt
    : -2.097 + 0.1069 * ht + 0.2466 * wt;
  const value = r1(num('Watson TBW', tbw, { min: 0, max: 200 }));
  return { valid: true, value, abnormal: false, bandLabel: `TBW ${value} L`, band: `Watson total body water ${value} L (${male ? 'male' : 'female'} equation).`, detail: `age ${Math.round(age)}, height ${r1(ht)} cm, weight ${r1(wt)} kg.`, note: WATSON_NOTE };
}

// --- Salazar-Corcoran CrCl ---------------------------------------------------
// Salazar DE, Corcoran GB, Am J Med 1988;84(6):1053-1060 (for obesity): Men CrCl
// = [(137 - age) x (0.285*weight(kg) + 12.1*height(m)^2)] / (51 x SCr(mg/dL)); Women
// CrCl = [(146 - age) x (0.287*weight + 9.74*height^2)] / (60 x SCr).
const SALAZAR_NOTE = 'Salazar-Corcoran creatinine clearance (Salazar DE, Corcoran GB, Am J Med 1988;84(6):1053-1060): for obese patients (BMI >= 30) where Cockcroft-Gault overestimates. Men CrCl = [(137 - age) x (0.285*weight + 12.1*height(m)^2)] / (51 x SCr); Women CrCl = [(146 - age) x (0.287*weight + 9.74*height^2)] / (60 x SCr), SCr in mg/dL. An estimate, not a dosing order.';
export function salazarCorcoran(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const wt = pos(o.weight, 700);
  const htCm = pos(o.height, 300);
  const scr = pos(o.creatinine, 50);
  if (age === null || wt === null || htCm === null || scr === null) {
    return { valid: false, message: 'Enter age (years), weight (kg), height (cm), and serum creatinine (mg/dL), and select sex.' };
  }
  const htM = htCm / 100;
  const male = !bool(o.female);
  const crcl = male
    ? ((137 - age) * (0.285 * wt + 12.1 * htM * htM)) / (51 * scr)
    : ((146 - age) * (0.287 * wt + 9.74 * htM * htM)) / (60 * scr);
  const value = r1(num('Salazar-Corcoran', Math.max(0, crcl), { min: 0, max: 1000 }));
  return { valid: true, value, abnormal: value < 60, bandLabel: `CrCl ${value}`, band: `Salazar-Corcoran creatinine clearance ${value} mL/min (${male ? 'male' : 'female'} equation).`, detail: `age ${Math.round(age)}, weight ${r1(wt)} kg, height ${r1(htCm)} cm, SCr ${r2(scr)}.`, note: SALAZAR_NOTE };
}

// --- Estimated plasma volume status (Duarte) ---------------------------------
// Duarte K, et al, JACC Heart Fail 2015;3(11):886-893: ePVS = 100 x (1 -
// hematocrit fraction) / hemoglobin(g/dL), in dL/g. Higher values indicate greater
// congestion / plasma-volume expansion.
const EPVS_NOTE = 'Estimated plasma volume status (Duarte K, et al, JACC Heart Fail 2015;3(11):886-893): ePVS = 100 x (1 - hematocrit fraction) / hemoglobin(g/dL), in dL/g (typical ~4-6). Higher values indicate greater congestion / plasma-volume expansion. An estimate, not a diuretic order.';
export function epvs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hct = pos(o.hematocrit, 100);
  const hb = pos(o.hemoglobin, 30);
  if (hct === null || hb === null) {
    return { valid: false, message: 'Enter hematocrit (%) and hemoglobin (g/dL), both greater than 0.' };
  }
  const value = r2(num('ePVS', (100 * (1 - hct / 100)) / hb, { min: 0, max: 1000 }));
  const abnormal = value > 5.5;
  return { valid: true, value, abnormal, bandLabel: `ePVS ${value}`, band: `Estimated plasma volume status ${value} dL/g — ${abnormal ? 'elevated: suggests plasma-volume expansion / congestion' : 'within the usual range'}.`, detail: `100 x (1 - ${r1(hct)}/100) / ${r1(hb)} = ${value}.`, note: EPVS_NOTE };
}

// --- Furosemide stress test --------------------------------------------------
// Chawla LS, et al, Crit Care 2013;17(5):R207 + Koyner JL, et al, J Am Soc Nephrol
// 2015;26(8):2023-2031: give furosemide 1.0 mg/kg (naive) or 1.5 mg/kg (prior
// loop exposure) IV; a 2-hour urine output <= 200 mL predicts progression to
// KDIGO stage 3 acute kidney injury.
const FST_NOTE = 'Furosemide stress test (Chawla LS, et al, Crit Care 2013;17(5):R207): give furosemide 1.0 mg/kg (loop-naive) or 1.5 mg/kg (prior loop exposure) IV and measure the 2-hour urine output. A 2-hour output <= 200 mL predicts progression to KDIGO stage 3 acute kidney injury (sensitivity ~87%, specificity ~84%). A risk test, not a diuretic order.';
export function furosemideStressTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wt = pos(o.weight, 700);
  const uop = real(o.urineOutput2h, 0, 100000);
  if (wt === null || uop === null) {
    return { valid: false, message: 'Enter weight (kg) and the 2-hour urine output (mL), and mark prior loop-diuretic exposure.' };
  }
  const prior = bool(o.priorExposure);
  const dose = r1((prior ? 1.5 : 1.0) * wt);
  const progression = uop <= 200;
  return { valid: true, dose, progression, abnormal: progression, bandLabel: progression ? 'Predicts AKI progression' : 'Passes stress test', band: `Furosemide stress test: ${prior ? '1.5' : '1.0'} mg/kg = ${dose} mg IV; 2-hour urine ${r1(uop)} mL ${progression ? '<= 200 predicts progression to stage 3 AKI' : '> 200 (progression less likely)'}.`, detail: `recommended dose ${dose} mg IV.`, note: FST_NOTE };
}

// --- Fractional excretion of bicarbonate -------------------------------------
// Kurtzman NA, South Med J 2000;93(11):1042-1052 + Palmer BF, et al, AJKD Core
// Curriculum 2025: FEHCO3 = [(urine HCO3 / plasma HCO3) x (plasma Cr / urine Cr)] x
// 100, measured after bicarbonate loading. > 15% suggests proximal (type II) RTA;
// < 5% suggests distal (type I) RTA / normal.
const FEHCO3_NOTE = 'Fractional excretion of bicarbonate (Kurtzman NA, South Med J 2000;93(11):1042-1052): FEHCO3 = [(urine HCO3 / plasma HCO3) x (plasma Cr / urine Cr)] x 100, measured after bicarbonate loading to normalize plasma HCO3. > 15% suggests proximal (type II) renal tubular acidosis; < 5% suggests distal (type I) RTA or normal handling. A diagnostic ratio, not a treatment order.';
export function feBicarbonate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const uHco3 = pos(o.urineHco3, 10000);
  const pHco3 = pos(o.plasmaHco3, 100);
  const pCr = pos(o.plasmaCr, 50);
  const uCr = pos(o.urineCr, 10000);
  if (uHco3 === null || pHco3 === null || pCr === null || uCr === null) {
    return { valid: false, message: 'Enter urine and plasma bicarbonate and urine and plasma creatinine (all greater than 0).' };
  }
  const value = r2(num('FEHCO3', ((uHco3 / pHco3) * (pCr / uCr)) * 100, { min: 0, max: 1e6 }));
  let tier; let abnormal = true;
  if (value > 15) tier = 'suggests proximal (type II) RTA (> 15%)';
  else if (value < 5) { tier = 'suggests distal (type I) RTA or normal (< 5%)'; abnormal = false; }
  else tier = 'indeterminate (5-15%)';
  return { valid: true, value, abnormal, bandLabel: `FEHCO3 ${value}%`, band: `Fractional excretion of bicarbonate ${value}% — ${tier}.`, detail: `(${r1(uHco3)}/${r1(pHco3)}) x (${r2(pCr)}/${r1(uCr)}) x 100 = ${value}%.`, note: FEHCO3_NOTE };
}

// --- pH-corrected serum potassium --------------------------------------------
// Adrogue HJ, Madias NE, Am J Med 1981;71(3):456-467: serum K falls ~0.6 mEq/L per
// 0.1 rise in pH (mineral acidosis). Corrected K = measured K - 0.6 x [(7.4 - pH) /
// 0.1]. A rule of thumb (organic acidosis is closer to 0.3).
const KCORR_NOTE = 'pH-corrected serum potassium (Adrogue HJ, Madias NE, Am J Med 1981;71(3):456-467): serum potassium changes ~0.6 mEq/L per 0.1 change in pH (mineral acidosis). Corrected K = measured K - 0.6 x [(7.4 - pH) / 0.1]; the organic-acidosis coefficient is closer to 0.3. A rule-of-thumb estimate of the potassium at a normal pH, not a replacement order.';
export function correctedPotassiumPh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const k = pos(o.potassium, 20);
  const ph = real(o.ph, 6.5, 8.0);
  if (k === null || ph === null) {
    return { valid: false, message: 'Enter measured serum potassium (mEq/L) and arterial pH (6.5-8.0).' };
  }
  const corrected = r2(num('Kcorr', k - 0.6 * ((7.4 - ph) / 0.1), { min: 0, max: 20 }));
  return { valid: true, corrected, abnormal: corrected < 3.5 || corrected > 5.0, bandLabel: `Corrected K ${corrected}`, band: `pH-corrected serum potassium ${corrected} mEq/L at a normal pH of 7.4.`, detail: `${r2(k)} - 0.6 x [(7.4 - ${r2(ph)}) / 0.1] = ${corrected}.`, note: KCORR_NOTE };
}
