// spec-v1513 tools 1 and 3: proportion of days covered by the Part D Star method, and the list of patients
// who can still reach 80% this year.
//
// CMS 2026 Star Ratings Technical Notes (updated September 25, 2025), measures D08-D10 and Attachment L:
// the index date is the first fill of a target drug in the measurement year; the treatment period runs from
// it to the end of the year (or of enrollment, or death) and must be at least 91 days; the denominator needs
// at least 2 fills on different dates; the numerator is a PDC of 80% or more. A fill's days are shifted
// forward only past an earlier fill of the SAME ingredient; overlaps between different drugs in the class
// are counted once and not shifted. Inpatient and skilled nursing stay days (discharge day included) come
// out of both the numerator and the denominator, and supply overlapping a stay shifts to after it; stays
// spanning the whole treatment period exclude the patient. Excluded: hospice, ESRD or dialysis (all three
// measures); any insulin (D08); sacubitril/valsartan (D09). The reader maps each fill to its measure: the
// tools ship neither the PQA specification nor its NDC list.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';

const DAY = 86400000;
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
export const MEASURES = { D08: 'diabetes medications', D09: 'RAS antagonists', D10: 'statins' };
const key = (s) => String(s ?? '').trim().toLowerCase();

function parse(o) {
  const fills = [];
  for (const [i, line] of String(o.fills ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 5) return { error: `Fill line ${i + 1} ("${line.slice(0, 40)}"): enter patient, measure (D08, D09 or D10), fill date, days supply, ingredient.` };
    const [pt, m, d, ds, ing] = p;
    const measure = m.toUpperCase();
    if (!MEASURES[measure]) return { error: `Fill line ${i + 1}: the measure must be D08, D09 or D10.` };
    const dt = date(d);
    if (!dt) return { error: `Fill line ${i + 1}: enter the fill date as YYYY-MM-DD.` };
    const days = Number(ds);
    if (!Number.isInteger(days) || days < 1 || days > 365) return { error: `Fill line ${i + 1}: enter the days supply as a whole number from 1 to 365.` };
    if (!ing) return { error: `Fill line ${i + 1}: enter the ingredient.` };
    fills.push({ pt: key(pt), name: pt, measure, d: dt, days, ing: key(ing) });
  }
  const stays = [];
  for (const [i, line] of String(o.stays ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*,\s*/);
    const a = date(p[1]);
    const b = date(p[2]);
    if (p.length !== 3 || !a || !b || b < a) return { error: `Stay line ${i + 1}: enter patient, admit date, discharge date (YYYY-MM-DD).` };
    stays.push({ pt: key(p[0]), a, b });
  }
  const excl = new Map();
  for (const [i, line] of String(o.exclusions ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2 || !['hospice', 'esrd', 'dialysis'].includes(key(p[1]))) return { error: `Exclusion line ${i + 1}: enter patient, then hospice, esrd or dialysis.` };
    excl.set(key(p[0]), key(p[1]));
  }
  return { fills, stays, excl };
}

// One patient, one measure: the Attachment L walk.
function walk(fills, stays, start, end) {
  const inStay = (t) => stays.some((s) => t >= s.a.getTime() && t <= s.b.getTime());
  const covered = new Set();
  const cursor = new Map();
  for (const f of [...fills].sort((x, y) => x.d - y.d)) {
    let t = Math.max(f.d.getTime(), cursor.get(f.ing) ?? 0);
    let left = f.days;
    while (left > 0) {
      if (!inStay(t)) { if (t >= start && t <= end) covered.add(t); left -= 1; }
      t += DAY;
    }
    cursor.set(f.ing, t);
  }
  let stayDays = 0;
  for (let t = start; t <= end; t += DAY) if (inStay(t)) stayDays += 1;
  return { covered, stayDays, supplyEnd: Math.max(...[...cursor.values()]) };
}

function evaluate(o) {
  const yr = Number(String(o.year ?? '').trim());
  if (!Number.isInteger(yr) || yr < 2000 || yr > 2100) return { error: 'Enter the measurement year as a four-digit year.' };
  if (!String(o.fills ?? '').trim()) return { error: 'Enter the fills, one per line: patient, measure (D08, D09 or D10), fill date, days supply, ingredient.' };
  const p = parse(o);
  if (p.error) return p;
  const yStart = Date.UTC(yr, 0, 1);
  const yEnd = Date.UTC(yr, 11, 31);
  const groups = new Map();
  for (const f of p.fills) {
    if (f.d.getTime() < yStart || f.d.getTime() > yEnd) continue;
    const k = `${f.pt}|${f.measure}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(f);
  }
  const rows = [];
  for (const [k, fs] of groups) {
    const [pt, measure] = k.split('|');
    const name = fs[0].name;
    const stays = p.stays.filter((s) => s.pt === pt);
    const start = Math.min(...fs.map((f) => f.d.getTime()));
    const T = Math.round((yEnd - start) / DAY) + 1;
    const dates = new Set(fs.map((f) => f.d.getTime()));
    const r = { pt, name, measure, start, T, fills: fs };
    const allPt = p.fills.filter((f) => f.pt === pt);
    if (p.excl.has(pt)) r.out = `excluded: ${p.excl.get(pt)}`;
    else if (measure === 'D08' && allPt.some((f) => f.ing.includes('insulin'))) r.out = 'excluded: an insulin fill (D08)';
    else if (measure === 'D09' && allPt.some((f) => f.ing.includes('sacubitril'))) r.out = 'excluded: sacubitril/valsartan (D09)';
    else if (dates.size < 2) r.out = 'not in the denominator: fewer than 2 fills on different dates';
    else if (T < 91) r.out = `not in the denominator: a treatment period of ${T} days, under 91`;
    const w = walk(fs, stays, start, yEnd);
    const den = T - w.stayDays;
    if (!r.out && den <= 0) r.out = 'excluded: stays span the whole treatment period';
    r.den = den;
    r.covered = w.covered.size;
    r.pdc = den > 0 ? Math.round((w.covered.size / den) * 1000) / 10 : null;
    r.walk = w;
    r.stays = stays;
    rows.push(r);
  }
  return { rows, yr, yEnd };
}

export function pdcStar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const e = evaluate(o);
  if (e.error) return { valid: false, message: e.error };
  const { rows } = e;
  if (!rows.length) return { valid: false, message: 'No fill falls in the measurement year.' };
  const notes = [];
  const rates = [];
  for (const m of Object.keys(MEASURES)) {
    const inM = rows.filter((r) => r.measure === m);
    if (!inM.length) continue;
    const den = inM.filter((r) => !r.out);
    const num = den.filter((r) => r.pdc >= 80);
    rates.push(`${m} (${MEASURES[m]}): ${den.length ? `${num.length} of ${den.length} adherent, ${Math.round((num.length / den.length) * 1000) / 10}%` : 'no one in the denominator'}`);
    for (const r of inM) notes.push(`${r.name}, ${m}: ${r.out ? r.out : `PDC ${r.pdc}% (${r.covered} of ${r.den} days from ${longDate(new Date(r.start))}${r.stays.length ? ', stay days removed' : ''}), ${r.pdc >= 80 ? 'adherent' : 'not adherent'}`}.`);
  }
  return {
    valid: true,
    rows: rows.map((r) => ({ patient: r.name, measure: r.measure, pdc: r.pdc, inDenominator: !r.out, reason: r.out || null })),
    band: `${rates.join('; ')}.`,
    bandLabel: rates.length === 1 ? rates[0].split(': ')[1] : `${rates.length} measures`,
    notes,
    note: 'The CMS Technical Notes method on the fills entered; the reader assigns each fill to its measure. A plan\'s reported rate uses PDE data, enrollment and the PQA NDC list.',
  };
}

export function adherenceOutreachList(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const e = evaluate(o);
  if (e.error) return { valid: false, message: e.error };
  let asOf;
  if (String(o.asOf ?? '').trim()) { asOf = date(o.asOf); if (!asOf) return { valid: false, message: 'Enter the as-of date as YYYY-MM-DD, or leave it blank for today.' }; } else asOf = todayUtc(now);
  const t = asOf.getTime();
  if (t > e.yEnd) return { valid: false, message: 'The as-of date is after the measurement year; use the PDC tool for a finished year.' };
  const list = [];
  const gone = [];
  for (const r of e.rows) {
    if (r.out && !/fewer than 2 fills/.test(r.out)) continue;
    if (t < r.start) continue;
    const allowed = Math.floor(r.den * 0.2);
    let uncovered = 0;
    for (let d = r.start; d <= t; d += DAY) {
      const stay = r.stays.some((s) => d >= s.a.getTime() && d <= s.b.getTime());
      if (!stay && !r.walk.covered.has(d)) uncovered += 1;
    }
    const slack = allowed - uncovered;
    const nextDue = new Date(r.walk.supplyEnd);
    const item = { name: r.name, measure: r.measure, slack, nextDue };
    if (slack < 0) gone.push(item); else list.push(item);
  }
  list.sort((a, b) => a.slack - b.slack || a.nextDue - b.nextDue);
  const notes = list.map((x, i) => `${i + 1}. ${x.name}, ${x.measure}: ${x.slack} more uncovered day${x.slack === 1 ? '' : 's'} allowed; supply runs out ${longDate(x.nextDue)}.`);
  for (const x of gone) notes.push(`${x.name}, ${x.measure}: cannot reach 80% this year (${-x.slack} uncovered day${x.slack === -1 ? '' : 's'} over).`);
  return {
    valid: true,
    list: list.map((x) => ({ patient: x.name, measure: x.measure, slack: x.slack, nextDue: x.nextDue.toISOString().slice(0, 10) })),
    band: list.length ? `${list.length} patient-measure${list.length === 1 ? '' : 's'} can still reach 80%; call first: ${list[0].name} (${list[0].measure}), ${list[0].slack} day${list[0].slack === 1 ? '' : 's'} of slack.${gone.length ? ` ${gone.length} cannot reach 80% this year.` : ''}` : `No one on the list can still reach 80% this year${gone.length ? ` (${gone.length} past it)` : ''}.`,
    bandLabel: list.length ? `${list.length} to call` : 'None reachable',
    notes,
    note: 'Slack = the uncovered days a patient can still have and finish at 80%, from the fills entered; the method is the CMS Technical Notes\' PDC.',
  };
}
