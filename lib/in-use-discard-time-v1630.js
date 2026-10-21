// spec-v1630 tool 12: an opened stock container, when to discard it.
//
// CDC, Preventing Unsafe Injection Practices (page dated March 26, 2024), re-read on October 11, 2026.
// It reports what USP General Chapter 797 recommends: "Once a multi-dose vial is opened (e.g.,
// needle-punctured) the vial should be dated and discarded within 28 days unless the manufacturer
// states another date for that opened vial. The beyond-use-date should never exceed the
// manufacturer's original expiration date." On single-dose vials: "do not retain it for future use".
// On multi-dose vaccine vials it sends the reader to the Vaccine Storage and Handling Toolkit or the
// manufacturer, so they are out of scope here.
//
//   discard time = time opened + the in-use limit, and never later than the expiration date
//
// The 28 days is the only limit this tool supplies, and only for a multi-dose vial whose label
// states none. Every other limit is the label's and is entered by the reader: a pharmacy bulk
// package's hours after the closure is penetrated, an insulin vial's days in use, a spiked
// container's hang time. A single-dose container gets no time: "discard after the single use".
//
// An expiration date printed as a month and year is good through the last day of that month. Times
// are read as written, with no time zone. The CDC page is under the weekly page watch.
//
// Pure: no DOM, no clock, no network.

import { inputFault, inDateWindow } from './num.js';
import { longDate } from './partd-appeals-v1503.js';

export const SOURCE = {
  edition: 'March 26, 2024', route: 'B', readOn: '2026-10-11',
  source: { label: 'CDC, Preventing Unsafe Injection Practices', url: 'https://www.cdc.gov/injection-safety/hcp/clinical-safety/index.html' },
};
export const MULTI_DOSE_DAYS = 28;
export const CONTAINERS = [
  { value: 'multi-dose', text: 'Multi-dose vial' },
  { value: 'label-limit', text: 'Another container with an in-use limit on its label' },
  { value: 'single-dose', text: 'Single-dose vial, ampule, bag or bottle' },
];
export const LIMIT_UNITS = [
  { value: 'hours', text: 'Hours' },
  { value: 'days', text: 'Days' },
];
const HOUR = 3600000;
const NOTE = 'A date on the clock, not a judgment about sterility: discard any container whenever its sterility is compromised or in question. Multi-dose vaccine vials follow the vaccine\'s own label and CDC\'s storage toolkit, not this.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const clock = (w) => {
  const d = new Date(w);
  const h = d.getUTCHours();
  return `${longDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
// "2026-10-05T09:30" (a datetime-local value) or with a space; read as written.
function parseOpened(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(s ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  // A year outside 1900 to 2100 is a typo, not a date (Date.UTC would read 0026 as 1926).
  if (!inDateWindow(y)) return null;
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  return back.getUTCMonth() === mo - 1 && back.getUTCDate() === d && h < 24 && mi < 60 ? t : null;
}
// "2027-03-31", or "2027-03" for a month-and-year expiry: the last moment of that day or month.
function parseExpiry(s) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(s ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]);
  if (!inDateWindow(y) || mo < 1 || mo > 12) return null;
  if (m[3] === undefined) return { end: Date.UTC(y, mo, 1), monthOnly: true };
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  return new Date(t).getUTCMonth() === mo - 1 && d >= 1 ? { end: t + 24 * HOUR, monthOnly: false } : null;
}

export function inUseDiscardTime(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = String(o.container ?? '').trim();
  if (!CONTAINERS.some((c) => c.value === kind)) return { valid: false, message: 'Choose the container: a multi-dose vial, another container with an in-use limit on its label, or a single-dose container.' };
  if (kind === 'single-dose') {
    return {
      valid: true, discardAfterSingleUse: true,
      band: 'Discard after the single use: a single-dose container gets no in-use time.',
      bandLabel: 'Discard after the single use',
      notes: ['CDC: a single-dose vial is for a single patient and a single case, procedure or injection. If it seems to hold more than one dose, do not retain it for future use.'],
      note: NOTE,
    };
  }
  const opened = parseOpened(o.opened);
  if (opened === null) return { valid: false, message: 'Enter the date and time the container was opened or first punctured.' };
  const expiry = parseExpiry(o.expiration);
  if (!expiry) return { valid: false, message: 'Enter the manufacturer\'s expiration date as YYYY-MM-DD, or YYYY-MM when the label gives a month and year.' };
  if (opened >= expiry.end) return { valid: false, message: 'The container was opened after its expiration date. It was already expired; there is no in-use period to count.' };

  let hours; let why;
  if (blank(o.limit)) {
    if (kind !== 'multi-dose') return { valid: false, message: 'Enter the in-use limit printed on the label, and choose hours or days. The tool supplies a limit only for a multi-dose vial whose label states none.' };
    if (!blank(o.limitUnit)) return { valid: false, message: 'A unit was chosen with no limit. Enter the label\'s in-use limit, or clear the unit to use 28 days.' };
    hours = MULTI_DOSE_DAYS * 24; why = '28 days for an opened multi-dose vial whose manufacturer states no other date (CDC, reporting USP <797>)';
  } else {
    const unit = String(o.limitUnit ?? '').trim();
    if (unit !== 'hours' && unit !== 'days') return { valid: false, message: 'Choose whether the label\'s in-use limit is in hours or days.' };
    const lf = inputFault([['the label\'s in-use limit', o.limit, null, unit === 'days' ? 3650 : 87600, unit]]);
    if (lf) return { valid: false, message: lf };
    hours = Number(o.limit) * (unit === 'days' ? 24 : 1);
    why = `the label's in-use limit of ${Number(o.limit).toLocaleString('en-US')} ${Number(o.limit) === 1 ? unit.slice(0, -1) : unit}, as you entered it`;
  }
  const byLimit = opened + hours * HOUR;
  const capped = byLimit > expiry.end;
  const discard = capped ? expiry.end : byLimit;
  const expiryText = expiry.monthOnly ? `the end of ${longDate(new Date(expiry.end - HOUR)).replace(/ \d+,/, '')}` : `the end of ${longDate(new Date(expiry.end - HOUR))}`;
  const notes = [
    `Opened ${clock(opened)}; the limit is ${why}, which runs to ${clock(byLimit)}.`,
    capped
      ? `The manufacturer's expiration date comes first: the container is good only through ${expiryText}.`
      : `The manufacturer's expiration date (${expiryText}) is later, so the in-use limit decides.`,
  ];
  return {
    valid: true, discardBy: new Date(discard).toISOString().slice(0, 16), setBy: capped ? 'expiration' : 'limit', limitHours: hours,
    band: capped
      ? `Discard by ${expiryText}: the expiration date comes before the in-use limit.`
      : `Discard by ${clock(discard)}, set by ${why}.`,
    bandLabel: capped ? `By ${expiryText}` : clock(discard),
    notes, note: NOTE,
  };
}
