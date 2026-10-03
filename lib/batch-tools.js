// spec-v1501 §3, batch mode for form tools: a single-case tool whose inputs are all scalar runs over a
// CSV, one case per row. The tool's own compute function is called per row; there is no second
// implementation. A field marked `fromForm` is context the whole file shares (where the households live,
// which program, which year): a blank or missing cell takes the form's answer, so a counselor's list of
// households needs only the size and income columns. Every other field is a fact about the row and is the
// row's own, blank or not: one household's missing income, or one person's missing wages, is never
// filled from what was typed in the form. A tool's `formOnly` arguments (a hospital's discount tiers) are
// not columns at all: they come from the form for every row.
//
// Each tool lists its upload fields (id = the compute function's argument name) and, for a choice, its
// options: a cell matches an option by value or by its words, ignoring case, or by one of the aliases.
// A cell that matches nothing is passed as written, and the compute function refuses it in its own words.

import { fplPercent, REGIONS, PROGRAMS, PERIODS } from './income-screens-v1506.js';
import { extraHelpMspScreen, MARITAL, YES_NO } from './msp-lis-v1507.js';
import { fapDiscount } from './hospital-fap-v1508.js';

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export const BATCH_TOOLS = {
  'fpl-percent': {
    compute: fplPercent,
    noun: ['household', 'households'],
    fields: [
      { id: 'reference', label: 'Household reference', sensitive: true, synonyms: ['household', 'family', 'name', 'client', 'case', 'case number', 'id'] },
      { id: 'size', label: 'Household size', required: true, synonyms: ['household size', 'family size', 'people in household', 'persons', 'size'] },
      { id: 'income', label: 'Household income', required: true, synonyms: ['household income', 'annual income', 'family income', 'income', 'magi'] },
      { id: 'period', label: 'Income is annual or monthly', fromForm: true, options: PERIODS, aliases: { annually: 'annual', yearly: 'annual', year: 'annual', month: 'monthly' }, synonyms: ['income period', 'period', 'frequency'] },
      { id: 'region', label: 'Where the household lives', fromForm: true, options: REGIONS, aliases: { us: 'us', '48 states': 'us', contiguous: 'us', ak: 'ak', hi: 'hi' }, synonyms: ['region', 'state'] },
      { id: 'program', label: 'Program', fromForm: true, options: PROGRAMS, aliases: { medicaid: 'current', chip: 'current', current: 'current', ptc: 'ptc', marketplace: 'ptc', 'premium tax credit': 'ptc' }, synonyms: ['program'] },
      { id: 'year', label: 'Coverage or program year', fromForm: true, synonyms: ['year', 'coverage year', 'program year'] },
      { id: 'threshold', label: 'Program limit (percent)', fromForm: true, synonyms: ['limit', 'program limit', 'threshold', 'fpl limit'] },
    ],
  },
  'extra-help-msp-screen': {
    compute: extraHelpMspScreen,
    noun: ['person', 'people'],
    fields: [
      { id: 'reference', label: 'Person reference', sensitive: true, synonyms: ['person', 'beneficiary', 'name', 'client', 'case', 'case number', 'id', 'member'] },
      { id: 'marital', label: 'Marital status', required: true, options: MARITAL, aliases: { single: 'single', married: 'married', 'not married': 'single', widowed: 'single', divorced: 'single' }, synonyms: ['marital status', 'marital', 'married'] },
      { id: 'unearned', label: 'Monthly unearned income', required: true, synonyms: ['unearned income', 'monthly unearned income', 'social security', 'unearned'] },
      { id: 'earned', label: 'Monthly earned income', synonyms: ['earned income', 'monthly earned income', 'wages', 'earned'] },
      { id: 'resources', label: 'Countable resources', required: true, synonyms: ['resources', 'countable resources', 'assets', 'savings'] },
      { id: 'burial', label: 'Resources set aside for burial', options: YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['burial', 'burial funds', 'burial set aside'] },
      { id: 'dependents', label: 'Dependent relatives in the home', synonyms: ['dependents', 'dependent relatives'] },
      { id: 'region', label: 'Where the person lives', fromForm: true, options: REGIONS, aliases: { us: 'us', '48 states': 'us', contiguous: 'us', ak: 'ak', hi: 'hi' }, synonyms: ['region', 'state'] },
      { id: 'year', label: 'Year', fromForm: true, synonyms: ['year', 'screen year'] },
    ],
  },
  'fap-discount': {
    compute: fapDiscount,
    noun: ['patient', 'patients'],
    formOnly: ['tier1Limit', 'tier1Discount', 'tier2Limit', 'tier2Discount', 'tier3Limit', 'tier3Discount', 'agb'],
    fields: [
      { id: 'reference', label: 'Patient or account reference', sensitive: true, synonyms: ['patient', 'account', 'account number', 'guarantor', 'name', 'mrn', 'id'] },
      { id: 'size', label: 'Household size', required: true, synonyms: ['household size', 'family size', 'people in household', 'size'] },
      { id: 'income', label: 'Annual household income', required: true, synonyms: ['annual income', 'household income', 'family income', 'income'] },
      { id: 'gross', label: 'Gross charges', required: true, synonyms: ['gross charges', 'charges', 'total charges', 'billed', 'amount'] },
      { id: 'region', label: 'Where the household lives', fromForm: true, options: REGIONS, aliases: { us: 'us', '48 states': 'us', contiguous: 'us', ak: 'ak', hi: 'hi' }, synonyms: ['region', 'state'] },
      { id: 'year', label: 'Poverty guideline year', fromForm: true, synonyms: ['year', 'guideline year'] },
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

// rowArgs(tool, row, defaults) -> the compute function's arguments: each field's cell, and for a `fromForm`
// field left blank, the form's answer.
export function rowArgs(tool, row, defaults = {}) {
  const args = Object.fromEntries((tool.formOnly || []).map((id) => [id, defaults[id] ?? '']));
  for (const field of tool.fields) {
    const v = cellValue(field, row[field.id]);
    args[field.id] = v === '' && field.fromForm ? (defaults[field.id] ?? '') : v;
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
  const count = (n, [one, many]) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
  return {
    valid: true,
    rows: out,
    band: `${count(ok, tool.noun)} of ${out.length.toLocaleString('en-US')} computed.${bad ? ` ${count(bad, ['row', 'rows'])} need${bad === 1 ? 's' : ''} corrected inputs.` : ''}`,
    bandLabel: `${ok.toLocaleString('en-US')} computed`,
    abnormal: bad > 0,
    notes: [
      `Where a row leaves it blank, the answer entered above is used for: ${tool.fields.filter((f) => f.fromForm).map((f) => f.label.toLowerCase()).join('; ')}. Everything else is the row's own${tool.formOnly ? ', and the rest of the form applies to every row' : ''}.`,
      ...(bad ? ['Rows that need corrected inputs say why in the result table and download.'] : []),
    ],
    note: 'Each row is computed by the same function as the form.',
  };
}

// The columns appended to the download.
export const BATCH_RESULT_HEADERS = ['sophiewell_result', 'sophiewell_detail'];
export const batchResultRow = (r) => [r.label, r.detail];
