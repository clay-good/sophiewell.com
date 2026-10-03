// spec-v1602 tool 2: itemized-bill-check. Each line of a hospital itemized bill beside the hospital's own
// posted prices for that code (its machine-readable standard charge file, 45 CFR 180.50): the gross
// charge, the discounted cash price, and -- only when the reader names the plan -- that plan's negotiated
// rate. A code the file does not list is "not posted", never "overcharged". Outpatient lines are also
// checked against Medicare's outpatient hospital MUE (the units Medicare would pay for a code on one day),
// with the verdict logic mue-check uses.
//
// Pure: the caller passes the price file's matching items (lib/hpt-compare.js extractForCodes) and the MUE
// rows for the codes. Money is in whole cents.

import { mueCheck } from './billing-v79.js';
import { inputFault } from './num.js';
import { parseDate } from './pa/date.js';

export const MAX_LINES = 2000;
export const SETTINGS = [
  { value: 'outpatient', text: 'Outpatient (including the emergency department)' },
  { value: 'inpatient', text: 'Inpatient (admitted)' },
];
export const PAYMENT = [
  { value: 'insured', text: 'My plan paid part of it' },
  { value: 'self-pay', text: 'I am paying myself (no insurance used)' },
];

const cents = (x) => Math.round(Number(x) * 100);
export const money = (c) => (c == null ? '' : `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// Lines typed one per line: date (may be blank), code, units, charge, description.
export function linesFromText(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [date, code, units, charge, ...rest] = line.split(/\s*[,\t]\s*/);
    return { date, code, units, charge, description: rest.join(', ') };
  });
}

function readLine(c, line) {
  const code = String(c.code ?? '').trim().toUpperCase();
  if (!code) return { line, error: 'no billing code' };
  const f = inputFault([['the units', c.units, 0.001, 100000, 'units'], ['the charge', c.charge, 0, 1e8, 'dollars']]);
  if (f) return { line, error: f };
  let date = null;
  if (!blank(c.date)) {
    const d = parseDate(c.date);
    if (!d) return { line, error: 'the date is not a date' };
    date = d.toISOString().slice(0, 10);
  }
  return { line, code, date, units: Number(c.units), charge: cents(c.charge), description: String(c.description ?? '').trim() };
}

// The posted numbers for one code in one setting: the highest gross charge and cash price the file posts
// (a line above the highest is above every posted one), and the named plan's negotiated dollar rates.
function posted(items, setting, plan) {
  const here = items.filter((it) => !it.setting || it.setting === 'both' || it.setting === setting);
  const max = (k) => { const v = here.map((it) => it[k]).filter((n) => n != null); return v.length ? cents(Math.max(...v)) : null; };
  const want = String(plan || '').trim().toLowerCase();
  const rates = want ? here.flatMap((it) => it.payers.filter((p) => `${p.payer} ${p.plan}`.toLowerCase().includes(want))) : [];
  return { items: here.length, gross: max('gross'), cash: max('cash'), planRates: rates };
}

// itemizedBillCheck({ lines | bill, setting, payment, plan, prices: { code: items[] } | null,
//   hospital, mue: { code: { mue, mai } } | null, mueEdition })
export function itemizedBillCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = Array.isArray(o.lines) ? o.lines : linesFromText(o.bill);
  if (!raw.length) return { valid: false, message: 'Enter the bill lines, one per line: date, code, units, charge, description.' };
  if (raw.length > MAX_LINES) return { valid: false, message: `Up to ${MAX_LINES.toLocaleString('en-US')} bill lines at a time.` };
  if (!SETTINGS.some((s) => s.value === o.setting)) return { valid: false, message: 'Choose whether the stay was inpatient or outpatient.' };
  if (!PAYMENT.some((s) => s.value === o.payment)) return { valid: false, message: 'Choose whether your plan paid part of the bill or you are paying yourself.' };
  const lines = raw.map((c, i) => readLine(c || {}, i + 1));
  const codes = [...new Set(lines.filter((l) => !l.error).map((l) => l.code))];
  if (!o.prices) return { valid: false, needCodes: codes, message: 'Choose the hospital\'s price file to compare against.' };

  // MUE: an outpatient line's units against the outpatient hospital MUE, per line (MAI 1) or summed per
  // code per date of service (MAI 2 and 3; without dates, per line, as the note says).
  const perDay = new Map();
  for (const l of lines) if (!l.error && l.date) perDay.set(`${l.code}|${l.date}`, (perDay.get(`${l.code}|${l.date}`) || 0) + l.units);
  let undatedDateEdits = 0;
  const rows = lines.map((l) => {
    if (l.error) return { line: l.line, status: 'invalid', reason: l.error };
    const p = posted((o.prices || {})[l.code] || [], o.setting, o.plan);
    const perUnit = Math.round(l.charge / l.units);
    const findings = [];
    if (!p.items) findings.push('not posted: the hospital\'s file does not list this code for this setting');
    if (p.gross != null && perUnit > p.gross) findings.push(`charged ${money(perUnit)} a unit, above the ${money(p.gross)} gross charge the hospital posted`);
    if (o.payment === 'self-pay' && p.cash != null && perUnit > p.cash) findings.push(`charged ${money(perUnit)} a unit, above the ${money(p.cash)} discounted cash price the hospital posted`);
    let mue = null;
    const m = (o.mue || {})[l.code];
    if (o.setting === 'outpatient' && m && Number.isFinite(m.mue) && [1, 2, 3].includes(m.mai)) {
      const units = m.mai === 1 || !l.date ? l.units : perDay.get(`${l.code}|${l.date}`);
      if (m.mai !== 1 && !l.date) undatedDateEdits += 1;
      mue = mueCheck({ unitsBilled: units, mueValue: m.mue, mai: m.mai });
      if (!mue.pass) findings.push(`${units} units ${m.mai === 1 || !l.date ? 'on this line' : `of ${l.code} on ${l.date}`}, above the ${m.mue} Medicare would pay (outpatient hospital MUE, MAI ${m.mai})`);
    }
    const planRates = p.planRates.map((r) => (r.dollar != null ? money(cents(r.dollar)) : r.percentage != null ? `${r.percentage}%` : r.algorithm || '')).filter(Boolean);
    return {
      line: l.line, status: findings.length ? 'ask' : 'ok', code: l.code, date: l.date, description: l.description, units: l.units, charge: l.charge, perUnit,
      gross: p.gross, cash: p.cash, planRates, over: p.gross != null && perUnit > p.gross ? l.charge - p.gross * l.units : 0, findings,
    };
  });
  const good = rows.filter((r) => r.status !== 'invalid');
  const charged = good.reduce((n, r) => n + r.charge, 0);
  const over = good.reduce((n, r) => n + r.over, 0);
  const ask = good.filter((r) => r.status === 'ask').length;
  const notPosted = good.filter((r) => r.findings.some((f) => f.startsWith('not posted'))).length;
  const notes = [];
  if (!o.plan) notes.push('No plan was named, so no negotiated rate is shown: the tool never guesses which plan row applies.');
  else if (!good.some((r) => r.planRates.length)) notes.push(`The hospital's file lists no rate for a plan matching "${o.plan}" for these codes. Enter the plan name as it appears in the file.`);
  if (undatedDateEdits) notes.push(`${plural(undatedDateEdits, 'line')} had no date, so ${undatedDateEdits === 1 ? 'its' : 'their'} units were checked one line at a time against a per-day limit.`);
  if (o.setting === 'outpatient') notes.push(`Units are checked against Medicare's outpatient hospital medically unlikely edits${o.mueEdition ? ` (${o.mueEdition})` : ''}. Your plan may use other limits. Code pairs billed together are not checked here.`);
  else notes.push('Medicare\'s units edits apply to outpatient claims, so inpatient lines are not checked for units. Code pairs billed together are not checked here.');
  return {
    valid: true, rows, hospital: o.hospital || '',
    totals: { charged, over, lines: good.length, ask, notPosted },
    band: `${plural(good.length, 'line')} totaling ${money(charged)}; ${ask ? `${plural(ask, 'line')} worth asking about${over ? `, ${money(over)} above the gross charges the hospital posted` : ''}` : 'none above what the hospital posted'}.`,
    abnormal: ask > 0, notes,
  };
}

export const BILL_FIELDS = [
  { id: 'date', label: 'Date of service', synonyms: ['service date', 'date of service', 'dos', 'date'] },
  { id: 'code', label: 'Code (CPT or HCPCS)', required: true, synonyms: ['cpt', 'hcpcs', 'cpt code', 'hcpcs code', 'cpt/hcpcs', 'procedure code', 'code'] },
  { id: 'description', label: 'Description', synonyms: ['description', 'item', 'service', 'item description'] },
  { id: 'units', label: 'Units', required: true, synonyms: ['units', 'qty', 'quantity'] },
  { id: 'charge', label: 'Charge', required: true, synonyms: ['charge', 'charges', 'amount', 'total charge', 'billed amount', 'line charge'] },
];
