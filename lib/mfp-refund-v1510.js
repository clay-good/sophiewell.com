// spec-v1510 tool 3: Medicare negotiated-price refund check for a pharmacy.
//
// CMS final guidance for initial price applicability year 2027 and MFP effectuation in 2026-2027, section
// 40.4.1: the Medicare Transaction Facilitator gives the manufacturer a standard default refund amount (SDRA)
// of WAC per unit on the date of service minus MFP per unit on that date, times the quantity dispensed. A
// manufacturer may pay a different amount it determines makes the MFP available, and must report that it
// did. CMS MTF fact sheet for dispensing entities (April 2026): plans have up to 7 days to submit the claim
// data, manufacturers up to 14 days to instruct payment, and banking up to 5 business days (21 days from
// the date of service on average so far). Whether the drug had a negotiated price on the date comes from the
// CMS negotiated-prices file (lib/mfp-prices-v1506.js). WAC and the MFP per unit are the reader's figures.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, isBusinessDay } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';
import { mfpPriceCheck, DRUGS } from './mfp-prices-v1506.js';

export { DRUGS };
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unit = (x) => { const [w, f = ''] = x.toFixed(6).replace(/0+$/, '').split('.'); return `$${w}.${f.padEnd(2, '0')}`; };
const addBusiness = (d, n) => { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; };

export function mfpRefundCheck(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  let dos;
  try { dos = parseIsoStrict(String(o.serviceDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date of service (YYYY-MM-DD).' }; }
  const price = mfpPriceCheck({ drug: o.drug, date: o.serviceDate }, now);
  if (!price.valid) return price;
  if (price.price === null) return { valid: true, refund: 0, band: `No refund is due: ${price.band}`, bandLabel: 'No negotiated price', notes: [], note: 'From the CMS negotiated-prices file.' };
  const f = inputFault([
    ['the quantity dispensed (units)', o.quantity, 0.001, 1e6, 'units'],
    ['WAC per unit on the date of service', o.wac, 0, 1e6, 'dollars'],
    ['the MFP per unit (the CMS file\'s NDC-9 unit price)', o.mfpUnit, 0, 1e6, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const q = Number(o.quantity);
  const wac = Number(o.wac);
  const mfp = Number(o.mfpUnit);
  const sdra = Math.round(Math.max(0, wac - mfp) * q * 100) / 100;
  const notes = [`${price.band}`];
  const expected = addBusiness(addCalendarDaysUtc(dos, 21), 5);
  notes.push(`Expected by ${longDate(expected)}: up to 7 days for the plan's claim data, 14 for the manufacturer, then up to 5 business days of banking (CMS fact sheet, April 2026).`);
  let band = `Standard default refund amount ${money(sdra)}: (WAC ${unit(wac)} - MFP ${unit(mfp)}) × ${q} units (CMS final guidance, section 40.4.1).`;
  let label = money(sdra);
  let abnormal = false;
  const check = String(o.checkDate ?? '').trim() ? (() => { try { return parseIsoStrict(String(o.checkDate).trim()); } catch { return null; } })() : todayUtc(now);
  if (!check) return { valid: false, message: 'Enter the date to check as YYYY-MM-DD, or leave it blank for today.' };
  if (o.received !== 'yes' && check > expected) { band += ` No refund received by ${longDate(check)}, after the expected date: follow up with the manufacturer and the Medicare Transaction Facilitator.`; label = 'Refund late'; abnormal = true; }
  if (String(o.paid ?? '').trim() && String(o.cost ?? '').trim()) {
    const cf = inputFault([['the amount paid by the plan and patient', o.paid, 0, 1e7, 'dollars'], ['the acquisition cost per unit', o.cost, 0, 1e6, 'dollars']]);
    if (cf) return { valid: false, message: cf };
    const total = Number(o.paid) + sdra;
    const cost = Number(o.cost) * q;
    notes.push(`Paid ${money(Number(o.paid))} plus the refund is ${money(total)} against an acquisition cost of ${money(cost)}: ${total >= cost ? `covers it by ${money(total - cost)}` : `short by ${money(cost - total)}`}.`);
    if (total < cost) abnormal = true;
  }
  notes.push('A manufacturer may pay an amount other than the standard default refund, based on actual acquisition cost, and must report that it did.');
  return { valid: true, refund: sdra, expected: expected.toISOString().slice(0, 10), band, bandLabel: label, abnormal, notes, note: 'Arithmetic on the figures entered; the manufacturer\'s refund and the Medicare Transaction Facilitator\'s records control.' };
}
