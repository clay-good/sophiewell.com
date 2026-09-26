// spec-v1512 tool 3: infusion rate escalation schedule.
//
// Arithmetic on the protocol the reader enters (as the label or protocol states it): start at a rate,
// raise it by a fixed increment at a fixed interval up to a maximum, and hold there until the total is
// infused. For example, the Rituxan label's first infusion starts at 50 mg/hr and rises by 50 mg/hr every
// 30 minutes to at most 400 mg/hr; later infusions start at 100 mg/hr (DailyMed setid
// b172773b-3905-4a1c-ad95-bab4b6126563). Escalation assumes no infusion reaction, as labels do.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseDateTime } from './state-calendar.js';

export const UNITS = [{ value: 'mg', text: 'mg' }, { value: 'mL', text: 'mL' }];
const r2 = (x) => Math.round(x * 100) / 100;
const hm = (min) => `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, '0')} min`;
const clock = (w) => {
  const d = new Date(w);
  const h = d.getUTCHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

export function rateEscalation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.some((u) => u.value === o.unit) ? o.unit : null;
  if (!unit) return { valid: false, message: 'Choose whether the amounts are in mg or mL.' };
  const f = inputFault([
    ['the total to infuse', o.total, 0.01, 1e6, unit],
    ['the starting rate', o.startRate, 0.01, 1e5, `${unit}/hr`],
    ['the rate increment', o.increment, 0, 1e5, `${unit}/hr`],
    ['the interval between increases', o.interval, 1, 1440, 'minutes'],
    ['the maximum rate', o.maxRate, 0.01, 1e5, `${unit}/hr`],
  ]);
  if (f) return { valid: false, message: f };
  const total = Number(o.total);
  const start = Number(o.startRate);
  const inc = Number(o.increment);
  const every = Number(o.interval);
  const max = Number(o.maxRate);
  if (start > max) return { valid: false, message: 'Enter the rates again: the starting rate is above the maximum.' };
  let t0 = null;
  if (String(o.startTime ?? '').trim()) {
    t0 = parseDateTime(o.startTime);
    if (t0 === null) return { valid: false, message: 'Enter the start time as YYYY-MM-DDTHH:MM, or leave it blank.' };
  }
  const steps = [];
  let left = total;
  let t = 0;
  let rate = start;
  while (left > 1e-9) {
    const atMax = rate >= max || inc === 0;
    const span = atMax ? (left / rate) * 60 : Math.min(every, (left / rate) * 60);
    const amount = Math.min(left, (rate * span) / 60);
    steps.push({ from: t, to: t + span, rate, amount: r2(amount) });
    left -= amount;
    t += span;
    if (!atMax) rate = Math.min(max, rate + inc);
    if (steps.length > 500) break;
  }
  const at = (m) => (t0 === null ? hm(m) : `${clock(t0 + m * 60000)} (${hm(m)})`);
  let sum = 0;
  const notes = steps.map((s) => {
    sum = r2(sum + s.amount);
    return `${at(s.from)} to ${at(s.to)}: ${r2(s.rate)} ${unit}/hr, ${s.amount} ${unit} (${sum} ${unit} in all).`;
  });
  notes.push('Escalate only in the absence of infusion reactions, as the label or protocol directs.');
  const reached = steps.some((s) => s.rate >= max);
  return {
    valid: true,
    minutes: Math.round(t),
    band: `The infusion takes ${hm(t)}${t0 === null ? '' : `, finishing at ${clock(t0 + t * 60000)}`}, over ${steps.length} step${steps.length === 1 ? '' : 's'}${reached ? `, reaching the maximum ${r2(max)} ${unit}/hr` : `, ending before the maximum ${r2(max)} ${unit}/hr is reached`}.`,
    bandLabel: hm(t),
    notes,
    note: 'This is the arithmetic of the protocol entered; the label, the order and the patient\'s tolerance govern the rate.',
  };
}
