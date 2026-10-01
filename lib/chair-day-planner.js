// spec-v1512 tool 4: an infusion center's chair day, scheduled first-fit.
//
// Each appointment holds a chair for its premedication lead time, its chair minutes and its post-infusion
// observation, end to end. Appointments are placed in order of preferred start (an appointment with none
// is placed at opening, in the order given), each on the chair that lets it start soonest at or after its
// preferred time and finish by closing (ties to the lower chair number). One that cannot is not placed:
// it is listed with the earliest slot it could take in the schedule as built, if any. Utilization is the
// chair's booked minutes over its open minutes. Scheduling arithmetic only: no nurse ratios or pharmacy
// prep capacity.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const hm = (s) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s ?? '').trim());
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};
export const fmtTime = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// Appointments typed one per line: reference, chair minutes, premedication minutes, observation minutes,
// preferred start (HH:MM, optional).
function fromText(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [reference, chair_minutes, premed_minutes, observation_minutes, preferred_start] = line.split(/\s*[,\t]\s*/);
    return { reference, chair_minutes, premed_minutes, observation_minutes, preferred_start };
  });
}

// earliest(busy, from, dur, close) -> the first start >= from where [start, start + dur) is free and ends by close.
function earliest(busy, from, dur, close) {
  const starts = [from, ...busy.map((b) => b.end).filter((e) => e > from)].sort((a, b) => a - b);
  for (const s of starts) {
    if (s + dur > close) return null;
    if (busy.every((b) => s + dur <= b.start || s >= b.end)) return s;
  }
  return null;
}

export function chairDayPlanner(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of chairs', o.chairs, 1, 200, '']]);
  if (f) return { valid: false, message: f };
  if (!Number.isInteger(Number(o.chairs))) return { valid: false, message: 'Enter the number of chairs as a whole number.' };
  const open = hm(o.open);
  const close = hm(o.close);
  if (open == null) return { valid: false, message: 'Enter the opening time as HH:MM, such as 07:30.' };
  if (close == null) return { valid: false, message: 'Enter the closing time as HH:MM, such as 18:00.' };
  if (close <= open) return { valid: false, message: 'Enter the hours again: closing must be after opening.' };
  const raw = Array.isArray(o.apptRows) ? o.apptRows : fromText(o.appointments);
  if (!raw.length) return { valid: false, message: 'Enter the appointments, one per line: reference, chair minutes, premedication minutes, observation minutes, and a preferred start (optional).' };
  if (raw.length > 2000) return { valid: false, message: 'Up to 2,000 appointments a day. Split the list.' };

  const appts = raw.map((a, i) => {
    const line = i + 1;
    const ref = String(a.reference ?? '').trim() || `Line ${line}`;
    const af = inputFault([
      [`the chair minutes for ${ref}`, a.chair_minutes, 1, 1440, 'minutes'],
      [`the premedication minutes for ${ref} (0 if none)`, a.premed_minutes, 0, 600, 'minutes'],
      [`the observation minutes for ${ref} (0 if none)`, a.observation_minutes, 0, 600, 'minutes'],
    ]);
    if (af) return { line, ref, error: af };
    let pref = open;
    let hasPref = false;
    if (!blank(a.preferred_start)) {
      pref = hm(a.preferred_start);
      if (pref == null) return { line, ref, error: `Enter the preferred start for ${ref} as HH:MM, or leave it blank.` };
      hasPref = true;
      if (pref < open) pref = open;
    }
    const dur = Math.round(Number(a.premed_minutes)) + Math.round(Number(a.chair_minutes)) + Math.round(Number(a.observation_minutes));
    return { line, ref, dur, pref, hasPref };
  });

  const chairs = Array.from({ length: Number(o.chairs) }, () => []);
  const order = appts.filter((a) => !a.error).slice().sort((a, b) => a.pref - b.pref || a.line - b.line);
  const placed = [];
  const unplaced = [];
  for (const a of order) {
    let best = null;
    chairs.forEach((busy, c) => {
      const s = earliest(busy, a.pref, a.dur, close);
      if (s != null && (!best || s < best.start)) best = { chair: c, start: s };
    });
    if (best) {
      const slot = { ...a, chair: best.chair + 1, start: best.start, end: best.start + a.dur, moved: best.start > a.pref };
      chairs[best.chair].push(slot);
      chairs[best.chair].sort((x, y) => x.start - y.start);
      placed.push(slot);
    } else unplaced.push(a);
  }
  // The earliest slot each unplaced appointment could take in the schedule as built, at any time.
  for (const a of unplaced) {
    let best = null;
    chairs.forEach((busy, c) => {
      const s = earliest(busy, open, a.dur, close);
      if (s != null && (!best || s < best.start)) best = { chair: c + 1, start: s };
    });
    a.earliest = best;
  }
  const openMin = close - open;
  const util = chairs.map((busy, c) => ({ chair: c + 1, booked: busy.reduce((s, b) => s + b.dur, 0), pct: Math.round((busy.reduce((s, b) => s + b.dur, 0) / openMin) * 1000) / 10 }));
  const invalid = appts.filter((a) => a.error);
  const notes = [];
  const moved = placed.filter((p) => p.moved && p.hasPref);
  if (moved.length) notes.push(`${moved.length} appointment${moved.length === 1 ? '' : 's'} could not start at the preferred time and start later: ${moved.map((p) => `${p.ref} at ${fmtTime(p.start)} instead of ${fmtTime(p.pref)}`).join('; ')}.`);
  for (const a of unplaced) notes.push(`${a.ref} (${a.dur} minutes) does not fit ${a.hasPref ? `from ${fmtTime(a.pref)} ` : ''}before closing${a.earliest ? `; the earliest slot it could take is ${fmtTime(a.earliest.start)} in chair ${a.earliest.chair}` : '; no chair has that much time free today'}.`);
  if (invalid.length) notes.push(`${invalid.length} line${invalid.length === 1 ? '' : 's'} could not be read (first: line ${invalid[0].line}, ${invalid[0].error})`);
  notes.push('Each appointment holds its chair for premedication, infusion and observation, end to end.');
  const total = util.reduce((s, u) => s + u.booked, 0);
  const pct = Math.round((total / (openMin * chairs.length)) * 1000) / 10;
  return {
    valid: true,
    placed: placed.slice().sort((a, b) => a.chair - b.chair || a.start - b.start).map((p) => ({ line: p.line, reference: p.ref, chair: p.chair, start: fmtTime(p.start), end: fmtTime(p.end), minutes: p.dur })),
    unplaced: unplaced.map((a) => ({ line: a.line, reference: a.ref, minutes: a.dur, earliest: a.earliest ? `${fmtTime(a.earliest.start)}, chair ${a.earliest.chair}` : null })),
    invalid: invalid.map((a) => ({ line: a.line, reference: a.ref, reason: a.error })),
    utilization: util,
    band: `${placed.length} of ${appts.length} appointments scheduled in ${chairs.length} chair${chairs.length === 1 ? '' : 's'} from ${fmtTime(open)} to ${fmtTime(close)}: ${pct}% of chair time booked.${unplaced.length ? ` ${unplaced.length} do${unplaced.length === 1 ? 'es' : ''} not fit.` : ''}`,
    bandLabel: `${pct}% booked`,
    abnormal: unplaced.length > 0 || invalid.length > 0,
    notes,
    note: 'Scheduling arithmetic only: it does not know nurse ratios or pharmacy preparation capacity.',
  };
}
