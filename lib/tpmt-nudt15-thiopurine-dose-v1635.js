// spec-v1635 tool 17: TPMT and NUDT15 phenotypes to CPIC's thiopurine starting-dose recommendation (owner
// decision 12, October 15, 2026).
//
// CPIC's combined table for each thiopurine (35 rows each for mercaptopurine, azathioprine and
// thioguanine), matched exactly on the two phenotypes by lib/cpic-gene-drug-v1640.js and printed whole
// with its classification. CPIC's text carries both the malignancy and the nonmalignancy wording, so the
// indication is not an input. "No result" is a choice, never a blank.
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicGeneDrug } from './cpic-gene-drug-v1640.js';

export const DRUGS = [{ value: 'mercaptopurine', text: 'Mercaptopurine' }, { value: 'azathioprine', text: 'Azathioprine' }, { value: 'thioguanine', text: 'Thioguanine' }];
export const PHENOTYPES = ['Normal Metabolizer', 'Intermediate Metabolizer', 'Possible Intermediate Metabolizer', 'Poor Metabolizer', 'Indeterminate', 'No Result'].map((v) => ({ value: v, text: v === 'No Result' ? 'No result on the report' : v }));
const NOTE = 'CPIC\'s recommendation for the two phenotypes, quoted whole. It does not choose a dose.';

export function tpmtNudt15ThiopurineDose(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = String(o.drug ?? '').trim().toLowerCase();
  if (!DRUGS.some((d) => d.value === drug)) return { valid: false, message: 'Choose mercaptopurine, azathioprine or thioguanine.' };
  const t = String(o.tpmt ?? '').trim(); const n = String(o.nudt15 ?? '').trim();
  if (!PHENOTYPES.some((p) => p.value === t)) return { valid: false, message: 'Choose the TPMT phenotype on the report, or "No result on the report".' };
  if (!PHENOTYPES.some((p) => p.value === n)) return { valid: false, message: 'Choose the NUDT15 phenotype on the report, or "No result on the report".' };
  const r = cpicGeneDrug({ drug, results: `TPMT: ${t}\nNUDT15: ${n}` }, db, now);
  if (!r.valid) return r;
  return { ...r, note: NOTE, band: r.matched ? `${drug}, TPMT ${t}, NUDT15 ${n}: CPIC (${r.classification}): "${r.recommendation}"` : r.band };
}
