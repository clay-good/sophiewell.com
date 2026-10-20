// spec-v1661 tool 3: the intervals between the events of an organ's recovery and implant.
//
// Arithmetic on the times the reader records, in one time zone: the interval between each pair of
// consecutive events, and from the first event to each later one. The OPTN data definitions of cold and
// warm ischemia time were not read (optn.transplant.hrsa.gov refused the request), so the tool names each
// interval by the two events the reader labeled and does not call any of them "the" cold ischemia time.
// With a limit in hours, it gives the time at which that many hours from the first event have passed.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function parseStamp(s) {
  const m = /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d)$/.exec(String(s).trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const hm = (ms) => {
  const min = Math.round(ms / 60000);
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
};
const fmt = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');

// "Cross-clamp, 2026-10-19 08:15" per line: the event's label, then its date and time.
export function ischemiaTimeClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const events = [];
  const lines = String(o.events ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const k = line.lastIndexOf(',');
    if (k < 1) return { valid: false, message: `Line ${i + 1} needs the event's name and its time, such as Cross-clamp, 2026-10-19 08:15.` };
    const name = line.slice(0, k).trim();
    const t = parseStamp(line.slice(k + 1));
    if (t === null) return { valid: false, message: `Line ${i + 1}: enter the time as YYYY-MM-DD HH:MM, in 24-hour time.` };
    events.push({ name, t });
  }
  if (events.length < 2) return { valid: false, message: 'Enter at least two events, one per line, in the order they happened.' };
  for (let i = 1; i < events.length; i += 1) {
    if (events[i].t < events[i - 1].t) return { valid: false, message: `${events[i].name} is before ${events[i - 1].name}. Enter the events in order, and check the times.` };
  }
  const first = events[0];
  const last = events[events.length - 1];
  const notes = [];
  for (let i = 1; i < events.length; i += 1) notes.push(`${events[i - 1].name} to ${events[i].name}: ${hm(events[i].t - events[i - 1].t)}.`);
  if (events.length > 2) for (let i = 2; i < events.length; i += 1) notes.push(`${first.name} to ${events[i].name}: ${hm(events[i].t - first.t)}.`);
  let limitLine = '';
  if (!blank(o.limitHours)) {
    const f = inputFault([['the limit', o.limitHours, null, 200, 'hours']]);
    if (f) return { valid: false, message: f };
    const at = first.t + Number(o.limitHours) * 3600000;
    limitLine = ` ${o.limitHours} hours from ${first.name} is ${fmt(at)}${at < last.t ? `, before ${last.name}` : ''}.`;
  }
  return {
    valid: true, totalMinutes: Math.round((last.t - first.t) / 60000), abnormal: limitLine.includes(', before '),
    band: `${first.name} to ${last.name}: ${hm(last.t - first.t)}.${limitLine}`,
    bandLabel: hm(last.t - first.t),
    notes,
    note: 'Each interval is named by the events you labeled. Which events bound the cold or warm ischemia time is set by the program and the OPTN definitions, which this tool does not state. All times are taken as one time zone.',
  };
}
