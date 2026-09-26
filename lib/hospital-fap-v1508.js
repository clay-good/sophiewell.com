// spec-v1508: hospital financial assistance and self-pay estimates.
//
// 26 CFR 1.501(r)-5(b)(3): the look-back AGB percentage is allowed amounts over gross charges for a prior
// 12-month period (Medicare fee-for-service; Medicare plus private insurers; or Medicaid alone or with
// either), applied by the 120th day after that period ends. 1.501(r)-6(c)(3)-(4): no extraordinary
// collection action (ECA) for at least 120 days from the first post-discharge bill, and not until at least
// 30 days after a written notice naming the ECAs and a deadline no earlier than 30 days out.
// 1.501(r)-1(b)(3): the application period ends on the later of the 240th day after the first
// post-discharge bill or the notice's deadline. 1.501(r)-6(c)(5)-(6): an application during that period
// suspends ECAs until it is decided.
// 45 CFR 149.610(b)(1)(v)-(vi): a good faith estimate for an uninsured or self-pay patient 1 business day
// after scheduling when scheduled at least 3 business days ahead, 3 business days after when at least 10
// ahead, 3 business days after a request; co-providers asked within 1 business day. 149.620: a provider's
// or facility's total billed charges at least $400 over its own line on the estimate make the bill eligible
// for patient-provider dispute resolution, started within 120 calendar days of receiving the first bill.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, isBusinessDay, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';
import { fplPercent, REGIONS } from './income-screens-v1506.js';

export { REGIONS };

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const opt = (s, what) => {
  if (!String(s ?? '').trim()) return { none: true };
  const d = date(s);
  return d ? { d } : { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` };
};
const POSTURE = 'This is the regulation\'s arithmetic, not legal advice; the hospital\'s policies and the regulation control.';

export const AGB_BASES = [
  { value: 'medicare', text: 'Medicare fee-for-service' },
  { value: 'medicare-private', text: 'Medicare fee-for-service and private insurers' },
  { value: 'medicaid', text: 'Medicaid, alone or with the above' },
];

export function agbPercentage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the total allowed amounts', o.allowed, 0, 1e12, 'dollars'],
    ['the total gross charges', o.gross, 0.01, 1e12, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const allowed = Number(o.allowed);
  const gross = Number(o.gross);
  if (allowed > gross) return { valid: false, message: 'Enter the totals again: allowed amounts above gross charges would put AGB above the charge itself.' };
  const pct = Math.round((allowed / gross) * 10000) / 100;
  const notes = [];
  const basis = AGB_BASES.find((b) => b.value === o.basis);
  notes.push(basis ? `Claims allowed by: ${basis.text.toLowerCase()} (26 CFR 1.501(r)-5(b)(3)(ii)).` : 'The payers included were not entered; the method must use Medicare fee-for-service, Medicare plus private insurers, or Medicaid alone or with either (26 CFR 1.501(r)-5(b)(3)(ii)).');
  const end = opt(o.periodEnd, 'the end of the 12-month period');
  if (end.error) return { valid: false, message: end.error };
  if (end.d) notes.push(`Apply the new percentage by ${longDate(addCalendarDaysUtc(end.d, 120))}, the 120th day after the period ended ${longDate(end.d)} (1.501(r)-5(b)(3)(iv)).`);
  let band = `AGB percentage ${pct}%: a financial-assistance-eligible patient may be charged at most ${pct}% of gross charges for emergency or medically necessary care.`;
  let label = `${pct}%`;
  if (!String(o.bill ?? '').trim()) notes.push('A patient\'s gross charges were not entered, so no dollar cap is shown.');
  else {
    const bf = inputFault([['the patient\'s gross charges', o.bill, 0, 1e10, 'dollars']]);
    if (bf) return { valid: false, message: bf };
    const cap = Math.round(Number(o.bill) * pct) / 100;
    band += ` On gross charges of ${money(Number(o.bill))}, that is ${money(cap)}.`;
    label = `${pct}%, ${money(cap)} cap`;
  }
  notes.push('Allowed amounts include what the insurer pays and the patient\'s cost sharing; a claim not finally allowed by the period\'s end belongs to the next period.');
  return { valid: true, percent: pct, band, bandLabel: label, notes, note: POSTURE };
}

export function fapCollectionClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bill = date(o.firstBill);
  if (!bill) return { valid: false, message: 'Enter the date the first post-discharge bill was provided (YYYY-MM-DD).' };
  const notice = opt(o.notice, 'the date of the written notice');
  if (notice.error) return { valid: false, message: notice.error };
  const app = opt(o.application, 'the date of the financial assistance application');
  if (app.error) return { valid: false, message: app.error };
  const day120 = addCalendarDaysUtc(bill, 120);
  const day240 = addCalendarDaysUtc(bill, 240);
  const notes = [`Notification period: no extraordinary collection action before ${longDate(day120)}, 120 days after the first bill on ${longDate(bill)} (26 CFR 1.501(r)-6(c)(3)(i)).`];
  let earliest = day120;
  let appEnd = day240;
  if (notice.d) {
    if (notice.d < bill) return { valid: false, message: 'Enter the notice date again: it comes after the first bill.' };
    const n30 = addCalendarDaysUtc(notice.d, 30);
    if (n30 > earliest) earliest = n30;
    if (n30 > appEnd) appEnd = n30;
    notes.push(`Written notice on ${longDate(notice.d)}: its stated deadline must be no earlier than ${longDate(n30)}, and no action may start before then (1.501(r)-6(c)(4)(i)).`);
  } else notes.push('No written notice date was entered: an action may start only 30 days after a written notice with the plain-language summary, the actions intended and a deadline at least 30 days out.');
  notes.push(`Application period: through ${longDate(appEnd)}, the later of 240 days after the first bill and the notice's deadline (1.501(r)-1(b)(3)).`);
  let band = notice.d
    ? `The earliest extraordinary collection action is ${longDate(earliest)}${earliest > day120 ? ', 30 days after the written notice, later than day 120' : ', day 120 after the first bill'}.`
    : `No extraordinary collection action before ${longDate(day120)}, and then only 30 days after a written notice.`;
  let label = notice.d ? `ECA from ${fmtUtc(earliest)}` : `No ECA before ${fmtUtc(day120)}`;
  if (app.d) {
    if (app.d <= appEnd) {
      band += ` The application on ${longDate(app.d)} falls within the application period, so collection actions are suspended until it is decided (1.501(r)-6(c)(5)-(6)).`;
      label = 'Suspended: application pending';
    } else band += ` The application on ${longDate(app.d)} came after the application period ended; the hospital may still accept it.`;
  }
  notes.push('Extraordinary collection actions include reporting to credit agencies, selling the debt, liens, garnishment and lawsuits; deferring care for an earlier unpaid bill has its own notice rules (1.501(r)-6(b)).');
  return { valid: true, earliest: fmtUtc(earliest), band, bandLabel: label, notes, note: POSTURE };
}

export function fapDiscount(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const fp = fplPercent({ size: o.size, income: o.income, region: o.region, program: 'current', period: 'annual', year: o.year }, now);
  if (!fp.valid) return fp;
  const g = inputFault([['the gross charges', o.gross, 0, 1e10, 'dollars']]);
  if (g) return { valid: false, message: g };
  const tiers = [];
  for (const k of [1, 2, 3]) {
    const lim = String(o[`tier${k}Limit`] ?? '').trim();
    const dis = String(o[`tier${k}Discount`] ?? '').trim();
    if (!lim && !dis) continue;
    const tf = inputFault([[`tier ${k}'s income limit`, lim, 1, 2000, 'percent'], [`tier ${k}'s discount`, dis, 0, 100, 'percent']]);
    if (tf) return { valid: false, message: tf };
    tiers.push([Number(lim), Number(dis)]);
  }
  if (!tiers.length) return { valid: false, message: 'Enter at least one tier of the hospital\'s policy: an income limit (percent of poverty) and its discount.' };
  tiers.sort((a, b) => a[0] - b[0]);
  const gross = Number(o.gross);
  const pct = fp.percent;
  const tier = tiers.find(([lim]) => pct <= lim);
  const discount = tier ? tier[1] : 0;
  let owed = Math.round(gross * (100 - discount)) / 100;
  const notes = [...fp.notes.filter((n) => /year was not entered|period/.test(n))];
  let capText = '';
  if (tier && String(o.agb ?? '').trim()) {
    const af = inputFault([['the AGB percentage', o.agb, 0, 100, 'percent']]);
    if (af) return { valid: false, message: af };
    const cap = Math.round(gross * Number(o.agb)) / 100;
    if (owed > cap) { owed = cap; capText = `, capped at AGB (${o.agb}% of charges)`; }
    else notes.push(`AGB (${o.agb}% of charges, ${money(cap)}) is above the discounted amount, so it does not bind.`);
  } else if (tier) notes.push('The AGB percentage was not entered: a financial-assistance-eligible patient may not be charged more than AGB (26 CFR 1.501(r)-5), so check the amount against it.');
  const band = tier
    ? `${pct}% of the poverty line falls in the tier up to ${tier[0]}%: a ${discount}% discount, so the patient owes ${money(owed)} of ${money(gross)}${capText}.`
    : `${pct}% of the poverty line is above every tier entered (the highest is ${tiers[tiers.length - 1][0]}%): no discount under these tiers.`;
  return { valid: true, owed, band, bandLabel: tier ? money(owed) : 'No tier', notes, note: 'The tiers are the hospital\'s own policy as entered; the hospital\'s determination controls.' };
}

function businessDaysBetween(a, b) {
  let n = 0;
  for (let d = addCalendarDaysUtc(a, 1); d <= b; d = addCalendarDaysUtc(d, 1)) if (isBusinessDay(d)) n += 1;
  return n;
}
function addBusiness(a, n) {
  let d = a;
  let left = n;
  while (left > 0) { d = addCalendarDaysUtc(d, 1); if (isBusinessDay(d)) left -= 1; }
  return d;
}

export function gfeDeadline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const req = opt(o.requested, 'the date the estimate was requested');
  if (req.error) return { valid: false, message: req.error };
  const sch = opt(o.scheduled, 'the date the service was scheduled');
  if (sch.error) return { valid: false, message: sch.error };
  const svc = opt(o.serviceDate, 'the service date');
  if (svc.error) return { valid: false, message: svc.error };
  if (!req.d && !sch.d) return { valid: false, message: 'Enter the date the service was scheduled or the date the patient asked for an estimate.' };
  if (sch.d && !svc.d) return { valid: false, message: 'Enter the service date: the deadline after scheduling depends on how far ahead it is.' };
  const lines = [];
  const notes = ['Business days are federal business days (weekdays that are not federal holidays); days ahead are counted after the scheduling date through the service date.'];
  let due = null;
  if (sch.d) {
    if (svc.d < sch.d) return { valid: false, message: 'Enter the dates again: the service comes after scheduling.' };
    const ahead = businessDaysBetween(sch.d, svc.d);
    if (ahead >= 10) { due = addBusiness(sch.d, 3); lines.push(`Scheduled ${ahead} business days ahead: the estimate is due by ${longDate(due)}, 3 business days after scheduling (45 CFR 149.610(b)(1)(vi)(B)).`); }
    else if (ahead >= 3) { due = addBusiness(sch.d, 1); lines.push(`Scheduled ${ahead} business days ahead: the estimate is due by ${longDate(due)}, 1 business day after scheduling (149.610(b)(1)(vi)(A)).`); }
    else lines.push(`Scheduled ${ahead} business day${ahead === 1 ? '' : 's'} ahead, fewer than 3: the scheduling rule sets no estimate deadline.`);
    notes.push(`Co-providers and co-facilities must be asked for their parts by ${longDate(addBusiness(sch.d, 1))}, 1 business day after scheduling (149.610(b)(1)(v)).`);
  }
  if (req.d) {
    const r = addBusiness(req.d, 3);
    if (!due || r < due) due = r;
    lines.push(`Requested ${longDate(req.d)}: the estimate is due by ${longDate(r)}, 3 business days after the request (149.610(b)(1)(vi)(C)).`);
  }
  notes.push('The estimate is part of the medical record, and a copy of any estimate from the last 6 years must be given on request.');
  return { valid: true, deadline: due ? fmtUtc(due) : null, band: lines.join(' '), bandLabel: due ? `Due ${fmtUtc(due)}` : 'No deadline', notes, note: POSTURE };
}

export function ppdrEligibility(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rows = [];
  for (const k of [1, 2, 3]) {
    const est = String(o[`est${k}`] ?? '').trim();
    const bill = String(o[`billed${k}`] ?? '').trim();
    if (!est && !bill) continue;
    const f = inputFault([[`provider ${k}'s estimate`, est, 0, 1e9, 'dollars'], [`provider ${k}'s billed charges`, bill, 0, 1e9, 'dollars']]);
    if (f) return { valid: false, message: f };
    rows.push([k, Number(est), Number(bill)]);
  }
  if (!rows.length) return { valid: false, message: 'Enter at least one provider or facility: its line on the estimate and its total billed charges.' };
  const first = opt(o.firstBill, 'the date the first bill was received');
  if (first.error) return { valid: false, message: first.error };
  const notes = [];
  const eligible = [];
  for (const [k, est, bill] of rows) {
    const over = Math.round((bill - est) * 100) / 100;
    const ok = over >= 400;
    if (ok) eligible.push(k);
    notes.push(`Provider ${k}: billed ${money(bill)} against an estimate of ${money(est)}, ${over >= 0 ? `${money(over)} over` : `${money(-over)} under`}: ${ok ? 'eligible' : 'not eligible'}.`);
  }
  notes.push('Each provider or facility is tested against its own line; amounts over the estimate are not added across providers (45 CFR 149.620(a)(2)(ii), (b)(1)).');
  let band = eligible.length
    ? `Eligible for patient-provider dispute resolution for provider${eligible.length > 1 ? 's' : ''} ${eligible.join(', ')}: billed at least $400 over the estimate.`
    : 'Not eligible: no single provider or facility billed $400 or more over its line on the estimate.';
  if (eligible.length) {
    if (first.d) band += ` Start by ${longDate(addCalendarDaysUtc(first.d, 120))}, 120 calendar days after receiving the first bill (149.620(c)(1)).`;
    else notes.push('The dispute must be started within 120 calendar days of receiving the first bill; enter that date for the deadline.');
    notes.push('An administrative fee is due to the dispute resolution entity, in the amount HHS sets by guidance.');
  }
  return { valid: true, eligible, band, bandLabel: eligible.length ? 'Eligible' : 'Not eligible', notes, note: POSTURE };
}
