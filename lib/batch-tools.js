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
import { fapDiscount, gfeDeadline } from './hospital-fap-v1508.js';
import { nomncDeadline, NOMNC_SETTINGS } from './post-acute-clocks-v1514.js';
import { cobraClock, EVENTS as COBRA_EVENTS } from './cobra-clock-v1507.js';
import { medicareFfsPaRequired, SETTINGS as PA_SETTINGS, STATES } from './medicare-ffs-pa-required.js';
import { premiumTaxCredit } from './marketplace-credit-v1506.js';
import { refillEligibleDate, YES_NO as RF_YES_NO } from './days-supply-v1511.js';
import { timelyFiling, appealDeadline, APPEAL_LEVELS, paTurnaround, overpayment60Day } from './ops-v63.js';
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

// appeal-deadline over a list of Medicare decisions: each row's level just completed and notice date (a later
// receipt date only with proof of it). The form's compute throws on a bad date, so each row goes through this.
const APPEAL_LEVEL_OPTIONS = Object.entries(APPEAL_LEVELS).map(([value, s]) => ({ value, text: s.label }));
const isoOf = (v) => { const d = parseDate(String(v ?? '').trim()); return d ? d.toISOString().slice(0, 10) : null; };
function appealDeadlineRow({ level, decisionDate, receivedDate }, now) {
  if (!APPEAL_LEVELS[level]) return { valid: false, message: `Level just completed: "${String(level ?? '').trim()}" is not one of the levels.` };
  const notice = isoOf(decisionDate);
  if (!notice) return { valid: false, message: `Notice date: "${String(decisionDate ?? '').trim()}" is not a date.` };
  const blankReceipt = !String(receivedDate ?? '').trim();
  const received = blankReceipt ? '' : isoOf(receivedDate);
  if (received === null) return { valid: false, message: `Date received: "${String(receivedDate).trim()}" is not a date.` };
  let r;
  try { r = appealDeadline({ level, decisionDate: notice, receivedDate: received, now }); } catch (e) { return { valid: false, message: `Date received: ${e.message}.` }; }
  const left = r.pastDue ? `${Math.abs(r.daysRemaining).toLocaleString('en-US')} day${Math.abs(r.daysRemaining) === 1 ? '' : 's'} past` : `${r.daysRemaining.toLocaleString('en-US')} day${r.daysRemaining === 1 ? '' : 's'} left`;
  const aic = r.aicUsd ? ` At least $${r.aicUsd.toLocaleString('en-US')} must remain in controversy (${r.aicEdition}).` : r.aicEdition ? ` The amount in controversy is ${r.aicEdition}.` : '';
  return {
    valid: true,
    bandLabel: r.pastDue ? `Past the deadline (${r.deadline})` : `${r.nextLevel} by ${r.deadline}`,
    band: `${r.nextLevel}: ${r.windowDays} days from receipt of the ${r.completedLevel} notice (${r.receiptPresumed ? `presumed ${r.receiptDate}, 5 days after its date` : `received ${r.receiptDate}`}; ${r.cfr}), so due by ${r.deadline}; ${left}.${aic}`,
  };
}

// pa-turnaround over a list of open prior authorization requests: each row's type and request date, a
// plan-specified window in days only for a plan-specified row, and an arrival time only an expedited row uses.
const PA_TYPES = [{ value: 'standard', text: 'Standard' }, { value: 'expedited', text: 'Expedited' }, { value: 'custom', text: 'Plan-specified' }];
function paTurnaroundRow({ type, requestDate, windowDays, requestTime }, now) {
  const date = isoOf(requestDate);
  if (!date) return { valid: false, message: `Request date: "${String(requestDate ?? '').trim()}" is not a date.` };
  const w = String(windowDays ?? '').trim();
  if (type === 'custom' && !/^[1-9]\d*$/.test(w)) return { valid: false, message: w ? `Plan window: "${w}" is not a whole number of days.` : 'Plan window: blank. A plan-specified request needs its window in days.' };
  let r;
  try { r = paTurnaround({ requestDate: date, type, customDays: type === 'custom' ? Number(w) : undefined, requestTime: type === 'expedited' ? String(requestTime ?? '').trim() : '', now }); } catch (e) { return { valid: false, message: `Time received: ${e.message}.` }; }
  if (!r) return { valid: false, message: `Request type: "${String(type ?? '').trim()}" is not one of the choices.` };
  const left = r.pastDue ? `${Math.abs(r.daysRemaining).toLocaleString('en-US')} day${Math.abs(r.daysRemaining) === 1 ? '' : 's'} past` : `${r.daysRemaining.toLocaleString('en-US')} day${r.daysRemaining === 1 ? '' : 's'} left`;
  return {
    valid: true,
    bandLabel: r.pastDue ? `Past due (${r.deadline})` : `Decide by ${r.deadlineTime ? r.deadlineTime.replace('T', ' ') : r.deadline}`,
    band: `${r.windowLabel}: decision due by ${r.deadlineText || r.deadline}; ${left}.${type !== 'custom' && w ? ` The plan window of ${w} days was not used: the ${type} window is the one CMS-0057-F sets.` : ''}`,
  };
}

// overpayment-60day over a list of identified overpayments: each row's identification date, and an investigation
// of related overpayments only where the row records one (42 CFR 401.305(b)(3)).
function overpaymentRow({ identificationDate, investigationStart, investigationEnd }, now) {
  const dates = {};
  for (const [k, label, v] of [['identificationDate', 'Identification date', identificationDate], ['investigationStart', 'Investigation began', investigationStart], ['investigationEnd', 'Investigation concluded', investigationEnd]]) {
    if (!String(v ?? '').trim()) { dates[k] = ''; continue; }
    dates[k] = isoOf(v);
    if (!dates[k]) return { valid: false, message: `${label}: "${String(v).trim()}" is not a date.` };
  }
  if (!dates.identificationDate) return { valid: false, message: 'Identification date: blank.' };
  let r;
  try { r = overpayment60Day({ ...dates, now }); } catch (e) { return { valid: false, message: e.message }; }
  const left = r.pastDue ? `${Math.abs(r.daysRemaining).toLocaleString('en-US')} day${Math.abs(r.daysRemaining) === 1 ? '' : 's'} past` : `${r.daysRemaining.toLocaleString('en-US')} day${r.daysRemaining === 1 ? '' : 's'} left`;
  return {
    valid: true,
    bandLabel: r.pastDue ? `Past due (${r.deadline})` : `Report and return by ${r.deadline}`,
    band: r.suspended
      ? `Identified ${r.identificationDate}; the investigation from ${r.investigationStart} suspends the clock until ${r.suspensionEnds}, ${r.suspensionEndsBy === 'conclusion' ? 'when it concluded' : r.suspensionEndsBy}; then ${r.daysLeftAfterSuspension} of the 60 days remain: due by ${r.deadline}; ${left}.`
      : `Identified ${r.identificationDate}: report and return within 60 days, by ${r.deadline}; ${left}.`,
  };
}

// gfe-deadline over a schedule: the form's compute reads YYYY-MM-DD only, so each row's dates are read in the
// common spreadsheet forms first; a cell that is not a date is refused by name.
function gfeDeadlineRow(row) {
  const args = {};
  for (const [k, label] of [['scheduled', 'Date scheduled'], ['serviceDate', 'Service date'], ['requested', 'Date the estimate was requested']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoOf(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date.` };
  }
  return gfeDeadline(args);
}

// nomnc-deadline over a census: each row's last covered day (and delivery date, if the notice went out), read in
// the common spreadsheet forms before the form's compute, which reads YYYY-MM-DD only.
function nomncRow(row) {
  const args = { setting: row.setting };
  for (const [k, label] of [['lastCovered', 'Last covered day'], ['delivered', 'Date delivered']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoOf(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date.` };
  }
  return nomncDeadline(args);
}

// cobra-clock over an HR list of qualifying events: each row's event and dates; whether the employer administers
// the plan comes from the row or the form. The row leads with the employer's own next deadline.
function cobraRow(row) {
  const args = { event: row.event, employerAdministers: row.employerAdministers, disability: row.disability };
  for (const [k, label] of [['eventDate', 'Event date'], ['lossDate', 'Date coverage is lost'], ['noticeDate', 'Election notice date'], ['electionDate', 'Date elected']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoOf(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date.` };
  }
  const r = cobraClock(args);
  if (!r.valid) return r;
  const first = args.noticeDate ? '' : args.employerAdministers === 'yes'
    ? `Send the election notice by ${r.noticeBy} (44 days after the event). `
    : `Tell the plan administrator by ${r.noticeBy} (30 days after the event). `;
  return { ...r, band: `${first}${r.band}`, bandLabel: args.noticeDate ? (r.electBy ? `Elect by ${r.electBy}` : r.bandLabel) : `Notice by ${r.noticeBy}` };
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
  // The level column is required and strict: an unknown level is refused, never guessed.
  'appeal-deadline': {
    compute: appealDeadlineRow,
    noun: ['decision', 'decisions'],
    fields: [
      { id: 'reference', label: 'Claim or appeal reference', sensitive: true, synonyms: ['claim', 'claim number', 'icn', 'appeal number', 'case', 'account', 'patient', 'name', 'reference', 'id'] },
      { id: 'level', label: 'Level just completed', required: true, strict: true, options: APPEAL_LEVEL_OPTIONS, aliases: { initial: 'initial', 'initial determination': 'initial', denial: 'initial', 'claim denial': 'initial', redetermination: 'redetermination', 'mac redetermination': 'redetermination', reconsideration: 'reconsideration', 'qic reconsideration': 'reconsideration', qic: 'reconsideration', alj: 'alj', omha: 'alj', 'alj hearing': 'alj', hearing: 'alj', council: 'council', 'appeals council': 'council', 'medicare appeals council': 'council', dab: 'council' }, strictHint: 'Write initial, redetermination, reconsideration, ALJ or council.', synonyms: ['level', 'appeal level', 'level completed', 'last level', 'stage', 'appeal stage'] },
      { id: 'decisionDate', label: 'Notice date', required: true, synonyms: ['notice date', 'decision date', 'denial date', 'date of notice', 'determination date', 'letter date'] },
      { id: 'receivedDate', label: 'Date received (only with proof)', synonyms: ['date received', 'received date', 'receipt date', 'received'] },
    ],
  },
  // Both the scheduling date and the service date are required, so a list with one date column is not offered it.
  'gfe-deadline': {
    compute: gfeDeadlineRow,
    noun: ['service', 'services'],
    fields: [
      { id: 'reference', label: 'Patient or appointment reference', sensitive: true, synonyms: ['patient', 'appointment', 'account', 'mrn', 'name', 'reference', 'id'] },
      { id: 'scheduled', label: 'Date scheduled', required: true, synonyms: ['date scheduled', 'scheduled on', 'booked', 'booked on', 'booking date', 'scheduling date', 'created date'] },
      { id: 'serviceDate', label: 'Service date', required: true, synonyms: ['service date', 'date of service', 'dos', 'appointment date', 'procedure date'] },
      { id: 'requested', label: 'Date the estimate was requested', synonyms: ['estimate requested', 'date requested', 'request date', 'gfe requested'] },
    ],
  },
  'nomnc-deadline': {
    compute: nomncRow,
    noun: ['patient', 'patients'],
    fields: [
      { id: 'reference', label: 'Patient reference', sensitive: true, synonyms: ['patient', 'resident', 'name', 'mrn', 'account', 'reference', 'id'] },
      { id: 'lastCovered', label: 'Last covered day', required: true, synonyms: ['last covered day', 'last covered date', 'last day covered', 'coverage end', 'coverage end date', 'last covered'] },
      { id: 'delivered', label: 'Date the notice was delivered', synonyms: ['date delivered', 'notice delivered', 'nomnc delivered', 'delivered', 'notice date'] },
      { id: 'setting', label: 'Setting', fromForm: true, strict: true, options: NOMNC_SETTINGS, aliases: { 'skilled nursing': 'snf', 'skilled nursing facility': 'snf', 'home health agency': 'hha', 'home health': 'hha', hh: 'hha', comprehensive: 'corf' }, strictHint: 'Write SNF, home health, hospice or CORF.', synonyms: ['setting', 'provider type', 'level of care'] },
    ],
  },
  'cobra-clock': {
    compute: cobraRow,
    noun: ['event', 'events'],
    fields: [
      { id: 'reference', label: 'Employee or beneficiary reference', sensitive: true, synonyms: ['employee', 'employee id', 'beneficiary', 'name', 'member', 'reference', 'id'] },
      { id: 'event', label: 'Qualifying event', required: true, strict: true, options: COBRA_EVENTS, aliases: { termination: 'employment', terminated: 'employment', 'job loss': 'employment', layoff: 'employment', 'reduced hours': 'employment', 'reduction in hours': 'employment', resignation: 'employment', retirement: 'employment', retired: 'employment', death: 'other', divorce: 'other', 'legal separation': 'other', medicare: 'other', 'medicare entitlement': 'other', 'loss of dependent status': 'other', 'aging out': 'other' }, strictHint: 'Write termination, reduced hours, death, divorce, Medicare or aging out.', synonyms: ['qualifying event', 'event', 'event type', 'reason', 'termination reason'] },
      { id: 'eventDate', label: 'Event date', required: true, synonyms: ['event date', 'qualifying event date', 'termination date', 'term date', 'date of event'] },
      { id: 'lossDate', label: 'Date coverage is lost', synonyms: ['loss of coverage date', 'coverage end date', 'coverage ends', 'coverage loss date'] },
      { id: 'noticeDate', label: 'Election notice date', synonyms: ['election notice date', 'notice date', 'notice sent', 'cobra notice date'] },
      { id: 'electionDate', label: 'Date elected', synonyms: ['election date', 'date elected', 'elected'] },
      { id: 'disability', label: 'Disability extension', options: YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['disability', 'disability extension', 'ssa disability'] },
      { id: 'employerAdministers', label: 'Employer is also the plan administrator', fromForm: true, options: YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['employer administers', 'self-administered', 'administrator'] },
    ],
  },
  'overpayment-60day': {
    compute: overpaymentRow,
    noun: ['overpayment', 'overpayments'],
    fields: [
      { id: 'reference', label: 'Overpayment or claim reference', sensitive: true, synonyms: ['overpayment', 'claim', 'claim number', 'icn', 'case', 'account', 'patient', 'name', 'reference', 'id'] },
      { id: 'identificationDate', label: 'Identification date', required: true, synonyms: ['identification date', 'identified', 'date identified', 'identified date', 'overpayment identified'] },
      { id: 'investigationStart', label: 'Investigation began', synonyms: ['investigation began', 'investigation start', 'investigation start date', 'review began', 'lookback began'] },
      { id: 'investigationEnd', label: 'Investigation concluded', synonyms: ['investigation concluded', 'investigation end', 'investigation end date', 'review concluded', 'quantified', 'date quantified'] },
    ],
  },
  // The type column is required and strict, so a list of dates alone is not offered this tool.
  'pa-turnaround': {
    compute: paTurnaroundRow,
    noun: ['request', 'requests'],
    fields: [
      { id: 'reference', label: 'Request or authorization reference', sensitive: true, synonyms: ['request', 'request id', 'auth', 'auth number', 'authorization', 'case', 'member', 'patient', 'name', 'reference', 'id'] },
      { id: 'type', label: 'Request type', required: true, strict: true, options: PA_TYPES, aliases: { routine: 'standard', 'non-urgent': 'standard', nonurgent: 'standard', std: 'standard', urgent: 'expedited', stat: 'expedited', expedite: 'expedited', exp: 'expedited', plan: 'custom', 'plan-specified': 'custom', commercial: 'custom' }, strictHint: 'Write standard, expedited or plan-specified.', synonyms: ['type', 'request type', 'priority', 'urgency', 'review type'] },
      { id: 'requestDate', label: 'Request date', required: true, synonyms: ['request date', 'received date', 'date received', 'submission date', 'submitted', 'date'] },
      { id: 'windowDays', label: 'Plan window in days (plan-specified only)', synonyms: ['window', 'plan window', 'window days', 'turnaround days', 'days'] },
      { id: 'requestTime', label: 'Time received (expedited)', synonyms: ['time received', 'request time', 'time', 'received time'] },
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
      ...(tool.fields.some((f) => f.fromForm) ? [`Where a row leaves it blank, the answer entered above is used for: ${tool.fields.filter((f) => f.fromForm).map((f) => f.label.toLowerCase()).join('; ')}. Everything else is the row's own${tool.formOnly ? ', and the rest of the form applies to every row' : ''}.`] : ['Every value is the row\'s own; the form above is not used for file rows.']),
      ...(bad ? ['Rows that need corrected inputs say why in the result table and download.'] : []),
    ],
    note: 'Each row is computed by the same function as the form.',
  };
}

// The columns appended to the download.
export const BATCH_RESULT_HEADERS = ['sophiewell_result', 'sophiewell_detail'];
export const batchResultRow = (r) => [r.label, r.detail];
