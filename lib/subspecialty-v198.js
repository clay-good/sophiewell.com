// spec-v198: five deterministic cross-specialty prognostic / diagnostic
// instruments (closing spec of the Advanced Specialist Quantitation program,
// spec-v193 §1.1). Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). None duplicates a live tile; v198 runs no AI and makes no
// runtime network call. These prognosticate and stratify — they are not
// prophylaxis, imaging, treatment, or chemotherapy orders (spec-v11 §5.3).
//
//   cnsIpi      - CNS International Prognostic Index
//   isthBat     - ISTH bleeding assessment tool
//   virsta      - VIRSTA score (IE risk in S. aureus bacteremia)
//   selectPse   - SeLECT score (late post-stroke epilepsy)
//   figoGtn     - WHO/FIGO prognostic score for gestational trophoblastic neoplasia
//
// POINT WEIGHTS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-verified
// across >= 2 independent open sources at implementation:
//   - cnsIpi (Schmitz N, et al, J Clin Oncol 2016;34(26):3150-3156): six factors,
//     1 point each; low 0-1 (2-yr CNS relapse ~0.6%), intermediate 2-3 (~3.4%),
//     high 4-6 (~10.2%).
//   - isthBat (Rodeghiero F, et al, J Thromb Haemost 2010;8(9):2063-2065;
//     thresholds Elbatarny M, et al, Haemophilia 2014;20(6):831-835): 14 domains,
//     0 to +4 each (no negatives); abnormal >=4 adult male, >=6 adult female,
//     >=3 child.
//   - virsta (Tubiana S, et al, J Infect 2016;72(5):544-553): weighted items
//     summing to <=2 low (IE ~1%, NPV ~99%) vs >=3 higher (~17%).
//   - selectPse (Galovic M, et al, Lancet Neurol 2018;17(2):143-152): five factors,
//     total 0-9; per-score 1-yr and 5-yr cumulative late-seizure risk from Fig 3.
//   - figoGtn (FIGO Oncology Committee, Int J Gynaecol Obstet 2002;77(3):285-287):
//     eight factors scored 0/1/2/4; <=6 low (single-agent), >=7 high (multi-agent).

import { num } from './num.js';

function nonNeg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
function clampInt(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const i = Math.round(n);
  return i < lo ? lo : i > hi ? hi : i;
}

// --- 2.1 CNS-IPI ------------------------------------------------------------
const CNSIPI_NOTE = 'CNS International Prognostic Index (Schmitz N, et al, J Clin Oncol 2016;34(26):3150-3156). Six factors, 1 point each — age > 60, elevated LDH, ECOG > 1, Ann Arbor stage III/IV, > 1 extranodal site, and kidney/adrenal involvement — total 0–6 mapped to 2-year CNS-relapse risk: low 0–1 (~0.6%), intermediate 2–3 (~3.4%), high 4–6 (~10.2%). A relapse-risk stratification, not a CNS-prophylaxis order.';
const CNSIPI_ITEMS = [
  { key: 'age', label: 'age > 60' },
  { key: 'ldh', label: 'LDH > normal' },
  { key: 'ecog', label: 'ECOG > 1' },
  { key: 'stage', label: 'Ann Arbor stage III/IV' },
  { key: 'extranodal', label: '> 1 extranodal site' },
  { key: 'kidneyAdrenal', label: 'kidney/adrenal involvement' },
];

export function cnsIpi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = CNSIPI_ITEMS.filter((it) => truthy(o[it.key]));
  const score = present.length;
  let label; let rate;
  if (score <= 1) { label = 'low'; rate = '~0.6%'; }
  else if (score <= 3) { label = 'intermediate'; rate = '~3.4%'; }
  else { label = 'high'; rate = '~10.2%'; }
  return {
    valid: true,
    score,
    abnormal: score >= 4,
    bandLabel: `CNS-IPI ${score} — ${label}`,
    band: `CNS-IPI ${score} — ${label} risk (2-year CNS relapse ${rate}).`,
    detail: `Present: ${present.length ? present.map((p) => p.label).join(', ') : 'none'}.`,
    note: CNSIPI_NOTE,
  };
}

// --- 2.2 ISTH-BAT -----------------------------------------------------------
const ISTHBAT_NOTE = 'ISTH bleeding assessment tool (Rodeghiero F, et al, J Thromb Haemost 2010;8(9):2063-2065; thresholds Elbatarny M, et al, Haemophilia 2014;20(6):831-835). Fourteen bleeding domains, each scored 0 to +4 (no negative scores). Abnormal: ≥ 4 (adult male), ≥ 6 (adult female), ≥ 3 (child). An abnormal score supports evaluation for an inherited bleeding disorder / von Willebrand disease. A screening score, not a workup order.';
const ISTHBAT_DOMAINS = [
  ['epistaxis', 'Epistaxis'],
  ['cutaneous', 'Cutaneous'],
  ['minorWounds', 'Bleeding from minor wounds'],
  ['oralCavity', 'Oral cavity'],
  ['gi', 'GI bleeding'],
  ['hematuria', 'Hematuria'],
  ['toothExtraction', 'Tooth extraction'],
  ['surgery', 'Surgery'],
  ['menorrhagia', 'Menorrhagia'],
  ['postpartum', 'Postpartum hemorrhage'],
  ['muscleHematoma', 'Muscle hematoma'],
  ['hemarthrosis', 'Hemarthrosis'],
  ['cns', 'CNS bleeding'],
  ['other', 'Other bleeding'],
];
const ISTHBAT_THRESHOLD = { male: 4, female: 6, child: 3 };

export function isthBat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const group = ISTHBAT_THRESHOLD[o.group] ? o.group : '';
  if (!group) return { valid: false, message: 'Choose the patient group (adult male, adult female, or child).' };
  const contributors = [];
  let total = 0;
  for (const [key, label] of ISTHBAT_DOMAINS) {
    const raw = o[key];
    const pts = raw === undefined || raw === '' ? 0 : clampInt(raw, 0, 4);
    total += pts;
    if (pts > 0) contributors.push(`${label} +${pts}`);
  }
  total = num('ISTH-BAT', total, { min: 0, max: 56 });
  const threshold = ISTHBAT_THRESHOLD[group];
  const abnormal = total >= threshold;
  const groupLabel = group === 'male' ? 'adult male' : group === 'female' ? 'adult female' : 'child';
  return {
    valid: true,
    total,
    threshold,
    abnormal,
    bandLabel: `ISTH-BAT ${total}`,
    band: abnormal
      ? `ISTH-BAT ${total} — at or above the ≥ ${threshold} ${groupLabel} threshold: abnormal bleeding score.`
      : `ISTH-BAT ${total} — below the ≥ ${threshold} ${groupLabel} threshold: within the normal range.`,
    detail: `Contributors: ${contributors.length ? contributors.join(', ') : 'none'}. An abnormal score supports evaluation for an inherited bleeding disorder.`,
    note: ISTHBAT_NOTE,
  };
}

// --- 2.3 VIRSTA -------------------------------------------------------------
const VIRSTA_NOTE = 'VIRSTA score for infective-endocarditis risk in Staphylococcus aureus bacteremia (Tubiana S, et al, J Infect 2016;72(5):544-553). Weighted items sum to a total: ≤ 2 low (IE prevalence ~1%, NPV ~99% — echocardiography may be deferred), ≥ 3 higher (~17% — echo recommended). An echocardiography-triage aid, not an imaging order.';
const VIRSTA_ITEMS = [
  { key: 'emboli', label: 'cerebral/peripheral emboli', pts: 5 },
  { key: 'meningitis', label: 'meningitis', pts: 5 },
  { key: 'device', label: 'intracardiac device or previous IE', pts: 4 },
  { key: 'ivdu', label: 'IV drug use', pts: 4 },
  { key: 'valve', label: 'preexisting native valve disease', pts: 3 },
  { key: 'persistent', label: 'persistent bacteremia', pts: 3 },
  { key: 'vertebral', label: 'vertebral osteomyelitis', pts: 2 },
  { key: 'community', label: 'community/non-nosocomial acquisition', pts: 2 },
  { key: 'sepsis', label: 'severe sepsis/shock', pts: 1 },
  { key: 'crp', label: 'CRP > 190 mg/L', pts: 1 },
];

export function virsta(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = VIRSTA_ITEMS.filter((it) => truthy(o[it.key]));
  const score = present.reduce((s, it) => s + it.pts, 0);
  const abnormal = score >= 3;
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `VIRSTA ${score}`,
    band: abnormal
      ? `VIRSTA ${score} — ≥ 3: higher IE risk (~17%); echocardiography recommended.`
      : `VIRSTA ${score} — ≤ 2: low IE risk (~1%, NPV ~99%); echocardiography may be deferred.`,
    detail: `Present: ${present.length ? present.map((p) => `${p.label} +${p.pts}`).join(', ') : 'none'}. An echo-triage aid.`,
    note: VIRSTA_NOTE,
  };
}

// --- 2.4 SeLECT -------------------------------------------------------------
const SELECT_NOTE = 'SeLECT score for late post-stroke epilepsy (Galovic M, et al, Lancet Neurol 2018;17(2):143-152). Five factors — Severity (NIHSS), Large-artery atherosclerosis, Early seizure ≤ 7 d, Cortical involvement, and MCA Territory — total 0–9, mapped to the published 1-year and 5-year cumulative late-seizure risk. A prognostic estimate, not an anti-seizure order.';
const SELECT_NIHSS = { '0-3': 0, '4-10': 1, '11+': 2 };
// Fig 3 point estimates: [1-year %, 5-year %] by total score 0..9.
const SELECT_RISK = [
  [0.7, 1], [1, 2], [2, 4], [4, 6], [6, 11], [11, 18], [18, 29], [28, 45], [44, 65], [63, 83],
];

export function selectPse(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const nihss = Object.prototype.hasOwnProperty.call(SELECT_NIHSS, String(o.nihss)) ? String(o.nihss) : '';
  if (!nihss) return { valid: false, message: 'Choose the NIHSS severity band (0–3, 4–10, or ≥ 11).' };
  const laa = truthy(o.laa);
  const early = truthy(o.early);
  const cortical = truthy(o.cortical);
  const territory = truthy(o.territory);
  const parts = [
    [`NIHSS ${nihss === '11+' ? '≥ 11' : nihss}`, SELECT_NIHSS[nihss]],
    ['large-artery atherosclerosis', laa ? 1 : 0],
    ['early seizure ≤ 7 d', early ? 3 : 0],
    ['cortical involvement', cortical ? 2 : 0],
    ['MCA territory', territory ? 1 : 0],
  ];
  const score = num('SeLECT', parts.reduce((s, p) => s + p[1], 0), { min: 0, max: 9 });
  const [r1y, r5y] = SELECT_RISK[score];
  const drivers = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`);
  return {
    valid: true,
    score,
    risk1: r1y,
    risk5: r5y,
    abnormal: score >= 4,
    bandLabel: `SeLECT ${score}`,
    band: `SeLECT ${score} — cumulative late-seizure risk ${r1y}% at 1 year, ${r5y}% at 5 years.`,
    detail: `Contributors: ${drivers.length ? drivers.join(', ') : 'none'}.`,
    note: SELECT_NOTE,
  };
}

// --- 2.5 WHO/FIGO GTN -------------------------------------------------------
const FIGO_NOTE = 'WHO/FIGO prognostic score for gestational trophoblastic neoplasia (FIGO Oncology Committee, Int J Gynaecol Obstet 2002;77(3):285-287, modified WHO scoring). Eight factors scored 0/1/2/4; total ≤ 6 low risk (single-agent chemotherapy), ≥ 7 high risk (multi-agent). The guideline’s risk stratification, not a chemotherapy order.';
const FIGO_ANTECEDENT = { mole: 0, abortion: 1, term: 2 };
const FIGO_SITE = { lung: 0, spleenkidney: 1, gi: 2, liverbrain: 4 };
const FIGO_PRIORCHEMO = { none: 0, single: 2, multi: 4 };

function figoInterval(m) { if (m < 4) return 0; if (m <= 6) return 1; if (m <= 12) return 2; return 4; }
function figoHcg(v) { if (v < 1e3) return 0; if (v < 1e4) return 1; if (v < 1e5) return 2; return 4; }
function figoSize(cm) { if (cm < 3) return 0; if (cm < 5) return 1; return 2; }
function figoMets(n) { if (n === 0) return 0; if (n <= 4) return 1; if (n <= 8) return 2; return 4; }

export function figoGtn(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = nonNeg(o.age, 130);
  const antecedent = Object.prototype.hasOwnProperty.call(FIGO_ANTECEDENT, o.antecedent) ? o.antecedent : '';
  const interval = nonNeg(o.interval, 2000);
  const hcg = nonNeg(o.hcg, 1e9);
  const size = nonNeg(o.size, 100);
  const site = Object.prototype.hasOwnProperty.call(FIGO_SITE, o.site) ? o.site : '';
  const mets = nonNeg(o.mets, 1000);
  const priorChemo = Object.prototype.hasOwnProperty.call(FIGO_PRIORCHEMO, o.priorChemo) ? o.priorChemo : '';
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (!antecedent) missing.push('antecedent pregnancy');
  if (interval === null) missing.push('interval from index pregnancy (months)');
  if (hcg === null) missing.push('pretreatment hCG (IU/L)');
  if (size === null) missing.push('largest tumor size (cm)');
  if (!site) missing.push('site of metastases');
  if (mets === null) missing.push('number of metastases');
  if (!priorChemo) missing.push('prior chemotherapy');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const parts = [
    ['age ≥ 40', age >= 40 ? 1 : 0],
    ['antecedent pregnancy', FIGO_ANTECEDENT[antecedent]],
    ['interval', figoInterval(interval)],
    ['hCG', figoHcg(hcg)],
    ['tumor size', figoSize(size)],
    ['metastasis site', FIGO_SITE[site]],
    ['number of metastases', figoMets(mets)],
    ['prior chemotherapy', FIGO_PRIORCHEMO[priorChemo]],
  ];
  const score = parts.reduce((s, p) => s + p[1], 0);
  const highRisk = score >= 7;
  return {
    valid: true,
    score,
    abnormal: highRisk,
    bandLabel: `WHO/FIGO ${score}`,
    band: highRisk
      ? `WHO/FIGO ${score} — ≥ 7: high risk (multi-agent chemotherapy stratification).`
      : `WHO/FIGO ${score} — ≤ 6: low risk (single-agent chemotherapy stratification).`,
    detail: `Contributors: ${parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`).join(', ') || 'none'}. The guideline’s risk split, not a chemotherapy order.`,
    note: FIGO_NOTE,
  };
}
