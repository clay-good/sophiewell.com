// spec-v1635 tool 18: a UGT1A1 genotype and what the irinotecan label says for it (owner decision 12,
// October 15, 2026, for the spec as a whole; this tool is the label's, not CPIC's).
//
// Irinotecan Hydrochloride Injection, Bluepoint Laboratories, DailyMed set b66dbd6d-6ccb-ce9d-e053-
// 2995a90a4c3c, version 8 (effective August 26, 2026), section 2.3, re-read October 15, 2026: "consider a
// reduction in the starting dose by at least one level of irinotecan hydrochloride injection for patients
// known to be homozygous for the UGT1A1*28 or *6 alleles (*28/*28, *6/*6) or compound heterozygous for
// the UGT1A1*28 and *6 alleles (*6/*28)". A label row under spec-v1628 section 1. CPIC lists
// UGT1A1-irinotecan as a level-A pair with no guideline, so there is no CPIC row to show.
//
// Pure: no DOM, no network; `now` is passed in.

import { labelRow } from './label-row.js';

export const LABEL = { setId: 'b66dbd6d-6ccb-ce9d-e053-2995a90a4c3c' };
export const GENOTYPES = ['*1/*1', '*1/*28', '*1/*6', '*28/*28', '*6/*6', '*6/*28'].map((g) => ({ value: g, text: g }));
const NAMED = new Set(['*28/*28', '*6/*6', '*6/*28']);
const SENTENCE = '"When administered in combination with other agents, or as a single-agent, consider a reduction in the starting dose by at least one level of irinotecan hydrochloride injection for patients known to be homozygous for the UGT1A1*28 or *6 alleles (*28/*28, *6/*6) or compound heterozygous for the UGT1A1*28 and *6 alleles (*6/*28)"';
const NOTE = 'What the label states for the genotype entered. It does not choose a dose level.';

export function ugt1a1IrinotecanLabel(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const g = String(o.genotype ?? '').trim();
  if (!GENOTYPES.some((x) => x.value === g)) return { valid: false, message: 'Choose the UGT1A1 genotype on the report.' };
  const row = labelRow(LABEL.setId, now);
  const links = [{ text: 'Irinotecan label on DailyMed', url: row.url }];
  if (!row.answers) return { valid: true, genotype: g, withheld: true, labelLinks: links, band: `UGT1A1 ${g}: the label's statement is withheld.`, bandLabel: 'Withheld', notes: [row.message], note: NOTE };
  const named = NAMED.has(g);
  const notes = named
    ? [`Label, section 2.3: ${SENTENCE}.`, 'It adds that later dose changes may be needed by tolerance.', `Label: ${row.edition}.`]
    : [`Section 2.3 names only *28/*28, *6/*6 and *6/*28, so the label states no starting-dose change for ${g}.`, `Label: ${row.edition}.`];
  notes.push('CPIC lists UGT1A1 and irinotecan as a level-A pair with no guideline, so no CPIC recommendation is shown.');
  return { valid: true, genotype: g, labelNamed: named, labelLinks: links, flag: named ? 'label-reduction' : 'no-label-statement', abnormal: named,
    band: named ? `UGT1A1 ${g}: the label says to consider reducing the starting dose by at least one level.` : `UGT1A1 ${g}: the label states no starting-dose change for this genotype.`,
    bandLabel: named ? 'Consider one level lower' : 'No label statement', notes, note: NOTE };
}
