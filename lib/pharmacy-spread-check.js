// spec-v1604 tool 4: a plan's pharmacy claims against NADAC, the batch mode of nadac-margin.
//
// Per claim: NADAC per unit on the fill date times quantity (nadacOn, the rule nadac-margin uses, imported
// here, not copied); what the plan and member paid above that; and, where the PBM discloses what the
// pharmacy received, the spread between the two. A claim with no NADAC on its date is "no benchmark":
// counted and left out of every total, never priced at zero. Money is summed in whole cents, so the totals
// by drug and by month are the row sums to the cent.
//
// Pure: no DOM, no fetch, no clock. The caller passes `nadac` (see below); without it the result names
// the labelers whose NADAC shards it needs, so the page can load only those.

import { inputFault } from './num.js';
import { parseDate } from './pa/date.js';
import { normalizeNdc, nadacOn, shardName } from './nadac-margin.js';
import { stepOn } from './nadac-reference.js';
import { datasetStatus } from './data.js';

export const MAX_CLAIMS = 100000;
const cents = (x) => Math.round(Number(x) * 100);
export const money = (c) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dashed = (n) => `${n.slice(0, 5)}-${n.slice(5, 9)}-${n.slice(9)}`;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// Claims typed one per line: NDC, quantity, fill date, plan paid, member paid, pharmacy paid (optional).
function claimsFromText(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [ndc, quantity, fill_date, plan_paid, member_paid, pharmacy_paid] = line.split(/\s*[,\t]\s*/);
    return { ndc, quantity, fill_date, plan_paid, member_paid, pharmacy_paid };
  });
}

function readClaim(c, line) {
  const n = normalizeNdc(c.ndc);
  if (n.error) return { line, error: n.error === 'blank' ? 'no NDC' : n.error };
  const f = inputFault([
    ['the quantity', c.quantity, 0.001, 1e6, 'units'],
    ['the plan paid', c.plan_paid, -1e7, 1e7, 'dollars'],
    ['the member paid', c.member_paid, 0, 1e7, 'dollars'],
  ]);
  if (f) return { line, error: f };
  const date = parseDate(c.fill_date);
  if (!date) return { line, error: 'Enter the fill date.' };
  let pharmacy = null;
  if (!blank(c.pharmacy_paid)) {
    const pf = inputFault([['the pharmacy paid', c.pharmacy_paid, -1e7, 1e7, 'dollars']]);
    if (pf) return { line, error: pf };
    pharmacy = cents(c.pharmacy_paid);
  }
  const iso = date.toISOString().slice(0, 10);
  return { line, ndc: n.ndc, quantity: Number(c.quantity), date: iso, month: iso.slice(0, 7), paid: cents(c.plan_paid) + cents(c.member_paid), pharmacy };
}

function add(map, key, seed, c) {
  const t = map.get(key) || { ...seed, claims: 0, paid: 0, nadacCost: 0, gap: 0 };
  t.claims += 1; t.paid += c.paid; t.nadacCost += c.nadacCost; t.gap += c.gap;
  map.set(key, t);
}

// nadacFrom(manifest, week, labelers, shards, now) -> the `nadac` object below. `shards` maps each labeler
// whose shard the manifest lists to its rows, or to null when that shard failed to load.
export function nadacFrom(manifest, week, labelers, shards, now) {
  const st = datasetStatus(manifest, now);
  const edition = { id: 'nadac', sourceEdition: manifest.sourceEdition, coverage: manifest.coverage, status: st.status };
  if (st.status === 'expired') return { status: 'expired', edition };
  const listed = new Set((manifest.shards || []).map((s) => s.name));
  const out = { status: 'ok', asOfDate: week && week.asOfDate, edition, labelers: {}, rows: [] };
  for (const lab of labelers) {
    if (!listed.has(shardName(lab))) out.labelers[lab] = 'not-listed';
    else if (!Array.isArray(shards.get(lab))) out.labelers[lab] = 'unavailable';
    else { out.labelers[lab] = 'listed'; out.rows.push(...shards.get(lab)); }
  }
  return out;
}

// nadac: { status: 'ok' | 'expired' | 'unavailable', asOfDate, edition, labelers: { '00002': 'listed' |
// 'not-listed' }, rows: [NADAC rows of the listed labelers] }. spec-v1614 §6: with the reader's own NADAC file,
// `history` ({ NDC: [rows, oldest first] }, lib/nadac-reference.js) replaces `rows`, and each claim is priced at
// the step in effect on its fill date.
export function pharmacySpreadCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = Array.isArray(o.claimRows) ? o.claimRows : claimsFromText(o.claims);
  if (!raw.length) return { valid: false, message: 'Enter the claims, one per line: NDC, quantity, fill date, plan paid, member paid, and the pharmacy paid if disclosed.' };
  if (raw.length > MAX_CLAIMS) return { valid: false, message: `Up to ${MAX_CLAIMS.toLocaleString('en-US')} claims at a time. Split the file.` };
  const claims = raw.map((c, i) => readClaim(c || {}, i + 1));
  const good = claims.filter((c) => !c.error);
  const labelers = [...new Set(good.map((c) => c.ndc.slice(0, 5)))].sort();
  const nd = o.nadac;
  if (!nd || typeof nd !== 'object') return { valid: false, needLabelers: labelers, message: 'Looking up NADAC for the drugs in these claims...' };

  const byNdc = new Map((nd.rows || []).map((r) => [r.ndc, r]));
  const rows = claims.map((c) => {
    if (c.error) return { line: c.line, status: 'invalid', reason: c.error };
    let lookup;
    if (nd.status === 'expired' || nd.status === 'unavailable') lookup = { status: nd.status };
    else if (nd.history) lookup = nd.history[c.ndc] ? { status: 'found', row: stepOn(nd.history[c.ndc], c.date), asOfDate: nd.asOfDate } : { status: 'not-listed', asOfDate: nd.asOfDate };
    else if (nd.labelers && nd.labelers[c.ndc.slice(0, 5)] === 'listed' && byNdc.has(c.ndc)) lookup = { status: 'found', row: byNdc.get(c.ndc), asOfDate: nd.asOfDate };
    else if (nd.labelers && nd.labelers[c.ndc.slice(0, 5)] === 'unavailable') lookup = { status: 'unavailable' };
    else lookup = { status: 'not-listed', asOfDate: nd.asOfDate };
    const b = nadacOn(lookup, c.date);
    const base = { line: c.line, ndc: c.ndc, month: c.month, paid: c.paid, pharmacy: c.pharmacy };
    if (!b.ok) return { ...base, status: 'no-benchmark', reason: b.reason };
    const nadacCost = Math.round(b.perUnit * c.quantity * 100);
    return { ...base, status: 'priced', description: b.row.description, perUnit: b.perUnit, nadacCost, gap: c.paid - nadacCost, spread: c.pharmacy == null ? null : c.paid - c.pharmacy };
  });

  const priced = rows.filter((r) => r.status === 'priced');
  const noBench = rows.filter((r) => r.status === 'no-benchmark');
  const invalid = rows.filter((r) => r.status === 'invalid');
  const byDrug = new Map(); const byMonth = new Map();
  for (const r of priced) {
    add(byDrug, r.ndc, { ndc: dashed(r.ndc), description: r.description }, r);
    add(byMonth, r.month, { month: r.month }, r);
  }
  const total = priced.reduce((t, r) => ({ paid: t.paid + r.paid, nadacCost: t.nadacCost + r.nadacCost, gap: t.gap + r.gap }), { paid: 0, nadacCost: 0, gap: 0 });
  const disclosed = rows.filter((r) => r.pharmacy != null && r.status !== 'invalid');
  const spread = disclosed.reduce((s, r) => s + (r.paid - r.pharmacy), 0);

  const notes = [];
  if (noBench.length) notes.push(`${plural(noBench.length, 'claim')} had no NADAC for the fill date and ${noBench.length === 1 ? 'is' : 'are'} left out of the totals, not priced at zero. Each one is listed with its reason.`);
  if (invalid.length) notes.push(`${plural(invalid.length, 'claim')} could not be read (first: line ${invalid[0].line}, ${invalid[0].reason}).`);
  if (disclosed.length) notes.push(`Where the pharmacy's payment is disclosed (${plural(disclosed.length, 'claim')}), the plan and members paid ${money(spread)} more than the pharmacies received${spread < 0 ? ' (a negative spread: the pharmacies received more)' : ''}.`);
  else notes.push('No pharmacy payment was disclosed, so the spread between what was paid and what the pharmacy received is not shown.');
  const drugs = [...byDrug.values()].sort((a, b) => b.gap - a.gap || a.ndc.localeCompare(b.ndc));
  const months = [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));

  if (!priced.length) {
    return { valid: true, rows, byDrug: drugs, byMonth: months, total, spread: disclosed.length ? spread : null, band: `None of the ${plural(rows.length, 'claim')} could be priced against NADAC, so there is no total.`, bandLabel: 'No benchmark', abnormal: true, notes, note: NOTE };
  }
  const pct = total.nadacCost > 0 ? Math.round((total.gap / total.nadacCost) * 1000) / 10 : null;
  const band = `${priced.length.toLocaleString('en-US')} of ${plural(rows.length, 'claim')} priced against NADAC: ${money(total.paid)} paid by the plan and members where NADAC totals ${money(total.nadacCost)}, ${total.gap >= 0 ? `${money(total.gap)} above` : `${money(-total.gap)} below`} it${pct == null ? '' : ` (${Math.abs(pct)}%)`}.`;
  return {
    valid: true, rows, byDrug: drugs, byMonth: months, total, spread: disclosed.length ? spread : null,
    band, bandLabel: `${money(total.gap)} ${total.gap >= 0 ? 'above' : 'below'} NADAC`, abnormal: false, notes, note: NOTE,
  };
}

const NOTE = 'NADAC is a survey of what retail pharmacies pay for drugs. It is a benchmark, not a price the plan was owed.';
