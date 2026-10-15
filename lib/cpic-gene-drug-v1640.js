// spec-v1640 tool 4: CPIC's recommendation and the FDA table's statement for a drug and a genotype
// result, side by side (owner decision 12, October 15, 2026).
//
// The reader names the drug and enters each result as the report prints it, one per line ("CYP2C19:
// Poor Metabolizer", "CYP2D6 1.0", "HLA-B*15:02 positive"). CPIC keys CYP2D6, CYP2C9 and DPYD rows by
// activity score and HLA rows by allele status; every other gene by phenotype. A gene of a two-gene
// guideline that is not entered is "No Result" where CPIC has that row, and asked for otherwise. The
// match is exact on (drug, population, key); there is no nearest row. CPIC's text is quoted whole with its
// classification, comments, guideline and level; the FDA rows for the drug and the genes entered are
// quoted whole beside it (lib/fda-pgx-associations-2026.js). The tool does not decide whether the result
// is inside FDA's "affected subgroup" wording, and it does not reconcile the two.
// When the matched recommendation is one whose arithmetic a person has read (lib/cpic-dose-factors-v1640.js,
// keyed by the SHA-256 of CPIC's own sentence), and the reader enters their own dose, that arithmetic is
// shown under CPIC's text. The dose is always the reader's; none is supplied here, and a reworded CPIC
// sentence drops the arithmetic rather than changing it.
// Not answered: warfarin (CPIC: its recommendation "does not follow simple diplotype to phenotype
// translation") and drugs CPIC has a guideline for but no rows in its database (ondansetron, tropisetron).
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicIndex, footer } from './cpic-tables.js';
import { datedValue } from './dated-data.js';
import { ROWS as FDA_ROWS, SOURCE as FDA, SECTIONS } from './fda-pgx-associations-2026.js';
import { doseArithmetic } from './cpic-dose-factors-v1640.js';

const FDA_DATED = { fda: { ...FDA, values: { ok: true } } };
const NOTE = 'CPIC\'s recommendation and the FDA table\'s statement, each quoted as published, for the result entered. Neither is reconciled with the other, and the tool does not choose a drug or a dose.';
const ABBR = { pm: 'Poor Metabolizer', im: 'Intermediate Metabolizer', nm: 'Normal Metabolizer', rm: 'Rapid Metabolizer', um: 'Ultrarapid Metabolizer' };
const lc = (s) => String(s ?? '').trim().toLowerCase();
const canonScore = (s) => { const m = /^(≥|>=)?\s*(\d+(?:\.\d+)?)$/.exec(String(s).trim()); return m ? `${m[1] ? '≥' : ''}${Number(m[2]).toFixed(m[2].includes('.') && m[2].split('.')[1].length > 1 ? 2 : 1)}` : null; };

const recIndex = new WeakMap();
function drugs(db) {
  if (!recIndex.has(db)) {
    const m = new Map();
    for (const r of db.rec || []) { const k = lc(r.drug); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
    recIndex.set(db, m);
  }
  return recIndex.get(db);
}

// drugList(db) -> every drug with CPIC rows or an FDA row, for the picker.
export function drugList(db) {
  const names = new Set([...(db && db.rec ? drugs(db).values() : [])].map((rows) => rows[0].drug));
  for (const r of FDA_ROWS) if (![...names].some((n) => lc(n) === lc(r[1]))) names.add(r[1].toLowerCase());
  return [...names].sort((a, b) => a.localeCompare(b));
}

// The value the reader typed, as CPIC keys it for this gene in this drug's rows.
export function keyValue(raw, legal) {
  const v = String(raw).trim().replace(/>=/g, '≥');
  const exact = legal.find((x) => lc(x) === lc(v));
  if (exact) return exact;
  const ab = ABBR[lc(v)] || (/^likely (pm|im)$/.test(lc(v)) ? `Likely ${ABBR[lc(v).slice(7)]}` : null) || (/^possible im$/.test(lc(v)) ? 'Possible Intermediate Metabolizer' : null);
  if (ab && legal.includes(ab)) return ab;
  const sc = canonScore(v);
  if (sc) { const hit = legal.find((x) => canonScore(x) === sc); if (hit) return hit; }
  const pos = /^(\*[\d:]+)?\s*(positive|negative)$/i.exec(v);
  if (pos) { const cands = legal.filter((x) => lc(x).endsWith(lc(pos[2])) && (!pos[1] || lc(x).startsWith(lc(pos[1])))); if (cands.length === 1) return cands[0]; }
  return null;
}

// fdaRows(drug, genes, now): the FDA table's rows for a drug (and these genes), or for these genes across
// every drug when drug is null; past the snapshot's check date, a line that says so and no rows.
export function fdaRows(drug, genes, now) {
  const v = datedValue('fda', 'ok', now instanceof Date ? now : undefined, FDA_DATED);
  const rows = FDA_ROWS.filter((r) => (drug === null || lc(r[1]) === lc(drug)) && (!genes || genes.includes(r[2])));
  if (v.expired) return { lines: [`FDA table snapshot (${FDA.edition}) is past its check date; read the current ${FDA.source.label}.`], rows: [] };
  return { rows, lines: rows.map((r) => `FDA, section ${r[0]} (${SECTIONS[r[0]]}), ${r[2]}, affected subgroups "${r[3]}": "${r[4]}"`) };
}

export function cpicGeneDrug(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const ix = cpicIndex(db, now);
  const drug = lc(o.drug);
  if (!drug) return { valid: false, message: 'Choose the drug.' };
  if (!ix.ok) {
    const f = fdaRows(drug, undefined, now);
    return { valid: false, message: `${ix.why} No CPIC recommendation is shown.${f.lines.length ? ` ${f.lines.join(' ')}` : ''}` };
  }
  const rows = drugs(db).get(drug) || [];
  const fdaAll = FDA_ROWS.filter((r) => lc(r[1]) === drug);
  const pairs = (db.pair || []).filter((p) => lc(p.drug) === drug);
  const guide = (name) => (db.guideline || []).find((g) => g.name === name);
  if (!rows.length) {
    const named = pairs.filter((p) => p.guideline);
    if (!named.length && !fdaAll.length) return { valid: false, message: `Neither CPIC's database nor the FDA table has a row for "${o.drug}". Check the generic name.` };
    const notes = [];
    for (const p of named) {
      const g = guide(p.guideline);
      const why = g && g.notes !== null && g.notes !== undefined && ix.str(g.notes) ? ` CPIC's note: "${ix.str(g.notes)}"` : '';
      notes.push(`CPIC has a guideline for ${p.drug} and ${p.gene} (${p.guideline}${g && g.latest ? `, ${g.latest}` : ''}). Its recommendation table is not in the CPIC database as of ${ix.edition}.${why}`);
    }
    if (!named.length) notes.push(`CPIC has no recommendation rows for ${o.drug}.`);
    const f = fdaRows(drug, undefined, now);
    notes.push(...f.lines, footer(ix));
    const head = named.length ? `CPIC has a guideline for ${drug}, but no recommendation rows for it in the CPIC database as of ${ix.edition}` : `CPIC has no recommendation rows for ${drug}`;
    return { valid: true, drug, matched: false, flag: 'no-cpic-rows', labelLinks: named.map((p) => guide(p.guideline)).filter(Boolean).map((x) => ({ text: `CPIC guideline: ${x.name}`, url: x.url })), band: `${head}${f.rows.length ? '; the FDA table\'s rows are shown' : ''}.`, bandLabel: 'No CPIC rows', notes, note: NOTE };
  }
  const pops = [...new Set(rows.map((r) => r.pop))];
  let pop = pops[0];
  if (pops.length > 1) {
    pop = pops.find((p) => lc(p) === lc(o.population));
    if (!pop) return { valid: false, message: `CPIC splits ${rows[0].drug} by population. Choose one: ${pops.join('; ')}.` };
  }
  const these = rows.filter((r) => r.pop === pop);
  const genes = [...new Set(these.flatMap((r) => Object.keys(r.key)))];
  const legal = Object.fromEntries(genes.map((g) => [g, [...new Set(these.map((r) => r.key[g]).filter(Boolean))]]));
  const given = {};
  for (const line of String(o.results ?? '').split(/\r?\n|;/)) {
    const t = line.trim();
    if (!t) continue;
    const m = /^(HLA-[A-Z]+|[A-Z0-9]+(?:-[A-Z0-9]+)?)\s*(?::|\s|(?=\*))\s*(.+)$/i.exec(t);
    const gene = m && genes.find((g) => lc(g) === lc(m[1]));
    if (!gene) return { valid: false, message: `"${t}": ${rows[0].drug}'s CPIC rows use ${genes.join(' and ')}. Enter each as "gene: result".` };
    const k = keyValue(m[2], legal[gene]);
    if (!k) return { valid: false, message: `"${m[2].trim()}" is not a ${gene} result CPIC keys ${rows[0].drug} by. CPIC's values: ${legal[gene].join('; ')}.` };
    // The same gene twice with two different results is not a question with one answer; taking the last
    // line would answer confidently from half the report.
    if (given[gene] !== undefined && given[gene] !== k) return { valid: false, message: `${gene} is given twice, as "${given[gene]}" and "${k}". Enter one result for each gene.` };
    given[gene] = k;
  }
  for (const g of genes) {
    if (given[g]) continue;
    if (legal[g].includes('No Result')) { given[g] = 'No Result'; continue; }
    return { valid: false, message: `Enter the ${g} result as the report prints it (CPIC keys ${rows[0].drug} by ${g === 'CYP2D6' || g === 'CYP2C9' || g === 'DPYD' ? 'activity score' : /^HLA/.test(g) ? 'allele status' : 'phenotype'}: ${legal[g].slice(0, 8).join('; ')}${legal[g].length > 8 ? '; …' : ''}).` };
  }
  const hit = these.find((r) => genes.every((g) => r.key[g] === given[g]));
  const f = fdaRows(drug, genes, now);
  const keyText = genes.map((g) => `${g} ${given[g]}`).join(', ');
  const levels = pairs.filter((p) => genes.includes(p.gene)).map((p) => `${p.gene} level ${p.level}`).join(', ');
  const g = guide((pairs.find((p) => p.guideline) || {}).guideline);
  const gl = g ? `Guideline: ${g.name} (${g.first && g.latest && g.first !== g.latest ? `${g.first}; updated ${g.latest}` : g.latest || g.first || 'year not listed'}).${levels ? ` CPIC level: ${levels}.` : ''}` : '';
  const labelLinks = g ? [{ text: `CPIC guideline: ${g.name}`, url: g.url }] : [];
  const notes = [];
  if (!hit) {
    notes.push(`CPIC has no row for ${keyText}${pops.length > 1 ? ` (${pop})` : ''}.`, ...f.lines, gl, footer(ix));
    return { valid: true, drug: rows[0].drug, matched: false, flag: 'no-row', labelLinks, band: `${rows[0].drug}, ${keyText}: CPIC has no row for this combination.`, bandLabel: 'No CPIC row', notes: notes.filter(Boolean), note: NOTE };
  }
  for (const [gene, i] of Object.entries(hit.impl)) notes.push(`CPIC implication (${gene}): "${ix.str(i)}"`);
  notes.push(`CPIC recommendation: "${ix.str(hit.rec)}"`, `Classification of recommendation: ${hit.cls}.`);
  if (ix.str(hit.comments) && ix.str(hit.comments) !== 'n/a') notes.push(`CPIC comments: "${ix.str(hit.comments)}"`);
  if (pops.length > 1) notes.push(`Population: ${pop}.`);
  // The side table's arithmetic, when this sentence is one it was read from and a dose was entered.
  const arith = doseArithmetic({ hash: hit.sha, drug, dose: o.dose, maxDose: o.maxDose, weight: o.weight });
  if (arith.fault) return { valid: false, message: arith.fault };
  if (arith.lines) notes.push(...arith.lines);
  else if (arith.ask) notes.push(arith.ask);
  notes.push(...(f.lines.length ? f.lines : ['The FDA table has no row for this drug and gene.']), gl, footer(ix));
  return { valid: true, drug: rows[0].drug, matched: true, labelLinks, key: given, population: pop, classification: hit.cls, recommendation: ix.str(hit.rec), fdaRows: f.rows.length,
    arithmetic: arith.values || null,
    flag: `cpic-${lc(hit.cls).replace(/[^a-z]+/g, '-')}`, abnormal: hit.cls === 'Strong' || hit.cls === 'Moderate',
    band: `${rows[0].drug}, ${keyText}: CPIC (${hit.cls}): "${ix.str(hit.rec)}"`, bandLabel: `CPIC ${hit.cls}`, notes: notes.filter(Boolean), note: NOTE };
}
