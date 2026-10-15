// spec-v1635 tool 16: DPYD activity score to CPIC's fluoropyrimidine recommendation (owner decision 12,
// October 15, 2026).
//
// The reader enters the DPYD variants the report lists (two or more, "Reference" for a copy with none
// found) or the activity score the report prints. CPIC's gene note: the score is "calculated as the sum of
// the two DPYD variants with the lowest variant activity value"; each value is read from CPIC's allele
// table. The recommendation is CPIC's row for fluorouracil or capecitabine at that score, printed whole
// with its classification (lib/cpic-gene-drug-v1640.js does the lookup). For capecitabine the XELODA
// label's section 2.1 is quoted beside it, a label row under spec-v1628 section 1: "Prior to initiating
// XELODA, test patients for genetic variants of the DPYD gene unless immediate treatment is necessary"
// and "Avoid use of XELODA in patients known to have certain homozygous or compound heterozygous DPYD
// variants that result in complete DPD deficiency" (version 32, February 5, 2026, re-read October 15,
// 2026). No label line is shown for fluorouracil.
//
// Pure: no DOM, no network; the tables and `now` are passed in.

import { cpicIndex, findAllele } from './cpic-tables.js';
import { cpicGeneDrug } from './cpic-gene-drug-v1640.js';
import { labelRow } from './label-row.js';
import { inputFault } from './num.js';

export const LABEL = { setId: 'e702d84d-7162-4751-bf37-d724cc7e45a5' };
export const DRUGS = [{ value: 'fluorouracil', text: 'Fluorouracil' }, { value: 'capecitabine', text: 'Capecitabine' }];
const XELODA = ['"Prior to initiating XELODA, test patients for genetic variants of the DPYD gene unless immediate treatment is necessary."', '"Avoid use of XELODA in patients known to have certain homozygous or compound heterozygous DPYD variants that result in complete DPD deficiency."'];
const NOTE = 'CPIC\'s recommendation for the DPYD activity score, quoted whole, and for capecitabine the label\'s testing sentence. It does not choose a dose.';
const fmt = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

export function dpydFluoropyrimidineDose(input = {}, db, now) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = String(o.drug ?? '').trim().toLowerCase();
  if (!DRUGS.some((d) => d.value === drug)) return { valid: false, message: 'Choose fluorouracil or capecitabine.' };
  const ix = cpicIndex(db, now);
  if (!ix.ok) return { valid: false, message: `${ix.why} No CPIC recommendation is shown.` };
  const names = String(o.variants ?? '').split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean);
  const scoreGiven = String(o.activityScore ?? '').trim() !== '';
  if (names.length && scoreGiven) return { valid: false, message: 'Enter the variants or the activity score, not both.' };
  const notes = [];
  let score;
  if (scoreGiven) {
    const f = inputFault([['the DPYD activity score', o.activityScore, 0, 2, '']]);
    if (f) return { valid: false, message: f };
    score = Number(o.activityScore);
    if (score * 2 !== Math.round(score * 2)) return { valid: false, message: 'A DPYD activity score is 0, 0.5, 1, 1.5 or 2.' };
  } else {
    if (names.length > 50) return { valid: false, message: 'Enter the variants the report lists, at most 50.' };
    if (names.length < 2) return { valid: false, message: 'Enter at least two DPYD variants as the report lists them, with "Reference" for a copy where none was found, or enter the activity score. A blank is not read as normal.' };
    const rows = [];
    for (const n of names) {
      const a = findAllele(ix, 'DPYD', n);
      if (!a) return { valid: false, message: `"${n}" is not in CPIC's DPYD variant list. Enter it as the report prints it.` };
      if (!a.value || a.value === 'n/a') return { valid: false, message: `CPIC has not assigned an activity value to DPYD ${a.name}, so no score is given.` };
      rows.push(a);
    }
    const low = [...rows].sort((a, b) => Number(a.value) - Number(b.value)).slice(0, 2);
    score = Number(low[0].value) + Number(low[1].value);
    notes.push(...rows.map((a) => `${a.name}: ${a.fn}, activity value ${a.value}.`), `Activity score: the two lowest values, ${low[0].value} + ${low[1].value} = ${fmt(score)} (CPIC: "the sum of the two DPYD variants with the lowest variant activity value").`);
  }
  const rule = (ix.rules.get('DPYD') || []).find((r) => Number(r.score) === score);
  const r = cpicGeneDrug({ drug, results: `DPYD: ${fmt(score)}` }, db, now);
  if (!r.valid) return r;
  const out = { valid: true, drug, activityScore: score, phenotype: rule ? rule.result : null, classification: r.classification, recommendation: r.recommendation, labelLinks: r.labelLinks || [] };
  notes.push(...r.notes.filter((n) => !/^Source: CPIC/.test(n)));
  if (drug === 'capecitabine') {
    const row = labelRow(LABEL.setId, now);
    if (row.answers) notes.push(`XELODA label, section 2.1 (${row.edition}): ${XELODA.join(' ')}`);
    else notes.push(`The XELODA label's testing sentences are withheld: ${row.why}.`);
    out.labelLinks = [...out.labelLinks, { text: 'XELODA label on DailyMed', url: row.url }];
  }
  notes.push(r.notes.find((n) => /^Source: CPIC/.test(n)));
  return { ...out, flag: r.flag, abnormal: score < 2,
    band: `DPYD activity score ${fmt(score)}${rule ? ` (${rule.result})` : ''}, ${drug}: CPIC (${r.classification}): "${r.recommendation}"`, bandLabel: rule ? rule.result : `Score ${fmt(score)}`, notes: notes.filter(Boolean), note: NOTE };
}
