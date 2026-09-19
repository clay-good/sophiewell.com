// spec-v1399: California ambulance patient offload time (APOT) -- the 90th percentile and the share
// offloaded within 30 minutes, Health & Safety Code 1797.120 and 1797.120.5.
//
// Source: leginfo text read 2026-09-18.
//   1797.120(b) APOT is "the interval between the arrival of an ambulance patient at an emergency
//     department and the time that the patient is transferred to an emergency department gurney,
//     bed, chair, or other acceptable location and the emergency department assumes responsibility
//     for care of the patient."
//   1797.120.5(b)(1) (AB 40, effective January 1, 2024): by July 1, 2024 every local EMS agency
//     develops "a standard not to exceed 30 minutes, 90 percent of the time". A LEMSA may adopt a
//     stricter one; the tile checks the statutory ceiling.
//
// Percentile method: nearest rank (the value at position ceil(0.9 x n) of the sorted times), stated on
// screen so it can be checked against the LEMSA's report. A row missing a time is listed and
// excluded, never counted as zero.
//
// Pure: no DOM, no clock, no network.

import { parseDateTime } from './state-calendar.js';

export const APOT_VERIFIED = '2026-09-18';
const MIN = 60000;

function ordinal(n) {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`;
}
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
// A time is 'YYYY-MM-DDTHH:MM' (or with a space) or a bare 'HH:MM'.
function parseTime(s) {
  const str = String(s ?? '').trim();
  if (!str) return { blank: true };
  const full = parseDateTime(str);
  if (full !== null) return { t: full, full: true };
  const m = /^(\d{1,2}):(\d{2})$/.exec(str);
  if (m && Number(m[1]) < 24 && Number(m[2]) < 60) return { t: (Number(m[1]) * 60 + Number(m[2])) * MIN, full: false };
  return { bad: true };
}

export function caApotCalculator(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.rows)) return { valid: false, message: 'Enter one offload per line: ambulance arrival, then transfer of care, separated by a comma (for example 14:05, 14:32).' };
  const lines = String(o.rows).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const mins = [];
  const excluded = [];
  let wrapped = 0;
  lines.forEach((line, i) => {
    const parts = line.split(/[,;\t]/).map((x) => x.trim());
    const a = parseTime(parts[0]);
    const b = parseTime(parts[1]);
    const n = i + 1;
    if (parts.length < 2 || a.blank || b.blank) { excluded.push(`line ${n} (${line}): a time is missing`); return; }
    if (a.bad || b.bad) { excluded.push(`line ${n} (${line}): not a time`); return; }
    let d = (b.t - a.t) / MIN;
    if (d < 0 && !a.full && !b.full) { d += 24 * 60; wrapped += 1; }
    if (d < 0) { excluded.push(`line ${n} (${line}): transfer is before arrival`); return; }
    if (d > 24 * 60) { excluded.push(`line ${n} (${line}): longer than 24 hours`); return; }
    mins.push(d);
  });
  if (!mins.length) return { valid: false, message: `No complete pair to count. Enter arrival and transfer-of-care times on each line.${excluded.length ? ` Excluded: ${excluded.join('; ')}.` : ''}` };

  const sorted = [...mins].sort((x, y) => x - y);
  const rank = Math.ceil(0.9 * sorted.length);
  const p90 = sorted[rank - 1];
  const within = mins.filter((m) => m <= 30).length;
  const share = within / mins.length;
  const pct = Math.round(share * 1000) / 10;
  const meets = share >= 0.9;
  return {
    valid: true,
    p90,
    within,
    counted: mins.length,
    abnormal: !meets,
    bandLabel: meets ? 'Meets the 30-minute, 90% standard' : 'Does not meet the 30-minute, 90% standard',
    band: `90th-percentile APOT: ${p90} minutes. Offloaded within 30 minutes: ${within} of ${mins.length} (${pct}%). The statute caps a local standard at 30 minutes, 90 percent of the time (1797.120.5(b)(1)).`,
    methodNote: `Nearest-rank method: the ${ordinal(rank)} of ${sorted.length} times sorted from shortest. APOT runs from ambulance arrival at the emergency department to transfer of the patient to an ED gurney, bed, chair, or other location with the ED taking over care (1797.120(b)). Your LEMSA may set a stricter standard.`,
    excluded,
    wrapNote: wrapped ? `${wrapped} pair${wrapped === 1 ? '' : 's'} given as clock times crossed midnight and were counted into the next day.` : null,
  };
}
