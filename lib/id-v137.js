// spec-v137 (Wave 6 of the spec-v100 MDCalc Parity Completion program, CLOSING
// spec): the infectious-disease risk-score cluster that sits beside the existing
// community-acquired-pneumonia tools (curb-65, psi, smart-cop). Five
// deterministic instruments; none duplicates a live tile. Each consumes
// clinician-entered values/findings and returns a score or probability plus the
// source's framing -- not a browsable reference table (spec-v100 §2).
//
//   isaric4cMortality - ISARIC 4C Mortality Score (COVID-19 inpatient, 0-21)
//   covidGram         - COVID-GRAM critical-illness logistic probability
//   candidaScore      - Candida score (Leon, non-neutropenic ICU, 0-5)
//   vacsIndex         - VACS Index 1.0 (HIV all-cause mortality, 0-164)
//   regiscarDress     - RegiSCAR DRESS diagnostic-certainty score (-4 to +9)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v137.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score/probability and the source's stated
// interpretation; the management decision (admit, start antifungal/antiviral,
// treat) stays with the clinician and local protocol (spec-v11 §5.3).
//
// FORMULAS / POINT TABLES / COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97
// lesson), each cross-verified across >= 2 independent sources. NO-FABRICATION /
// SOURCE-GOVERNANCE:
//   - isaric4cMortality (Knight SR, et al, BMJ 2020;370:m3339; with the published
//     Table-2 correction <7 / CRP mg/L): additive 0-21 across age, sex, comorbid
//     count, respiratory rate, SpO2, GCS, urea, CRP. Urea cut-points are 7 and 14
//     mmol/L; the US BUN-in-mg/dL equivalents are 19.6 / 39.2 (BUN mg/dL = urea
//     mmol/L x 2.8), exposed via a unit selector. Strata: low 0-3 (1.2%),
//     intermediate 4-8 (9.9%), high 9-14 (31.4%), very high >=15 (61.5%) -- the
//     Knight derivation-cohort in-hospital mortality figures (NOT the validation-
//     cohort 0/8.0/27.2/54.2% set; the two must not be conflated).
//   - covidGram (Liang W, et al, JAMA Intern Med 2020;180:1081): a logistic model
//     p = 1/(1+e^-x). The paper publishes ODDS RATIOS (Table 3), not betas, so the
//     betas here are derived as ln(OR) -- a deterministic transform, transparently
//     labelled, NOT a recalled coefficient. The intercept is ln of the paper's
//     constant OR 0.001 (= -6.9078); that constant is reported to one significant
//     figure, so the ABSOLUTE probability carries calibration uncertainty -- the
//     tile says so. The authors DELIBERATELY defined no low/medium/high cut-points
//     (verbatim), so NONE is invented here (source over the spec-v137 §2.2 draft).
//   - candidaScore (Leon C, et al, Crit Care Med 2006;34:730): integer items TPN
//     (1), surgery on ICU admission (1), multifocal Candida colonization (1),
//     severe sepsis (2); total 0-5. Cut-off >2.5 (i.e. a score >= 3) identifies
//     likely invasive candidiasis (2009 validation: score < 3 -> ~2.3% probability
//     of proven IC; >= 3 -> consider empiric antifungal). The weighted-coefficient
//     form (0.908/0.997/1.112/2.038) is the derivation model; the integer score is
//     the clinical instrument and what is implemented.
//   - vacsIndex (Tate JP, Justice AC, et al, AIDS 2013;27:563; VACS Index 1.0):
//     additive component points across age, CD4, HIV-1 RNA, hemoglobin, FIB-4,
//     eGFR, and hepatitis-C co-infection; total 0-164. FIB-4 = (age x AST) /
//     (platelets[10^9/L] x sqrt(ALT)). Only two mortality anchors are published
//     (score 0 ~1.8%, score 164 ~>85.8% 5-year all-cause mortality) over a
//     continuous curve; NO per-band lookup exists, so none is fabricated -- the
//     tile quotes the two anchors and the continuous-curve caveat.
//   - regiscarDress (Kardaun SH, et al, Br J Dermatol 2013;169:1071): weighted
//     -1/0/+1/+2 items; total -4 to +9. Eosinophilia scores the absolute-count OR
//     (when leukopenic) the percentage band -- alternatives, max +2, not additive.
//     Two items go negative: rash-suggestive (No = -1) and biopsy (No suggesting
//     other = -1). Bands: < 2 no case, 2-3 possible, 4-5 probable, > 5 (>= 6)
//     definite DRESS.

import { r1, r2 } from './num.js';

const obj = (input) => (input && typeof input === 'object' ? input : {});
const num = (v) => {
  // Number(null/'') === 0, so reject the empty cases up front: a blank required
  // field must surface a fallback, never silently score 0.
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => { const n = num(v); return n !== null && n > 0 ? n : null; };
const nonneg = (v) => { const n = num(v); return n !== null && n >= 0 ? n : null; };
// a yes/no flag that must be explicitly answered: 'yes'/'no'/'1'/'0'/bool ->
// true, false, or null (blank -> surfaced fallback).
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- 2.1 isaric-4c-mortality --------------------------------------------------
const ISARIC_NOTE = 'ISARIC 4C Mortality Score (Knight SR, et al, BMJ 2020): an additive 0-21 score for adults admitted to hospital with COVID-19, summing age (< 50 = 0, 50-59 = 2, 60-69 = 4, 70-79 = 6, >= 80 = 7), male sex (1), number of comorbidities (1 = 1, >= 2 = 2), respiratory rate (20-29 = 1, >= 30 = 2), peripheral oxygen saturation on room air < 92% (2), Glasgow Coma Scale < 15 (2), urea (7-14 mmol/L = 1, > 14 = 3; equivalently BUN 19.6-39.2 / > 39.2 mg/dL), and C-reactive protein (50-99 mg/L = 1, >= 100 = 2). The derivation-cohort in-hospital mortality runs low 0-3 (1.2%), intermediate 4-8 (9.9%), high 9-14 (31.4%), very high >= 15 (61.5%). It reports the risk group; the admission and escalation decision stays with the clinician.';

function isaricStratum(total) {
  if (total <= 3) return { group: 'Low', mortality: '1.2%' };
  if (total <= 8) return { group: 'Intermediate', mortality: '9.9%' };
  if (total <= 14) return { group: 'High', mortality: '31.4%' };
  return { group: 'Very high', mortality: '61.5%' };
}

export function isaric4cMortality(input = {}) {
  const o = obj(input);
  const age = nonneg(o.age);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  const comorbidities = nonneg(o.comorbidities);
  const rr = nonneg(o.rr);
  const spo2 = pos(o.spo2);
  const gcs = num(o.gcs);
  const urea = nonneg(o.urea);
  const ureaUnit = o.ureaUnit === 'bun-mgdl' ? 'bun-mgdl' : (o.ureaUnit === 'mmol' ? 'mmol' : null);
  const crp = nonneg(o.crp);
  if (age === null || age > 130 || sex === null || comorbidities === null
    || rr === null || spo2 === null || gcs === null || gcs < 3 || gcs > 15
    || urea === null || ureaUnit === null || crp === null) {
    return { valid: false, message: 'Enter age, sex, number of comorbidities, respiratory rate, SpO2 (room air), GCS (3-15), urea (with its unit), and CRP (mg/L).' };
  }
  // Convert BUN mg/dL to urea mmol/L when needed (BUN mg/dL = urea mmol/L x 2.8).
  const ureaMmol = ureaUnit === 'bun-mgdl' ? urea / 2.8 : urea;

  let total = 0;
  const parts = [];
  // Age.
  let agePts = 0;
  if (age >= 80) agePts = 7; else if (age >= 70) agePts = 6; else if (age >= 60) agePts = 4; else if (age >= 50) agePts = 2;
  total += agePts; parts.push(`age ${age}y +${agePts}`);
  // Sex.
  const sexPts = sex === 'male' ? 1 : 0;
  total += sexPts; if (sexPts) parts.push('male +1');
  // Comorbidities.
  const comPts = comorbidities >= 2 ? 2 : (comorbidities >= 1 ? 1 : 0);
  total += comPts; if (comPts) parts.push(`${comorbidities >= 2 ? '>=2' : '1'} comorbidities +${comPts}`);
  // Respiratory rate.
  const rrPts = rr >= 30 ? 2 : (rr >= 20 ? 1 : 0);
  total += rrPts; if (rrPts) parts.push(`RR ${rr} +${rrPts}`);
  // SpO2.
  const spo2Pts = spo2 < 92 ? 2 : 0;
  total += spo2Pts; if (spo2Pts) parts.push(`SpO2 ${spo2}% +2`);
  // GCS.
  const gcsPts = gcs < 15 ? 2 : 0;
  total += gcsPts; if (gcsPts) parts.push(`GCS ${gcs} +2`);
  // Urea (banded on mmol/L).
  let ureaPts = 0;
  if (ureaMmol > 14) ureaPts = 3; else if (ureaMmol >= 7) ureaPts = 1;
  total += ureaPts; if (ureaPts) parts.push(`urea +${ureaPts}`);
  // CRP.
  let crpPts = 0;
  if (crp >= 100) crpPts = 2; else if (crp >= 50) crpPts = 1;
  total += crpPts; if (crpPts) parts.push(`CRP ${crp} +${crpPts}`);

  const s = isaricStratum(total);
  const metStr = parts.length ? ` Contributions: ${parts.join(', ')}.` : ' No points scored.';
  return {
    valid: true,
    total,
    group: s.group,
    abnormal: total >= 9,
    band: `ISARIC 4C ${total} of 21 -- ${s.group} risk group (in-hospital mortality ~${s.mortality}).${metStr}`,
    note: ISARIC_NOTE,
  };
}

// --- 2.2 covid-gram -----------------------------------------------------------
const COVIDGRAM_NOTE = 'COVID-GRAM Critical Illness Risk Score (Liang W, et al, JAMA Intern Med 2020): a logistic model estimating the probability of critical illness (ICU admission, invasive ventilation, or death) in hospitalized COVID-19 patients from chest-imaging abnormality, age, hemoptysis, dyspnea, unconsciousness, number of comorbidities, cancer history, neutrophil-to-lymphocyte ratio, lactate dehydrogenase, and direct bilirubin. The paper publishes odds ratios, not regression coefficients, so the betas used here are the natural log of those published odds ratios and the intercept is the log of the paper\'s constant (odds ratio 0.001, reported to one significant figure) -- the relative risk ordering is faithful but the absolute probability is approximate. The authors deliberately did not define low/medium/high cut-points, so the probability is reported on its own. It frames risk; the management decision stays with the clinician.';

// COVID-GRAM logistic coefficients. beta = ln(published OR) from Liang 2020
// Table 3; intercept = ln(constant OR 0.001). Continuous predictors are
// per-unit (age per year, NLR per unit, LDH per U/L, DB per umol/L); binary
// predictors and the comorbidity count enter as 0/1/n.
const COVIDGRAM = {
  intercept: -6.9078,        // ln(0.001)
  xray: 1.2208,              // ln(3.39)
  age: 0.02956,              // ln(1.03) per year
  hemoptysis: 1.5107,        // ln(4.53)
  dyspnea: 0.6313,           // ln(1.88)
  unconscious: 1.5497,       // ln(4.71)
  comorbidities: 0.4700,     // ln(1.60) per comorbidity
  cancer: 1.4036,            // ln(4.07)
  nlr: 0.05827,              // ln(1.06) per unit
  ldh: 0.0019980,            // ln(1.002) per U/L
  db: 0.13976,               // ln(1.15) per umol/L
};

export function covidGram(input = {}) {
  const o = obj(input);
  const xray = flag(o.xray);
  const age = nonneg(o.age);
  const hemoptysis = flag(o.hemoptysis);
  const dyspnea = flag(o.dyspnea);
  const unconscious = flag(o.unconscious);
  const comorbidities = nonneg(o.comorbidities);
  const cancer = flag(o.cancer);
  const nlr = pos(o.nlr);
  const ldh = pos(o.ldh);
  const db = nonneg(o.db);
  if (xray === null || age === null || age > 130 || hemoptysis === null || dyspnea === null
    || unconscious === null || comorbidities === null || cancer === null
    || nlr === null || ldh === null || db === null) {
    return { valid: false, message: 'Answer the five clinical findings (chest-imaging abnormality, hemoptysis, dyspnea, unconsciousness, cancer history) and enter age, number of comorbidities, neutrophil-to-lymphocyte ratio, LDH (U/L), and direct bilirubin (umol/L).' };
  }
  const C = COVIDGRAM;
  let x = C.intercept;
  x += C.xray * (xray ? 1 : 0);
  x += C.age * age;
  x += C.hemoptysis * (hemoptysis ? 1 : 0);
  x += C.dyspnea * (dyspnea ? 1 : 0);
  x += C.unconscious * (unconscious ? 1 : 0);
  x += C.comorbidities * comorbidities;
  x += C.cancer * (cancer ? 1 : 0);
  x += C.nlr * nlr;
  x += C.ldh * ldh;
  x += C.db * db;
  // Clamp the exponent so an extreme fuzzed predictor returns a probability in
  // [0, 1] rather than Infinity.
  const p = 1 / (1 + Math.exp(-clamp(x, -40, 40)));
  if (!Number.isFinite(p)) {
    return { valid: false, message: 'Enter the predictors as finite numbers.' };
  }
  const pct = r1(clamp(p, 0, 1) * 100);
  return {
    valid: true,
    probability: pct,
    abnormal: false,
    band: `COVID-GRAM estimated probability of critical illness ~${pct}% (published logistic model; betas derived as ln of the reported odds ratios, intercept from the paper's rounded constant -- treat the absolute value as approximate). The authors define no low/medium/high cut-points.`,
    note: COVIDGRAM_NOTE,
  };
}

// --- 2.3 candida-score --------------------------------------------------------
const CANDIDA_NOTE = 'Candida score (Leon C, et al, Crit Care Med 2006): a bedside score for non-neutropenic critically ill patients with Candida colonization -- total parenteral nutrition (1), surgery on ICU admission (1), multifocal Candida colonization (1), and severe sepsis (2), total 0-5. A score >= 3 (the original > 2.5 cut-off) identifies patients in whom invasive candidiasis is likely and empiric antifungal therapy should be considered; in the 2009 multicenter validation a score < 3 carried only a ~2.3% probability of proven invasive candidiasis. It reports the threshold verdict; the decision to start antifungal therapy stays with the clinician and local protocol.';

export function candidaScore(input = {}) {
  const o = obj(input);
  const tpn = flag(o.tpn);
  const surgery = flag(o.surgery);
  const colonization = flag(o.colonization);
  const sepsis = flag(o.sepsis);
  if (tpn === null || surgery === null || colonization === null || sepsis === null) {
    return { valid: false, message: 'Answer all four items: total parenteral nutrition, surgery on ICU admission, multifocal Candida colonization, and severe sepsis.' };
  }
  const items = [];
  let total = 0;
  if (tpn) { total += 1; items.push('TPN +1'); }
  if (surgery) { total += 1; items.push('surgery +1'); }
  if (colonization) { total += 1; items.push('multifocal colonization +1'); }
  if (sepsis) { total += 2; items.push('severe sepsis +2'); }
  const likely = total >= 3;
  const metStr = items.length ? ` Counted: ${items.join(', ')}.` : ' No items present.';
  return {
    valid: true,
    total,
    likely,
    abnormal: likely,
    band: likely
      ? `Candida score ${total} of 5 -- at or above the threshold (>= 3): invasive candidiasis likely, consider empiric antifungal therapy.${metStr}`
      : `Candida score ${total} of 5 -- below the threshold (< 3): invasive candidiasis improbable (~2.3% in validation).${metStr}`,
    note: CANDIDA_NOTE,
  };
}

// --- 2.4 vacs-index -----------------------------------------------------------
const VACS_NOTE = 'VACS Index 1.0 (Tate JP, Justice AC, et al, AIDS 2013): an additive 0-164 mortality index for people with HIV on antiretroviral therapy, summing component points for age, CD4 count, HIV-1 RNA, hemoglobin, FIB-4 (computed from age, AST, ALT, and platelets), eGFR, and hepatitis-C co-infection. Higher scores indicate greater 5-year all-cause mortality risk along a continuous calibration curve; the published anchors are a score of 0 (~1.8%) and a score of 164 (~> 85.8%), with no per-band lookup table, so intermediate totals are reported as the index value with this framing. It frames mortality risk; it does not stage HIV or select a regimen.';

function vacsAgePts(age) { if (age >= 65) return 27; if (age >= 50) return 12; return 0; }
function vacsCd4Pts(cd4) {
  if (cd4 < 50) return 29;
  if (cd4 < 100) return 28;
  if (cd4 < 200) return 10;
  if (cd4 < 350) return 6;
  if (cd4 < 500) return 6;
  return 0;
}
function vacsRnaPts(rna) { if (rna >= 100000) return 14; if (rna >= 500) return 7; return 0; }
function vacsHgbPts(hgb) { if (hgb < 10) return 38; if (hgb < 12) return 22; if (hgb < 14) return 10; return 0; }
function vacsFib4Pts(fib4) { if (fib4 > 3.25) return 25; if (fib4 >= 1.45) return 6; return 0; }
function vacsEgfrPts(egfr) { if (egfr < 30) return 26; if (egfr < 45) return 8; if (egfr < 60) return 6; return 0; }

export function vacsIndex(input = {}) {
  const o = obj(input);
  const age = pos(o.age);
  const cd4 = nonneg(o.cd4);
  const rna = nonneg(o.rna);
  const hgb = pos(o.hgb);
  const ast = pos(o.ast);
  const alt = pos(o.alt);
  const platelets = pos(o.platelets);
  const egfr = nonneg(o.egfr);
  const hepC = flag(o.hepC);
  if (age === null || age > 130 || cd4 === null || rna === null || hgb === null
    || ast === null || alt === null || platelets === null || egfr === null || hepC === null) {
    return { valid: false, message: 'Enter age, CD4 count, HIV-1 RNA, hemoglobin, AST, ALT, platelets (for FIB-4), and eGFR, and answer hepatitis-C co-infection.' };
  }
  // FIB-4 = (age x AST) / (platelets[10^9/L] x sqrt(ALT)); platelet denominator
  // guarded > 0 by pos(); sqrt(ALT) guarded > 0 by pos().
  const fib4 = (age * ast) / (platelets * Math.sqrt(alt));
  if (!Number.isFinite(fib4)) {
    return { valid: false, message: 'Enter AST, ALT, and platelets as positive numbers so FIB-4 can be computed.' };
  }
  const comps = [];
  let total = 0;
  const addp = (label, pts) => { total += pts; if (pts) comps.push(`${label} +${pts}`); };
  addp(`age ${age}y`, vacsAgePts(age));
  addp(`CD4 ${cd4}`, vacsCd4Pts(cd4));
  addp('HIV-1 RNA', vacsRnaPts(rna));
  addp(`Hb ${hgb}`, vacsHgbPts(hgb));
  addp(`FIB-4 ${r2(fib4)}`, vacsFib4Pts(fib4));
  addp('eGFR', vacsEgfrPts(egfr));
  addp('HCV', hepC ? 5 : 0);
  const metStr = comps.length ? ` Contributions: ${comps.join(', ')}.` : ' No points scored.';
  return {
    valid: true,
    total,
    fib4: r2(fib4),
    abnormal: total >= 50,
    band: `VACS Index ${total} of 164 (FIB-4 ${r2(fib4)}). Higher values indicate greater 5-year all-cause mortality risk along a continuous curve (published anchors: score 0 ~1.8%, score 164 ~> 85.8%); there is no per-band mortality lookup.${metStr}`,
    note: VACS_NOTE,
  };
}

// --- 2.5 regiscar-dress -------------------------------------------------------
const REGISCAR_NOTE = 'RegiSCAR Score for DRESS (Kardaun SH, et al, Br J Dermatol 2013): a weighted -4 to +9 score grading the diagnostic certainty of drug reaction with eosinophilia and systemic symptoms. Items: fever >= 38.5 C (1), enlarged lymph nodes >= 2 sites (1), eosinophilia (700-1499/uL or 10-19.9% = 1; >= 1500/uL or >= 20% = 2; the count and percentage paths are alternatives, maximum +2), atypical lymphocytes (1), skin rash > 50% body surface area (1), rash suggestive of DRESS (yes +1, unknown 0, no -1), skin biopsy suggesting DRESS (yes/unknown 0, no -1), internal-organ involvement (1 organ +1, >= 2 organs +2), resolution > 15 days (1), and evaluation of other causes (>= 3 investigations done and all negative +1). The total maps to < 2 = no case, 2-3 = possible, 4-5 = probable, > 5 = definite DRESS. It reports the certainty band; the diagnosis stays with the clinician.';

// Items whose only states are present (+1) or absent/unknown (0).
const REG_BINARY = ['fever', 'nodes', 'atypical', 'skinExtent', 'resolution', 'otherCauses'];
const REG_LABEL = {
  fever: 'fever >= 38.5C', nodes: 'lymph nodes', atypical: 'atypical lymphocytes',
  skinExtent: 'rash > 50% BSA', resolution: 'resolution > 15d', otherCauses: 'other causes excluded',
};

export function regiscarDress(input = {}) {
  const o = obj(input);
  // Eosinophilia tier select: '0' | '1' | '2' (alternatives, max +2).
  const eos = o.eos === '0' || o.eos === '1' || o.eos === '2' ? Number(o.eos) : null;
  // Rash-suggestive tri-state: 'yes' (+1) | 'unknown' (0) | 'no' (-1).
  const rashSuggestive = ['yes', 'unknown', 'no'].includes(o.rashSuggestive) ? o.rashSuggestive : null;
  // Biopsy: 'compatible' (yes/unknown -> 0) | 'against' (no, suggests other -> -1).
  const biopsy = o.biopsy === 'compatible' || o.biopsy === 'against' ? o.biopsy : null;
  // Organ involvement: '0' | '1' | '2plus'.
  const organ = ['0', '1', '2plus'].includes(o.organ) ? o.organ : null;
  const binaries = {};
  for (const k of REG_BINARY) binaries[k] = flag(o[k]);

  const missing = eos === null || rashSuggestive === null || biopsy === null || organ === null
    || REG_BINARY.some((k) => binaries[k] === null);
  if (missing) {
    return { valid: false, message: 'Answer every RegiSCAR item: fever, lymph nodes, eosinophilia tier, atypical lymphocytes, rash extent, rash suggestive of DRESS, skin biopsy, organ involvement, resolution > 15 days, and evaluation of other causes.' };
  }

  let total = 0;
  const parts = [];
  for (const k of REG_BINARY) {
    if (binaries[k]) { total += 1; parts.push(`${REG_LABEL[k]} +1`); }
  }
  if (eos > 0) { total += eos; parts.push(`eosinophilia +${eos}`); }
  if (rashSuggestive === 'yes') { total += 1; parts.push('rash suggestive +1'); }
  else if (rashSuggestive === 'no') { total -= 1; parts.push('rash not suggestive -1'); }
  if (biopsy === 'against') { total -= 1; parts.push('biopsy against -1'); }
  let organPts = 0;
  if (organ === '2plus') organPts = 2; else if (organ === '1') organPts = 1;
  if (organPts) { total += organPts; parts.push(`organ involvement +${organPts}`); }

  let cls;
  if (total < 2) cls = 'No case (DRESS excluded)';
  else if (total <= 3) cls = 'Possible DRESS';
  else if (total <= 5) cls = 'Probable DRESS';
  else cls = 'Definite DRESS';
  const metStr = parts.length ? ` Contributions: ${parts.join(', ')}.` : ' No items scored.';
  return {
    valid: true,
    total,
    classification: cls,
    abnormal: total >= 4,
    band: `RegiSCAR ${total} -- ${cls} (< 2 no case, 2-3 possible, 4-5 probable, > 5 definite).${metStr}`,
    note: REGISCAR_NOTE,
  };
}
