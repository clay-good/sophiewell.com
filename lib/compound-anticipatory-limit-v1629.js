// spec-v1629 tool 25: anticipatory compounding limit (section 503A).
//
// FDA, Prescription Requirement Under Section 503A of the Federal Food, Drug, and Cosmetic Act
// (guidance for industry, December 2016, docket FDA-2016-D-0269), re-read on October 11, 2026. It is
// listed as final on FDA's site. Its interim compliance policy: FDA does not intend to consider
// whether a compounder has exceeded the limited-quantity condition if "the compounder holds for
// distribution no more than a 30-day supply of a particular compounded drug product ... to fill
// valid prescriptions it has not yet received", and that amount "is based on the number of valid
// prescriptions that the compounder has received for identified individual patients in a 30-day
// period over the past year that the compounder selected." Its example: the highest number of units
// in a 30-day period in the last year is 500, so compounding up to 500 units in advance and holding
// no more than that is consistent with the policy.
//
//   ceiling   = the units on valid patient-specific prescriptions received in the 30-day period
//               chosen from the past year; from a dated list the tool finds the highest such total
//               (any 30 consecutive days, so a window may cross a month boundary)
//   room left = ceiling - units now held for distribution
//
// Prescriptions dated more than a year before the as-of date are ignored, and so are any dated after
// it. This is a nonbinding enforcement policy, and the beyond-use date still limits what a batch is
// worth making. The page is under the weekly page watch.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { parseIsoStrict } from './deadline.js';
import { todayUtc } from './pa/date.js';

export const GUIDANCE = {
  edition: 'December 2016', route: 'B', readOn: '2026-10-11',
  source: { label: 'FDA, Prescription Requirement Under Section 503A of the Federal Food, Drug, and Cosmetic Act (December 2016)', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/prescription-requirement-under-section-503a-federal-food-drug-and-cosmetic-act-guidance-industry' },
};
export const WINDOW_DAYS = 30;
const DAY = 86400000;
const NOTE = 'FDA\'s December 2016 guidance states an interim, nonbinding enforcement policy; a state board may be stricter. Count only valid prescriptions for identified patients. The beyond-use date still limits what a batch is worth making. The tool counts; it does not say whether to compound.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(9));
const show = (x) => sig(x).toLocaleString('en-US', { maximumFractionDigits: 3 });
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export function compoundAnticipatoryLimit(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.prescriptions ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter the prescriptions received for this product, one per line: the date received (YYYY-MM-DD), then the units.' };
  if (lines.length > 5000) return { valid: false, message: `${lines.length} lines is more than the 5,000 this tool counts.` };
  let asOf;
  if (blank(o.asOf)) asOf = todayUtc(now);
  else { asOf = date(o.asOf); if (!asOf) return { valid: false, message: 'Enter the as-of date as YYYY-MM-DD, or leave it blank for today.' }; }
  const end = asOf.getTime();
  const start = Date.UTC(asOf.getUTCFullYear() - 1, asOf.getUTCMonth(), asOf.getUTCDate());
  const rows = []; let old = 0; let future = 0;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    const d = p.length === 2 ? date(p[0]) : null;
    if (!d) return { valid: false, message: `Prescription line ${i + 1}: enter the date received as YYYY-MM-DD, a comma, then the units.` };
    const f = inputFault([[`the units on prescription line ${i + 1}`, p[1], null, 1e9, '']]);
    if (f) return { valid: false, message: f };
    const t = d.getTime();
    if (t > end) { future += 1; continue; }
    if (t < start) { old += 1; continue; }
    rows.push({ t, units: Number(p[1]) });
  }
  let onHand = null;
  if (!blank(o.onHand)) {
    const hf = inputFault([['the units now held for distribution', o.onHand, 0, 1e9, '']]);
    if (hf) return { valid: false, message: hf };
    onHand = Number(o.onHand);
  }
  const ignored = [];
  if (old) ignored.push(`${old} dated more than a year before ${iso(end)}`);
  if (future) ignored.push(`${future} dated after ${iso(end)}`);
  if (!rows.length) return { valid: false, message: `No prescription falls in the year ending ${iso(end)}${ignored.length ? ` (${ignored.join('; ')})` : ''}, so there is no 30-day period to select.` };

  rows.sort((a, b) => a.t - b.t);
  // The highest total over any 30 consecutive days is reached by a window that starts on a prescription date.
  let best = { units: -1, from: 0 };
  for (let i = 0; i < rows.length; i += 1) {
    const from = rows[i].t; const to = from + (WINDOW_DAYS - 1) * DAY;
    let units = 0;
    for (let j = i; j < rows.length && rows[j].t <= to; j += 1) units += rows[j].units;
    if (units > best.units) best = { units, from };
  }
  const ceiling = best.units;
  const windowEnd = best.from + (WINDOW_DAYS - 1) * DAY;
  const notes = [
    `Highest 30-day total in the year ending ${iso(end)}: ${show(ceiling)} units, on prescriptions received from ${iso(best.from)} through ${iso(windowEnd)}.`,
    `${rows.length} prescription${rows.length === 1 ? '' : 's'} counted${ignored.length ? `; ignored: ${ignored.join('; ')}` : ''}.`,
  ];
  const out = { valid: true, ceiling: sig(ceiling), windowFrom: iso(best.from), windowThrough: iso(windowEnd), counted: rows.length, ignoredOld: old, ignoredFuture: future };
  if (onHand === null) {
    notes.push('No units on hand were entered, so only the ceiling is given.');
    return { ...out, band: `Ceiling under the policy: ${show(ceiling)} units held for distribution.`, bandLabel: `${show(ceiling)} units`, notes, note: NOTE };
  }
  const room = ceiling - onHand;
  const over = sig(room) < 0;
  notes.push(over
    ? `Units on hand: ${show(onHand)}. ${show(onHand)} − ${show(ceiling)} = ${show(-room)} above the ceiling.`
    : `Units on hand: ${show(onHand)}. ${show(ceiling)} − ${show(onHand)} = ${show(room)}.`);
  return {
    ...out, onHand: sig(onHand), room: sig(room), overCeiling: over, abnormal: over,
    band: over
      ? `${show(onHand)} units on hand is ${show(-room)} above the ${show(ceiling)}-unit ceiling under the policy.`
      : `${show(room)} more unit${sig(room) === 1 ? '' : 's'} may be made under the policy: ${show(onHand)} on hand against a ceiling of ${show(ceiling)}.`,
    bandLabel: over ? `${show(-room)} over the ceiling` : `${show(room)} more units`,
    notes, note: NOTE,
  };
}
