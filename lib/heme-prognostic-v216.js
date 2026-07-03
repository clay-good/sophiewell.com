// spec-v216: hematology prognostic scores and staging systems — MDS, CLL, PTCL,
// follicular-lymphoma, and myeloma prognostic instruments plus a lymphocyte
// doubling-time formula and Talcott febrile-neutropenia risk groups. Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v216 runs no AI and makes no runtime network call.
// These stage / stratify prognosis — they are NOT a treatment order (spec-v11
// §5.3).
//
//   wpssMds     - WHO Classification-based Prognostic Scoring System (MDS)
//   mdaccCll    - MD Anderson (MDACC) CLL prognostic index
//   pitPtcl     - Prognostic Index for PTCL-U (PIT)
//   primaPi     - PRIMA Prognostic Index (follicular lymphoma)
//   durieSalmon - Durie-Salmon staging (multiple myeloma)
//   ldt         - lymphocyte doubling time (CLL)
//   talcott     - Talcott's rules (febrile neutropenia risk groups)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function sel(v, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- WPSS (MDS) --------------------------------------------------------------
// Malcovati L, et al, J Clin Oncol 2007;25:3503-3510 + Della Porta MG, et al,
// Leukemia 2015: WHO category (RA/RARS/del5q 0, RCMD 1, RAEB-1 2, RAEB-2 3);
// karyotype (good 0, intermediate 1, poor 2); transfusion requirement (no 0,
// regular 1). Bands: very low 0, low 1, intermediate 2, high 3-4, very high 5-6.
const WPSS_NOTE = 'WPSS (Malcovati L, et al, J Clin Oncol 2007;25:3503-3510): WHO category (RA/RARS/isolated del(5q) 0, RCMD 1, RAEB-1 2, RAEB-2 3) + karyotype (good 0, intermediate 1, poor 2) + transfusion requirement (no 0, regular 1). Very low 0, low 1, intermediate 2, high 3-4, very high 5-6 for myelodysplastic-syndrome survival. A prognostic score, not a treatment order.';
export function wpssMds(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cat = sel(o.whoCategory, 3);
  const karyo = sel(o.karyotype, 2);
  const tx = bool(o.transfusion) ? 1 : 0;
  const score = Math.round(num('WPSS', cat + karyo + tx, { min: 0, max: 6 }));
  let tier; let abnormal = true;
  if (score >= 5) tier = 'very high risk (5-6)';
  else if (score >= 3) tier = 'high risk (3-4)';
  else if (score === 2) tier = 'intermediate risk (2)';
  else if (score === 1) tier = 'low risk (1)';
  else { tier = 'very low risk (0)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `WPSS ${score}`, band: `WPSS ${score} — ${tier}.`, detail: `WHO category ${cat} + karyotype ${karyo} + transfusion ${tx} = ${score}.`, note: WPSS_NOTE };
}

// --- MDACC CLL index ---------------------------------------------------------
// Wierda WG, et al, Blood 2007;109:4679-4685 + Wierda WG, et al, Blood 2011;118:
// Age (<50 0, 50-65 1, >65 2); beta-2-microglobulin (<ULN 0, 1-2x 1, >2x 2);
// ALC (<20 0, 20-50 1, >50 2); male +1; Rai III-IV +1; >= 3 nodal groups +1.
// Bands: low <= 3, intermediate 4-7, high >= 8.
const MDACC_NOTE = 'MDACC CLL prognostic index (Wierda WG, et al, Blood 2007;109:4679-4685): Age (<50 0, 50-65 1, >65 2); beta-2-microglobulin (<ULN 0, 1-2x 1, >2x 2); absolute lymphocyte count (<20 0, 20-50 1, >50 2, x10^9/L); male +1; Rai III-IV +1; >= 3 involved nodal groups +1 (0-9). Low <= 3, intermediate 4-7, high >= 8 for overall survival. A prognostic index, not a treatment order.';
export function mdaccCll(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const alc = pos(o.alc, 100000);
  if (age === null || alc === null) {
    return { valid: false, message: 'Enter age (years) and absolute lymphocyte count (x10^9/L), select the beta-2-microglobulin band, and mark male / Rai III-IV / >= 3 nodal groups.' };
  }
  let s = 0; const p = [];
  const agePts = age > 65 ? 2 : age >= 50 ? 1 : 0; s += agePts; if (agePts) p.push(`age ${Math.round(age)} (+${agePts})`);
  const b2m = sel(o.b2mBand, 2); s += b2m; if (b2m) p.push(`B2M (+${b2m})`);
  const alcPts = alc > 50 ? 2 : alc >= 20 ? 1 : 0; s += alcPts; if (alcPts) p.push(`ALC ${alc} (+${alcPts})`);
  if (bool(o.male)) { s += 1; p.push('male'); }
  if (bool(o.raiAdvanced)) { s += 1; p.push('Rai III-IV'); }
  if (bool(o.nodalHigh)) { s += 1; p.push('>= 3 nodal groups'); }
  const score = Math.round(num('MDACC', s, { min: 0, max: 9 }));
  let tier; let abnormal = true;
  if (score >= 8) tier = 'high risk (>= 8)';
  else if (score >= 4) tier = 'intermediate risk (4-7)';
  else { tier = 'low risk (<= 3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `MDACC CLL ${score}`, band: `MDACC CLL index ${score} — ${tier}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: MDACC_NOTE };
}

// --- PIT (PTCL-U) ------------------------------------------------------------
// Gallamini A, et al, Blood 2004;103:2474-2479 + Kim et al, Sci Rep 2023: one
// point each for age > 60, LDH > normal, ECOG PS >= 2, bone-marrow involvement.
// Groups: 1 (0), 2 (1), 3 (2), 4 (3-4).
const PIT_NOTE = 'Prognostic Index for PTCL-U (Gallamini A, et al, Blood 2004;103:2474-2479): one point each for age > 60, LDH > normal, ECOG performance status >= 2, and bone-marrow involvement (0-4). Group 1 (0 factors) to group 4 (3-4 factors) for peripheral-T-cell-lymphoma survival. A prognostic index, not a treatment order.';
export function pitPtcl(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.ageOver60)) { s += 1; p.push('age > 60'); }
  if (bool(o.ldhHigh)) { s += 1; p.push('LDH > normal'); }
  if (bool(o.ecog2)) { s += 1; p.push('ECOG >= 2'); }
  if (bool(o.marrow)) { s += 1; p.push('marrow involvement'); }
  const score = Math.round(num('PIT', s, { min: 0, max: 4 }));
  const group = score >= 3 ? 4 : score + 1;
  return { valid: true, score, group, abnormal: score >= 1, bandLabel: `PIT group ${group}`, band: `PIT ${score} — prognostic group ${group}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: PIT_NOTE };
}

// --- PRIMA-PI (follicular lymphoma) ------------------------------------------
// Bachy E, et al, Blood 2018;132(1):49-58: beta-2-microglobulin threshold 3 mg/L
// plus bone-marrow involvement. Low = B2M <= 3 without marrow; intermediate =
// B2M <= 3 with marrow; high = B2M > 3.
const PRIMA_NOTE = 'PRIMA Prognostic Index (Bachy E, et al, Blood 2018;132(1):49-58): beta-2-microglobulin (mg/L) and bone-marrow involvement. Low = B2M <= 3 without marrow involvement; intermediate = B2M <= 3 with marrow involvement; high = B2M > 3, for follicular-lymphoma progression-free survival. A prognostic index, not a treatment order.';
export function primaPi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b2m = pos(o.b2m, 100);
  if (b2m === null) {
    return { valid: false, message: 'Enter beta-2-microglobulin (mg/L) and mark whether bone-marrow is involved.' };
  }
  const marrow = bool(o.marrow);
  let tier; let abnormal = true;
  if (b2m > 3) tier = 'high risk (B2M > 3 mg/L)';
  else if (marrow) tier = 'intermediate risk (B2M <= 3 with marrow involvement)';
  else { tier = 'low risk (B2M <= 3 without marrow involvement)'; abnormal = false; }
  const g = b2m > 3 ? 'High' : marrow ? 'Intermediate' : 'Low';
  return { valid: true, group: g, abnormal, bandLabel: `PRIMA-PI ${g}`, band: `PRIMA-PI: ${tier}.`, detail: `B2M ${r1(b2m)} mg/L, marrow ${marrow ? 'involved' : 'not involved'}.`, note: PRIMA_NOTE };
}

// --- Durie-Salmon staging (myeloma) ------------------------------------------
// Durie BGM, Salmon SE, Cancer 1975;36(3):842-854: Stage I (all of Hb > 10,
// normal Ca, 0-1 bone lesion, low M-protein); Stage III (any of Hb < 8.5, Ca >
// 12, advanced lytic lesions >= 3, high M-protein); Stage II otherwise. Subclass
// A creatinine < 2.0, B >= 2.0 mg/dL.
const DS_NOTE = 'Durie-Salmon staging (Durie BGM, Salmon SE, Cancer 1975;36(3):842-854): Stage I = Hb > 10, normal calcium, 0-1 bone lesion, low M-protein; Stage III = any of Hb < 8.5, calcium > 12, >= 3 lytic lesions, high M-protein; Stage II = neither. Subclass A (creatinine < 2.0) or B (>= 2.0 mg/dL). A staging classification, not a treatment order.';
export function durieSalmon(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hb = pos(o.hemoglobin, 30);
  const ca = pos(o.calcium, 30);
  const lesions = pos(o.boneLesions, 500);
  const cr = pos(o.creatinine, 50);
  if (hb === null || ca === null || lesions === null || cr === null) {
    return { valid: false, message: 'Enter hemoglobin (g/dL), serum calcium (mg/dL), number of lytic bone lesions, and creatinine (mg/dL), and select the M-protein burden.' };
  }
  const mBurden = sel(o.mProtein, 2); // 0 low, 1 intermediate, 2 high
  const stageIII = hb < 8.5 || ca > 12 || lesions >= 3 || mBurden === 2;
  const stageI = hb > 10 && ca <= 12 && lesions <= 1 && mBurden === 0;
  const stageNum = stageIII ? 'III' : stageI ? 'I' : 'II';
  const sub = cr >= 2.0 ? 'B' : 'A';
  const abnormal = stageIII || (!stageI);
  return { valid: true, stage: `${stageNum}${sub}`, abnormal, bandLabel: `Durie-Salmon ${stageNum}${sub}`, band: `Durie-Salmon stage ${stageNum}${sub}.`, detail: `Hb ${r1(hb)}, Ca ${r1(ca)}, ${Math.round(lesions)} lesion(s), creatinine ${r1(cr)} (subclass ${sub}).`, note: DS_NOTE };
}

// --- Lymphocyte doubling time (CLL) ------------------------------------------
// Molica S, Alberti A, Cancer 1987;60(11):2712-2716: LDT = interval x ln(2) /
// ln(ALC2 / ALC1). A doubling time <= 12 months carries a worse prognosis.
const LDT_NOTE = 'Lymphocyte doubling time (Molica S, Alberti A, Cancer 1987;60(11):2712-2716): LDT = interval x ln(2) / ln(ALC2 / ALC1). A doubling time <= 12 months predicts a worse prognosis in chronic lymphocytic leukemia. A prognostic estimate, not a treatment order.';
export function ldt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alc1 = pos(o.alc1, 100000);
  const alc2 = pos(o.alc2, 100000);
  const interval = pos(o.intervalMonths, 600);
  if (alc1 === null || alc2 === null || interval === null || alc1 <= 0 || alc2 <= alc1 || interval <= 0) {
    return { valid: false, message: 'Enter an earlier and a later absolute lymphocyte count (the later greater than the earlier) and the interval between them in months (greater than 0).' };
  }
  const months = r1(num('LDT', (interval * Math.log(2)) / Math.log(alc2 / alc1), { min: 0, max: 1e6 }));
  const abnormal = months <= 12;
  return { valid: true, months, abnormal, bandLabel: `LDT ${months} mo`, band: `Lymphocyte doubling time ${months} months — ${abnormal ? 'worse prognosis (<= 12 months)' : 'more favorable (> 12 months)'}.`, detail: `${r1(alc1)} -> ${r1(alc2)} over ${r1(interval)} months.`, note: LDT_NOTE };
}

// --- Talcott's rules (febrile neutropenia) -----------------------------------
// Talcott JA, et al, Arch Intern Med 1988;148(12):2561-2568 + Talcott JA, et al,
// J Clin Oncol 1992;10(2):316-322: Group I inpatient at fever onset; Group II
// outpatient with serious comorbidity; Group III outpatient with
// uncontrolled/progressive cancer; Group IV outpatient, no comorbidity,
// controlled cancer = low risk.
const TALCOTT_NOTE = 'Talcott rules (Talcott JA, et al, Arch Intern Med 1988;148(12):2561-2568): Group I = inpatient at fever onset (~34%); Group II = outpatient with serious concurrent comorbidity (~55%); Group III = outpatient with uncontrolled/progressive cancer (~31%); Group IV = outpatient, no comorbidity, controlled cancer = low risk (~2% complications). A risk classification, not a treatment or discharge order.';
export function talcott(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let group; let tier; let abnormal = true;
  if (bool(o.inpatient)) { group = 'I'; tier = 'inpatient at fever onset (~34% complications)'; }
  else if (bool(o.comorbidity)) { group = 'II'; tier = 'outpatient with serious comorbidity (~55% complications)'; }
  else if (bool(o.uncontrolledCancer)) { group = 'III'; tier = 'outpatient with uncontrolled/progressive cancer (~31% complications)'; }
  else { group = 'IV'; tier = 'outpatient, no comorbidity, controlled cancer = low risk (~2% complications)'; abnormal = false; }
  return { valid: true, group, abnormal, bandLabel: `Talcott group ${group}`, band: `Talcott group ${group} — ${tier}.`, detail: `Group ${group}.`, note: TALCOTT_NOTE };
}
