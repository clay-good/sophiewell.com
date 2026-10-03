// spec-v1501 §3, batch mode for form tools: a single-case tool whose inputs are all scalar runs over a
// CSV, one case per row. The tool's own compute function is called per row; there is no second
// implementation. An optional column the file does not have, or leaves blank, takes the form's answer, so
// a counselor's list of households needs only the size and income columns, with the region and program
// chosen once above. A required column is the row's own.
//
// Each tool lists its upload fields (id = the compute function's argument name) and, for a choice, its
// options: a cell matches an option by value or by its words, ignoring case, or by one of the aliases.
// A cell that matches nothing is passed as written, and the compute function refuses it in its own words.

import { fplPercent, REGIONS, PROGRAMS, PERIODS } from './income-screens-v1506.js';

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export const BATCH_TOOLS = {
  'fpl-percent': {
    compute: fplPercent,
    noun: 'household',
    fields: [
      { id: 'reference', label: 'Household reference', sensitive: true, synonyms: ['household', 'family', 'name', 'client', 'case', 'case number', 'id'] },
      { id: 'size', label: 'Household size', required: true, synonyms: ['household size', 'family size', 'people in household', 'persons', 'size'] },
      { id: 'income', label: 'Household income', required: true, synonyms: ['household income', 'annual income', 'family income', 'income', 'magi'] },
      { id: 'period', label: 'Income is annual or monthly', options: PERIODS, aliases: { annually: 'annual', yearly: 'annual', year: 'annual', month: 'monthly' }, synonyms: ['income period', 'period', 'frequency'] },
      { id: 'region', label: 'Where the household lives', options: REGIONS, aliases: { us: 'us', '48 states': 'us', contiguous: 'us', ak: 'ak', hi: 'hi' }, synonyms: ['region', 'state'] },
      { id: 'program', label: 'Program', options: PROGRAMS, aliases: { medicaid: 'current', chip: 'current', current: 'current', ptc: 'ptc', marketplace: 'ptc', 'premium tax credit': 'ptc' }, synonyms: ['program'] },
      { id: 'year', label: 'Coverage or program year', synonyms: ['year', 'coverage year', 'program year'] },
      { id: 'threshold', label: 'Program limit (percent)', synonyms: ['limit', 'program limit', 'threshold', 'fpl limit'] },
    ],
  },
};

// A cell's value for a field: an option's value when the cell names one, otherwise the cell as written.
export function cellValue(field, cell) {
  const raw = String(cell ?? '').trim();
  if (!field.options || !raw) return raw;
  const n = norm(raw);
  const hit = field.options.find((o) => norm(o.value) === n || norm(o.text) === n);
  if (hit) return hit.value;
  return (field.aliases && field.aliases[n]) || raw;
}

// rowArgs(tool, row, defaults) -> the compute function's arguments: the row's cells over the form's answers.
// A required field is always the row's own, even blank: one household's missing income must be refused,
// never answered with the income typed in the form.
export function rowArgs(tool, row, defaults = {}) {
  const args = { ...defaults };
  for (const field of tool.fields) {
    const v = cellValue(field, row[field.id]);
    if (v !== '' || field.required) args[field.id] = v;
  }
  return args;
}

// runBatch(id, rows, defaults, now) -> a result the upload workbench shows: a summary, and per row its answer or refusal.
export function runBatch(id, rows, defaults = {}, now) {
  const tool = BATCH_TOOLS[id];
  if (!tool) return { valid: false, message: 'This tool does not run over a file.' };
  const out = rows.map((row) => {
    const r = tool.compute(rowArgs(tool, row, defaults), now);
    return r.valid ? { ok: true, label: r.bandLabel, detail: r.band } : { ok: false, label: 'Needs corrected inputs', detail: r.message };
  });
  const ok = out.filter((r) => r.ok).length;
  const bad = out.length - ok;
  const plural = (n, w) => `${n.toLocaleString('en-US')} ${w}${n === 1 ? '' : 's'}`;
  return {
    valid: true,
    rows: out,
    band: `${plural(ok, tool.noun)} of ${out.length.toLocaleString('en-US')} computed.${bad ? ` ${plural(bad, 'row')} need${bad === 1 ? 's' : ''} corrected inputs.` : ''}`,
    bandLabel: `${ok.toLocaleString('en-US')} computed`,
    abnormal: bad > 0,
    notes: [
      'A column the file does not have, other than the household size and income, takes the answer entered above.',
      ...(bad ? ['Rows that need corrected inputs say why in the result table and download.'] : []),
    ],
    note: 'Each row is computed by the same function as the form.',
  };
}

// The columns appended to the download.
export const BATCH_RESULT_HEADERS = ['sophiewell_result', 'sophiewell_detail'];
export const batchResultRow = (r) => [r.label, r.detail];
