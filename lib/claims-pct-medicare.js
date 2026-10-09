// spec-v1604 tool 3: claims-pct-medicare. A plan's claims, each professional line repriced at Medicare
// (lib/medicare-reprice.js: RVU x GPCI x conversion factor for the locality chosen), then summed by
// provider and by service category: what the plan allowed as a percent of what Medicare would pay.
//
// A line that cannot be repriced (a facility claim, a code with no fee schedule amount, a modifier that
// changes the amount) is left out of the ratio and counted with its reason -- never priced at zero.
// Money is summed in whole cents. Pure: no DOM, no fetch, no clock. Without `mpfs` the result names
// the codes whose fee schedule rows it needs, so the page loads only those shards.
//
// spec-v1614 §6: with the reader's own OPPS Addendum B (`opps`, from lib/opps-addendum-b.js), a facility
// outpatient line with a HCPCS code is priced at its national OPPS rate when its status indicator is S, T or V.
// Inpatient lines (a DRG, or a claim type of inpatient) and revenue-code-only lines stay out.

import { inputFault } from './num.js';
import { parseDate } from './pa/date.js';
import { repriceProfessional } from './medicare-reprice.js';
import { oppsLine } from './opps-addendum-b.js';

export const MAX_LINES = 100000;
const cents = (x) => Math.round(Number(x) * 100);
export const money = (c) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const pct = (a, m) => Math.round((a / m) * 1000) / 10;

// The AMA CPT sections by code range, and HCPCS Level II, for grouping. A code outside them is "Other".
export function categoryOf(code) {
  if (/^[A-V]\d{4}$/.test(code)) return 'HCPCS Level II';
  if (/^\d{4}[FT]$/.test(code)) return 'Other';
  if (!/^\d{5}$/.test(code)) return 'Other';
  const n = Number(code);
  if (n >= 100 && n <= 1999) return 'Anesthesia';
  if (n >= 10004 && n <= 69990) return 'Surgery';
  if (n >= 70010 && n <= 79999) return 'Radiology';
  if (n >= 80047 && n <= 89398) return 'Pathology and laboratory';
  if (n >= 99091 && n <= 99499 && !(n >= 99100 && n <= 99199)) return 'Evaluation and management';
  if (n >= 90281 && n <= 99607) return 'Medicine';
  return 'Other';
}

// Lines typed one per line: date, provider, code, place of service, allowed, units, modifiers.
function linesFromText(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [service_date, provider, code, pos, allowed, units, ...mods] = line.split(/\s*[,\t]\s*/);
    return { service_date, provider, code, pos, allowed, units, modifiers: mods.join(' '), claim_type: '' };
  });
}

const FACILITY_TYPE = /^(institutional|facility|ub|ub-?04|inpatient|outpatient facility|hospital)$/i;

function readLine(c, line) {
  const code = String(c.code ?? '').trim().toUpperCase().replace(/^DRG\s*/, 'DRG ');
  if (!code) return { line, error: 'no billing code' };
  const f = inputFault([['the allowed amount', c.allowed, -1e7, 1e7, 'dollars']]);
  if (f) return { line, error: f };
  if (!blank(c.service_date) && !parseDate(c.service_date)) return { line, error: 'the service date is not a date' };
  let units = 1; let unitsBlank = false;
  if (blank(c.units)) unitsBlank = true;
  else {
    const uf = inputFault([['the units', c.units, 0.001, 10000, 'units']]);
    if (uf) return { line, error: uf };
    units = Number(c.units);
  }
  const pos = String(c.pos ?? '').trim().padStart(2, '0');
  const modifiers = String(c.modifiers ?? '').toUpperCase().split(/[\s,;|]+/).filter(Boolean);
  const type = String(c.claim_type ?? '').trim();
  const facility = FACILITY_TYPE.test(type) || /^DRG /.test(code) || /^0\d{3}$/.test(code);
  const outpatient = facility && !/^inpatient$/i.test(type) && !/^DRG /.test(code) && !/^0\d{3}$/.test(code);
  return { line, code, provider: String(c.provider ?? '').trim() || 'Provider not stated', pos: blank(c.pos) ? '' : pos, units, unitsBlank, modifiers, allowed: cents(c.allowed), facility, outpatient };
}

function add(map, key, l) {
  const t = map.get(key) || { key, lines: 0, allowed: 0, medicare: 0, leftOut: 0 };
  if (l.medicare == null) t.leftOut += 1; else { t.lines += 1; t.allowed += l.allowed; t.medicare += l.medicare; }
  map.set(key, t);
}

// mpfs: { status: 'ok' | 'expired' | 'unavailable', rows: { code: [PPRRVU rows] }, localities: [GPCI rows],
// conversionFactor, edition }.
export function claimsPctMedicare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = Array.isArray(o.claimRows) ? o.claimRows : linesFromText(o.claims);
  if (!raw.length) return { valid: false, message: 'Enter the claim lines, one per line: date, provider, code, place of service, allowed, units, modifiers.' };
  if (raw.length > MAX_LINES) return { valid: false, message: `Up to ${MAX_LINES.toLocaleString('en-US')} claim lines at a time. Split the file.` };
  if (blank(o.locality)) return { valid: false, message: 'Choose the Medicare locality the claims are priced against.' };
  const lines = raw.map((c, i) => readLine(c || {}, i + 1));
  const codes = [...new Set(lines.filter((l) => !l.error && !l.facility).map((l) => l.code))].sort();
  const m = o.mpfs;
  if (!m || typeof m !== 'object') return { valid: false, needCodes: codes, message: 'Looking up the fee schedule for the codes in these claims...' };
  if (m.status === 'expired') return { valid: false, message: 'The bundled physician fee schedule has passed its review date, so no line is repriced.' };
  if (m.status !== 'ok') return { valid: false, message: 'The physician fee schedule could not be loaded.' };
  const [state, number] = String(o.locality).trim().toUpperCase().split(/[\s-]+/);
  const gpci = (m.localities || []).find((g) => g.state === state && g.locality === number);
  if (!gpci) return { valid: false, message: `${o.locality} is not a Medicare physician fee schedule locality.` };

  const rows = lines.map((l) => {
    if (l.error) return { line: l.line, status: 'invalid', reason: l.error };
    if (l.facility && l.outpatient && o.opps && o.opps.rates) {
      const r = oppsLine(l.code, l.units, o.opps);
      if (r.unpriced) return { ...l, status: 'left out', reason: r.unpriced };
      return { ...l, status: 'priced', medicare: Math.round(r.amount * 100), method: r.method, category: 'Hospital outpatient (OPPS)' };
    }
    if (l.facility && l.outpatient) return { ...l, status: 'left out', reason: 'a facility outpatient claim: Medicare pays it under the OPPS; add your copy of the CMS Addendum B to price it' };
    if (l.facility) return { ...l, status: 'left out', reason: 'an inpatient or revenue-code-only facility line: Medicare pays inpatient stays under the IPPS, whose hospital base rates this site does not hold' };
    const r = repriceProfessional({ code: l.code, modifiers: l.modifiers, serviceCodes: l.pos ? [l.pos] : [], rows: (m.rows || {})[l.code] || [], gpci, conversionFactor: m.conversionFactor, edition: m.edition });
    if (r.unpriced) return { ...l, status: 'left out', reason: r.unpriced };
    return { ...l, status: 'priced', medicare: Math.round(r.amount * 100 * l.units), method: r.method, category: categoryOf(l.code) };
  });
  const priced = rows.filter((r) => r.status === 'priced');
  if (!priced.length) return { valid: false, rows, message: `None of the ${plural(rows.length, 'line')} could be repriced; each line's reason is listed.` };
  const allowed = priced.reduce((n, r) => n + r.allowed, 0);
  const medicare = priced.reduce((n, r) => n + r.medicare, 0);
  const byProvider = new Map(); const byCategory = new Map();
  for (const r of rows) {
    if (r.status === 'invalid') continue;
    add(byProvider, r.provider, r.status === 'priced' ? r : { medicare: null });
    if (r.status === 'priced') add(byCategory, r.category, r);
  }
  const finish = (map) => [...map.values()].map((t) => ({ ...t, pct: t.medicare > 0 ? pct(t.allowed, t.medicare) : null })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  const leftOut = rows.filter((r) => r.status !== 'priced');
  const reasons = new Map();
  for (const r of leftOut) reasons.set(r.reason, (reasons.get(r.reason) || 0) + 1);
  const unitsBlank = priced.filter((r) => r.unitsBlank).length;
  const ratio = pct(allowed, medicare);
  const notes = [
    `Medicare amounts are the ${m.edition} physician fee schedule for ${gpci.name} (${gpci.state} ${gpci.locality}), facility or nonfacility rate by place of service. Applied: the GPCIs and conversion factor. Not applied: the multiple-procedure, bilateral and assistant reductions, the payment for any modifier other than 26, TC or 53, sequestration, and incentive or penalty adjustments.`,
  ];
  const oppsPriced = priced.filter((x) => x.category === 'Hospital outpatient (OPPS)').length;
  if (oppsPriced) notes.push(`${plural(oppsPriced, 'facility outpatient line')} priced from your Addendum B (${o.opps.edition}) at the national OPPS rate for status indicators S, T and V. Not applied: the hospital's wage index (60% of the rate is adjusted by it), the 50% reduction for a second T procedure the same day, packaging into a comprehensive APC on the same claim, and outlier payments.`);
  if (unitsBlank) notes.push(`${plural(unitsBlank, 'priced line')} had no units and ${unitsBlank === 1 ? 'was' : 'were'} priced as 1 unit.`);
  return {
    valid: true, rows, byProvider: finish(byProvider), byCategory: finish(byCategory),
    leftOutReasons: [...reasons.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    totals: { allowed, medicare, ratio, priced: priced.length, leftOut: leftOut.length },
    band: `The plan allowed ${money(allowed)} where Medicare would pay ${money(medicare)}: ${ratio}% of Medicare, on ${priced.length.toLocaleString('en-US')} of ${plural(rows.length, 'claim line')} (${leftOut.length.toLocaleString('en-US')} left out).`,
    bandLabel: `${ratio}% of Medicare`,
    abnormal: false, notes, edition: m.edition,
  };
}

export const CSV_RESULT_HEADERS = ['sophiewell_medicare_amount', 'sophiewell_percent_of_medicare', 'sophiewell_status'];
export const csvResult = (r) => (r.status === 'priced' ? [(r.medicare / 100).toFixed(2), String(pct(r.allowed, r.medicare)), 'priced'] : ['', '', r.reason]);
