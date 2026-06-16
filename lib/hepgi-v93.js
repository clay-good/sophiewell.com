// spec-v93 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// six deterministic hepatology & GI disease-activity instruments that close the
// catalog's liver/gut gap (it shipped meld-childpugh, fib4, apri, ranson-bisap
// and maddrey-lille -- the chronic-liver and pancreatitis spine -- but none of
// the disease-activity / fibrosis instruments clinics actually score).
//
//   nafldFibrosis  - NAFLD Fibrosis Score (Angulo 2007) + advanced-fibrosis bands
//   glasgowImrie   - modified Glasgow (Imrie) acute-pancreatitis severity (PANCREAS)
//   trueloveWitts  - Truelove & Witts acute ulcerative-colitis severity
//   harveyBradshaw - Harvey-Bradshaw index (Crohn's disease activity)
//   mayoUc         - Mayo score / partial Mayo for ulcerative colitis
//   milanCriteria  - Milan criteria for HCC liver-transplant eligibility
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v19.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz harness
// can drive each field through its adversarial matrix; the one guarded domain is
// the nafldFibrosis AST/ALT division (a blank/zero ALT is a surfaced valid:false,
// never a NaN/Infinity term). r1/r2 come from lib/num.js (spec-v53 §4.1). None
// authors a management/listing order in Sophie's voice (spec-v11 §5.3) -- each
// surfaces the computation and the cited source's own band / classification.

import { r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can divide by).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };
// Clamp a finite value to [lo, hi]; non-finite -> lo. Surfaces the clamp via the
// returned flag so a renderer can report an out-of-range subscore entry.
function clampSub(v, lo, hi) {
  const f = fin(v);
  if (f == null) return { value: lo, clamped: false, blank: true };
  if (f < lo) return { value: lo, clamped: true, blank: false };
  if (f > hi) return { value: hi, clamped: true, blank: false };
  return { value: f, clamped: false, blank: false };
}
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1;

// --- 2.1 nafldFibrosis - NAFLD Fibrosis Score (Angulo 2007) -------------------
// NFS = -1.675 + 0.037*age + 0.094*BMI + 1.13*(IFG/DM) - 0.013*platelets
//        - 0.66*albumin + 0.99*(AST/ALT). Bands: < -1.455 excludes advanced
// fibrosis (F0-F2); > 0.676 indicates advanced fibrosis (F3-F4); between the two
// cutoffs is indeterminate. The AST/ALT term divides by ALT, so a blank/zero ALT
// is a surfaced guard, never a non-finite score.
export function nafldFibrosis({ age, bmi, ifgDm, ast, alt, platelets, albumin } = {}) {
  const a = fin(age);
  const b = fin(bmi);
  const as = fin(ast);
  const al = pos(alt);
  const plt = fin(platelets);
  const alb = fin(albumin);
  if (a == null || a < 0 || b == null || b <= 0 || as == null || as < 0
      || plt == null || plt <= 0 || alb == null || alb <= 0) {
    return {
      valid: false,
      band: 'Enter age (years), BMI, AST, ALT, platelets (x10⁹/L) and albumin (g/dL); mark impaired fasting glucose or diabetes.',
      note: 'The NAFLD Fibrosis Score is a fixed linear equation in age, BMI, the AST/ALT ratio, platelets, albumin and a glucose-status indicator (Angulo 2007).',
    };
  }
  if (al == null) {
    return {
      valid: false,
      band: 'ALT is required and must be > 0 (the score uses the AST/ALT ratio).',
      note: 'The AST/ALT ratio term divides by ALT; an ALT of 0 or blank has no defined ratio.',
    };
  }
  const ifg = onFlag(ifgDm) ? 1 : 0;
  const ratio = as / al;
  const nfs = -1.675 + 0.037 * a + 0.094 * b + 1.13 * ifg - 0.013 * plt - 0.66 * alb + 0.99 * ratio;
  let bandKey;
  if (nfs < -1.455) bandKey = 'low';
  else if (nfs > 0.676) bandKey = 'high';
  else bandKey = 'indeterminate';
  const BAND = {
    low: 'NFS < -1.455: excludes advanced fibrosis (F0-F2).',
    indeterminate: 'NFS between -1.455 and 0.676: indeterminate -- advanced fibrosis can be neither excluded nor confirmed.',
    high: 'NFS > 0.676: indicates advanced fibrosis (F3-F4).',
  };
  return {
    valid: true,
    score: r2(nfs),
    astAltRatio: r2(ratio),
    ifg,
    bandKey,
    interpretation: BAND[bandKey],
    band: `NAFLD Fibrosis Score ${r2(nfs)}: ${BAND[bandKey]}`,
    note: 'NFS = -1.675 + 0.037*age + 0.094*BMI + 1.13*(IFG or diabetes) - 0.013*platelets - 0.66*albumin + 0.99*(AST/ALT). Cutoffs (Angulo 2007): < -1.455 excludes advanced fibrosis, > 0.676 indicates advanced fibrosis, between the two is indeterminate. A non-invasive triage estimate in the FIB-4/APRI tradition; it does not replace biopsy or elastography. Confirm an indeterminate or positive result with the gastroenterologist.',
  };
}

// --- 2.2 glasgowImrie - modified Glasgow (Imrie) pancreatitis severity --------
// Eight 48-hour items (the PANCREAS mnemonic), one point each (0-8); >= 3
// predicts severe pancreatitis. A blank item is "not assessed" and does NOT
// count as zero toward the total -- the output states how many of the eight were
// scored so a partial 48-hour panel never masquerades as a complete low score.
const IMRIE_ITEMS = [
  { key: 'pao2', label: 'PaO2 < 60 mmHg (8 kPa)', met: (v) => v < 60 },
  { key: 'age', label: 'Age > 55 years', met: (v) => v > 55 },
  { key: 'wbc', label: 'WBC > 15 x10⁹/L (neutrophilia)', met: (v) => v > 15 },
  { key: 'calcium', label: 'Calcium < 2 mmol/L', met: (v) => v < 2 },
  { key: 'urea', label: 'Urea > 16 mmol/L', met: (v) => v > 16 },
  { key: 'ldh', label: 'LDH > 600 IU/L', met: (v) => v > 600 },
  { key: 'albumin', label: 'Albumin < 32 g/L', met: (v) => v < 32 },
  { key: 'glucose', label: 'Glucose > 10 mmol/L', met: (v) => v > 10 },
];
export function glasgowImrie(inputs = {}) {
  let total = 0;
  let scored = 0;
  const items = IMRIE_ITEMS.map((it) => {
    const v = fin(inputs[it.key]);
    if (v == null) return { key: it.key, label: it.label, state: 'not assessed', met: false };
    scored += 1;
    const met = it.met(v);
    if (met) total += 1;
    return { key: it.key, label: it.label, state: met ? 'met' : 'not met', met };
  });
  if (scored === 0) {
    return {
      valid: false,
      band: 'Enter the 48-hour values: PaO2, age, WBC, calcium, urea, LDH, albumin, glucose.',
      note: 'The modified Glasgow (Imrie) score is an eight-item 48-hour score; enter at least one value.',
    };
  }
  const severe = total >= 3;
  const partial = scored < 8;
  return {
    valid: true,
    total,
    scored,
    severe,
    items,
    band: `Modified Glasgow (Imrie) ${total}: ${severe ? 'predicts severe pancreatitis (>= 3)' : 'not in the severe range (< 3)'}; ${scored} of 8 items assessed${partial ? ' (partial 48-hour panel)' : ''}.`,
    note: 'PANCREAS, one point each at 48 hours: PaO2 < 60 mmHg, age > 55, WBC > 15, calcium < 2 mmol/L, urea > 16 mmol/L, LDH > 600 IU/L, albumin < 32 g/L, glucose > 10 mmol/L. >= 3 predicts severe acute pancreatitis (Blamey/Imrie 1984). A blank item is not assessed, not zero; complete the 48-hour panel before relying on a low score. The parallel Ranson/BISAP score is the ranson-bisap tile.',
  };
}

// --- 2.3 trueloveWitts - acute ulcerative-colitis severity --------------------
// Severe = >= 6 bloody stools/day PLUS at least one systemic criterion (temp >
// 37.8 C, HR > 90, Hgb < 10.5 g/dL, ESR > 30 mm/h); mild = < 4 stools/day with no
// systemic criterion; moderate is the intermediate band. The output names which
// systemic criteria are met so a near-miss is reported as the band it falls in.
export function trueloveWitts({ stools, bleeding, temp, heartRate, hemoglobin, esr } = {}) {
  const s = fin(stools);
  if (s == null || s < 0) {
    return {
      valid: false,
      band: 'Enter the number of stools per day and whether rectal bleeding is present.',
      note: 'Truelove & Witts classifies acute ulcerative-colitis severity from the bloody-stool count plus systemic toxicity.',
    };
  }
  const bloody = bleeding === 'present' || bleeding === 'yes' || bleeding === true;
  const t = fin(temp);
  const hr = fin(heartRate);
  const hgb = fin(hemoglobin);
  const e = fin(esr);
  const systemic = [];
  if (t != null && t > 37.8) systemic.push('temperature > 37.8 C');
  if (hr != null && hr > 90) systemic.push('heart rate > 90 bpm');
  if (hgb != null && hgb < 10.5) systemic.push('hemoglobin < 10.5 g/dL');
  if (e != null && e > 30) systemic.push('ESR > 30 mm/h');
  let bandKey;
  if (s >= 6 && bloody && systemic.length >= 1) bandKey = 'severe';
  else if (s < 4 && systemic.length === 0) bandKey = 'mild';
  else bandKey = 'moderate';
  const BAND = {
    mild: 'mild: < 4 stools/day with minimal systemic disturbance.',
    moderate: 'moderate: intermediate between mild and severe.',
    severe: 'severe: >= 6 bloody stools/day plus >= 1 systemic criterion.',
  };
  const sysText = systemic.length ? `Systemic criteria met: ${systemic.join(', ')}.` : 'No systemic toxicity criterion met.';
  return {
    valid: true,
    bandKey,
    severe: bandKey === 'severe',
    systemic,
    band: `Truelove & Witts: ${BAND[bandKey]} ${sysText}`,
    note: 'Severe acute ulcerative colitis = >= 6 bloody stools/day PLUS at least one of: temperature > 37.8 C, heart rate > 90 bpm, hemoglobin < 10.5 g/dL, ESR > 30 mm/h (Truelove & Witts 1955). Mild is < 4 stools/day with minimal systemic disturbance; moderate is intermediate. The admit / IV-steroid decision stays with the clinician and local protocol.',
  };
}

// --- 2.4 harveyBradshaw - Harvey-Bradshaw index (Crohn's activity) ------------
// Total = general wellbeing (0-4) + abdominal pain (0-3) + liquid/soft stools per
// day (count) + abdominal mass (0-3) + complications (1 point each). Bands:
// remission < 5, mild 5-7, moderate 8-16, severe > 16. Each ordinal subscore is
// clamped to its published range and the clamp is surfaced.
export function harveyBradshaw({ wellbeing, pain, stools, mass, complications } = {}) {
  const wb = clampSub(wellbeing, 0, 4);
  const pn = clampSub(pain, 0, 3);
  const ms = clampSub(mass, 0, 3);
  const st = clampSub(stools, 0, 1e6);
  const cx = clampSub(complications, 0, 8);
  const stoolsN = Math.round(st.value);
  const compN = Math.round(cx.value);
  const total = wb.value + pn.value + stoolsN + ms.value + compN;
  let bandKey;
  if (total < 5) bandKey = 'remission';
  else if (total <= 7) bandKey = 'mild';
  else if (total <= 16) bandKey = 'moderate';
  else bandKey = 'severe';
  const BAND = {
    remission: 'remission (< 5)',
    mild: 'mild (5-7)',
    moderate: 'moderate (8-16)',
    severe: 'severe (> 16)',
  };
  const clamped = wb.clamped || pn.clamped || ms.clamped || cx.clamped;
  return {
    valid: true,
    total,
    bandKey,
    clamped,
    components: { wellbeing: wb.value, pain: pn.value, stools: stoolsN, mass: ms.value, complications: compN },
    band: `Harvey-Bradshaw Index ${total}: ${BAND[bandKey]}.${clamped ? ' (a subscore was out of range and was clamped)' : ''}`,
    note: 'HBI = general wellbeing (0 very well - 4 terrible) + abdominal pain (0 none - 3 severe) + number of liquid/soft stools per day + abdominal mass (0 none, 1 dubious, 2 definite, 3 definite and tender) + 1 point per complication (arthralgia, uveitis, erythema nodosum, aphthous ulcers, pyoderma gangrenosum, anal fissure, new fistula, abscess). Bands (Harvey-Bradshaw 1980): remission < 5, mild 5-7, moderate 8-16, severe > 16.',
  };
}

// --- 2.5 mayoUc - Mayo score / partial Mayo for ulcerative colitis ------------
// Full Mayo (0-12) when all four subscores are present; partial Mayo (0-9) when
// the endoscopy subscore is omitted. Each subscore is 0-3 and is clamped. The
// rendered label always states which instrument produced the number, so a partial
// score is never read against the full-score bands.
export function mayoUc({ stoolFreq, rectalBleeding, physicianGlobal, endoscopy } = {}) {
  const sf = clampSub(stoolFreq, 0, 3);
  const rb = clampSub(rectalBleeding, 0, 3);
  const pg = clampSub(physicianGlobal, 0, 3);
  const endoRaw = fin(endoscopy);
  const hasEndo = endoRaw != null;
  const en = clampSub(endoscopy, 0, 3);
  const clamped = sf.clamped || rb.clamped || pg.clamped || (hasEndo && en.clamped);
  if (hasEndo) {
    const total = sf.value + rb.value + pg.value + en.value;
    let bandKey;
    if (total <= 2) bandKey = 'remission';
    else if (total <= 5) bandKey = 'mild';
    else if (total <= 10) bandKey = 'moderate';
    else bandKey = 'severe';
    const BAND = { remission: 'remission (0-2)', mild: 'mild (3-5)', moderate: 'moderate (6-10)', severe: 'severe (11-12)' };
    return {
      valid: true,
      form: 'full',
      total,
      bandKey,
      clamped,
      components: { stoolFreq: sf.value, rectalBleeding: rb.value, physicianGlobal: pg.value, endoscopy: en.value },
      band: `Full Mayo score ${total} (0-12): ${BAND[bandKey]}.${clamped ? ' (a subscore was clamped)' : ''}`,
      note: 'Full Mayo (Schroeder 1987) = stool frequency (0-3) + rectal bleeding (0-3) + physician global assessment (0-3) + endoscopy (0-3). Bands: remission 0-2, mild 3-5, moderate 6-10, severe 11-12. The endoscopy subscore is the entered value, not an image grade.',
    };
  }
  const total = sf.value + rb.value + pg.value;
  let bandKey;
  if (total <= 2) bandKey = 'remission';
  else if (total <= 4) bandKey = 'mild';
  else if (total <= 6) bandKey = 'moderate';
  else bandKey = 'severe';
  const BAND = { remission: 'remission (0-2)', mild: 'mild (3-4)', moderate: 'moderate (5-6)', severe: 'severe (7-9)' };
  return {
    valid: true,
    form: 'partial',
    total,
    bandKey,
    clamped,
    components: { stoolFreq: sf.value, rectalBleeding: rb.value, physicianGlobal: pg.value },
    band: `Partial Mayo score ${total} (0-9): ${BAND[bandKey]}.${clamped ? ' (a subscore was clamped)' : ''}`,
    note: 'Partial Mayo (the endoscopy-free Mayo subset) = stool frequency (0-3) + rectal bleeding (0-3) + physician global assessment (0-3). Bands: remission 0-2, mild 3-4, moderate 5-6, severe 7-9. Add the endoscopy subscore for the full Mayo (0-12).',
  };
}

// --- 2.6 milanCriteria - HCC liver-transplant eligibility (Mazzaferro 1996) ---
// Within Milan = (single tumor <= 5 cm) OR (<= 3 nodules each <= 3 cm), AND no
// macrovascular invasion AND no extrahepatic spread. The largest-nodule size
// governs the "each <= 3 cm" limb. A nodule count of zero or a missing largest
// size returns a surfaced "size and count required" rather than a vacuous within.
export function milanCriteria({ nodules, largestSize, macrovascular, extrahepatic } = {}) {
  const n = fin(nodules);
  const largest = fin(largestSize);
  if (n == null || n < 1 || !Number.isInteger(n) || largest == null || largest <= 0) {
    return {
      valid: false,
      band: 'Enter the number of HCC nodules (>= 1, whole number) and the size of the largest nodule (cm).',
      note: 'The Milan criteria need the tumor count and the largest-nodule size; macrovascular invasion and extrahepatic spread default to none unless marked.',
    };
  }
  const invasion = onFlag(macrovascular);
  const spread = onFlag(extrahepatic);
  const singleLimb = n === 1 && largest <= 5;
  const multiLimb = n >= 1 && n <= 3 && largest <= 3;
  const sizeCountOk = singleLimb || multiLimb;
  const within = sizeCountOk && !invasion && !spread;
  const failed = [];
  if (!sizeCountOk) failed.push('size/count (not a single tumor <= 5 cm and not <= 3 nodules each <= 3 cm)');
  if (invasion) failed.push('macrovascular invasion present');
  if (spread) failed.push('extrahepatic spread present');
  return {
    valid: true,
    within,
    sizeCountOk,
    invasion,
    spread,
    failed,
    band: within
      ? `Within Milan criteria: ${singleLimb ? 'a single HCC <= 5 cm' : '<= 3 nodules each <= 3 cm'}, no macrovascular invasion, no extrahepatic spread.`
      : `Exceeds Milan criteria -- failing limb(s): ${failed.join('; ')}.`,
    note: 'Milan criteria (Mazzaferro 1996): within = a single tumor <= 5 cm OR <= 3 nodules each <= 3 cm, AND no macrovascular invasion AND no extrahepatic spread. Reports the criterion only -- it is not a listing decision (MELD allocation, downstaging, UCSF/extended criteria and center policy all apply).',
  };
}
