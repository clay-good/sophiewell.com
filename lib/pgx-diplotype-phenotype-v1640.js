// spec-v1640 tool 1: diplotype to phenotype by CPIC's tables (owner decision 12, October 15, 2026).
//
// The reader picks a gene and enters the alleles as the lab report prints them. Each allele's function
// (or activity value, for CYP2C9 and DPYD) is read from CPIC's allele table, and the unordered pair is
// matched in CPIC's diplotype-to-phenotype rules. Nothing is called from variants: no rsID or VCF input,
// no "*1 by default" (a blank second allele is refused except where CPIC's rules take one: G6PD read as
// hemizygous, and MT-RNR1). CYP2D6 has its own tool (cyp2d6-activity-score); HLA results are already a
// carrier status on the report. An allele CPIC lists with no function assigned gives no phenotype.
// Values are data from the pinned tables (lib/cpic-tables.js), never constants here.
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicIndex, footer, findAllele, keyOf, matchRule } from './cpic-tables.js';

// The genes CPIC's rules cover, less CYP2D6 and HLA. The tables decide the answer; this list only fills
// the picker, and a gene whose rules leave the tables is refused.
export const GENES = ['ABCG2', 'CACNA1S', 'CFTR', 'CYP2B6', 'CYP2C19', 'CYP2C9', 'CYP3A5', 'DPYD', 'G6PD', 'MT-RNR1', 'NAT2', 'NUDT15', 'RYR1', 'SLCO1B1', 'TPMT', 'UGT1A1'].map((g) => ({ value: g, text: g }));
const NOT_HERE = { 'CYP2D6': 'CYP2D6 has its own tool, CYP2D6 Activity Score, which takes copy numbers and tandems.', 'HLA-A': 'An HLA result is printed on the report as positive or negative; enter it in the CPIC drug lookup.', 'HLA-B': 'An HLA result is printed on the report as positive or negative; enter it in the CPIC drug lookup.' };
const NOTE = 'CPIC\'s translation of the alleles entered, as the lab printed them. It does not call alleles from variants, and it does not say what to prescribe.';

// genes(db) -> the genes this tool answers for, from the tables.
export function genes(db, now) {
  const ix = cpicIndex(db, now);
  return ix.ok ? [...ix.rules.keys()].filter((g) => !NOT_HERE[g]).sort() : [];
}

export function pgxDiplotypePhenotype(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const ix = cpicIndex(db, now);
  if (!ix.ok) return { valid: false, message: `${ix.why} Use the phenotype printed on the lab report.` };
  const gene = String(o.gene ?? '').trim().toUpperCase();
  if (!gene) return { valid: false, message: 'Choose the gene.' };
  if (NOT_HERE[gene]) return { valid: false, message: NOT_HERE[gene] };
  if (!ix.rules.has(gene)) return { valid: false, message: `CPIC has no diplotype-to-phenotype rules for ${gene}.` };
  const raw = [o.allele1, o.allele2].map((x) => String(x ?? '').trim());
  if (!raw[0] && !raw[1]) return { valid: false, message: `Enter the ${gene} alleles as the lab report prints them.` };
  const singles = (ix.rules.get(gene) || []).some((r) => Object.values(r.key).reduce((a, b) => a + b, 0) === 1);
  const pairs = (ix.rules.get(gene) || []).some((r) => Object.values(r.key).reduce((a, b) => a + b, 0) === 2);
  const entered = raw.filter(Boolean);
  if (entered.length === 1 && !singles) return { valid: false, message: `Enter both ${gene} alleles. A blank allele is not read as normal.` };
  if (entered.length === 2 && !pairs) return { valid: false, message: `CPIC's ${gene} rules take one variant; enter it alone.` };
  const rows = [];
  for (const name of entered) {
    const a = findAllele(ix, gene, name);
    if (!a) return { valid: false, message: `"${name}" is not in CPIC's ${gene} allele list. Enter it as the report prints it (for example ${(ix.alleles.get(gene) || []).slice(0, 3).map((x) => x.name).join(', ')}).` };
    rows.push(a);
  }
  const method = (ix.methods.get(gene) || {}).method;
  const notes = rows.map((a) => `${a.name}: ${a.fn || 'no function assigned by CPIC'}${method === 'ACTIVITY_SCORE' && a.value ? `, activity value ${a.value}` : ''}.`);
  const unassigned = rows.find((a) => !a.fn);
  const label = `${gene} ${rows.map((a) => a.name).join('/')}`;
  const base = { valid: true, gene, alleles: rows.map((a) => ({ name: a.name, function: a.fn, activityValue: a.value })), edition: ix.edition };
  if (unassigned) {
    notes.push(`CPIC has not assigned a function to ${unassigned.name}, so no phenotype is given.`, footer(ix));
    return { ...base, phenotype: null, flag: 'no-function-assigned', band: `${label}: no phenotype. CPIC has not assigned a function to ${unassigned.name}.`, bandLabel: 'No phenotype', notes, note: NOTE };
  }
  const rule = matchRule(ix, gene, rows.map((a) => keyOf(ix, gene, a)));
  if (!rule) {
    notes.push('CPIC has no rule for this combination.', footer(ix));
    return { ...base, phenotype: null, flag: 'no-rule', band: `${label}: CPIC has no rule for this combination.`, bandLabel: 'No CPIC rule', notes, note: NOTE };
  }
  if (entered.length === 1 && gene === 'G6PD') notes.push('One allele was entered, so the result is CPIC\'s for one copy of G6PD (hemizygous).');
  const score = method === 'ACTIVITY_SCORE' && rule.score && rule.score !== 'n/a' ? rule.score : null;
  if (score) notes.push(`Activity score ${score}.`);
  const desc = ix.str(rule.desc);
  if (desc) notes.push(`CPIC: "${desc}"`);
  const gn = ix.methods.get(gene);
  if (gn && gn.notes !== null && gn.notes !== undefined && ix.str(gn.notes)) notes.push(`CPIC's note on ${gene}: "${ix.str(gn.notes)}"`);
  notes.push(footer(ix));
  return { ...base, phenotype: rule.result, activityScore: score, flag: rule.result === 'Indeterminate' ? 'indeterminate' : 'phenotype',
    band: `${label}: ${rule.result}${score ? ` (activity score ${score})` : ''}.`, bandLabel: rule.result, notes, note: NOTE };
}
