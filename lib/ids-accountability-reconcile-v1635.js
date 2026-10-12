// spec-v1635 tool 23: study drug accountability and pill-count compliance.
//
// Source: 21 CFR 312.62(a), read on eCFR as current October 8, 2026 (re-read October 11, 2026): "An
// investigator is required to maintain adequate records of the disposition of the drug, including
// dates, quantity, and use by subjects." 21 CFR 312.57(a) is the sponsor's matching duty. The rule
// asks for the records; the formulas are arithmetic on them:
//   units taken   = dispensed - returned
//   expected      = units per day x (days from dispensing to return - documented hold days)
//   compliance, % = taken / expected x 100
//   site balance  = received - dispensed + returned to stock - destroyed - returned to sponsor,
//                   compared with the count on hand.
// No federal rule sets a compliance threshold. The acceptable range is the protocol's and is entered
// by the reader; with none entered, no row is called in or out of range.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { parseIsoStrict } from './deadline.js';

const NOTE = 'Arithmetic on the counts and dates entered. Returned-unit counts overstate what was taken when doses are lost or discarded, and understate it when units are not brought back, so compliance by pill count is an estimate. The acceptable range is the protocol\'s; no federal rule sets one. Do not enter names: use the study\'s subject and visit codes.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function idsAccountabilityReconcile(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.visits ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const siteKeys = [['received', 'the units received'], ['dispensedTotal', 'the units dispensed'], ['returnedToStock', 'the units returned to stock'], ['destroyed', 'the units destroyed'], ['returnedToSponsor', 'the units returned to the sponsor'], ['onHand', 'the count on hand']];
  const hasSite = siteKeys.some(([k]) => !blank(o[k]));
  if (!lines.length && !hasSite) return { valid: false, message: 'Enter at least one visit line (code, dispensed, returned, dispense date, return date, units per day, hold days), or the site balance figures.' };
  if (lines.length > 300) return { valid: false, message: 'Enter at most 300 visit lines.' };
  let lo = null; let hi = null;
  if (!blank(o.rangeLow) || !blank(o.rangeHigh)) {
    const rf = inputFault([['the lower end of the protocol compliance range', o.rangeLow, 0, 1000, '%'], ['the upper end of the protocol compliance range', o.rangeHigh, 0, 1000, '%']]);
    if (rf) return { valid: false, message: rf };
    lo = Number(o.rangeLow); hi = Number(o.rangeHigh);
    if (!(hi > lo)) return { valid: false, message: 'The upper end of the compliance range must be above the lower end.' };
  }
  const rows = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*[,\t]\s*/); const at = `Visit line ${i + 1}`;
    if (p.length < 6 || p.length > 7) return { valid: false, message: `${at}: enter the code, units dispensed, units returned, dispense date, return date, units per day, and optionally hold days, separated by commas.` };
    const f = inputFault([[`the units dispensed on line ${i + 1}`, p[1], 0, 1e6, ''], [`the units returned on line ${i + 1}`, p[2], 0, 1e6, ''], [`the units per day on line ${i + 1}`, p[5], null, 1000, ''], ...(p.length === 7 ? [[`the hold days on line ${i + 1}`, p[6], 0, 10000, '']] : [])]);
    if (f) return { valid: false, message: f };
    const from = date(p[3]); const to = date(p[4]);
    if (!from || !to) return { valid: false, message: `${at}: enter the dispense and return dates as YYYY-MM-DD.` };
    const dispensed = Number(p[1]); const returned = Number(p[2]); const perDay = Number(p[5]); const hold = p.length === 7 ? Number(p[6]) : 0;
    if (returned > dispensed) return { valid: false, message: `${at}: more units were returned than dispensed. Check the two counts.` };
    const days = Math.round((to.getTime() - from.getTime()) / 86400000);
    if (days <= 0) return { valid: false, message: `${at}: the return date must be after the dispense date.` };
    if (hold >= days) return { valid: false, message: `${at}: the hold days cover the whole interval, so no doses were expected.` };
    const taken = dispensed - returned; const expected = perDay * (days - hold); const pct = (taken / expected) * 100;
    rows.push({ code: p[0], taken, expected: Number(expected.toPrecision(8)), days, holdDays: hold, compliancePercent: Number(pct.toFixed(1)), discrepancyUnits: Number((taken - expected).toPrecision(8)), inRange: lo === null ? null : pct >= lo - 1e-9 && pct <= hi + 1e-9 });
  }
  const notes = rows.map((r) => `${r.code}: ${r.taken.toLocaleString('en-US')} taken of ${r.expected.toLocaleString('en-US')} expected over ${r.days} day${r.days === 1 ? '' : 's'}${r.holdDays ? ` less ${r.holdDays} held` : ''} = ${n1(r.compliancePercent)}%${r.inRange === null ? '' : r.inRange ? ', in the protocol range' : ', outside the protocol range'}${r.discrepancyUnits ? ` (${r.discrepancyUnits > 0 ? '+' : ''}${r.discrepancyUnits.toLocaleString('en-US')} units against expected)` : ''}.`);
  const out = { valid: true, flag: 'accountability', visits: rows };
  let site = null;
  if (hasSite) {
    const sf = inputFault(siteKeys.map(([k, label]) => [label, o[k], 0, 1e9, '']));
    if (sf) return { valid: false, message: `${sf} All six site balance figures are needed, and zero is an answer.` };
    const v = Object.fromEntries(siteKeys.map(([k]) => [k, Number(o[k])]));
    const expected = v.received - v.dispensedTotal + v.returnedToStock - v.destroyed - v.returnedToSponsor;
    site = { expectedOnHand: expected, onHand: v.onHand, discrepancy: v.onHand - expected };
    out.site = site;
    notes.push(`Site balance: ${v.received.toLocaleString('en-US')} received − ${v.dispensedTotal.toLocaleString('en-US')} dispensed + ${v.returnedToStock.toLocaleString('en-US')} returned to stock − ${v.destroyed.toLocaleString('en-US')} destroyed − ${v.returnedToSponsor.toLocaleString('en-US')} returned to sponsor = ${expected.toLocaleString('en-US')} expected on hand; ${v.onHand.toLocaleString('en-US')} counted${site.discrepancy ? `, a difference of ${site.discrepancy > 0 ? '+' : ''}${site.discrepancy.toLocaleString('en-US')}` : ', which matches'}.`);
  }
  if (rows.length && lo === null) notes.push('No protocol compliance range was entered, so no visit is called in or out of range.');
  notes.push('21 CFR 312.62(a), 312.57(a).');
  const outRows = rows.filter((r) => r.inRange === false);
  const parts = [];
  if (rows.length) parts.push(`${rows.length} visit${rows.length === 1 ? '' : 's'}: compliance ${rows.length === 1 ? `${n1(rows[0].compliancePercent)}%` : `${n1(Math.min(...rows.map((r) => r.compliancePercent)))}% to ${n1(Math.max(...rows.map((r) => r.compliancePercent)))}%`}${lo === null ? '' : `, ${outRows.length} outside the protocol range of ${lo}% to ${hi}%`}`);
  if (site) parts.push(site.discrepancy ? `site count off by ${site.discrepancy > 0 ? '+' : ''}${site.discrepancy.toLocaleString('en-US')} units` : 'site count matches the records');
  const band = `${parts.join('; ')}.`;
  return { ...out, abnormal: outRows.length > 0 || Boolean(site && site.discrepancy), band: band[0].toUpperCase() + band.slice(1), bandLabel: rows.length === 1 ? `${n1(rows[0].compliancePercent)}%` : rows.length ? `${rows.length} visits` : 'Site balance', notes, note: NOTE };
}
