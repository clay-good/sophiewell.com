// spec-v1699 (drug-interaction-kinetics tool 7): the level from the doses actually given, by superposition of each
// dose's one-compartment curve, beside the level the same doses would give on schedule. Linear kinetics only.
//   IV bolus:    C = D/V e^(-k t)
//   IV infusion: rate R = D/Tinf; during, R/(V k) (1 - e^(-k t)); after, R/(V k) (1 - e^(-k Tinf)) e^(-k (t - Tinf))
//   oral:        C = F D ka / (V (ka - k)) (e^(-k t) - e^(-ka t)); when |ka - k|/k < 1e-6, the limit F D/V k t e^(-k t)
// k = ln 2 / half-life, or CL / V.
//
// Times are hours from the first dose, or "YYYY-MM-DD HH:MM" clock times (all in one form); clock times are
// subtracted as written, so a daylight-saving change between two doses is not applied.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

export const ROUTE_OPTIONS = [
  { value: 'bolus', text: 'IV bolus' },
  { value: 'infusion', text: 'IV infusion' },
  { value: 'oral', text: 'Oral (first-order absorption)' },
];

const sig = (x) => Number(x.toPrecision(4));
const STAMP = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

// One dose's contribution at t hours after it was given.
export function doseLevel(t, dose, p) {
  if (t < 0) return 0;
  const { route, v, k } = p;
  if (route === 'bolus') return (dose / v) * Math.exp(-k * t);
  if (route === 'infusion') {
    const rate = dose / p.tinf;
    if (t <= p.tinf) return (rate / (v * k)) * (1 - Math.exp(-k * t));
    return (rate / (v * k)) * (1 - Math.exp(-k * p.tinf)) * Math.exp(-k * (t - p.tinf));
  }
  const fd = p.f * dose;
  if (Math.abs(p.ka - k) / k < 1e-6) return (fd / v) * k * t * Math.exp(-k * t);
  return ((fd * p.ka) / (v * (p.ka - k))) * (Math.exp(-k * t) - Math.exp(-p.ka * t));
}

const levelAt = (t, doses, p) => doses.reduce((s, d) => s + doseLevel(t - d.t, d.amount, p), 0);

// parseTimes(list) -> { values: hours from the reference } or { message }. All numbers, or all clock times.
function toHours(strings, label) {
  const stamps = strings.map((s) => STAMP.exec(s));
  if (stamps.every(Boolean)) {
    const ms = stamps.map((m) => Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    if (ms.some((x, i) => new Date(x).getUTCDate() !== +stamps[i][3] || +stamps[i][4] > 23 || +stamps[i][5] > 59)) return { message: `${label}: a clock time is not a real date and time.` };
    return { ms };
  }
  if (stamps.some(Boolean)) return { message: `${label}: write every time as hours or every time as YYYY-MM-DD HH:MM, not a mix.` };
  const hours = strings.map((s) => measured(s));
  if (hours.some((h) => h === null)) return { message: `${label}: write each time as hours from the first dose (for example 12) or as YYYY-MM-DD HH:MM.` };
  return { hours };
}

export function doseHistoryLevel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const route = String(o.route ?? '').trim();
  if (!['bolus', 'infusion', 'oral'].includes(route)) return { valid: false, message: 'Choose the route: IV bolus, IV infusion or oral.' };
  const lines = String(o.doses ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter the doses given, one per line: time, amount in mg.' };
  if (lines.length > 500) return { valid: false, message: 'Enter at most 500 doses.' };
  const timeStr = [];
  const amounts = [];
  for (const [i, l] of lines.entries()) {
    const m = /^(.+?)\s*,\s*([^,]+)$/.exec(l);
    if (!m) return { valid: false, message: `Dose line ${i + 1}: write it as time, amount (for example 12, 1000).` };
    const a = measured(m[2]);
    if (a === null || !(a > 0)) return { valid: false, message: `Dose line ${i + 1}: the amount must be a number of mg above 0.` };
    timeStr.push(m[1].trim());
    amounts.push(a);
  }
  const evalStr = String(o.evalTimes ?? '').split(/[;\n]|,(?!\d{3}\b)/).map((s) => s.trim()).filter(Boolean);
  if (!evalStr.length) return { valid: false, message: 'Enter the times to evaluate, separated by semicolons or new lines.' };
  if (evalStr.length > 50) return { valid: false, message: 'Enter at most 50 evaluation times.' };
  const all = toHours([...timeStr, ...evalStr], 'Times');
  if (all.message) return { valid: false, message: all.message };
  let hoursAll;
  if (all.ms) { const t0 = all.ms[0]; hoursAll = all.ms.map((x) => (x - t0) / 3600000); }
  else { const t0 = all.hours[0]; hoursAll = all.hours.map((x) => x - t0); }
  const doses = amounts.map((amount, i) => ({ t: hoursAll[i], amount }));
  const evalTimes = hoursAll.slice(lines.length);

  const v = measured(o.vd);
  if (v === null || !(v > 0)) return { valid: false, message: 'Enter the volume of distribution in liters, above 0.' };
  const hl = measured(o.halfLife);
  const cl = measured(o.clearance);
  if (hl !== null && cl !== null) return { valid: false, message: 'Enter the half-life or the clearance, not both.' };
  let k;
  if (hl !== null) { if (!(hl > 0)) return { valid: false, message: 'The half-life must be above 0 hours.' }; k = Math.LN2 / hl; }
  else if (cl !== null) { if (!(cl > 0)) return { valid: false, message: 'The clearance must be above 0 L/h.' }; k = cl / v; }
  else return { valid: false, message: 'Enter the half-life in hours, or the clearance in L/h.' };
  const tau = measured(o.interval);
  if (tau === null || !(tau > 0)) return { valid: false, message: 'Enter the scheduled dosing interval in hours, above 0.' };
  const p = { route, v, k };
  if (route === 'infusion') {
    p.tinf = measured(o.infusionHours);
    if (p.tinf === null || !(p.tinf > 0)) return { valid: false, message: 'Enter the infusion duration in hours, above 0.' };
    if (p.tinf > tau) return { valid: false, message: 'The infusion runs longer than the dosing interval; this tool handles infusions that end before the next dose.' };
  }
  if (route === 'oral') {
    p.ka = measured(o.ka);
    if (p.ka === null || !(p.ka > 0)) return { valid: false, message: 'Enter the absorption rate constant ka per hour, above 0.' };
    const f = measured(o.bioavailability);
    p.f = f === null ? null : f;
    if (p.f === null) return { valid: false, message: 'Enter the bioavailability F, from 0 to 1 (1 if the dose is already the absorbed amount).' };
    if (!(p.f > 0 && p.f <= 1)) return { valid: false, message: 'Bioavailability F must be above 0 and at most 1.' };
  }

  const first = doses.reduce((m, d) => Math.min(m, d.t), Infinity);
  const sorted = [...doses].sort((x, y) => x.t - y.t);
  const onTime = sorted.map((d, i) => ({ t: first + i * tau, amount: d.amount }));
  const flags = [];
  const seen = new Map();
  for (const d of doses) seen.set(d.t, (seen.get(d.t) || 0) + 1);
  for (const [t, c] of seen) if (c > 1) flags.push(`${c} doses at ${sig(t)} h were counted as given together.`);
  if (doses.some((d, i) => i > 0 && d.t < doses[i - 1].t)) flags.push('The dose lines are not in time order; they were sorted.');

  const rows = evalTimes.map((t) => {
    const actual = levelAt(t, doses, p);
    const sched = levelAt(t, onTime, p);
    return { t, actual, sched };
  });
  if (!rows.every((r) => Number.isFinite(r.actual) && Number.isFinite(r.sched))) return { valid: false, message: 'These inputs give no finite level.' };

  // Peak and trough of the last interval: from the last dose to one interval after it.
  const last = sorted[sorted.length - 1].t;
  let peak = { t: last, c: levelAt(last, doses, p) };
  const N = 2000;
  for (let i = 1; i <= N; i += 1) {
    const t = last + (tau * i) / N;
    const c = levelAt(t, doses, p);
    if (c > peak.c) peak = { t, c };
  }
  // Refine the sampled peak to the true maximum between its neighbors (the curve is unimodal there).
  {
    let lo = Math.max(last, peak.t - tau / N);
    let hi = Math.min(last + tau, peak.t + tau / N);
    for (let i = 0; i < 100; i += 1) {
      const m1 = lo + (hi - lo) / 3;
      const m2 = hi - (hi - lo) / 3;
      if (levelAt(m1, doses, p) < levelAt(m2, doses, p)) lo = m1; else hi = m2;
    }
    const t = (lo + hi) / 2;
    const c = levelAt(t, doses, p);
    if (c > peak.c) peak = { t, c };
  }
  if (route === 'infusion') { const c = levelAt(last + p.tinf, doses, p); if (c >= peak.c) peak = { t: last + p.tinf, c }; }
  const trough = { t: last + tau, c: levelAt(last + tau, doses, p) };

  const end = Math.max(last + tau, ...evalTimes);
  const curve = [];
  for (let i = 0; i <= 48; i += 1) {
    const t = first + ((end - first) * i) / 48;
    curve.push({ t: sig(t), actual: sig(levelAt(t, doses, p)), onTime: sig(levelAt(t, onTime, p)) });
  }
  const unit = 'mg/L';
  const head = rows[0];
  return {
    valid: true,
    levels: rows.map((r) => ({ t: sig(r.t), actual: sig(r.actual), onTime: sig(r.sched) })),
    peak: sig(peak.c), trough: sig(trough.c), curve, abnormal: false,
    band: `${sig(head.actual)} ${unit} at ${sig(head.t)} h from the doses given, against ${sig(head.sched)} ${unit} on schedule.`,
    bandLabel: `${sig(head.actual)} ${unit}`,
    notes: [
      ...rows.map((r) => `At ${sig(r.t)} h: ${sig(r.actual)} ${unit} as given; ${sig(r.sched)} ${unit} on schedule (${r.sched > 0 ? `${sig((100 * (r.actual - r.sched)) / r.sched)}%` : 'no on-schedule level'}).`),
      `Last interval, from the last dose at ${sig(last)} h: peak ${sig(peak.c)} ${unit} at ${sig(peak.t)} h; trough ${sig(trough.c)} ${unit} at ${sig(trough.t)} h.`,
      `On schedule means the same doses, in the same order, every ${tau} h from the first dose. k = ${sig(k)} per hour; half-life ${sig(Math.LN2 / k)} h; V ${v} L.`,
      ...flags,
    ],
    note: 'Linear one-compartment kinetics with the parameters entered. Drugs with saturable elimination, such as phenytoin, do not superpose; use a nonlinear method for them.',
  };
}
