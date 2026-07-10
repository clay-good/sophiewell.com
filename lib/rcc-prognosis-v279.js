// spec-v279: resected renal-cell-carcinoma prognosis — the Leibovich progression
// score (clear-cell RCC recurrence) and the UCLA Integrated Staging System (UISS).
// Both ids were verified absent (spec-v85 §6.2) by a direct scan of app.js AND the
// MCP adapter set first. v279 runs no AI and makes no runtime network call.
//
// These compute a recurrence risk or a risk tier — they are NOT treatment,
// surveillance, or adjuvant-therapy orders (spec-v11 §5.3). Management stays with
// the oncology team.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see each function header).

import { num } from './num.js';

function isYes(v) {
  return v === true || v === 1 || v === '1' || v === 'on' || v === 'yes' || v === 'true';
}

// --- Leibovich progression score (2003, clear-cell RCC) -----------------------
// Leibovich BC, Blute ML, Cheville JC, et al. Prediction of progression after
// radical nephrectomy for patients with clear cell renal cell carcinoma. Cancer.
// 2003;97(7):1663-1671. Five additive factors, total 0-11; risk bands low 0-2,
// intermediate 3-5, high >= 6, with 5-year metastasis-free survival ~97.1% /
// 73.8% / 31.2% in the derivation cohort.
//
// The regional-node cell (pN1/pN2) is the one value secondary renders disagree on
// — some print pN1/pN2 = 1, which is internally INCONSISTENT with the universally
// documented 0-11 maximum: pT(4) + size(1) + grade(4=3) + necrosis(1) = 9 without
// the node term, so the node term MUST contribute 2 for the total to reach 11. The
// pN1/pN2 = 1 renders (which cap at 10) are the error. This is corroborated by the
// SORCE external validation (Stewart-Merrill / SORCE, J Clin Oncol. 2022, open on
// PMC), which reproduces the same 0-11 range and low/intermediate/high bands. So
// pN1/pN2 = 2 (verified by range-consistency + the SORCE validation).
const LEIB_PT = { 'pt1a': 0, 'pt1b': 2, 'pt2': 3, 'pt3-4': 4 };
const LEIB_NODES = { 'n0': 0, 'n1-2': 2 };
const LEIB_SIZE = { 'lt10': 0, 'ge10': 1 };
const LEIB_GRADE = { 'g1-2': 0, 'g3': 1, 'g4': 3 };
const LEIB_NOTE = 'Leibovich progression score (Leibovich 2003, clear-cell RCC after radical nephrectomy): an additive 0-11 recurrence-risk model over five pathology factors (primary tumor stage, regional nodes, tumor size, nuclear/Fuhrman grade, coagulative necrosis). Bands: low 0-2, intermediate 3-5, high >= 6, with 5-year metastasis-free survival roughly 97% / 74% / 31%. It is the model used to stratify patients for adjuvant trials. It reports a recurrence risk, not a surveillance or adjuvant-therapy order. Reproduces the original Fuhrman-grade / 2002 TNM derivation vintage.';

export function leibovichRcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pt = LEIB_PT[o.ptStage];
  const nodes = LEIB_NODES[o.nodes];
  const size = LEIB_SIZE[o.size];
  const grade = LEIB_GRADE[o.grade];
  if (pt === undefined || nodes === undefined || size === undefined || grade === undefined) {
    return { valid: false, message: 'Select the tumor stage, node status, tumor size, and nuclear grade.' };
  }
  const necrosis = isYes(o.necrosis) ? 1 : 0;
  const score = num('Leibovich', pt + nodes + size + grade + necrosis, { min: 0, max: 11 });
  const high = score >= 6;
  const intermediate = score >= 3 && score < 6;
  const band = high ? 'high' : (intermediate ? 'intermediate' : 'low');
  const mfs = high ? '~31% 5-year metastasis-free survival' : (intermediate ? '~74% 5-year metastasis-free survival' : '~97% 5-year metastasis-free survival');
  const factors = [];
  if (pt > 0) factors.push(`tumor stage +${pt}`);
  if (nodes > 0) factors.push(`node-positive +${nodes}`);
  if (size > 0) factors.push(`size >= 10 cm +${size}`);
  if (grade > 0) factors.push(`grade +${grade}`);
  if (necrosis > 0) factors.push('necrosis +1');
  return {
    valid: true,
    score,
    band,
    abnormal: high,
    bandLabel: `Leibovich ${score} — ${band} risk`,
    // spec-v59: report the band and its survival basis inline.
    detail: `Leibovich progression score ${score}/11 — ${band}-risk group (${mfs}).${factors.length ? ` Contributing factors: ${factors.join(', ')}.` : ' No adverse factors scored.'}`,
    note: LEIB_NOTE,
  };
}

// --- UCLA Integrated Staging System (UISS) ------------------------------------
// Zisman A, Pantuck AJ, Dorey F, et al. Improved prognostication of RCC using an
// integrated staging system. J Clin Oncol. 2001;19(6):1649-1657; Zisman A, et al.
// J Clin Oncol. 2002;20(23):4559-4566. Integrates 1997 TNM stage, Fuhrman grade,
// and ECOG performance status.
//
// SCOPE (spec-v97 / spec-v279 §7): only the LOCALIZED (N0M0) branch is shipped —
// it is the branch corroborated by >= 2 independent open sources (the Patard 2004
// international multicenter validation reproduces the low/intermediate/high tree
// and the 5-year overall survival ~92% / 67% / 44%). A clean >= 2-source
// reproduction of the exact TNM/grade/ECOG cells for the node-positive/metastatic
// branch could NOT be obtained in-session, so that branch is PARKED (not
// approximated), per spec-v97 and the spec-v266 §7 precedent; the tile routes
// node-positive/metastatic disease to the metastatic-RCC models (imdc-rcc /
// mskcc-rcc) instead.
//
// Localized (N0M0) tree (Zisman 2001 / Patard 2004):
//   low:          T1, grade 1-2, ECOG 0
//   high:         T3 grade 2-4 with ECOG >= 1, OR T4 (any grade / ECOG)
//   intermediate: every other localized combination
const UISS_NOTE = 'UCLA Integrated Staging System (UISS; Zisman 2001/2002, Patard 2004 validation) for surgically resected, LOCALIZED (N0M0) renal cell carcinoma. Integrates 1997 TNM stage, Fuhrman grade, and ECOG performance status into low / intermediate / high tiers with 5-year overall survival roughly 92% / 67% / 44%. It reports a risk tier, not a treatment order. The node-positive / metastatic branch is out of scope here (its exact cells could not be cross-verified against two open sources); use the metastatic-RCC models (IMDC, MSKCC) for that disease. Reproduces the Fuhrman-grade / 1997 TNM derivation vintage.';

export function uissRcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const t = o.tStage; // 't1' | 't2' | 't3' | 't4'
  const grade = Number(o.grade); // 1..4
  const ecog = o.ecog; // 'ecog0' | 'ecog1plus'
  const nodalMet = isYes(o.nodePositive) || isYes(o.metastatic);

  if (nodalMet) {
    return { valid: false, message: 'This tile covers localized (N0M0) RCC only. For node-positive or metastatic disease, use the metastatic-RCC models (imdc-rcc, mskcc-rcc).' };
  }
  const validT = t === 't1' || t === 't2' || t === 't3' || t === 't4';
  const validGrade = Number.isFinite(grade) && grade >= 1 && grade <= 4;
  const validEcog = ecog === 'ecog0' || ecog === 'ecog1plus';
  if (!validT || !validGrade || !validEcog) {
    return { valid: false, message: 'Select the T stage, Fuhrman grade, and ECOG performance status (localized N0M0 disease).' };
  }

  let tier;
  if (t === 't1' && grade <= 2 && ecog === 'ecog0') {
    tier = 'low';
  } else if (t === 't4' || (t === 't3' && grade >= 2 && ecog === 'ecog1plus')) {
    tier = 'high';
  } else {
    tier = 'intermediate';
  }
  const os = tier === 'high' ? '~44% 5-year overall survival' : (tier === 'intermediate' ? '~67% 5-year overall survival' : '~92% 5-year overall survival');
  return {
    valid: true,
    tier,
    // a categorical tier lookup has no numeric score; expose a stable label.
    score: tier,
    band: tier,
    abnormal: tier === 'high',
    bandLabel: `UISS ${tier} risk (localized)`,
    detail: `UISS tier: ${tier} risk (localized N0M0; ${os}). Applied to T-stage ${t.toUpperCase()}, Fuhrman grade ${grade}, ECOG ${ecog === 'ecog0' ? '0' : '>= 1'}.`,
    note: UISS_NOTE,
  };
}
