// spec-v1658 tool 3: CLIA proficiency-testing acceptance for routine chemistry and hematology.
//
// Source: 42 CFR 493.931 (routine chemistry) and 493.941 (hematology), each "Table 2 to Paragraph
// (c)(2)—Criteria for Acceptable Performance", as amended 87 FR 41238 and 41241 (July 11, 2022), read on
// the eCFR (title 42 current to October 16, 2026) on October 19, 2026. Every row below is transcribed from
// those tables; "(greater)" means the wider of the percentage and the fixed unit. The white blood cell
// differential is "Target ±3SD", so it takes the program's SD; cell identification (80% consensus) and the
// CK-MB "MB elevated" alternative are qualitative and not computed. Sections not read (endocrinology,
// toxicology, immunology and the rest) are not in the list.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// [value, label, percent or null, unit floor or null, unit, CFR section]
export const ANALYTES = [
  ['alt', 'ALT (SGPT)', 15, 6, 'U/L', '493.931'],
  ['albumin', 'Albumin', 8, null, '', '493.931'],
  ['alk-phos', 'Alkaline phosphatase', 20, null, '', '493.931'],
  ['amylase', 'Amylase', 20, null, '', '493.931'],
  ['ast', 'AST (SGOT)', 15, 6, 'U/L', '493.931'],
  ['bilirubin', 'Bilirubin, total', 20, 0.4, 'mg/dL', '493.931'],
  ['pco2', 'Blood gas pCO2', 8, 5, 'mm Hg', '493.931'],
  ['po2', 'Blood gas pO2', 15, 15, 'mm Hg', '493.931'],
  ['ph', 'Blood gas pH', null, 0.04, 'pH units', '493.931'],
  ['bnp', 'B-natriuretic peptide (BNP)', 30, null, '', '493.931'],
  ['probnp', 'Pro B-natriuretic peptide (proBNP)', 30, null, '', '493.931'],
  ['calcium', 'Calcium, total', null, 1.0, 'mg/dL', '493.931'],
  ['co2', 'Carbon dioxide', 20, null, '', '493.931'],
  ['chloride', 'Chloride', 5, null, '', '493.931'],
  ['cholesterol', 'Cholesterol, total', 10, null, '', '493.931'],
  ['hdl', 'Cholesterol, HDL', 20, 6, 'mg/dL', '493.931'],
  ['ldl', 'Cholesterol, LDL, direct measurement', 20, null, '', '493.931'],
  ['ck', 'Creatine kinase (CK)', 20, null, '', '493.931'],
  ['ck-mb', 'CK-MB isoenzymes (quantitative)', 25, 3, 'ng/mL', '493.931'],
  ['creatinine', 'Creatinine', 10, 0.2, 'mg/dL', '493.931'],
  ['ferritin', 'Ferritin', 20, null, '', '493.931'],
  ['ggt', 'Gamma glutamyl transferase', 15, 5, 'U/L', '493.931'],
  ['glucose', 'Glucose (not FDA-cleared home-use devices)', 8, 6, 'mg/dL', '493.931'],
  ['a1c', 'Hemoglobin A1c', 8, null, '', '493.931'],
  ['iron', 'Iron, total', 15, null, '', '493.931'],
  ['ldh', 'Lactate dehydrogenase (LDH)', 15, null, '', '493.931'],
  ['magnesium', 'Magnesium', 15, null, '', '493.931'],
  ['phosphorus', 'Phosphorus', 10, 0.3, 'mg/dL', '493.931'],
  ['potassium', 'Potassium', null, 0.3, 'mmol/L', '493.931'],
  ['psa', 'Prostate specific antigen, total', 20, 0.2, 'ng/mL', '493.931'],
  ['sodium', 'Sodium', null, 4, 'mmol/L', '493.931'],
  ['tibc', 'Total iron binding capacity, direct measurement', 20, null, '', '493.931'],
  ['protein', 'Total protein', 8, null, '', '493.931'],
  ['triglycerides', 'Triglycerides', 15, null, '', '493.931'],
  ['troponin-i', 'Troponin I', 30, 0.9, 'ng/mL', '493.931'],
  ['troponin-t', 'Troponin T', 30, 0.2, 'ng/mL', '493.931'],
  ['bun', 'Urea nitrogen', 9, 2, 'mg/dL', '493.931'],
  ['uric-acid', 'Uric acid', 10, null, '', '493.931'],
  ['wbc-diff', 'White blood cell differential (±3 SD)', null, null, 'percent', '493.941'],
  ['rbc', 'Erythrocyte count', 4, null, '', '493.941'],
  ['hct', 'Hematocrit (not spun)', 4, null, '', '493.941'],
  ['hgb', 'Hemoglobin', 4, null, '', '493.941'],
  ['wbc', 'Leukocyte count', 10, null, '', '493.941'],
  ['plt', 'Platelet count', 25, null, '', '493.941'],
  ['fibrinogen', 'Fibrinogen', 20, null, '', '493.941'],
  ['ptt', 'Partial thromboplastin time', 15, null, '', '493.941'],
  ['pt', 'Prothrombin time (seconds or INR)', 15, null, '', '493.941'],
];

const r = (n) => Math.round(n * 1000) / 1000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function criterion(a) {
  const [, , pct, unit, u] = a;
  if (pct !== null && unit !== null) return `target ±${pct}% or ±${unit} ${u}, whichever is greater`;
  if (pct !== null) return `target ±${pct}%`;
  if (unit !== null) return `target ±${unit} ${u}`;
  return 'target ±3 SD';
}

export function cliaPtAcceptance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a = ANALYTES.find((x) => x[0] === o.analyte);
  if (!a) return { valid: false, message: 'Choose the analyte.' };
  const [, label, pct, unit, u, sec] = a;
  const f = inputFault([['the target value', o.target, -1e6, 1e7, ''], ['the laboratory\'s response', o.response, -1e6, 1e7, '']]);
  if (f) return { valid: false, message: f };
  const t = Number(o.target);
  const resp = Number(o.response);
  let allow;
  if (a[0] === 'wbc-diff') {
    const g = inputFault([['the program\'s SD for this cell type', o.sd, null, 100, 'percent']]);
    if (g) return { valid: false, message: g };
    allow = 3 * Number(o.sd);
  } else {
    allow = Math.max(pct === null ? 0 : (Math.abs(t) * pct) / 100, unit === null ? 0 : unit);
  }
  const dev = resp - t;
  const ok = Math.abs(dev) <= allow + 1e-9;
  const unitTxt = u && u !== 'percent' ? ` ${u}` : '';
  const notes = [`The acceptable range is ${r(t - allow)} to ${r(t + allow)}${unitTxt}: ${criterion(a)} (42 CFR ${sec}, Table 2 to paragraph (c)(2)).`];
  if (unit !== null && pct !== null) notes.push(`At this target the ${(Math.abs(t) * pct) / 100 >= unit ? 'percentage' : `fixed ${unit} ${u}`} is the wider limit. Enter the values in ${u} for the fixed limit to apply.`);
  if (a[0] === 'ck-mb') notes.push('The CFR also accepts a correct "MB elevated" presence or absence; that qualitative grading is not computed here.');
  if (!blank(o.decisionLevel) && a[0] !== 'wbc-diff') {
    const g = inputFault([['the decision level', o.decisionLevel, null, 1e7, '']]);
    if (g) return { valid: false, message: g };
    const d = Number(o.decisionLevel);
    const lim = Math.max(pct === null ? 0 : (d * pct) / 100, unit === null ? 0 : unit);
    const asPct = (lim / d) * 100;
    notes.push(`At a decision level of ${d}${unitTxt}, the CLIA limit is ±${r(lim)}${unitTxt}${Number.isFinite(asPct) ? `, or ${r(asPct)}% as an allowable total error for the sigma metric` : ''}.`);
  }
  return {
    valid: true, acceptable: ok, allowable: r(allow), deviation: r(dev), abnormal: !ok,
    band: `${ok ? 'Acceptable' : 'Not acceptable'}: ${label} response ${resp} is ${r(dev) >= 0 ? '+' : ''}${r(dev)}${unitTxt} from the target ${t}${Number.isFinite((dev / t) * 100) ? ` (${r((dev / t) * 100)}%)` : ''}; the limit is ±${r(allow)}${unitTxt}.`,
    bandLabel: ok ? 'Acceptable' : 'Not acceptable',
    notes,
    note: 'The target is the program\'s, from 80% or more agreement of referee or participating laboratories. Only routine chemistry and hematology are listed; other CLIA sections were not read.',
  };
}
