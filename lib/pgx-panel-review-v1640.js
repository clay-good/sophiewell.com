// spec-v1640 tool 5: one genotype report against every drug CPIC or the FDA table flags for it (owner
// decision 12, October 15, 2026).
//
// The reader enters the report's results, one per line ("CYP2C19: Poor Metabolizer", "CYP2D6 0.5",
// "HLA-B*15:02 positive"). For each result, every CPIC recommendation row keyed by that gene and value is
// found, with each other gene of a multi-gene row set to the reader's result for it, or to "No Result"
// when it was not entered. A row is listed when its recommendation text differs from the same drug's row
// for the gene's normal result (text inequality, nothing ranked); a gene with no normal result in CPIC's
// terms (CFTR) lists every row. Then the FDA table's rows for the gene. Sorted by CPIC classification,
// Strong first. It does not read a medication list: matching to the patient's drugs is the reader's step.
// The results stay out of the share link (data-private in the view).
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicIndex, footer } from './cpic-tables.js';
import { keyValue, fdaRows } from './cpic-gene-drug-v1640.js';
import { csvText } from './csv-out.js';

const ORDER = ['Strong', 'Moderate', 'Optional', 'No Recommendation', 'n/a'];
const NORMAL = ['Normal Metabolizer', 'Normal Function', 'Normal', '2.0', 'normal risk of aminoglycoside-induced hearing loss', 'Uncertain Susceptibility', 'Rapid Metabolizer'];
const NOTE = 'Every CPIC recommendation that changes for these results, and the FDA table\'s rows for each gene, quoted as published. It does not read a medication list or choose a drug; a drug whose CPIC text is the same for every result is not listed.';
const lc = (s) => String(s ?? '').trim().toLowerCase();

function normalOf(gene, value, legal) {
  if (/^HLA-/.test(gene)) { const allele = value.split(' ')[0]; return legal.find((x) => x === `${allele} negative`) || null; }
  return NORMAL.find((n) => legal.includes(n)) || null;
}

export function pgxPanelReview(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const ix = cpicIndex(db, now);
  if (!ix.ok) return { valid: false, message: `${ix.why} No CPIC recommendation is shown.` };
  const recs = db.rec || [];
  const legalAll = {};
  for (const r of recs) for (const [g, k] of Object.entries(r.key)) (legalAll[g] ||= new Set()).add(k);
  const given = {};
  const lines = String(o.results ?? '').split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter the report\'s results, one per line, as "gene: result" (for example CYP2C19: Poor Metabolizer, or CYP2D6: 0.5).' };
  if (lines.length > 60) return { valid: false, message: 'Enter at most 60 results.' };
  for (const t of lines) {
    const m = /^(HLA-[A-Z]+|[A-Z0-9]+(?:-[A-Z0-9]+)?)\s*(?::|,|\t|\s|(?=\*))\s*(.+)$/i.exec(t);
    const gene = m && Object.keys(legalAll).find((g) => lc(g) === lc(m[1]));
    if (!gene) return { valid: false, message: `"${t}": no CPIC recommendation is keyed by that gene. Enter each result as "gene: result".` };
    const legal = [...legalAll[gene]].filter((x) => x !== 'No Result');
    const k = keyValue(m[2], legal);
    if (!k) return { valid: false, message: `"${m[2].trim()}" is not a ${gene} result CPIC's recommendations are keyed by. CPIC's values: ${legal.join('; ')}.` };
    if (/^HLA-/.test(gene)) { (given[gene] ||= []).push(k); } else given[gene] = [k];
  }
  const entered = Object.entries(given).flatMap(([g, ks]) => ks.map((k) => [g, k]));
  const found = [];
  const perResult = [];
  for (const [gene, value] of entered) {
    let n = 0;
    const rows = recs.filter((r) => r.key[gene] === value && Object.entries(r.key).every(([g, k]) => g === gene || (given[g] ? given[g].includes(k) : k === 'No Result')));
    for (const r of rows) {
      const legal = [...new Set(recs.filter((x) => x.drug === r.drug && x.pop === r.pop).map((x) => x.key[gene]).filter(Boolean))];
      const norm = normalOf(gene, value, legal);
      if (norm === value) continue;
      if (norm) {
        const base = recs.find((x) => x.drug === r.drug && x.pop === r.pop && x.key[gene] === norm && Object.entries(r.key).every(([g, k]) => g === gene || x.key[g] === k));
        if (base && base.rec === r.rec) continue;
      }
      n += 1;
      found.push({ result: `${gene} ${value}`, drug: r.drug, population: r.pop, classification: r.cls, recommendation: ix.str(r.rec) });
    }
    perResult.push({ gene, value, cpic: n });
  }
  found.sort((a, b) => ORDER.indexOf(a.classification) - ORDER.indexOf(b.classification) || a.drug.localeCompare(b.drug));
  const notes = perResult.map((p) => `${p.gene} ${p.value}: ${p.cpic} CPIC recommendation${p.cpic === 1 ? '' : 's'} that differ from the normal result's.`);
  for (const f of found.slice(0, 80)) notes.push(`${f.drug}${f.population && f.population !== 'general' ? ` (${f.population.trim()})` : ''}, ${f.result}, CPIC ${f.classification}: "${f.recommendation.length > 220 ? `${f.recommendation.slice(0, 217)}…` : f.recommendation}"`);
  if (found.length > 80) notes.push(`And ${found.length - 80} more rows, in the CSV.`);
  const genes = [...new Set(entered.map(([g]) => g))];
  const fda = fdaRows(null, genes, now);
  if (fda.rows.length) notes.push(`The FDA table lists ${fda.rows.length} row${fda.rows.length === 1 ? '' : 's'} for ${genes.join(', ')}, each naming its own affected subgroup (not matched to these results): ${fda.rows.map((r) => `${r[1]} (${r[2]}, section ${r[0]}: ${r[3]})`).join('; ')}.`);
  else notes.push(...fda.lines);
  notes.push(footer(ix));
  const n = found.length;
  return { valid: true, results: perResult, found, fdaRows: fda.rows.length, flag: n ? 'changed-recommendations' : 'none-changed', abnormal: found.some((f) => f.classification === 'Strong'),
    band: `${n} CPIC recommendation${n === 1 ? '' : 's'} across ${new Set(found.map((f) => f.drug)).size} drug${new Set(found.map((f) => f.drug)).size === 1 ? '' : 's'} differ from the normal result's for ${entered.length} result${entered.length === 1 ? '' : 's'}${found.some((f) => f.classification === 'Strong') ? `, ${found.filter((f) => f.classification === 'Strong').length} classed Strong` : ''}.`,
    bandLabel: `${n} changed`, notes, note: NOTE,
    csv: csvText(['result', 'drug', 'population', 'CPIC classification', 'CPIC recommendation'], found.map((f) => [f.result, f.drug, (f.population || '').trim(), f.classification, f.recommendation])) };
}
