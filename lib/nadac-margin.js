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

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unitMoney = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
const UNIT = { EA: 'each', ML: 'mL', GM: 'g' };
const INVOICE_ASK = 'Enter your invoice cost per unit to compare instead.';

// normalizeNdc('0002-1433-80') -> { ndc: '00002143380' }. The three 10-digit label layouts pad a
// different segment, so 10 bare digits cannot be placed and are refused rather than guessed.
export function normalizeNdc(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { error: 'blank' };
  const parts = s.split(/[-\s]+/);
  if (parts.some((p) => !/^\d+$/.test(p))) return { error: 'Enter the NDC as digits, with or without its hyphens.' };
  if (parts.length === 1) {
    if (s.length === 11) return { ndc: s };
    if (s.length === 10) return { error: 'A 10-digit NDC without hyphens could be 4-4-2, 5-3-2 or 5-4-1. Enter it with its hyphens, or as 11 digits.' };
    return { error: 'An NDC has 10 or 11 digits. Check the value entered.' };
  }
  if (parts.length !== 3) return { error: 'An NDC has three parts: labeler, product and package. Check the value entered.' };
  const shape = parts.map((p) => p.length).join('-');
  const pad = { '4-4-2': [5, 4, 2], '5-3-2': [5, 4, 2], '5-4-1': [5, 4, 2], '5-4-2': [5, 4, 2] }[shape];
  if (!pad) return { error: `An NDC is 4-4-2, 5-3-2, 5-4-1 or 5-4-2 digits; ${shape} is none of them. Check the value entered.` };
  return { ndc: parts.map((p, i) => p.padStart(pad[i], '0')).join('') };
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
