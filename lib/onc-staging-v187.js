// spec-v187: five deterministic solid-tumor staging / response / inflammation
// prognosis instruments (first feature spec of the Subspecialty Oncology &
// Hematology Staging program). Every id was verified absent by a direct scan of
// app.js first (spec-v85 §6.2). None duplicates a live tile; v187 runs no AI and
// makes no runtime network call. These stage and prognosticate — they are not
// treatment or allocation orders (spec-v11 §5.3).
//
//   bclcHcc               - Barcelona Clinic Liver Cancer stage
//   imdcRcc               - IMDC (Heng) metastatic RCC risk
//   mskccRcc              - MSKCC (Motzer) metastatic RCC risk
//   recist                - RECIST 1.1 tumor response
//   glasgowPrognosticScore- modified Glasgow Prognostic Score (mGPS)
//
// STAGE BOUNDARIES / WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent sources at implementation:
//   - bclcHcc (Llovet JM, et al, Semin Liver Dis 1999;19(3):329-338; 2022 update
//     Reig M, et al, J Hepatol 2022;76(3):681-693): maps ECOG PS, tumor burden,
//     and liver function to stage 0/A/B/C/D with the guideline's stage-linked
//     strategy.
//   - imdcRcc (Heng DYC, et al, J Clin Oncol 2009;27(34):5794-5799): six factors
//     1 point each (Karnofsky < 80%, dx-to-treatment < 1 y, anemia, hypercalcemia,
//     neutrophilia, thrombocytosis); favorable 0, intermediate 1-2, poor ≥ 3.
//   - mskccRcc (Motzer RJ, et al, J Clin Oncol 1999;17(8):2530-2540): five factors
//     1 point each (Karnofsky < 80%, LDH > 1.5× ULN, low hemoglobin, high
//     corrected calcium, dx-to-treatment < 1 y); favorable 0, intermediate 1-2,
//     poor ≥ 3.
//   - recist (Eisenhauer EA, et al, Eur J Cancer 2009;45(2):228-247): % change
//     from baseline and nadir; CR (target sum 0), PR (≥ 30% decrease from
//     baseline), PD (≥ 20% increase from nadir and ≥ 5 mm absolute, or any new
//     lesion / unequivocal non-target progression), SD otherwise.
//   - glasgowPrognosticScore (McMillan DC, Cancer Treat Rev 2013;39(5):534-540):
//     mGPS — CRP ≤ 10 mg/L → 0; CRP > 10 with albumin ≥ 3.5 g/dL → 1; CRP > 10
//     and albumin < 3.5 g/dL → 2.

import { num, r1 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function nonNeg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }

// --- 2.1 BCLC stage ---------------------------------------------------------
const BCLC_NOTE = 'Barcelona Clinic Liver Cancer stage (Llovet JM, et al, Semin Liver Dis 1999; 2022 update Reig M, et al, J Hepatol 2022;76(3):681-693). Maps performance status (ECOG), tumor burden, and liver function (Child-Pugh) to stage 0 (very early), A (early), B (intermediate), C (advanced), or D (terminal), each with a guideline-linked treatment strategy. The strategy is the guideline’s, not an order; the decision stays with the tumor board and patient.';
const BCLC_ECOG = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
const BCLC_CHILD = { A: 'A', B: 'B', C: 'C' };
const BCLC_BURDEN = {
  'very-early': 'single nodule ≤ 2 cm',
  early: 'single > 2 cm or ≤ 3 nodules each ≤ 3 cm',
  intermediate: 'multinodular, no vascular invasion or spread',
  advanced: 'portal invasion or extrahepatic spread',
};
const BCLC_STRATEGY = {
  0: 'ablation or resection (curative intent)',
  A: 'resection, ablation, or transplant (curative intent)',
  B: 'transarterial chemoembolization (TACE)',
  C: 'systemic therapy',
  D: 'best supportive care',
};
const BCLC_LABEL = { 0: '0 (very early)', A: 'A (early)', B: 'B (intermediate)', C: 'C (advanced)', D: 'D (terminal)' };

export function bclcHcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ecog = Object.prototype.hasOwnProperty.call(BCLC_ECOG, String(o.ecog)) ? BCLC_ECOG[String(o.ecog)] : null;
  const child = typeof o.child === 'string' && BCLC_CHILD[o.child] ? o.child : '';
  const burden = typeof o.burden === 'string' && BCLC_BURDEN[o.burden] ? o.burden : '';
  const missing = [];
  if (ecog === null) missing.push('ECOG performance status (0–4)');
  if (!child) missing.push('Child-Pugh class (A/B/C)');
  if (!burden) missing.push('tumor burden');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  let stage;
  if (ecog >= 3 || child === 'C') stage = 'D';
  else if (burden === 'advanced' || ecog >= 1) stage = 'C';
  else if (burden === 'very-early') stage = '0';
  else if (burden === 'early') stage = 'A';
  else stage = 'B';
  const abnormal = stage === 'C' || stage === 'D';
  return {
    valid: true,
    stage,
    strategy: BCLC_STRATEGY[stage],
    abnormal,
    bandLabel: `BCLC ${BCLC_LABEL[stage]}`,
    band: `BCLC stage ${BCLC_LABEL[stage]} — ${BCLC_STRATEGY[stage]} strategy.`,
    detail: `ECOG ${ecog}, Child-Pugh ${child}, ${BCLC_BURDEN[burden]}. The strategy is the guideline’s stage-linked recommendation, not an order.`,
    note: BCLC_NOTE,
  };
}

// --- 2.2 / 2.3 metastatic-RCC risk (shared shape) ---------------------------
function rccRisk(present, labels, medians, model) {
  const score = present.length;
  let group; let median;
  if (score === 0) { group = 'favorable'; median = medians.favorable; }
  else if (score <= 2) { group = 'intermediate'; median = medians.intermediate; }
  else { group = 'poor'; median = medians.poor; }
  return {
    valid: true,
    score,
    group,
    abnormal: score >= 1,
    bandLabel: group.replace(/^./, (m) => m.toUpperCase()) + ' risk',
    band: `${model}: ${score} factor${score === 1 ? '' : 's'} — ${group} risk (median OS ${median}).`,
    detail: present.length ? `Present: ${present.join(', ')}.` : 'No adverse factors present.',
  };
}

const IMDC_NOTE = 'IMDC (Heng) metastatic renal-cell-carcinoma risk (Heng DYC, et al, J Clin Oncol 2009;27(34):5794-5799). Six factors, 1 point each: Karnofsky < 80%, < 1 year from diagnosis to systemic therapy, anemia (Hb below normal), hypercalcemia (corrected Ca above normal), neutrophilia (above normal), thrombocytosis (above normal). Favorable 0, intermediate 1–2, poor ≥ 3. The modern targeted-therapy-era model.';
const IMDC_ITEMS = [
  { key: 'karnofsky', label: 'Karnofsky < 80%' },
  { key: 'dxToTx', label: 'diagnosis to therapy < 1 year' },
  { key: 'anemia', label: 'anemia' },
  { key: 'hypercalcemia', label: 'hypercalcemia' },
  { key: 'neutrophilia', label: 'neutrophilia' },
  { key: 'thrombocytosis', label: 'thrombocytosis' },
];

export function imdcRcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = IMDC_ITEMS.filter((it) => truthy(o[it.key])).map((it) => it.label);
  const r = rccRisk(present, IMDC_ITEMS, { favorable: '43.2 mo', intermediate: '22.5 mo', poor: '7.8 mo' }, 'IMDC');
  r.note = IMDC_NOTE;
  return r;
}

const MSKCC_NOTE = 'MSKCC (Motzer) metastatic renal-cell-carcinoma risk (Motzer RJ, et al, J Clin Oncol 1999;17(8):2530-2540). Five factors, 1 point each: Karnofsky < 80%, LDH > 1.5× upper limit of normal, low hemoglobin, high corrected calcium, < 1 year from diagnosis to treatment. Favorable 0, intermediate 1–2, poor ≥ 3. The historical (cytokine-era) comparator to the modern IMDC model.';
const MSKCC_ITEMS = [
  { key: 'karnofsky', label: 'Karnofsky < 80%' },
  { key: 'ldh', label: 'LDH > 1.5× ULN' },
  { key: 'anemia', label: 'low hemoglobin' },
  { key: 'hypercalcemia', label: 'high corrected calcium' },
  { key: 'dxToTx', label: 'diagnosis to treatment < 1 year' },
];

export function mskccRcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = MSKCC_ITEMS.filter((it) => truthy(o[it.key])).map((it) => it.label);
  const r = rccRisk(present, MSKCC_ITEMS, { favorable: '20 mo', intermediate: '10 mo', poor: '4 mo' }, 'MSKCC');
  r.note = MSKCC_NOTE;
  return r;
}

// --- 2.4 RECIST 1.1 ---------------------------------------------------------
const RECIST_NOTE = 'RECIST 1.1 tumor response (Eisenhauer EA, et al, Eur J Cancer 2009;45(2):228-247). From the sum of target-lesion diameters: complete response (CR) = target sum 0; partial response (PR) = ≥ 30% decrease from baseline; progressive disease (PD) = ≥ 20% increase from the nadir and ≥ 5 mm absolute increase, or any new lesion / unequivocal non-target progression; stable disease (SD) otherwise. Consumes entered diameters; it does not measure lesions on a scan.';

export function recist(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const baseline = pos(o.baseline, 10000); // mm
  const current = nonNeg(o.current, 10000); // mm (0 allowed = CR)
  const nadir = pos(o.nadir, 10000); // mm
  const newLesion = truthy(o.newLesion);
  const nonTarget = truthy(o.nonTarget);
  const missing = [];
  if (baseline === null) missing.push('baseline sum of diameters (mm)');
  if (current === null) missing.push('current sum of diameters (mm)');
  if (nadir === null) missing.push('nadir sum of diameters (mm)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const pctBaseline = r1(num('% from baseline', ((current - baseline) / baseline) * 100, { min: -100, max: 100000 }));
  const pctNadir = r1(num('% from nadir', ((current - nadir) / nadir) * 100, { min: -100, max: 100000 }));
  const absNadir = current - nadir;
  const progression = newLesion || nonTarget || (pctNadir >= 20 && absNadir >= 5);
  let cat; let label; let rule;
  if (progression) {
    cat = 'PD'; label = 'Progressive disease (PD)';
    rule = newLesion ? 'a new lesion' : nonTarget ? 'unequivocal non-target progression' : `+${pctNadir}% from nadir with a ${r1(absNadir)} mm absolute increase`;
  } else if (current === 0) {
    cat = 'CR'; label = 'Complete response (CR)'; rule = 'target lesions resolved (sum 0)';
  } else if (pctBaseline <= -30) {
    cat = 'PR'; label = 'Partial response (PR)'; rule = `${Math.abs(pctBaseline)}% decrease from baseline`;
  } else {
    cat = 'SD'; label = 'Stable disease (SD)'; rule = 'neither a 30% decrease from baseline nor progression';
  }
  const abnormal = cat === 'PD';
  const band = cat === 'PD' || cat === 'CR'
    ? `${label}: ${rule}.`
    : `${label}: ${Math.abs(pctBaseline)}% ${pctBaseline <= 0 ? 'decrease' : 'increase'} from baseline.`;
  return {
    valid: true,
    category: cat,
    pctBaseline,
    pctNadir,
    abnormal,
    bandLabel: label,
    band,
    detail: `Change from baseline ${pctBaseline}%; from nadir ${pctNadir}%. Rule fired: ${rule}.`,
    note: RECIST_NOTE,
  };
}

// --- 2.5 modified Glasgow Prognostic Score ----------------------------------
const MGPS_NOTE = 'Modified Glasgow Prognostic Score (McMillan DC, Cancer Treat Rev 2013;39(5):534-540). CRP ≤ 10 mg/L → 0; CRP > 10 mg/L with albumin ≥ 3.5 g/dL → 1; CRP > 10 mg/L and albumin < 3.5 g/dL → 2. A systemic-inflammation-based prognostic score across many cancers; a higher score marks worse prognosis.';

export function glasgowPrognosticScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const crp = nonNeg(o.crp, 1000); // mg/L
  const albumin = pos(o.albumin, 10); // g/dL
  const missing = [];
  if (crp === null) missing.push('C-reactive protein (mg/L)');
  if (albumin === null) missing.push('serum albumin (g/dL)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  let score;
  if (crp <= 10) score = 0;
  else if (albumin >= 3.5) score = 1;
  else score = 2;
  const abnormal = score >= 1;
  const meaning = score === 0 ? 'no systemic inflammatory response' : score === 1 ? 'elevated CRP alone' : 'elevated CRP with hypoalbuminemia';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `mGPS ${score}`,
    band: `mGPS ${score} — ${meaning}.`,
    detail: `CRP ${r1(crp)} mg/L, albumin ${r1(albumin)} g/dL. A higher score marks a worse inflammation-based prognosis.`,
    note: MGPS_NOTE,
  };
}
