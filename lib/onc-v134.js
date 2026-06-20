// spec-v134 (Wave 6 of the spec-v100 MDCalc Parity Completion program): the
// plasma-cell and myeloid-neoplasm staging cluster that sits beside the existing
// ipss-r-mds (MDS prognosis) and flipi (lymphoma index) tiles. Six deterministic
// staging / prognosis instruments; none duplicates a live tile. Each consumes
// clinician-entered labs / cytogenetic flags and returns a stage or risk group
// plus the source's survival framing -- not a browsable reference table
// (spec-v100 §2).
//
//   myelomaIss      - International Staging System for multiple myeloma (I-III)
//   myelomaRIss     - Revised ISS (recomputes ISS internally; + LDH + iFISH)
//   myelomaR2Iss    - Second-Revision ISS additive model (0-5 -> strata I-IV)
//   mgusRisk        - Mayo MGUS progression-risk count (0-3)
//   dipssMf         - DIPSS myelofibrosis survival score (0-6)
//   dipssPlusMf     - DIPSS-Plus (carries the DIPSS group forward; 0-6)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v134.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the stage / risk group and the source's
// survival framing; the management decision (treatment line, transplant) stays
// with the clinician and local protocol (spec-v11 §5.3). Five are Class A (fixed
// derivation papers / weights, journal+author citations, no ISSUER_PATTERN trip);
// myeloma-r-iss is Class B (an IMWG working-group definition) and carries a
// docs/citation-staleness.md row.
//
// POINT TABLES / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOV:
//   - myelomaIss (Greipp 2005, J Clin Oncol 23:3412): Stage I = beta2M < 3.5 mg/L
//     AND albumin >= 3.5 g/dL; Stage III = beta2M >= 5.5 mg/L (governs over
//     albumin); Stage II = neither. Median OS 62 / 44 / 29 months (I / II / III).
//   - myelomaRIss (Palumbo 2015, J Clin Oncol 33:2863): recomputes ISS, then
//     Stage I = ISS I AND normal LDH AND no high-risk iFISH (del(17p), t(4;14),
//     t(14;16)); Stage III = ISS III AND (high LDH OR high-risk iFISH);
//     Stage II = all others. 5-yr OS ~82 / 62 / 40% (I / II / III). Class B.
//   - myelomaR2Iss (D'Agostino 2022, J Clin Oncol 40:3406; EMN/HARMONY): ADDITIVE
//     weights -- ISS II = 1.0, ISS III = 1.5; high LDH = 1.0; del(17p) = 1.0;
//     t(4;14) = 1.0; gain/amp 1q21 = 0.5. Total range 0-5 (the spec draft's
//     "0-3.0" understates the ceiling -- the IV stratum opens at 3.0 and runs to
//     the 5.0 max; corrected here). Strata: 0 = I (low); 0.5-1 = II
//     (low-intermediate); 1.5-2.5 = III (intermediate-high); 3-5 = IV (high).
//     Median OS not-reached / 109.2 / 68.5 / 37.9 months (I / II / III / IV).
//   - mgusRisk (Rajkumar 2005, Blood 106:812): 1 point each for serum M-protein
//     >= 1.5 g/dL, a non-IgG isotype (IgA or IgM), and an abnormal serum
//     free-light-chain ratio (outside 0.26-1.65). Count 0-3 -> 20-yr progression
//     risk 5 / 21 / 37 / 58%.
//   - dipssMf (Passamonti 2010, Blood 115:1703): age > 65 = 1; WBC > 25 x10^9/L
//     = 1; hemoglobin < 10 g/dL = 2 (the weighted-2 term -- the common coding
//     trap, guarded by tests); peripheral blast >= 1% = 1; constitutional
//     symptoms = 1. Total 0-6 -> low (0) / int-1 (1-2) / int-2 (3-4) / high
//     (5-6). Median OS not-reached / 14.2 / 4 / 1.5 years.
//   - dipssPlusMf (Gangat 2011, J Clin Oncol 29:392): carries the DIPSS group
//     forward (int-1 = 1, int-2 = 2, high = 3; low = 0), then adds platelet
//     < 100 x10^9/L = 1, red-cell transfusion need = 1, unfavorable karyotype
//     = 1. Total 0-6 -> low (0) / int-1 (1) / int-2 (2-3) / high (4-6). Median
//     OS 15.4 / 6.5 / 2.9 / 1.3 years.

const obj = (input) => (input && typeof input === 'object' ? input : {});
const num = (v) => {
  // Number(null) === 0 and Number('') === 0, so reject the empty cases up front:
  // a blank graded field must surface a fallback, never silently score 0.
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
};
const nonneg = (v) => {
  const n = num(v);
  return n !== null && n >= 0 ? n : null;
};
// a yes/no flag that must be explicitly answered: 'yes'/'no'/'1'/'0'/bool.
// Returns true, false, or null (blank -> surfaced fallback, never silent 0).
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};

// --- 2.1 myeloma-iss ----------------------------------------------------------
const ISS_NOTE = 'Multiple myeloma International Staging System (Greipp PR, et al, J Clin Oncol 2005): a two-variable stage from serum beta2-microglobulin and serum albumin. Stage I = beta2-microglobulin < 3.5 mg/L AND albumin >= 3.5 g/dL (median overall survival ~62 months); Stage III = beta2-microglobulin >= 5.5 mg/L, whatever the albumin (~29 months); Stage II = everything in between (~44 months). The survival figures are the 2005 derivation-cohort medians and pre-date current therapy; the stage frames prognosis, not the treatment line.';

// Recompute the ISS stage from the two raw labs. Shared by myeloma-r-iss so the
// R-ISS chain cannot desync from a separately entered stage (spec-v134 §3).
function issStageOf(b2m, albumin) {
  if (b2m >= 5.5) return 'III';
  if (b2m < 3.5 && albumin >= 3.5) return 'I';
  return 'II';
}
const ISS_MEDIAN = { I: '~62 months', II: '~44 months', III: '~29 months' };

export function myelomaIss(input = {}) {
  const o = obj(input);
  const b2m = pos(o.b2m);
  const albumin = pos(o.albumin);
  if (b2m === null || albumin === null) {
    return { valid: false, message: 'Enter serum beta2-microglobulin (mg/L) and serum albumin (g/dL).' };
  }
  const stage = issStageOf(b2m, albumin);
  const governs = stage === 'III' ? 'beta2-microglobulin >= 5.5 governs'
    : stage === 'I' ? 'beta2-microglobulin < 3.5 and albumin >= 3.5'
    : 'neither the stage-I nor the stage-III threshold met';
  return {
    valid: true, stage,
    abnormal: stage !== 'I',
    band: `Multiple myeloma ISS stage ${stage} (beta2-microglobulin ${b2m} mg/L, albumin ${albumin} g/dL; ${governs}) -- median overall survival ${ISS_MEDIAN[stage]} in the 2005 derivation cohort.`,
    note: ISS_NOTE,
  };
}

// --- 2.2 myeloma-r-iss --------------------------------------------------------
const RISS_NOTE = 'Revised International Staging System for multiple myeloma (Palumbo A, et al; International Myeloma Working Group, J Clin Oncol 2015): refines the ISS with serum LDH and high-risk iFISH cytogenetics (del(17p), t(4;14), or t(14;16)). Stage I = ISS I AND normal LDH AND no high-risk iFISH (5-year overall survival ~82%); Stage III = ISS III AND (high LDH OR high-risk iFISH) (~40%); Stage II = all others (~62%). It frames prognosis; the treatment decision stays with the clinician.';
const RISS_OS5 = { I: '~82%', II: '~62%', III: '~40%' };

export function myelomaRIss(input = {}) {
  const o = obj(input);
  const b2m = pos(o.b2m);
  const albumin = pos(o.albumin);
  const ldhHigh = flag(o.ldhHigh);
  const highRiskFish = flag(o.highRiskFish);
  if (b2m === null || albumin === null || ldhHigh === null || highRiskFish === null) {
    return { valid: false, message: 'Enter serum beta2-microglobulin (mg/L) and serum albumin (g/dL), and answer whether the LDH is above normal and whether high-risk iFISH (del(17p), t(4;14), or t(14;16)) is present.' };
  }
  const iss = issStageOf(b2m, albumin);
  let stage;
  if (iss === 'I' && !ldhHigh && !highRiskFish) stage = 'I';
  else if (iss === 'III' && (ldhHigh || highRiskFish)) stage = 'III';
  else stage = 'II';
  const driver = stage === 'I' ? 'ISS I, normal LDH, no high-risk iFISH'
    : stage === 'III' ? `ISS III with ${ldhHigh && highRiskFish ? 'high LDH and high-risk iFISH' : ldhHigh ? 'high LDH' : 'high-risk iFISH'}`
    : `ISS ${iss}${ldhHigh ? ', high LDH' : ''}${highRiskFish ? ', high-risk iFISH' : ''}`;
  return {
    valid: true, stage, iss,
    abnormal: stage !== 'I',
    band: `Revised ISS (R-ISS) stage ${stage} (${driver}) -- 5-year overall survival ${RISS_OS5[stage]} in the IMWG cohort.`,
    note: RISS_NOTE,
  };
}

// --- 2.3 myeloma-r2-iss -------------------------------------------------------
const R2ISS_NOTE = 'Second-Revision ISS for multiple myeloma (D’Agostino M, et al; European Myeloma Network within HARMONY, J Clin Oncol 2022): an ADDITIVE weighted model. ISS II = 1.0 and ISS III = 1.5; high LDH = 1.0; del(17p) = 1.0; t(4;14) = 1.0; gain/amp 1q21 = 0.5. The total runs 0-5 and maps to four strata: 0 = I (low), 0.5-1 = II (low-intermediate), 1.5-2.5 = III (intermediate-high), 3-5 = IV (high), with median overall survival not-reached / 109 / 69 / 38 months. It frames prognosis; the treatment decision stays with the clinician.';

export function myelomaR2Iss(input = {}) {
  const o = obj(input);
  const iss = o.iss; // 'I' | 'II' | 'III'
  const ldhHigh = flag(o.ldhHigh);
  const del17p = flag(o.del17p);
  const t414 = flag(o.t414);
  const gain1q = flag(o.gain1q);
  if (!['I', 'II', 'III'].includes(iss) || ldhHigh === null || del17p === null || t414 === null || gain1q === null) {
    return { valid: false, message: 'Select the ISS stage (I, II or III) and answer the high-LDH, del(17p), t(4;14) and gain/amp 1q21 questions.' };
  }
  const parts = [];
  let total = 0;
  if (iss === 'III') { total += 1.5; parts.push('ISS III (1.5)'); }
  else if (iss === 'II') { total += 1.0; parts.push('ISS II (1.0)'); }
  if (ldhHigh) { total += 1.0; parts.push('high LDH (1.0)'); }
  if (del17p) { total += 1.0; parts.push('del(17p) (1.0)'); }
  if (t414) { total += 1.0; parts.push('t(4;14) (1.0)'); }
  if (gain1q) { total += 0.5; parts.push('gain/amp 1q21 (0.5)'); }
  total = Math.round(total * 10) / 10;
  let stratum;
  let median;
  if (total === 0) { stratum = 'I (low)'; median = 'median overall survival not reached'; }
  else if (total <= 1) { stratum = 'II (low-intermediate)'; median = 'median overall survival ~109 months'; }
  else if (total <= 2.5) { stratum = 'III (intermediate-high)'; median = 'median overall survival ~69 months'; }
  else { stratum = 'IV (high)'; median = 'median overall survival ~38 months'; }
  return {
    valid: true, total, stratum,
    abnormal: total > 0,
    band: `R2-ISS additive score ${total} of 5 -- stratum ${stratum}; ${median}.${parts.length ? ' Counted: ' + parts.join(', ') + '.' : ' No risk features.'}`,
    note: R2ISS_NOTE,
  };
}

// --- 2.4 mgus-risk ------------------------------------------------------------
const MGUS_NOTE = 'Mayo MGUS risk stratification (Rajkumar SV, et al, Blood 2005): counts three risk factors in monoclonal gammopathy of undetermined significance -- a serum M-protein >= 1.5 g/dL, a non-IgG isotype (IgA or IgM), and an abnormal serum free-light-chain ratio (outside 0.26-1.65). The 0-3 count maps to a 20-year risk of progression to myeloma or a related malignancy of 5 / 21 / 37 / 58%, which drives the surveillance interval. It frames progression risk; the monitoring plan stays with the clinician.';
const MGUS_RISK20 = ['5%', '21%', '37%', '58%'];
const MGUS_TIER = ['Low', 'Low-intermediate', 'Intermediate', 'High'];

export function mgusRisk(input = {}) {
  const o = obj(input);
  const mspike = pos(o.mspike);
  const isotype = o.isotype; // 'IgG' | 'IgA' | 'IgM'
  const flcRatio = pos(o.flcRatio);
  if (mspike === null || !['IgG', 'IgA', 'IgM'].includes(isotype) || flcRatio === null) {
    return { valid: false, message: 'Enter the serum M-protein (g/dL) and the serum free-light-chain ratio, and select the isotype (IgG, IgA or IgM).' };
  }
  const scored = [];
  let count = 0;
  if (mspike >= 1.5) { count += 1; scored.push('M-protein >= 1.5 g/dL'); }
  if (isotype !== 'IgG') { count += 1; scored.push(`non-IgG isotype (${isotype})`); }
  const flcAbnormal = flcRatio < 0.26 || flcRatio > 1.65;
  if (flcAbnormal) { count += 1; scored.push('abnormal FLC ratio (outside 0.26-1.65)'); }
  return {
    valid: true, count,
    tier: MGUS_TIER[count],
    abnormal: count >= 1,
    band: `Mayo MGUS ${count} of 3 risk factors -- ${MGUS_TIER[count].toLowerCase()} risk, ~${MGUS_RISK20[count]} 20-year risk of progression.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No risk factors present.'}`,
    note: MGUS_NOTE,
  };
}

// --- 2.5 dipss-mf -------------------------------------------------------------
const DIPSS_NOTE = 'DIPSS for primary myelofibrosis (Passamonti F, et al, Blood 2010): a dynamic survival score applicable at any point in the disease course. Age > 65 = 1; WBC > 25 x10^9/L = 1; hemoglobin < 10 g/dL = 2 (the only weighted-2 term); peripheral blood blasts >= 1% = 1; constitutional symptoms = 1. The 0-6 total maps to four risk groups -- low (0), intermediate-1 (1-2), intermediate-2 (3-4), high (5-6) -- with median survival not-reached / 14.2 / 4 / 1.5 years. It frames prognosis; management stays with the clinician.';
const DIPSS_MEDIAN = ['not reached', '14.2 years', '14.2 years', '4 years', '4 years', '1.5 years', '1.5 years'];

function dipssGroupOf(total) {
  if (total === 0) return 'Low';
  if (total <= 2) return 'Intermediate-1';
  if (total <= 4) return 'Intermediate-2';
  return 'High';
}

export function dipssMf(input = {}) {
  const o = obj(input);
  const age = pos(o.age);
  const wbc = pos(o.wbc);
  const hgb = pos(o.hgb);
  const blasts = nonneg(o.blasts);
  const constitutional = flag(o.constitutional);
  if (age === null || age > 130 || wbc === null || hgb === null || blasts === null || constitutional === null) {
    return { valid: false, message: 'Enter age (years), WBC (x10^9/L), hemoglobin (g/dL) and peripheral blast percentage, and answer the constitutional-symptoms question.' };
  }
  const scored = [];
  let total = 0;
  if (age > 65) { total += 1; scored.push('age > 65'); }
  if (wbc > 25) { total += 1; scored.push('WBC > 25'); }
  if (hgb < 10) { total += 2; scored.push('hemoglobin < 10 (2 pts)'); }
  if (blasts >= 1) { total += 1; scored.push('blasts >= 1%'); }
  if (constitutional) { total += 1; scored.push('constitutional symptoms'); }
  const group = dipssGroupOf(total);
  return {
    valid: true, total, group,
    abnormal: total >= 3,
    band: `DIPSS ${total} of 6 -- ${group} risk; median survival ${DIPSS_MEDIAN[total]}.${scored.length ? ' Counted: ' + scored.join(', ') + '.' : ' No risk factors present.'}`,
    note: DIPSS_NOTE,
  };
}

// --- 2.6 dipss-plus-mf --------------------------------------------------------
const DIPSS_PLUS_NOTE = 'DIPSS-Plus for primary myelofibrosis (Gangat N, et al, J Clin Oncol 2011): refines DIPSS with three further variables. The DIPSS group is carried forward (intermediate-1 = 1, intermediate-2 = 2, high = 3; low = 0), then platelet count < 100 x10^9/L = 1, red-cell transfusion need = 1, and an unfavorable karyotype = 1. The 0-6 total maps to four risk groups -- low (0), intermediate-1 (1), intermediate-2 (2-3), high (4-6) -- with median survival 15.4 / 6.5 / 2.9 / 1.3 years. It frames prognosis; management stays with the clinician.';
const DIPSS_PLUS_GROUP_PTS = { low: 0, 'int-1': 1, 'int-2': 2, high: 3 };
const DIPSS_PLUS_LABEL = { low: 'low', 'int-1': 'intermediate-1', 'int-2': 'intermediate-2', high: 'high' };
const DIPSS_PLUS_MEDIAN = ['15.4 years', '6.5 years', '2.9 years', '2.9 years', '1.3 years', '1.3 years', '1.3 years'];

export function dipssPlusMf(input = {}) {
  const o = obj(input);
  const dipss = o.dipssGroup; // 'low' | 'int-1' | 'int-2' | 'high'
  const platelet = pos(o.platelet);
  const transfusion = flag(o.transfusion);
  const karyotype = flag(o.karyotype);
  if (!(dipss in DIPSS_PLUS_GROUP_PTS) || platelet === null || transfusion === null || karyotype === null) {
    return { valid: false, message: 'Select the DIPSS risk group and enter the platelet count (x10^9/L), then answer the red-cell-transfusion and unfavorable-karyotype questions.' };
  }
  const scored = [`DIPSS ${DIPSS_PLUS_LABEL[dipss]} (${DIPSS_PLUS_GROUP_PTS[dipss]} pts)`];
  let total = DIPSS_PLUS_GROUP_PTS[dipss];
  if (platelet < 100) { total += 1; scored.push('platelet < 100'); }
  if (transfusion) { total += 1; scored.push('transfusion need'); }
  if (karyotype) { total += 1; scored.push('unfavorable karyotype'); }
  let group;
  if (total === 0) group = 'Low';
  else if (total === 1) group = 'Intermediate-1';
  else if (total <= 3) group = 'Intermediate-2';
  else group = 'High';
  return {
    valid: true, total, group,
    abnormal: total >= 2,
    band: `DIPSS-Plus ${total} of 6 -- ${group} risk; median survival ${DIPSS_PLUS_MEDIAN[total]}. Counted: ${scored.join(', ')}.`,
    note: DIPSS_PLUS_NOTE,
  };
}
