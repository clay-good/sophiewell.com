// spec-v249: renal & respiratory bedside formulas — the renal failure index (RFI),
// the fractional excretion of uric acid (FEUA), the bronchodilator responsiveness,
// and the integrative weaning index (IWI). Each id was verified absent by a fixed-
// string scan of the extracted app.js id/name lists AND the MCP adapter set first
// (spec-v85 §6.2). v249 runs no AI and makes no runtime network call.
//
// These compute a value — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   renal-failure-index       - renal failure index (UNa x PCr / UCr)
//   feua                      - fractional excretion of uric acid
//   bronchodilator-response   - bronchodilator responsiveness (% predicted)
//   integrative-weaning-index - IWI (Cstat x SaO2 / RSBI)
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

// --- Renal failure index (RFI) -----------------------------------------------
// RFI = urine sodium x plasma creatinine / urine creatinine. < 1 favors prerenal
// azotemia; > 1 favors acute tubular necrosis. Distinct from FeNa (no plasma
// sodium term). Cross-verified: GlobalRPh; MDApp.
const RFI_NOTE = 'Renal failure index = urine sodium (mEq/L) x plasma creatinine (mg/dL) / urine creatinine (mg/dL). < 1 favors prerenal azotemia; > 1 favors acute tubular necrosis. A renal index, not a diagnosis or treatment order (unreliable with diuretics or CKD).';
export function renalFailureIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const una = fin(o.urineNa, 1, 300);
  const pcr = fin(o.plasmaCr, 0.1, 30);
  const ucr = fin(o.urineCr, 1, 500);
  if (una === null || pcr === null || ucr === null) {
    return { valid: false, message: 'Enter urine sodium (mEq/L), plasma creatinine (mg/dL), and urine creatinine (mg/dL).' };
  }
  const score = r2(num('RFI', una * pcr / ucr, { min: 0, max: 1000 }));
  const abnormal = score > 1;
  return { valid: true, score, abnormal, bandLabel: `RFI ${score}`, band: `Renal failure index ${score} — ${abnormal ? 'favors acute tubular necrosis (> 1)' : 'favors prerenal azotemia (< 1)'}.`, detail: `UNa ${una} x PCr ${pcr} / UCr ${ucr}.`, note: RFI_NOTE };
}

// --- Fractional excretion of uric acid (FEUA) --------------------------------
// FEUA = 100 x (urine uric acid x serum creatinine) / (serum uric acid x urine
// creatinine). Normal 4-11%; < 4% underexcretion, > 11% overexcretion (aids the
// hyponatremia / SIADH / cerebral-salt-wasting workup). Cross-verified: wikidoc;
// medicalalgorithms.
const FEUA_NOTE = 'Fractional excretion of uric acid = 100 x (urine uric acid x serum creatinine) / (serum uric acid x urine creatinine). Normal 4-11%; < 4% underexcretion, > 11% overexcretion (helps the hyponatremia / SIADH / cerebral-salt-wasting workup). A renal index, not a diagnosis or treatment order.';
export function feua(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const uua = fin(o.urineUA, 0.1, 500);
  const scr = fin(o.serumCr, 0.1, 30);
  const sua = fin(o.serumUA, 0.1, 30);
  const ucr = fin(o.urineCr, 1, 500);
  if (uua === null || scr === null || sua === null || ucr === null) {
    return { valid: false, message: 'Enter urine uric acid, serum creatinine, serum uric acid, and urine creatinine.' };
  }
  const score = r1(num('FEUA', 100 * uua * scr / (sua * ucr), { min: 0, max: 200 }));
  const abnormal = score < 4 || score > 11;
  let tier;
  if (score < 4) tier = 'underexcretion (< 4%)';
  else if (score > 11) tier = 'overexcretion (> 11%)';
  else tier = 'within normal range (4-11%)';
  return { valid: true, score, abnormal, bandLabel: `FEUA ${score}%`, band: `Fractional excretion of uric acid ${score}% — ${tier}.`, detail: `100 x (UUA ${uua} x SCr ${scr}) / (SUA ${sua} x UCr ${ucr}).`, note: FEUA_NOTE };
}

// --- Bronchodilator responsiveness -------------------------------------------
// ATS/ERS 2022: % change = 100 x (post - pre) / predicted (for FEV1 or FVC). A
// change > 10% of predicted is a significant bronchodilator response (the 2005
// criterion was >= 12% AND >= 200 mL over baseline). Cross-verified: ERJ 2022;
// PMC10392779.
const BDR_NOTE = 'Bronchodilator responsiveness (ATS/ERS 2022): % change = 100 x (post - pre) / predicted, for FEV1 or FVC. A change > 10% of the predicted value is a significant response (the legacy 2005 criterion was >= 12% AND >= 200 mL over baseline). A spirometry index, not a diagnosis or treatment order.';
export function bronchodilatorResponse(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pre = fin(o.pre, 0.1, 10);
  const post = fin(o.post, 0.1, 10);
  const predicted = fin(o.predicted, 0.5, 10);
  if (pre === null || post === null || predicted === null) {
    return { valid: false, message: 'Enter pre- and post-bronchodilator FEV1 (or FVC) and the predicted value (L).' };
  }
  const score = r1(num('BDR', 100 * (post - pre) / predicted, { min: -100, max: 200 }));
  const abnormal = score > 10;
  return { valid: true, score, abnormal, bandLabel: `${score}%`, band: `Bronchodilator response ${score}% of predicted — ${abnormal ? 'significant (> 10%)' : 'not significant (<= 10%)'}.`, detail: `100 x (post ${post} - pre ${pre}) / predicted ${predicted}.`, note: BDR_NOTE };
}

// --- Integrative weaning index (IWI) -----------------------------------------
// Nemer SN, et al. Crit Care. 2009: IWI = static compliance (mL/cmH2O) x SaO2 (%)
// / (f/VT, the rapid shallow breathing index). An IWI >= 25 predicts weaning
// success (thresholds vary by population). Cross-verified: PMC2784374; PMC4711200.
const IWI_NOTE = 'Integrative weaning index (Nemer SN, et al. Crit Care. 2009) = static compliance (mL/cmH2O) x SaO2 (%) / (f/VT, the rapid shallow breathing index). An IWI >= 25 predicts weaning success (compliance and SaO2 favor success; a high RSBI favors failure; thresholds vary by population). A weaning predictor, not a diagnosis or treatment order.';
export function integrativeWeaningIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cstat = fin(o.compliance, 1, 200);
  const sao2 = fin(o.sao2, 50, 100);
  const rsbi = fin(o.rsbi, 1, 500);
  if (cstat === null || sao2 === null || rsbi === null) {
    return { valid: false, message: 'Enter static compliance (mL/cmH2O), SaO2 (%), and RSBI (f/VT).' };
  }
  const score = r1(num('IWI', cstat * sao2 / rsbi, { min: 0, max: 10000 }));
  const abnormal = score < 25;
  return { valid: true, score, abnormal, bandLabel: `IWI ${score}`, band: `Integrative weaning index ${score} — ${abnormal ? 'below the weaning-success threshold (< 25)' : 'favors weaning success (>= 25)'}.`, detail: `Cstat ${cstat} x SaO2 ${sao2} / RSBI ${rsbi}.`, note: IWI_NOTE };
}
