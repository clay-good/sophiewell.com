// spec-v1637 tool 5: how long a DEA Form 222 or an electronic (CSOS) order stays valid.
//
// Source: 21 CFR 1305.13 and 1305.22, read on eCFR as current October 8, 2026 (re-read October 12,
// 2026).
//   1305.13(b)  paper: "it may be filled in part and the balance supplied by additional shipments
//     within 60 days following the date of the DEA Form 222. No DEA Form 222 is valid more than 60
//     days after its execution by the purchaser, except as specified in paragraph (f)".
//   1305.22(e)  electronic: the same two sentences, "except as specified in paragraph (h)".
//   1305.13(f), 1305.22(h)  procurement officers of the Defense Supply Center of the Defense
//     Logistics Agency: "partial shipments at different times not to exceed six months from the
//     date of the order".
//   1305.13(d)  a supplier not required to report to ARCOS sends DEA a copy "at the close of the
//     month during which the order is filled. If an order is filled by partial shipments, ... at
//     the close of the month during which the final shipment is made or the 60-day validity period
//     expires."
//
// The rule gives no time of day. The tool counts calendar days and treats day 60 as valid.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

export const KINDS = [
  { value: 'paper-form-222', text: 'Paper DEA Form 222' },
  { value: 'electronic-csos-order', text: 'Electronic order (CSOS)' },
];
export const PURCHASERS = [
  { value: 'ordinary-purchaser', text: 'Any other purchaser' },
  { value: 'defense-supply-center', text: 'Defense Supply Center procurement officer' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const monthEnd = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
const todayUtc = (now) => (now instanceof Date && !Number.isNaN(now.getTime()) ? new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) : null);

export function dea222Validity(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = KINDS.find((k) => k.value && k.value === String(o.kind ?? '').trim());
  if (!kind) return { valid: false, message: 'Choose a paper Form 222 or an electronic (CSOS) order.' };
  const purchaser = PURCHASERS.find((k) => k.value && k.value === String(o.purchaser ?? '').trim());
  if (!purchaser) return { valid: false, message: 'Choose the purchaser: a Defense Supply Center procurement officer has a six-month limit in place of 60 days.' };
  const executed = date(o.executed);
  if (!executed) return { valid: false, message: 'Enter the date the purchaser executed the order.' };
  const shipments = [];
  for (const raw of String(o.shipments ?? '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const d = date(raw);
    if (!d) return { valid: false, message: `Enter each shipment date as YYYY-MM-DD. "${raw.slice(0, 20)}" was not read.` };
    shipments.push(d);
  }
  if (shipments.length > 60) return { valid: false, message: 'Enter no more than 60 shipment dates.' };
  const paper = kind.value === 'paper-form-222';
  const defense = purchaser.value === 'defense-supply-center';
  const para = paper ? (defense ? '1305.13(f)' : '1305.13(b)') : (defense ? '1305.22(h)' : '1305.22(e)');
  const last = defense ? addMonthsUtc(executed, 6) : addCalendarDaysUtc(executed, 60);
  const notes = [defense
    ? `Defense Supply Center order: partial shipments may be made at different times not to exceed six months from the date of the order, so through ${say(last)} (21 CFR ${para}).`
    : `No order is valid more than 60 days after the purchaser executed it. Executed ${say(executed)}, it may be filled, or completed by further shipments, through ${say(last)} (21 CFR ${para}).`];
  notes.push('The rule gives no time of day; this counts calendar days and treats the last day as valid.');
  const out = { valid: true, lastValidShipment: fmtUtc(last), shipments: [] };
  let late = 0;
  for (const s of shipments.sort((a, b) => a.getTime() - b.getTime())) {
    const state = s.getTime() < executed.getTime() ? 'before-the-order' : s.getTime() <= last.getTime() ? 'in-time' : 'after-the-order-expired';
    if (state !== 'in-time') late += 1;
    out.shipments.push({ date: fmtUtc(s), state });
    notes.push(`Shipment ${say(s)}: ${state === 'in-time' ? 'in time' : state === 'before-the-order' ? 'dated before the order was executed' : 'after the order stopped being valid'}.`);
  }
  if (paper && !defense) {
    const finalShip = shipments.filter((s) => s.getTime() <= last.getTime()).pop();
    notes.push(`A supplier that does not report to ARCOS (such as a practitioner) sends DEA a copy of the form at the close of the month in which the order is filled. For an order filled by partial shipments that is the close of the month of the final shipment or of the day the 60 days run out: ${finalShip && monthEnd(finalShip).getTime() !== monthEnd(last).getTime() ? `${say(monthEnd(finalShip))} if ${say(finalShip)} was the final shipment, or ` : ''}${say(monthEnd(last))}${finalShip && monthEnd(finalShip).getTime() !== monthEnd(last).getTime() ? ' if the 60 days run out first' : ''} (1305.13(d)).`);
    out.copyDeadlineIfExpired = fmtUtc(monthEnd(last));
  }
  let where = 'Order validity';
  const today = todayUtc(now);
  if (today) {
    const n = Math.round((last.getTime() - today.getTime()) / 86400000);
    out.daysLeft = n;
    where = n > 0 ? `${n} days left` : n === 0 ? 'Last valid day is today' : `Expired ${-n} days ago`;
    notes.push(n > 0 ? `That is ${n} days from today.` : n === 0 ? 'That is today.' : `That was ${-n} days ago.`);
  }
  notes.push('This is the federal rule; a state or a supplier may set a shorter period.');
  const expired = out.daysLeft !== undefined && out.daysLeft < 0;
  return { ...out, flag: late ? 'shipment-outside-validity' : expired ? 'order-expired' : 'valid-through', abnormal: late > 0 || expired, band: `The order is valid for shipments through ${say(last)}.`, bandLabel: late ? `${late} shipment${late === 1 ? '' : 's'} outside the valid period` : where, notes, note: notes.join(' ') };
}
