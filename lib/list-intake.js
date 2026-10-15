// File intake for the tools that read a pasted list, one row per line in a fixed column order (SUPD, the
// concurrent-use measures, the MTM service clock). A file with a header row is reordered into that order
// by its column names; a file with no header row is passed as it is. A comma inside a cell (two dates in
// one cell) becomes a semicolon, the separator those tools read inside a cell. Not a tool of its own.
// Pure: no DOM.

import { rowsOf } from './csv-rows.js';

const c = (label, re, required = false) => ({ label, re, required });
const MEMBER = /^(member|member id|member reference|beneficiary|enrollee|id)$/;
export const LIST_COLUMNS = {
  'supd-members': [c('member', MEMBER, true), c('age', /^age\b/, true), c('continuously enrolled', /^(continuously enrolled|continuous enrollment|ce)$/, true), c('exclusion', /^exclusions?$/)],
  'supd-fills': [c('member', MEMBER, true), c('fill date', /^(fill date|date of service|date|service date)$/, true), c('class', /^(class|drug class)$/, true)],
  'cum-members': [c('member', MEMBER, true), c('age', /^age\b/, true), c('continuously enrolled', /^(continuously enrolled|continuous enrollment|ce)$/, true), c('exclusions', /^exclusions?$/)],
  'cum-fills': [c('member', MEMBER, true), c('fill date', /^(fill date|date of service|date|service date)$/, true), c('days supply', /^(days supply|days' supply|day supply|days)$/, true), c('medication', /^(medication|drug|drug name)$/, true), c('class', /^(class|drug class)$/, true)],
  'msc-enrollees': [c('enrollee', MEMBER, true), c('MTM enrollment date', /^(mtm enrollment date|enrollment date|enrolled)$/, true), c('enrolled last year', /^(enrolled last year|prior year|carried over)$/, true), c('last CMR offer date', /^(last cmr offer date|last offer|last cmr offer)$/), c('CMR dates', /^(cmr dates?|cmrs?)$/), c('TMR dates', /^(tmr dates?|tmrs?)$/), c('opt-out date', /^(opt-out date|opt out date|opt-out|opt out)$/), c('age', /^age\b/, true), c('hospice', /^hospice$/, true), c('met the CMS criteria', /^(met|met cms criteria|met the cms criteria|targeted)$/, true)],
};

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// listFromFile(text, key) -> { text, note } or { message }.
export function listFromFile(text, key) {
  const cols = LIST_COLUMNS[key];
  if (!cols) return { message: 'This list does not take a file.' };
  const rows = rowsOf(String(text ?? '')).filter((r) => r.some((x) => String(x ?? '').trim() !== ''));
  if (!rows.length) return { message: 'The file has no rows.' };
  const head = rows[0].map(norm);
  const cell = (v) => String(v ?? '').trim().replace(/,/g, ';');
  if (!head.some((h) => cols[0].re.test(h))) {
    return { text: rows.map((r) => r.map(cell).join(', ')).join('\n'), note: 'The file has no header row, so its columns are read in the order the list expects.' };
  }
  const at = cols.map((col) => head.findIndex((h) => col.re.test(h)));
  const missing = cols.filter((col, i) => col.required && at[i] < 0).map((col) => col.label);
  if (missing.length) return { message: `The file's header has no column for ${missing.join(', ')}. Its columns are: ${rows[0].map((x) => String(x ?? '').trim()).join(', ').slice(0, 160)}.` };
  const out = rows.slice(1).map((r) => at.map((i) => (i < 0 ? '' : cell(r[i]))).join(', ').replace(/(, )+$/, ''));
  return { text: out.join('\n'), note: `${out.length} row${out.length === 1 ? '' : 's'} read by column name.` };
}
