// spec-v1630 tool 13: is a drug, or each drug on a formulary list, on the NIOSH 2024 hazardous drug list?
//
// Owner decision 5 (scope-pharmacy-practice.md), October 15, 2026: a decider over a list passes admission
// rule 1 on the substitution-check precedent, so long as a miss says "not on this edition of this list"
// and never "not hazardous". The list is lib/niosh-hazardous-drugs-2024.js. The 2024 update reviewed
// drugs approved or given new FDA safety warnings from January 2014 through December 2015, plus drugs with
// manufacturer's special handling information (MSHI) NIOSH added as it learned of them; every miss says so.
// Matching is on the generic name, case and spacing ignored, then once more with a trailing salt word
// removed (said when it is used). Entries that only contain the name are shown, not counted as matches.
// No handling or containment requirement is stated: those are USP <800> and the site's own assessment.
//
// Pure: no DOM, no clock, no network.

import { TABLE1, TABLE2, REMOVED, SOURCE } from './niosh-hazardous-drugs-2024.js';
import { csvText } from './csv-out.js';

const norm = (s) => String(s ?? '').toLowerCase().replace(/\s*\/\s*/g, '/').replace(/[^\w/ -]+/g, ' ').replace(/\s+/g, ' ').trim();
const SALT = /\s(sodium|potassium|calcium|hydrochloride|hcl|dihydrochloride|mesylate|sulfate|citrate|acetate|maleate|tartrate|phosphate|besylate|succinate|fumarate|tosylate|bromide|chloride|monohydrate|disodium)$/;
const ENTRIES = new Map([
  ...TABLE1.map(([drug, mshi, bla, iarc, star]) => [norm(drug), { table: 1, drug, mshi, bla, iarc, star }]),
  ...TABLE2.map(([drug, bla, devRepro, third]) => [norm(drug), { table: 2, drug, bla, devRepro, third }]),
]);
// An entry naming one drug two ways ("valproate/valproic acid") answers to either name; a combination
// ("estrogen/progesterone combinations") does not split.
for (const [k, e] of [...ENTRIES]) {
  if (k.includes('/') && !/combinations?$/.test(k)) for (const part of k.split('/')) if (!ENTRIES.has(part)) ENTRIES.set(part, { ...e, alias: true });
}
const GONE = new Map(REMOVED.map(([drug, note]) => [norm(drug.replace(/\s*\(.*\)$/, '')), { drug, note }]));
const EDITION = `NIOSH ${SOURCE.edition}`;
const MISS_NOTE = 'A drug not on the list is not shown to be safe to handle: the 2024 update reviewed drugs approved or given new FDA safety warnings from January 2014 through December 2015, plus drugs with manufacturer\'s special handling information NIOSH added as it learned of them.';
const NOTE = `The ${EDITION} list, matched on the generic name. Handling and containment are set by USP <800> and the site's own assessment of risk, not by this lookup.`;

function lookOne(raw) {
  const q = norm(raw);
  let hit = ENTRIES.get(q); let via = null;
  if (!hit && SALT.test(q)) { const base = q.replace(SALT, ''); hit = ENTRIES.get(base); if (hit) via = `matched as "${base}" with the salt word removed`; }
  if (hit) return { query: raw, status: 'listed', ...hit, via };
  const base = SALT.test(q) ? q.replace(SALT, '') : q;
  const removed = GONE.get(q) || GONE.get(base);
  if (removed) return { query: raw, status: 'removed', removedNote: removed.note };
  const containing = q.length >= 4 ? [...ENTRIES.values()].filter((e) => !e.alias && norm(e.drug).split(/[ /-]/).includes(base)).map((e) => e.drug) : [];
  return { query: raw, status: 'not-listed', containing };
}

function describe(r) {
  if (r.status === 'removed') return `${r.query}: removed from the list after the 2016 update. NIOSH: ${r.removedNote}`;
  if (r.status === 'not-listed') return `${r.query}: not on the ${EDITION} list.${r.containing.length ? ` Entries that contain the name, not counted as a match: ${r.containing.join('; ')}.` : ''}`;
  const how = r.via ? ` (${r.via})` : '';
  if (r.table === 1) return `${r.drug}${how}: Table 1, which holds drugs with MSHI in the package insert and/or that meet NIOSH's hazardous-drug definition and are classed as known or probable human carcinogens. MSHI: ${r.mshi ? 'yes' : 'no'}. Under a biologics license application: ${r.bla ? 'yes' : 'no'}.${r.iarc ? ` IARC and NTP: ${r.iarc}${r.star ? ', listed in Table 1 because it has MSHI' : ''}.` : ''}`;
  return `${r.drug}${how}: Table 2, which holds drugs that meet NIOSH's hazardous-drug definition without MSHI and are not known or probable human carcinogens. Under a biologics license application: ${r.bla ? 'yes' : 'no'}. Only a developmental and/or reproductive hazard: ${r.devRepro ? `yes${r.third ? ', and only in the third trimester of pregnancy' : ''}` : 'no'}.`;
}

export function hazardousDrugListCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const single = typeof o.drug === 'string' ? o.drug.trim() : '';
  const lines = typeof o.list === 'string' ? o.list.split(/\r?\n/).map((x) => x.replace(/^﻿/, '').split(/[,\t]/)[0].trim()).filter(Boolean) : [];
  if (!single && !lines.length) return { valid: false, message: 'Enter a generic drug name, or a list of generic names, one per line.' };
  if (lines.length > 5000) return { valid: false, message: 'Enter at most 5,000 names.' };
  if (single && !lines.length) {
    const r = lookOne(single);
    const notes = [describe(r)];
    if (r.status !== 'listed') notes.push(MISS_NOTE);
    return { valid: true, edition: EDITION, result: r, flag: r.status === 'listed' ? `table-${r.table}` : r.status, abnormal: r.status === 'listed',
      band: r.status === 'listed' ? `${r.drug} is on the ${EDITION} list, Table ${r.table}.` : r.status === 'removed' ? `${single} was removed from the list after the 2016 update.` : `${single} is not on the ${EDITION} list.`,
      bandLabel: r.status === 'listed' ? `Table ${r.table}` : r.status === 'removed' ? 'Removed after 2016' : 'Not on this list', notes, note: NOTE };
  }
  const seen = new Set(); const results = [];
  for (const name of lines) { const k = norm(name); if (seen.has(k)) continue; seen.add(k); results.push(lookOne(name)); }
  const t1 = results.filter((r) => r.status === 'listed' && r.table === 1); const t2 = results.filter((r) => r.status === 'listed' && r.table === 2);
  const removed = results.filter((r) => r.status === 'removed'); const misses = results.filter((r) => r.status === 'not-listed');
  const notes = [`${results.length} distinct name${results.length === 1 ? '' : 's'}: ${t1.length} in Table 1, ${t2.length} in Table 2, ${removed.length} removed after 2016, ${misses.length} not on the list.`];
  for (const r of [...t1, ...t2, ...removed]) notes.push(describe(r));
  if (misses.length) notes.push(`Not on the list: ${misses.slice(0, 60).map((r) => r.query).join(', ')}${misses.length > 60 ? `, and ${misses.length - 60} more` : ''}.`, MISS_NOTE);
  if (single) notes.push('A single name and a list were both entered; the list was used.');
  const csv = csvText(['name entered', 'status', 'NIOSH entry', 'table', 'MSHI', 'BLA', 'IARC and NTP', 'developmental or reproductive only'],
    results.map((r) => [r.query, r.status, r.drug || '', r.table || '', r.table === 1 ? r.mshi : '', r.status === 'listed' ? r.bla : '', r.iarc || '', r.table === 2 ? r.devRepro : '']));
  return { valid: true, edition: EDITION, results, table1: t1.length, table2: t2.length, removed: removed.length, notListed: misses.length, csv,
    flag: t1.length + t2.length ? 'hazardous-drugs-found' : 'none-found', abnormal: t1.length + t2.length > 0,
    band: `${t1.length + t2.length} of ${results.length} name${results.length === 1 ? '' : 's'} on the ${EDITION} list (${t1.length} in Table 1, ${t2.length} in Table 2).`,
    bandLabel: `${t1.length + t2.length} on the list`, notes, note: NOTE };
}
