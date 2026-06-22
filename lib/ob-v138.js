// spec-v138 (Wave 7 opener of the spec-v100 MDCalc Parity Completion program):
// six deterministic obstetrics and maternal-fetal-medicine instruments that fill
// confirmed gaps beside the existing dating / induction tiles (due-date,
// preg-dating, bishop, bpp). None duplicates a live tile; v138 parses no report.
//
//   hadlockEfw   - Hadlock four-parameter estimated fetal weight (BPD/HC/AC/FL)
//   fullPiers    - fullPIERS adverse-maternal-outcome probability in pre-eclampsia
//   miniPiers    - miniPIERS bedside-only adverse-maternal-outcome probability
//   afi          - Amniotic Fluid Index (four-quadrant sum + oligo/poly flags)
//   barnhartHcg  - Barnhart minimal serial-hCG rise for a potentially viable IUP
//   iomGwg       - IOM gestational-weight-gain target by pre-pregnancy BMI
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v138.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the estimate / probability / range and the
// source's framing; the management decision stays with the clinician (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - hadlockEfw (Hadlock 1985, Am J Obstet Gynecol): the FOUR-parameter model
//     log10(EFW g) = 1.3596 - 0.00386*AC*FL + 0.0064*HC + 0.00061*BPD*AC
//     + 0.0424*AC + 0.174*FL, all biometry in cm. Verified verbatim across
//     perinatology.com, onlinemedicaltools.com, and the primary abstract. The
//     distinct 1.5662/HC^2 form is the THREE-parameter HC/AC/FL model -- NOT this
//     one (it has no BPD term); the BPD*AC term is the fingerprint of "Hadlock 4".
//     The log10 polynomial and its 10^x back-transform are domain/overflow guarded.
//   - fullPiers (von Dadelszen 2011, Lancet): logit = 2.68 - 0.0541*GA(wk)
//     + 1.23*chestPainDyspnea - 0.0271*creatinine(umol/L) + 0.207*platelets(10^9/L)
//     + 4.0e-5*platelets^2 + 0.0101*AST(U/L) - 3.05e-6*AST^2
//     + 2.5e-4*(creatinine*platelets) - 6.99e-5*(platelets*AST)
//     - 2.56e-3*(platelets*SpO2 %). SpO2 has NO main effect (only the platelet*SpO2
//     interaction); creatinine has no quadratic term. Bands per perinatology.com /
//     the validation literature: <10% low, 10-30% intermediate, >=30% high-risk
//     rule-in (LR+ ~17.5). Cross-verified vs the open St George's full text + a
//     Chinese-population reprint. Logistic exponent overflow-clamped.
//   - miniPiers (Payne 2014, PLoS Med): logit = -5.77 - 0.298*multiparity
//     - 1.07*ln(GA wk) + 1.34*ln(SBP mmHg) + dipstick term + 1.18*(vaginal bleeding
//     with abdominal pain) + 0.422*(headache/visual) + 0.847*(chest pain/dyspnea).
//     Dipstick proteinuria enters as THREE categorical indicators relative to
//     trace/1+/none: 2+ = -0.218 (negative, as published), 3+ = +0.424, 4+ = +0.512.
//     GA and SBP enter as NATURAL LOGS. Threshold per the paper: >=25% high-risk
//     rule-in (LR 5.09, sens 41.4%, spec 91.9%), >15% increased surveillance.
//     Cross-verified PLoS journal PDF vs PMC. Logistic exponent overflow-clamped.
//   - afi (Moore & Cayle 1990; ACOG thresholds): sum of the four-quadrant deepest
//     vertical pockets (cm); oligohydramnios < 5 cm, polyhydramnios > 24 cm (the
//     strict ACOG cut-point; some sources use > 25), 5-8 cm low-normal. Class B
//     (ACOG thresholds revisable -> docs/citation-staleness.md row).
//   - barnhartHcg (Barnhart 2004, Obstet Gynecol): the minimal expected serial-hCG
//     rise for a potentially viable intrauterine pregnancy is 53% over 48 h (the
//     2004 99% lower bound). Observed rise = (repeat - initial)/initial * 100;
//     the expected minimum is scaled log-linearly from the 48-h anchor as
//     1.53^(hours/48). A more conservative 35% over 48 h (Morse 2012, 99.9% bound)
//     is noted but the tile flags against the 53% original. Initial value guarded > 0.
//   - iomGwg (IOM 2009 / ACOG Committee Opinion 548): total weight-gain ranges and
//     2nd/3rd-trimester weekly rates by pre-pregnancy BMI category, singleton and
//     twin. Class B (IOM/ACOG ranges revisable -> docs/citation-staleness.md row).

import { r1 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const nonNeg = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampExp = (x) => (x > 40 ? 40 : x < -40 ? -40 : x);
// Overflow-safe logistic: never returns Infinity for extreme inputs.
const sigmoid = (x) => {
  const z = clampExp(x);
  if (z >= 0) { const e = Math.exp(-z); return 1 / (1 + e); }
  const e = Math.exp(z); return e / (1 + e);
};
const INCOMPLETE = 'Enter all required positive values.';

// --- 2.1 hadlock-efw ----------------------------------------------------------
const HADLOCK_NOTE = 'Hadlock estimated fetal weight, four-parameter model (Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK, Am J Obstet Gynecol 1985): log10(EFW in grams) = 1.3596 - 0.00386 x AC x FL + 0.0064 x HC + 0.00061 x BPD x AC + 0.0424 x AC + 0.174 x FL, with the four sonographic biometry measurements (biparietal diameter, head circumference, abdominal circumference, femur length) entered in centimeters. It returns a point estimate of weight; the growth-percentile interpretation and the growth-restriction or macrosomia decision stay with the clinician.';

export function hadlockEfw(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bpd = pos(o.bpd);
  const hc = pos(o.hc);
  const ac = pos(o.ac);
  const fl = pos(o.fl);
  if (bpd === null || hc === null || ac === null || fl === null) return { valid: false, message: INCOMPLETE };
  const log10 = 1.3596 - 0.00386 * ac * fl + 0.0064 * hc + 0.00061 * bpd * ac + 0.0424 * ac + 0.174 * fl;
  if (!Number.isFinite(log10) || log10 > 12 || log10 < 0) return { valid: false, message: 'Biometry out of plausible range.' };
  const efw = Math.pow(10, log10);
  if (!Number.isFinite(efw)) return { valid: false, message: 'Biometry out of plausible range.' };
  const grams = Math.round(efw);
  return {
    valid: true, efw: grams, log10: r1(log10 * 10000) / 10000,
    abnormal: false,
    band: `Estimated fetal weight ${grams} g (Hadlock four-parameter model).`,
    note: HADLOCK_NOTE,
  };
}

// --- 2.2 fullpiers ------------------------------------------------------------
const FULLPIERS_NOTE = 'fullPIERS -- Pre-eclampsia Integrated Estimate of RiSk (von Dadelszen P, Payne B, Li J, et al, Lancet 2011): a logistic model predicting an adverse maternal outcome within 48 hours from gestational age, chest pain or dyspnea, oxygen saturation, platelet count, creatinine, and AST. It is a rule-in tool: a predicted probability of 30% or more is the high-risk cut-point (positive likelihood ratio about 17.5), 10 to 30% intermediate, under 10% low. It frames a probability, not a delivery order; the management decision stays with the clinician and local protocol.';

export function fullPiers(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ga = pos(o.ga);            // weeks
  const spo2 = pos(o.spo2);        // %
  const plt = pos(o.platelets);    // x10^9/L
  const creat = pos(o.creatinine); // umol/L
  const ast = pos(o.ast);          // U/L
  if (ga === null || spo2 === null || plt === null || creat === null || ast === null) return { valid: false, message: INCOMPLETE };
  const chest = onFlag(o.chestPainDyspnea) ? 1 : 0;
  const logit = 2.68
    + (-0.0541) * ga
    + 1.23 * chest
    + (-0.0271) * creat
    + 0.207 * plt
    + 4.0e-5 * plt * plt
    + 0.0101 * ast
    + (-3.05e-6) * ast * ast
    + 2.5e-4 * (creat * plt)
    + (-6.99e-5) * (plt * ast)
    + (-2.56e-3) * (plt * spo2);
  const p = sigmoid(logit);
  const pct = r1(p * 100);
  let band; let high;
  if (p >= 0.30) { band = '30% or more -- high risk (rule-in)'; high = true; }
  else if (p >= 0.10) { band = '10 to 30% -- intermediate risk'; high = false; }
  else { band = 'under 10% -- low risk'; high = false; }
  return {
    valid: true, probability: pct,
    abnormal: high,
    band: `fullPIERS ${pct}% probability of adverse maternal outcome within 48 h: ${band}.`,
    note: FULLPIERS_NOTE,
  };
}

// --- 2.3 minipiers ------------------------------------------------------------
const MINIPIERS_NOTE = 'miniPIERS -- the bedside-only Pre-eclampsia Integrated Estimate of RiSk (Payne BA, Hutcheon JA, Ansermino JM, et al, PLoS Med 2014): a logistic model using only parity, gestational age, headache or visual changes, chest pain or dyspnea, vaginal bleeding with abdominal pain, systolic blood pressure, and dipstick proteinuria -- no laboratory tests. It is a rule-in tool for low-resource triage: a predicted probability of 25% or more is the high-risk cut-point (positive likelihood ratio about 5), and over 15% prompts increased surveillance. It frames a probability, not a transfer order; the decision stays with the clinician.';

const DIP_BETA = { '2+': -0.218, '3+': 0.424, '4+': 0.512 };

export function miniPiers(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ga = pos(o.ga);     // weeks
  const sbp = pos(o.sbp);   // mmHg
  if (ga === null || sbp === null) return { valid: false, message: INCOMPLETE };
  const multip = onFlag(o.multiparous) ? 1 : 0;
  const vbap = onFlag(o.vaginalBleedingAbdPain) ? 1 : 0;
  const hv = onFlag(o.headacheVisual) ? 1 : 0;
  const cpd = onFlag(o.chestPainDyspnea) ? 1 : 0;
  const dip = DIP_BETA[o.proteinuria] || 0;
  const logit = -5.77
    + (-0.298) * multip
    + (-1.07) * Math.log(ga)
    + 1.34 * Math.log(sbp)
    + dip
    + 1.18 * vbap
    + 0.422 * hv
    + 0.847 * cpd;
  const p = sigmoid(logit);
  const pct = r1(p * 100);
  let band; let high;
  if (p >= 0.25) { band = '25% or more -- high risk (rule-in)'; high = true; }
  else if (p > 0.15) { band = 'over 15% -- increased surveillance'; high = false; }
  else { band = 'at or below 15% -- lower risk'; high = false; }
  return {
    valid: true, probability: pct,
    abnormal: high,
    band: `miniPIERS ${pct}% probability of adverse maternal outcome within 48 h: ${band}.`,
    note: MINIPIERS_NOTE,
  };
}

// --- 2.4 afi ------------------------------------------------------------------
const AFI_NOTE = 'Amniotic Fluid Index (Moore TR, Cayle JE, Am J Obstet Gynecol 1990): the sum of the deepest vertical pocket of clear fluid, in centimeters, measured in each of the four uterine quadrants. Against the ACOG thresholds, an AFI under 5 cm is oligohydramnios and over 24 cm is polyhydramnios (some references use over 25); 5 to 8 cm is often labeled low-normal. It quantifies fluid volume; the surveillance and delivery decision stay with the clinician.';

export function afi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const q1 = nonNeg(o.q1);
  const q2 = nonNeg(o.q2);
  const q3 = nonNeg(o.q3);
  const q4 = nonNeg(o.q4);
  if (q1 === null || q2 === null || q3 === null || q4 === null) return { valid: false, message: 'Enter all four quadrant pocket depths (cm).' };
  const total = r1(q1 + q2 + q3 + q4);
  let band; let abnormal;
  if (total < 5) { band = 'oligohydramnios (below 5 cm)'; abnormal = true; }
  else if (total > 24) { band = 'polyhydramnios (above 24 cm)'; abnormal = true; }
  else if (total <= 8) { band = 'low-normal'; abnormal = false; }
  else { band = 'normal'; abnormal = false; }
  return {
    valid: true, afi: total,
    abnormal,
    band: `AFI ${total.toFixed(1)} cm: ${band}.`,
    note: AFI_NOTE,
  };
}

// --- 2.5 barnhart-hcg ---------------------------------------------------------
const BARNHART_NOTE = 'Minimal serial-hCG rise (Barnhart KT, Sammel MD, Rinaudo PF, et al, Obstet Gynecol 2004): for a symptomatic patient with a potentially viable intrauterine pregnancy, the slowest normal rise is 53% over 48 hours (the 99% lower bound; a more conservative 35% from the 2012 re-analysis is sometimes used). The observed rise is (repeat - initial) / initial; the expected minimum is scaled log-linearly from the 48-hour anchor. A sub-minimal rise is abnormal but is not by itself diagnostic of ectopic or non-viable pregnancy; the clinician integrates ultrasound and the clinical picture.';

export function barnhartHcg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const initial = pos(o.initial);
  const repeat = pos(o.repeat);
  const hours = pos(o.hours);
  if (initial === null || repeat === null || hours === null) return { valid: false, message: 'Enter the initial hCG, repeat hCG, and interval in hours.' };
  const observedPct = r1((repeat - initial) / initial * 100);
  const expectedPct = r1((Math.pow(1.53, hours / 48) - 1) * 100);
  const subMinimal = observedPct < expectedPct;
  return {
    valid: true, observed: observedPct, expectedMin: expectedPct,
    abnormal: subMinimal,
    band: `Observed hCG rise ${observedPct.toFixed(1)}% over ${r1(hours)} h vs a minimal expected ${expectedPct.toFixed(1)}% for a viable IUP: ${subMinimal ? 'sub-minimal (abnormal)' : 'at or above the minimal rise'}.`,
    note: BARNHART_NOTE,
  };
}

// --- 2.6 iom-gwg --------------------------------------------------------------
const IOMGWG_NOTE = 'IOM gestational weight gain (Institute of Medicine and National Research Council, Weight Gain During Pregnancy: Reexamining the Guidelines, 2009; carried in ACOG Committee Opinion 548): the recommended total gain and second/third-trimester weekly rate by pre-pregnancy BMI category -- underweight 28 to 40 lb, normal weight 25 to 35 lb, overweight 15 to 25 lb, obese 11 to 20 lb for a singleton, with provisional twin ranges. It is a target range; the individualized counselling and the response to under- or over-gain stay with the clinician.';

const GWG = {
  underweight: { label: 'underweight', single: '28-40 lb', singleKg: '12.5-18 kg', rate: '1.0 lb/wk', twin: null },
  normal:      { label: 'normal weight', single: '25-35 lb', singleKg: '11.5-16 kg', rate: '1.0 lb/wk', twin: '37-54 lb' },
  overweight:  { label: 'overweight', single: '15-25 lb', singleKg: '7-11.5 kg', rate: '0.6 lb/wk', twin: '31-50 lb' },
  obese:       { label: 'obese', single: '11-20 lb', singleKg: '5-9 kg', rate: '0.5 lb/wk', twin: '25-42 lb' },
};

export function iomGwg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const weightLb = pos(o.weight);  // pre-pregnancy weight, lb
  const heightIn = pos(o.height);  // height, inches
  if (weightLb === null || heightIn === null) return { valid: false, message: 'Enter pre-pregnancy weight (lb) and height (in).' };
  const bmi = r1(703 * weightLb / (heightIn * heightIn));
  let key;
  if (bmi < 18.5) key = 'underweight';
  else if (bmi < 25) key = 'normal';
  else if (bmi < 30) key = 'overweight';
  else key = 'obese';
  const row = GWG[key];
  const twin = onFlag(o.twin);
  let range; let detail;
  if (twin) {
    if (row.twin === null) {
      range = 'no IOM recommendation';
      detail = `Pre-pregnancy BMI ${bmi.toFixed(1)} (${row.label}): the IOM gives no twin recommendation for the underweight category.`;
    } else {
      range = `${row.twin} (twin)`;
      detail = `Pre-pregnancy BMI ${bmi.toFixed(1)} (${row.label}): recommended total gain ${row.twin} for a twin pregnancy.`;
    }
  } else {
    range = `${row.single} (singleton)`;
    detail = `Pre-pregnancy BMI ${bmi.toFixed(1)} (${row.label}): recommended total gain ${row.single}, ${row.rate} in the 2nd-3rd trimester (singleton).`;
  }
  return {
    valid: true, bmi, category: row.label, range,
    abnormal: false,
    band: detail,
    note: IOMGWG_NOTE,
  };
}
