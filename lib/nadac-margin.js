// spec-v1510 tool 2: a pharmacy's margin on one claim against NADAC (or the reader's invoice cost).
//
// NADAC per unit x quantity = the national average acquisition cost; margin = reimbursement - that cost.
// The site holds ONE NADAC week (data/nadac), so a row's rate answers only for dates from its
// effectiveDate through the week's as-of date. An earlier date had some other rate this file does not
// hold, and a later one belongs to a later week: both are "no benchmark", never the current rate.
//
// Pure: no DOM, no fetch, no clock. The caller loads the week and passes `lookup` (see lookupFrom).

import { inputFault, usDateLong } from './num.js';
import { parseDate, diffDays } from './pa/date.js';
import { datasetStatus, EXPIRED_TEXT } from './data.js';
import { splitNdc, ndc11Of } from './ndc.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unitMoney = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
const UNIT = { EA: 'each', ML: 'mL', GM: 'g' };
const INVOICE_ASK = 'Enter your invoice cost per unit to compare instead.';

// normalizeNdc('0002-1433-80') -> { ndc: '00002143380' }, the 11 digits the reference files are keyed by.
// The parsing is lib/ndc.js (spec-v1641 row 22), so the 12-digit 6-4-2 form of FDA's 2033 format is read
// too: its leading labeler zero is dropped. The three 10-digit label layouts pad a different segment, so
// 10 bare digits cannot be placed and are refused rather than guessed.
export function normalizeNdc(raw) {
  const p = splitNdc(raw);
  if (p.error === 'blank') return { error: 'blank' };
  if (p.error === 'non-digit') return { error: 'Enter the NDC as digits, with or without its hyphens.' };
  if (p.error === 'bare10') return { error: 'A 10-digit NDC without hyphens could be 4-4-2, 5-3-2 or 5-4-1. Enter it with its hyphens, or as 11 digits.' };
  if (p.error === 'length') return { error: 'An NDC has 10, 11 or 12 digits. Check the value entered.' };
  if (p.error === 'segments') return { error: 'An NDC has three parts: labeler, product and package. Check the value entered.' };
  if (p.error === 'shape') return { error: `An NDC is 4-4-2, 5-3-2, 5-4-1, 5-4-2 or 6-4-2 digits; ${p.shape} is none of them. Check the value entered.` };
  const ndc = ndc11Of(p);
  if (!ndc) return { error: 'This 12-digit NDC has a six-digit labeler code, which has no 11-digit form, and the reference files here are keyed by the 11-digit NDC. FDA assigns only 5-digit labeler codes today; check the value entered.' };
  return { ndc };
}

export const shardName = (ndc11) => `${ndc11.slice(0, 5)}.json`;
const dashed = (n) => `${n.slice(0, 5)}-${n.slice(5, 9)}-${n.slice(9)}`;

// lookupFrom({ ndc, manifest, week, rows, now }) -> the `lookup` nadacMargin takes. `rows` is the labeler's
// shard, or null when the manifest lists no shard for that labeler (so an offline failure to fetch is
// never read as "not in NADAC": the caller passes { status: 'unavailable' } for that instead).
export function lookupFrom({ ndc, manifest, week, rows, now }) {
  if (datasetStatus(manifest, now).status === 'expired') return { status: 'expired' };
  const asOfDate = week && week.asOfDate;
  const listed = (manifest.shards || []).some((s) => s.name === shardName(ndc));
  const row = listed && Array.isArray(rows) ? rows.find((r) => r.ndc === ndc) : null;
  return row ? { status: 'found', row, asOfDate } : { status: 'not-listed', asOfDate };
}

// nadacOn(lookup, isoDate) -> { ok: true, perUnit, unit, row } or { ok: false, kind, reason, week, effectiveDate }.
// The one date rule both nadac-margin and pharmacy-spread-check use: a row answers from its effective date
// through the week's as-of date. `reason` is the short form a batch result table prints per claim.
export function nadacOn(lookup, isoDate) {
  const lk = lookup || { status: 'unavailable' };
  const week = lk.asOfDate ? usDateLong(lk.asOfDate) : 'the week on file';
  if (lk.status === 'expired') return { ok: false, kind: 'expired', week, reason: 'NADAC data has passed its review date' };
  if (lk.status === 'unavailable') return { ok: false, kind: 'unavailable', week, reason: 'NADAC could not be loaded' };
  if (lk.status !== 'found') return { ok: false, kind: 'not-listed', week, reason: `not in the NADAC week of ${week}` };
  const r = lk.row;
  const dos = parseDate(isoDate);
  if (diffDays(dos, parseDate(r.effectiveDate)) < 0) return { ok: false, kind: 'before', week, effectiveDate: r.effectiveDate, reason: `NADAC took effect ${usDateLong(r.effectiveDate)}, after the fill date` };
  if (lk.asOfDate && diffDays(dos, parseDate(lk.asOfDate)) > 0) return { ok: false, kind: 'after', week, reason: `the fill date is after the NADAC week of ${week}` };
  return { ok: true, perUnit: r.perUnit, unit: UNIT[r.pricingUnit] || r.pricingUnit, row: r };
}

export function nadacMargin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the quantity dispensed', o.quantity, 0.001, 1e6, 'units'],
    ['the reimbursement (ingredient cost plus dispensing fee)', o.reimbursed, 0, 1e7, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const q = Number(o.quantity);
  const paid = Number(o.reimbursed);
  const n = normalizeNdc(o.ndc);
  const ndcText = n.ndc ? `NDC ${dashed(n.ndc)}` : null;
  const notes = [];
  let perUnit;
  let basis;
  let unit = 'unit';
  let row = null;

  if (String(o.cost ?? '').trim()) {
    const cf = inputFault([['your invoice cost per unit', o.cost, 0, 1e6, 'dollars']]);
    if (cf) return { valid: false, message: cf };
    if (n.error && n.error !== 'blank') return { valid: false, message: n.error };
    perUnit = Number(o.cost);
    basis = 'invoice';
    notes.push('Your invoice cost is used in place of NADAC.');
  } else {
    if (n.error === 'blank') return { valid: false, message: 'Enter the NDC to price the claim against NADAC, or your invoice cost per unit.' };
    if (n.error) return { valid: false, message: n.error };
    const dos = parseDate(o.serviceDate);
    if (!dos) return { valid: false, message: 'Enter the date of service: NADAC is priced by date.' };
    const b = nadacOn(o.lookup, dos.toISOString().slice(0, 10));
    if (!b.ok) {
      const iso = dos.toISOString().slice(0, 10);
      const msg = {
        expired: EXPIRED_TEXT,
        unavailable: 'The NADAC file could not be loaded.',
        'not-listed': `${ndcText} is not in the NADAC week of ${b.week}. NADAC does not survey every drug.`,
        before: `No benchmark: this NDC's NADAC took effect ${usDateLong(b.effectiveDate)}, and this site holds only the week of ${b.week}, not the rate on ${usDateLong(iso)}.`,
        after: `No benchmark yet: this site holds NADAC as of ${b.week}, and the rate on ${usDateLong(iso)} comes with a later week.`,
      }[b.kind];
      return { valid: false, message: `${msg} ${INVOICE_ASK}` };
    }
    perUnit = b.perUnit;
    unit = b.unit;
    basis = 'nadac';
    row = b.row;
  }

  const cost = Math.round(perUnit * q * 100) / 100;
  const margin = Math.round((paid - cost) * 100) / 100;
  const pct = paid > 0 ? (Math.round((margin / paid) * 1000) / 10 || 0) : null;
  const pctText = pct == null ? '' : ` (${pct === 0 && margin !== 0 ? 'under 0.1%' : `${Math.abs(pct)}%`} of the reimbursement)`;
  const what = basis === 'nadac'
    ? `${ndcText} (${row.description}): NADAC ${unitMoney(perUnit)} per ${unit}, effective ${usDateLong(row.effectiveDate)}, times ${q} = ${money(cost)}.`
    : `${ndcText ? `${ndcText}: invoice` : 'Invoice'} cost ${unitMoney(perUnit)} per unit times ${q} = ${money(cost)}.`;
  const against = basis === 'nadac' ? 'NADAC' : 'your invoice cost';
  const verdict = margin < 0
    ? `Reimbursed ${money(paid)}: ${money(-margin)} below ${against}${pctText}. This claim is paid below acquisition cost.`
    : `Reimbursed ${money(paid)}: a margin of ${money(margin)}${pctText}.`;
  if (pct == null) notes.push('Nothing was reimbursed, so the margin has no percentage.');
  if (basis === 'nadac') notes.push('NADAC is a national average of retail pharmacy invoice prices; your own cost may differ, and you can enter it instead.');
  return {
    valid: true, basis, cost, margin, percent: pct, belowCost: margin < 0, abnormal: margin < 0,
    effectiveDate: basis === 'nadac' ? row.effectiveDate : null,
    band: `${what} ${verdict}`,
    bandLabel: margin < 0 ? `Below cost by ${money(-margin)}` : `Margin ${money(margin)}`,
    notes,
    note: 'NADAC is a benchmark, not a payment rate: the pharmacy\'s contract sets what it is paid.',
  };
}

// spec-v1510 tool 2, batch: a pharmacy's claims CSV against NADAC, margin by drug, by payer and in total --
// how a small pharmacy finds the contracts that lose money. Each claim uses nadacOn (the single-claim
// rule); a row's own invoice cost, when the file has one, replaces NADAC for that row. A claim with no
// benchmark is listed and left out of every total, never priced at zero. Money sums in whole cents.
// Without `nadac` the result names the labelers it needs (as pharmacy-spread-check does).
export function nadacMarginBatch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = Array.isArray(o.claimRows) ? o.claimRows : [];
  if (!raw.length) return { valid: false, message: 'Load a CSV of claims, one per row: NDC, quantity, fill date, reimbursement, and the payer.' };
  const cents = (x) => Math.round(Number(x) * 100);
  const read = raw.map((c, i) => {
    const n = normalizeNdc(c.ndc);
    if (n.error) return { line: i + 1, error: n.error === 'blank' ? 'no NDC' : n.error };
    const f = inputFault([['the quantity', c.quantity, 0.001, 1e6, 'units'], ['the reimbursement', c.reimbursed, 0, 1e7, 'dollars']]);
    if (f) return { line: i + 1, error: f };
    const dos = parseDate(c.fill_date);
    if (!dos) return { line: i + 1, error: 'Enter the fill date.' };
    let cost = null;
    if (String(c.cost ?? '').trim()) {
      const cf = inputFault([['the invoice cost per unit', c.cost, 0, 1e6, 'dollars']]);
      if (cf) return { line: i + 1, error: cf };
      cost = Number(c.cost);
    }
    return { line: i + 1, ndc: n.ndc, quantity: Number(c.quantity), date: dos.toISOString().slice(0, 10), paid: cents(c.reimbursed), payer: String(c.payer ?? '').trim() || '(no payer)', cost };
  });
  const need = [...new Set(read.filter((c) => !c.error && c.cost == null).map((c) => c.ndc.slice(0, 5)))].sort();
  const nd = o.nadac;
  if (need.length && (!nd || typeof nd !== 'object')) return { valid: false, needLabelers: need, message: 'Looking up NADAC for the drugs in these claims...' };
  const byNdc = new Map(((nd && nd.rows) || []).map((r) => [r.ndc, r]));
  const rows = read.map((c) => {
    if (c.error) return { line: c.line, status: 'invalid', reason: c.error };
    let perUnit;
    let basis;
    let description = null;
    if (c.cost != null) { perUnit = c.cost; basis = 'invoice'; } else {
      let lk;
      if (nd.status === 'expired' || nd.status === 'unavailable') lk = { status: nd.status };
      else if (nd.labelers && nd.labelers[c.ndc.slice(0, 5)] === 'listed' && byNdc.has(c.ndc)) lk = { status: 'found', row: byNdc.get(c.ndc), asOfDate: nd.asOfDate };
      else if (nd.labelers && nd.labelers[c.ndc.slice(0, 5)] === 'unavailable') lk = { status: 'unavailable' };
      else lk = { status: 'not-listed', asOfDate: nd.asOfDate };
      const b = nadacOn(lk, c.date);
      if (!b.ok) return { line: c.line, ndc: c.ndc, payer: c.payer, status: 'no-benchmark', reason: b.reason };
      perUnit = b.perUnit; basis = 'nadac'; description = b.row.description;
    }
    const cost = Math.round(perUnit * c.quantity * 100);
    return { line: c.line, ndc: c.ndc, payer: c.payer, status: 'priced', basis, description, perUnit, cost, paid: c.paid, margin: c.paid - cost };
  });
  const priced = rows.filter((r) => r.status === 'priced');
  const group = (key, label) => {
    const m = new Map();
    for (const r of priced) {
      const k = key(r);
      const t = m.get(k) || { [label]: k, claims: 0, paid: 0, cost: 0, margin: 0, below: 0 };
      t.claims += 1; t.paid += r.paid; t.cost += r.cost; t.margin += r.margin; if (r.margin < 0) t.below += 1;
      m.set(k, t);
    }
    return [...m.values()].sort((a, b) => a.margin - b.margin);
  };
  const byDrug = group((r) => `${r.ndc.slice(0, 5)}-${r.ndc.slice(5, 9)}-${r.ndc.slice(9)}`, 'ndc');
  for (const d of byDrug) d.description = (priced.find((r) => `${r.ndc.slice(0, 5)}-${r.ndc.slice(5, 9)}-${r.ndc.slice(9)}` === d.ndc) || {}).description || null;
  const byPayer = group((r) => r.payer, 'payer');
  const total = priced.reduce((t, r) => ({ paid: t.paid + r.paid, cost: t.cost + r.cost, margin: t.margin + r.margin }), { paid: 0, cost: 0, margin: 0 });
  const money = (c) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const plural = (n, one) => `${n.toLocaleString('en-US')} ${one}${n === 1 ? '' : 's'}`;
  const unpriced = rows.length - priced.length;
  const losers = byPayer.filter((p) => p.margin < 0);
  const notes = [];
  if (unpriced) notes.push(`${plural(unpriced, 'claim')} could not be priced (no benchmark for the fill date, or inputs to correct) and ${unpriced === 1 ? 'is' : 'are'} left out of the totals, not priced at zero.`);
  if (losers.length) notes.push(`Paid below cost overall: ${losers.map((p) => `${p.payer} (${money(p.margin)} on ${plural(p.claims, 'claim')})`).join('; ')}.`);
  notes.push('NADAC is a national average of retail pharmacy invoice prices; a row with its own invoice cost uses that instead.');
  return {
    valid: true, rows, byDrug, byPayer, total,
    band: priced.length
      ? `${priced.length.toLocaleString('en-US')} of ${plural(rows.length, 'claim')} priced: reimbursed ${money(total.paid)} against a cost of ${money(total.cost)}, a margin of ${money(total.margin)}.`
      : `None of the ${plural(rows.length, 'claim')} could be priced, so there is no total.`,
    bandLabel: priced.length ? `Margin ${money(total.margin)}` : 'No benchmark',
    abnormal: total.margin < 0 || !priced.length,
    notes,
    note: 'NADAC is a benchmark, not a payment rate: each contract sets what the pharmacy is paid.',
  };
}
