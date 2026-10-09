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
import { fapDiscount, gfeDeadline, fapCollectionClock } from './hospital-fap-v1508.js';
import { nomncDeadline, NOMNC_SETTINGS, moonDeadline, hospicePeriodClock, dmeRentalClock, DME_ITEMS, homeHealthCertClock } from './post-acute-clocks-v1514.js';
import { cobraClock, EVENTS as COBRA_EVENTS } from './cobra-clock-v1507.js';
import { partbLatePenalty, partdLatePenalty } from './medicare-penalties-v1507.js';
import { medicareEnrollmentWindow } from './medicare-enrollment-window-v1507.js';
import { acaSepWindow, EVENTS as SEP_EVENTS } from './aca-sep-window-v1507.js';
import { medicareFfsPaRequired, SETTINGS as PA_SETTINGS, STATES } from './medicare-ffs-pa-required.js';
import { premiumTaxCredit } from './marketplace-credit-v1506.js';
import { refillEligibleDate, YES_NO as RF_YES_NO } from './days-supply-v1511.js';
import { timelyFiling, appealDeadline, APPEAL_LEVELS, paTurnaround, overpayment60Day } from './ops-v63.js';
import { parseDate } from './pa/date.js';
import { acaExternalReviewClock } from './aca-external-review-v1503.js';
import { partdCoverageClock, REQUEST_TYPES as PD_REQUESTS } from './partd-appeals-v1503.js';
import { maOrgDeterminationClock, MA_REQUESTS, YES_NO as MA_YES_NO } from './ma-appeals-v1503.js';
import { erisaClaimClock, CLAIM_TYPES as ERISA_TYPES, STAGES as ERISA_STAGES, LEVELS as ERISA_LEVELS, YES_NO as ERISA_YES_NO } from './erisa-claim-clock-v1503.js';

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

// partd-late-penalty over a people file: up to three gaps per row, read in the common spreadsheet date forms
// before the form's compute, which reads YYYY-MM-DD only.
function partdRow(row) {
  const args = { year: row.year, base: row.base };
  for (const n of [1, 2, 3]) for (const [k, what] of [[`gap${n}Start`, 'first day'], [`gap${n}End`, 'last day']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoOf(v);
    if (!args[k]) return { valid: false, message: `Gap ${n} ${what}: "${v}" is not a date.` };
  }
  return partdLatePenalty(args);
}

// A date and time as a spreadsheet writes it ("10/01/2026 2:30 PM", "2026-10-01 14:30", "2026-10-01T14:30") ->
// "YYYY-MM-DDTHH:MM", or null. A date with no time is null: the MOON's 36 hours count from the hour.
export function isoDateTime(v) {
  const m = /^(.+?)[T\s]+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const day = isoOf(m[1]);
  let h = Number(m[2]);
  if (!day || h > 23 || Number(m[3]) > 59) return null;
  if (m[4]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (/p/i.test(m[4]) ? 12 : 0);
  }
  return `${day}T${String(h).padStart(2, '0')}:${m[3]}`;
}

// moon-deadline over an observation list: each row's start (and end, if the stay ended), as dates and times.
function moonRow(row) {
  const args = {};
  for (const [k, label] of [['observationStart', 'Observation began'], ['endTime', 'Released, transferred or admitted']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoDateTime(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date and time.` };
  }
  return moonDeadline(args);
}

// erisa-claim-clock over a claims or appeals list: urgent and concurrent care run in hours, so their received
// cell must carry a time; the other dates are read as a spreadsheet writes them.
function erisaRow(row) {
  const args = { ...row };
  const hourly = row.claimType === 'urgent' || row.claimType === 'concurrent';
  const rec = String(row.received ?? '').trim();
  if (rec) {
    args.received = hourly ? isoDateTime(rec) : isoOf(rec.replace(/[T\s].*$/, ''));
    if (!args.received) return { valid: false, message: `Received: "${rec}" is not a ${hourly ? 'date and time (urgent and concurrent claims run in hours)' : 'date'}.` };
  }
  for (const [k, label] of [['extensionNotice', 'Extension notice date'], ['denialReceived', 'Date the denial was received']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoOf(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date.` };
  }
  return erisaClaimClock(args);
}

// ma-org-determination-clock over a request worklist: the plan's clock runs from the hour received.
function maOrgRow(row) {
  const rec = String(row.received ?? '').trim();
  const received = rec ? isoDateTime(rec) : '';
  if (rec && !received) return { valid: false, message: `Plan received the request: "${rec}" is not a date and time.` };
  return maOrgDeterminationClock({ ...row, received });
}

// partd-coverage-clock over a request list: the clocks run in hours from receipt (and, for an exception, from the
// supporting statement).
function partdCoverageRow(row) {
  const args = { ...row };
  for (const [k, label] of [['received', 'Plan received the request'], ['statement', 'Supporting statement received']]) {
    const v = String(row[k] ?? '').trim();
    if (!v) { args[k] = ''; continue; }
    args[k] = isoDateTime(v);
    if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date and time.` };
  }
  return partdCoverageClock(args);
}

// withDates(compute, [[arg, label], ...]) -> a row compute that reads those date cells in the common spreadsheet
// forms first (the form computes read YYYY-MM-DD only), refusing a cell that is not a date by name.
function withDates(compute, dates) {
  return (row) => {
    const args = { ...row };
    for (const [k, label] of dates) {
      const v = String(row[k] ?? '').trim();
      if (!v) { args[k] = ''; continue; }
      args[k] = isoOf(v);
      if (!args[k]) return { valid: false, message: `${label}: "${v}" is not a date.` };
    }
    return compute(args);
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
  'moon-deadline': {
    compute: moonRow,
    noun: ['patient', 'patients'],
    fields: [
      { id: 'reference', label: 'Patient reference', sensitive: true, synonyms: ['patient', 'name', 'mrn', 'account', 'encounter', 'reference', 'id'] },
      { id: 'observationStart', label: 'Observation began (date and time)', required: true, synonyms: ['observation start', 'observation began', 'obs start', 'obs start time', 'observation order time', 'observation start date time'] },
      { id: 'endTime', label: 'Released, transferred or admitted (date and time)', synonyms: ['observation end', 'obs end', 'discharge time', 'discharged', 'released', 'end time'] },
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
  'partb-late-penalty': {
    compute: partbLatePenalty,
    noun: ['person', 'people'],
    fields: [
      { id: 'reference', label: 'Person reference', sensitive: true, synonyms: ['person', 'beneficiary', 'client', 'name', 'case', 'case number', 'id'] },
      { id: 'monthsLate', label: 'Months late (not counting special enrollment months)', required: true, synonyms: ['months late', 'months without part b', 'late months', 'months'] },
      { id: 'year', label: 'Premium year', fromForm: true, synonyms: ['year', 'premium year'] },
      { id: 'premium', label: 'Standard Part B premium', fromForm: true, synonyms: ['premium', 'standard premium', 'part b premium'] },
    ],
  },
  'partd-late-penalty': {
    compute: partdRow,
    noun: ['person', 'people'],
    fields: [
      { id: 'reference', label: 'Person reference', sensitive: true, synonyms: ['person', 'beneficiary', 'client', 'name', 'case', 'case number', 'id'] },
      { id: 'gap1Start', label: 'Gap 1: first day without drug coverage', required: true, synonyms: ['gap start', 'first day without coverage', 'uncovered from', 'gap 1 start', 'gap 1 first day'] },
      { id: 'gap1End', label: 'Gap 1: last day without drug coverage', required: true, synonyms: ['gap end', 'last day without coverage', 'uncovered through', 'gap 1 end', 'gap 1 last day'] },
      { id: 'gap2Start', label: 'Gap 2: first day without drug coverage', synonyms: ['gap 2 start', 'gap 2 first day'] },
      { id: 'gap2End', label: 'Gap 2: last day without drug coverage', synonyms: ['gap 2 end', 'gap 2 last day'] },
      { id: 'gap3Start', label: 'Gap 3: first day without drug coverage', synonyms: ['gap 3 start', 'gap 3 first day'] },
      { id: 'gap3End', label: 'Gap 3: last day without drug coverage', synonyms: ['gap 3 end', 'gap 3 last day'] },
      { id: 'year', label: 'Premium year', fromForm: true, synonyms: ['year', 'premium year'] },
      { id: 'base', label: 'Base beneficiary premium', fromForm: true, synonyms: ['base premium', 'base beneficiary premium', 'national base premium'] },
    ],
  },
  // A hospice census: each patient's election date, and the date to check from the row or the form.
  'hospice-period-clock': {
    compute: withDates(hospicePeriodClock, [['electionDate', 'Election date'], ['asOf', 'Date to check']]),
    noun: ['patient', 'patients'],
    fields: [
      { id: 'reference', label: 'Patient reference', sensitive: true, synonyms: ['patient', 'name', 'mrn', 'account', 'reference', 'id'] },
      { id: 'electionDate', label: 'Hospice election date', required: true, synonyms: ['election date', 'hospice election date', 'election', 'date of election', 'hospice start date', 'benefit start date'] },
      { id: 'asOf', label: 'Date to check', fromForm: true, synonyms: ['as of', 'as of date', 'census date', 'date to check', 'report date'] },
    ],
  },
  // A hospital billing office's accounts: when extraordinary collection actions may start (501(r)-6).
  'fap-collection-clock': {
    compute: withDates(fapCollectionClock, [['firstBill', 'First post-discharge bill'], ['notice', 'Written notice sent'], ['application', 'Financial assistance application']]),
    noun: ['account', 'accounts'],
    fields: [
      { id: 'reference', label: 'Account reference', sensitive: true, synonyms: ['account', 'account number', 'patient', 'name', 'guarantor', 'reference', 'id'] },
      { id: 'firstBill', label: 'First post-discharge bill', required: true, synonyms: ['first bill', 'first bill date', 'first post-discharge bill', 'first statement', 'first statement date'] },
      { id: 'notice', label: 'Written notice sent', synonyms: ['notice', 'notice sent', 'notice date', '30-day notice', 'eca notice', 'final notice'] },
      { id: 'application', label: 'Financial assistance application', synonyms: ['application', 'application date', 'fap application', 'financial assistance application', 'charity application'] },
    ],
  },
  // A home health agency's admissions: each start of care, and the face-to-face and referral dates where known.
  'home-health-cert-clock': {
    compute: withDates(homeHealthCertClock, [['startOfCare', 'Start-of-care date'], ['faceToFace', 'Face-to-face encounter date'], ['referral', 'Referral date']]),
    noun: ['patient', 'patients'],
    fields: [
      { id: 'reference', label: 'Patient reference', sensitive: true, synonyms: ['patient', 'name', 'mrn', 'account', 'episode', 'reference', 'id'] },
      { id: 'startOfCare', label: 'Start-of-care date', required: true, synonyms: ['start of care', 'start of care date', 'soc', 'soc date', 'admission date'] },
      { id: 'faceToFace', label: 'Face-to-face encounter date', synonyms: ['face to face', 'face-to-face', 'f2f', 'f2f date', 'face to face date', 'encounter date'] },
      { id: 'referral', label: 'Referral date', synonyms: ['referral', 'referral date', 'referral received', 'date referred'] },
    ],
  },
  // A DME supplier's rental roster: each rental's item type and delivery date, and a break in use if there was one.
  'dme-rental-clock': {
    compute: withDates(dmeRentalClock, [['delivered', 'Delivery date'], ['lastUse', 'Last day of use before a break'], ['resumed', 'Day use resumed']]),
    noun: ['rental', 'rentals'],
    fields: [
      { id: 'reference', label: 'Rental reference', sensitive: true, synonyms: ['patient', 'name', 'account', 'rental', 'rental id', 'reference', 'id'] },
      { id: 'item', label: 'Item type', required: true, strict: true, options: DME_ITEMS, aliases: { 'capped rental': 'capped', cr: 'capped', 'capped rental item': 'capped', o2: 'oxygen', 'oxygen equipment': 'oxygen', 'home oxygen': 'oxygen' }, strictHint: 'Write capped rental or oxygen.', synonyms: ['item type', 'item', 'rental type', 'payment category', 'category'] },
      { id: 'delivered', label: 'Delivery date', required: true, synonyms: ['delivery date', 'delivered', 'date delivered', 'initial rental date', 'rental start date'] },
      { id: 'lastUse', label: 'Last day of use before a break', synonyms: ['last day of use', 'break start', 'pickup date', 'last use'] },
      { id: 'resumed', label: 'Day use resumed', synonyms: ['resumed', 'use resumed', 'resume date', 'redelivery date'] },
    ],
  },
  // An appeals desk's list of final internal denials and external review requests.
  'aca-external-review-clock': {
    compute: withDates(acaExternalReviewClock, [['noticeReceived', 'Final internal denial received'], ['requestReceived', 'Plan received the external review request'], ['iroReceived', 'Independent reviewer received the request']]),
    noun: ['case', 'cases'],
    fields: [
      { id: 'reference', label: 'Case reference', sensitive: true, synonyms: ['member', 'name', 'case', 'case number', 'appeal', 'reference', 'id'] },
      { id: 'noticeReceived', label: 'Final internal denial received', required: true, synonyms: ['final denial received', 'final adverse determination', 'final internal denial', 'denial received', 'fiabd date', 'final denial date'] },
      { id: 'requestReceived', label: 'Plan received the external review request', synonyms: ['external review request received', 'request received', 'er request date', 'external review requested'] },
      { id: 'iroReceived', label: 'Independent reviewer received the request', synonyms: ['iro received', 'iro assigned', 'independent reviewer received', 'iro date'] },
    ],
  },
  // A pharmacy's or clinic's Part D request list.
  'partd-coverage-clock': {
    compute: partdCoverageRow,
    noun: ['request', 'requests'],
    fields: [
      { id: 'reference', label: 'Request reference', sensitive: true, synonyms: ['patient', 'name', 'request', 'request id', 'case', 'case number', 'reference', 'id'] },
      { id: 'requestType', label: 'Kind of Part D request', required: true, strict: true, options: PD_REQUESTS, aliases: { 'standard coverage determination': 'standard', 'standard exception': 'exception', 'formulary exception': 'exception', 'tiering exception': 'exception', 'expedited coverage determination': 'expedited', 'expedited exception': 'expedited-exception', reimbursement: 'payment', 'payment request': 'payment', 'expedite refused': 'expedite-refused' }, strictHint: 'Write standard, exception, expedited, expedited exception, payment or expedite refused.', synonyms: ['part d request type', 'request type', 'coverage determination type', 'cd type'] },
      { id: 'received', label: 'Plan received the request (date and time)', required: true, synonyms: ['received', 'date received', 'received date time', 'plan received'] },
      { id: 'statement', label: 'Supporting statement received (date and time)', synonyms: ['supporting statement', 'statement received', 'prescriber statement', 'statement date'] },
    ],
  },
  // A practice's Medicare Advantage request worklist.
  'ma-org-determination-clock': {
    compute: maOrgRow,
    noun: ['request', 'requests'],
    fields: [
      { id: 'reference', label: 'Request reference', sensitive: true, synonyms: ['patient', 'name', 'request', 'request id', 'auth', 'auth number', 'reference', 'id'] },
      { id: 'requestType', label: 'Kind of request', required: true, strict: true, options: MA_REQUESTS, aliases: { 'standard service': 'standard-service', standard: 'standard-service', 'standard prior authorization': 'standard-pa', 'standard pa': 'standard-pa', 'standard part b': 'standard-partb', 'standard part b drug': 'standard-partb', 'expedited service': 'expedited-service', expedited: 'expedited-service', 'expedited part b': 'expedited-partb', 'expedited part b drug': 'expedited-partb' }, strictHint: 'Write standard, standard prior authorization, standard Part B, expedited or expedited Part B.', synonyms: ['request type', 'kind of request', 'ma request type', 'determination type', 'priority'] },
      { id: 'received', label: 'Plan received the request (date and time)', required: true, synonyms: ['received', 'date received', 'received date time', 'plan received', 'submitted', 'submission time'] },
      { id: 'extended', label: 'Plan took the 14-day extension', options: MA_YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['extended', 'extension', 'extension taken'] },
    ],
  },
  // A plan administrator's claims or appeals list under ERISA.
  'erisa-claim-clock': {
    compute: erisaRow,
    noun: ['claim', 'claims'],
    fields: [
      { id: 'reference', label: 'Claim or appeal reference', sensitive: true, synonyms: ['claim', 'claim number', 'claim id', 'appeal', 'reference', 'id', 'member'] },
      { id: 'claimType', label: 'Kind of claim', required: true, strict: true, options: ERISA_TYPES, aliases: { 'urgent care': 'urgent', 'concurrent care': 'concurrent', preservice: 'pre-service', 'pre service': 'pre-service', 'prior authorization': 'pre-service', postservice: 'post-service', 'post service': 'post-service' }, strictHint: 'Write urgent, concurrent, pre-service or post-service.', synonyms: ['claim type', 'kind of claim', 'erisa claim type', 'claim category'] },
      { id: 'stage', label: 'Claim or appeal', required: true, strict: true, options: ERISA_STAGES, aliases: { initial: 'claim', 'initial claim': 'claim', 'claim decision': 'claim', 'internal appeal': 'appeal' }, strictHint: 'Write claim or appeal.', synonyms: ['stage', 'claim or appeal', 'level'] },
      { id: 'received', label: 'Plan received it', required: true, synonyms: ['received', 'date received', 'received date', 'receipt date', 'received date time'] },
      { id: 'extended', label: 'Plan took its 15-day extension (claims)', options: ERISA_YES_NO, aliases: { y: 'yes', n: 'no', true: 'yes', false: 'no' }, synonyms: ['extended', 'extension', 'extension taken'] },
      { id: 'extensionNotice', label: 'Extension notice date', synonyms: ['extension notice', 'extension notice date', 'extension date'] },
      { id: 'levels', label: 'Levels of appeal (appeals)', fromForm: true, options: ERISA_LEVELS, aliases: { 1: 'one', 2: 'two', single: 'one', '1 level': 'one', '2 levels': 'two' }, synonyms: ['appeal levels', 'levels', 'levels of appeal'] },
      { id: 'denialReceived', label: 'Date the denial was received', synonyms: ['denial received', 'denial date', 'date denial received'] },
    ],
  },
  'medicare-enrollment-window': {
    compute: withDates(medicareEnrollmentWindow, [['birthDate', 'Date of birth'], ['eligibleFrom', 'First month of disability eligibility'], ['enrollDate', 'Sign-up date'], ['employerCoverageEnd', 'Employer coverage end']]),
    noun: ['person', 'people'],
    fields: [
      { id: 'reference', label: 'Person reference', sensitive: true, synonyms: ['person', 'beneficiary', 'client', 'name', 'case', 'case number', 'id'] },
      { id: 'enrollDate', label: 'Sign-up date (or the date to check)', required: true, synonyms: ['sign up date', 'signup date', 'enrollment date', 'enroll date', 'date to check', 'application date'] },
      { id: 'birthDate', label: 'Date of birth', sensitive: true, synonyms: ['date of birth', 'dob', 'birth date', 'birthdate'] },
      { id: 'eligibleFrom', label: 'First month of disability eligibility', synonyms: ['disability eligibility', 'eligible from', 'first month eligible', 'medicare eligibility date'] },
      { id: 'employerCoverageEnd', label: 'Last day of employer coverage from current work', synonyms: ['employer coverage end', 'group coverage end', 'coverage end date', 'employment ended'] },
    ],
  },
  'aca-sep-window': {
    compute: withDates(acaSepWindow, [['eventDate', 'Event date'], ['learnedDate', 'Date learned of it'], ['selectionDate', 'Date the plan was chosen']]),
    noun: ['household', 'households'],
    fields: [
      { id: 'reference', label: 'Household reference', sensitive: true, synonyms: ['household', 'client', 'name', 'case', 'case number', 'id'] },
      { id: 'event', label: 'Qualifying event', required: true, strict: true, options: SEP_EVENTS, aliases: { 'loss of coverage': 'loss', 'lost coverage': 'loss', 'job loss': 'loss', 'medicaid loss': 'loss-medicaid', 'chip loss': 'loss-medicaid', 'lost medicaid': 'loss-medicaid', 'medicaid unwinding': 'loss-medicaid', birth: 'birth', adoption: 'birth', 'foster care': 'birth', married: 'marriage', move: 'move', moved: 'move', relocation: 'move' }, strictHint: 'Write loss of coverage, loss of Medicaid, birth, marriage, move or other.', synonyms: ['qualifying event', 'event', 'life event', 'sep reason', 'reason'] },
      { id: 'eventDate', label: 'Event date', required: true, synonyms: ['event date', 'qualifying event date', 'date of event', 'coverage loss date'] },
      { id: 'learnedDate', label: 'Date learned of it (if later)', synonyms: ['date learned', 'learned date', 'notified date'] },
      { id: 'selectionDate', label: 'Date the plan was chosen', synonyms: ['plan selection date', 'selection date', 'date plan chosen'] },
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
