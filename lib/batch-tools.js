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
// A cell that matches nothing is passed as written, and the compute function refuses it in its own words --
// unless the field is `strict`: for a tool that would read an unknown choice as no answer at all (an unknown
// state as no state), the row is refused here, naming the cell.

import { fplPercent, irmaa, REGIONS, PROGRAMS, PERIODS, FILING } from './income-screens-v1506.js';
import { extraHelpMspScreen, MARITAL, YES_NO } from './msp-lis-v1507.js';
import { fapDiscount } from './hospital-fap-v1508.js';
import { medicareFfsPaRequired, SETTINGS as PA_SETTINGS, STATES } from './medicare-ffs-pa-required.js';
import { premiumTaxCredit } from './marketplace-credit-v1506.js';
import { refillEligibleDate, YES_NO as RF_YES_NO } from './days-supply-v1511.js';
import { timelyFiling } from './ops-v63.js';
import { parseDate } from './pa/date.js';

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// Full state and territory names, for a file that spells the state out.
const STATE_NAMES = {
  alabama: 'AL', alaska: 'AK', 'american samoa': 'AS', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  'district of columbia': 'DC', 'washington dc': 'DC', 'washington, dc': 'DC', 'washington d.c.': 'DC', florida: 'FL', georgia: 'GA', guam: 'GU', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN',
  iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'northern mariana islands': 'MP', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'puerto rico': 'PR', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX',
  utah: 'UT', vermont: 'VT', 'virgin islands': 'VI', 'u.s. virgin islands': 'VI', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};

// timely-filing over a claims list. The form's compute takes a payer kind and throws on a bad date, so each row
// goes through this, which calls timelyFiling itself. A row's payer decides the window: Original Medicare is one
// calendar year by 42 CFR 424.44 (a filing-limit cell is not used for it), and any other payer -- a Medicare
// Advantage plan included, whose limit is its contract's -- needs its limit in days, the row's own or the form's.
const ORIGINAL_MEDICARE = new Set(['medicare', 'original medicare', 'medicare part a', 'medicare part b', 'medicare a', 'medicare b', 'medicare ffs', 'medicare fee-for-service', 'traditional medicare']);
function timelyFilingRow({ serviceDate, payer, limitDays }, now) {
  const name = String(payer ?? '').trim();
  if (!name) return { valid: false, message: 'Payer: blank. Write Medicare for Original Medicare, or the payer\'s name with its filing limit in days.' };
  const medicare = ORIGINAL_MEDICARE.has(norm(name));
  const dos = parseDate(String(serviceDate ?? '').trim());
  if (!dos) return { valid: false, message: `Date of service: "${String(serviceDate ?? '').trim()}" is not a date.` };
  const lim = String(limitDays ?? '').trim();
  if (!medicare && !/^\d+$/.test(lim)) return { valid: false, message: lim ? `Filing limit: "${lim}" is not a whole number of days.` : `Filing limit: blank. ${name} is not Original Medicare, so its limit in days is needed (from the payer's contract or manual).` };
  if (!medicare && Number(lim) < 1) return { valid: false, message: 'Filing limit: must be at least 1 day.' };
  const r = timelyFiling({ serviceDate: dos.toISOString().slice(0, 10), payer: medicare ? 'medicare' : 'other', customLimitDays: medicare ? undefined : Number(lim), now });
  const left = r.pastDue ? `${Math.abs(r.daysRemaining).toLocaleString('en-US')} day${Math.abs(r.daysRemaining) === 1 ? '' : 's'} past` : `${r.daysRemaining.toLocaleString('en-US')} day${r.daysRemaining === 1 ? '' : 's'} left`;
  return {
    valid: true,
    bandLabel: r.pastDue ? `Past the limit (${r.deadline})` : `File by ${r.deadline}`,
    band: `${name}: ${r.windowDays.toLocaleString('en-US')} days from the date of service${medicare ? ' (42 CFR 424.44)' : ''}, so the claim is due by ${r.deadline}; ${left}.`,
  };
}

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
  'irmaa': {
    compute: irmaa,
    noun: ['person', 'people'],
    fields: [
      { id: 'reference', label: 'Person reference', sensitive: true, synonyms: ['person', 'beneficiary', 'name', 'client', 'case', 'case number', 'id', 'member'] },
      // "Married filing separately" is not aliased: the separate brackets apply only to someone who lived with
      // the spouse during the year (SSA uses the single brackets otherwise), so the row must say which.
      { id: 'filing', label: 'Tax filing status', required: true, strict: true, options: FILING.filter((f) => f.value !== 'mfs'),
        strictHint: 'For married filing separately, write "MFS lived with spouse", or "single" if the person lived apart from the spouse all year.', aliases: { single: 'single', s: 'single', 'head of household': 'single', hoh: 'single', 'qualifying surviving spouse': 'single', qss: 'single', 'qualifying widow(er)': 'single', joint: 'joint', mfj: 'joint', 'married filing jointly': 'joint', 'mfs lived with spouse': 'mfs', 'married filing separately, lived with spouse': 'mfs', 'married filing separately (lived with spouse during the year)': 'mfs' }, synonyms: ['filing status', 'tax filing status', 'filing'] },
      { id: 'magi', label: 'MAGI from the tax return two years earlier', required: true, synonyms: ['magi', 'modified adjusted gross income', 'income', 'agi'] },
      { id: 'year', label: 'Premium year', fromForm: true, synonyms: ['year', 'premium year'] },
    ],
  },
  'premium-tax-credit': {
    compute: premiumTaxCredit,
    noun: ['household', 'households'],
    fields: [
      { id: 'reference', label: 'Household reference', sensitive: true, synonyms: ['household', 'family', 'name', 'client', 'case', 'case number', 'id'] },
      { id: 'magi', label: 'Household income (MAGI) a year', required: true, synonyms: ['magi', 'household income', 'annual income', 'income', 'modified adjusted gross income'] },
      { id: 'size', label: 'Household size', required: true, synonyms: ['household size', 'family size', 'tax household size', 'size'] },
      { id: 'benchmark', label: 'Benchmark (second-lowest-cost silver) premium a month', required: true, synonyms: ['benchmark', 'benchmark premium', 'slcsp', 'second lowest cost silver', 'second-lowest-cost silver premium'] },
      { id: 'region', label: 'Where the household lives', fromForm: true, options: REGIONS, aliases: { us: 'us', '48 states': 'us', contiguous: 'us', ak: 'ak', hi: 'hi' }, synonyms: ['region', 'state'] },
      { id: 'year', label: 'Coverage year', fromForm: true, synonyms: ['year', 'coverage year', 'plan year'] },
    ],
  },
  // spec-v1511 held this back until a file could say which tool it was for: the plan's threshold is required
  // per row here, so a plain fill history (no threshold column) still goes only to the adherence tools.
  'refill-eligible-date': {
    compute: refillEligibleDate,
    noun: ['fill', 'fills'],
    fields: [
      { id: 'reference', label: 'Patient or prescription reference', sensitive: true, synonyms: ['patient', 'rx', 'rx number', 'prescription', 'member', 'name', 'id'] },
      { id: 'fillDate', label: 'Date of the last fill', required: true, synonyms: ['fill date', 'last fill date', 'date filled', 'dispense date'] },
      { id: 'daysSupply', label: 'Days supply', required: true, synonyms: ['days supply', 'day supply', 'supply days', 'days'] },
      { id: 'threshold', label: 'Plan refill threshold (percent)', required: true, synonyms: ['threshold', 'refill threshold', 'refill too soon threshold', 'plan threshold', 'percent'] },
      { id: 'eyeDrops', label: 'Eye drops', options: RF_YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['eye drops', 'ophthalmic'] },
    ],
  },
  // A payer column is required, so a file that only has dates of service is not offered this tool.
  'timely-filing': {
    compute: timelyFilingRow,
    noun: ['claim', 'claims'],
    fields: [
      { id: 'reference', label: 'Claim or account reference', sensitive: true, synonyms: ['claim', 'claim number', 'claim id', 'account', 'account number', 'patient', 'name', 'reference', 'id'] },
      { id: 'serviceDate', label: 'Date of service', required: true, synonyms: ['date of service', 'dos', 'service date', 'from date', 'service from date', 'date'] },
      { id: 'payer', label: 'Payer', required: true, synonyms: ['payer', 'payer name', 'insurance', 'insurer', 'plan', 'carrier', 'primary payer'] },
      { id: 'limitDays', label: 'Filing limit in days', fromForm: true, synonyms: ['filing limit', 'timely filing limit', 'timely filing', 'limit', 'limit days', 'filing limit days', 'days to file'] },
    ],
  },
  'medicare-ffs-pa-required': {
    compute: medicareFfsPaRequired,
    noun: ['service', 'services'],
    fields: [
      { id: 'reference', label: 'Patient, appointment or order reference', sensitive: true, synonyms: ['patient', 'appointment', 'order', 'account', 'mrn', 'name', 'reference', 'id'] },
      { id: 'code', label: 'HCPCS or CPT code', required: true, synonyms: ['hcpcs', 'cpt', 'hcpcs code', 'cpt code', 'procedure code', 'code', 'item code'] },
      { id: 'serviceDate', label: 'Date of service', required: true, synonyms: ['date of service', 'dos', 'service date', 'scheduled date', 'appointment date', 'date'] },
      { id: 'setting', label: 'Setting', fromForm: true, strict: true, options: PA_SETTINGS, aliases: { hopd: 'opd', opd: 'opd', outpatient: 'opd', 'hospital outpatient': 'opd', asc: 'asc', 'ambulatory surgery center': 'asc', 'surgery center': 'asc', office: 'office', 'physician office': 'office', clinic: 'office', 'non-facility': 'office', dme: 'dmepos', dmepos: 'dmepos', supplier: 'dmepos', ambulance: 'ambulance', inpatient: 'inpatient', ip: 'inpatient' }, synonyms: ['setting', 'place of service', 'site of service', 'site'] },
      { id: 'state', label: 'State where the service is furnished', fromForm: true, strict: true, options: STATES, aliases: STATE_NAMES, synonyms: ['state', 'service state', 'state of service'] },
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

// known(field, cell): the cell names one of the field's options, by value or words, or one of its aliases.
function known(field, cell) {
  const n = norm(cell);
  return field.options.some((o) => norm(o.value) === n || norm(o.text) === n) || Boolean(field.aliases && field.aliases[n]);
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
    const unknown = tool.fields.find((f) => f.strict && f.options && String(row[f.id] ?? '').trim() && !known(f, row[f.id]));
    if (unknown) return { ok: false, label: 'Needs corrected inputs', detail: `${unknown.label}: "${String(row[unknown.id]).trim()}" is not one of the choices.${unknown.strictHint ? ` ${unknown.strictHint}` : ''}` };
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
