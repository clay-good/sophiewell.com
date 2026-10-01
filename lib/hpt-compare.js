// spec-v1515 tool 6: one billing code across hospital price files (CMS HPT v3.0.0, CSV tall, CSV wide or
// JSON). Each file is streamed with the readers hpt-file-check uses (lib/hpt-stream-v1515.js) and only the
// items carrying the reader's code are kept, so memory is bounded by the matches, not the file. The
// comparison is pure: gross charge, discounted cash price, de-identified minimum and maximum, and each
// payer and plan's negotiated dollar, percentage or algorithm with the allowed-amount percentiles where
// the file has them. Nothing is computed that the file does not state.

import { csvRecords } from './hpt-stream-v1515.js';
import { JsonParser } from './json-stream.js';
import { prepareCsv } from './hpt-v1515.js';

export const MAX_MATCHES = 500;
const norm = (v) => String(v ?? '').trim();
const num = (v) => { const s = norm(v); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const sameCode = (a, b) => norm(a).toUpperCase() === norm(b).toUpperCase();

// parseQuery('99213') -> { code: '99213', type: null }; 'MS-DRG 470' -> { code: '470', type: 'MS-DRG' }.
export function parseQuery(raw, type) {
  const s = norm(raw);
  if (!s) return null;
  const m = /^([A-Za-z-]+)\s+(\S+)$/.exec(s);
  if (m) return { code: m[2].toUpperCase(), type: m[1].toUpperCase() };
  return { code: s.toUpperCase(), type: norm(type).toUpperCase() || null };
}

const typeOk = (want, got) => !want || norm(got).toUpperCase() === want;

// One standard-charge item, normalized: { description, setting, codes, gross, cash, min, max, payers }.
function item(description, setting, codes, gross, cash, min, max, payers) {
  return { description: norm(description), setting: norm(setting).toLowerCase(), codes, gross: num(gross), cash: num(cash), min: num(min), max: num(max), payers };
}

async function fromCsv(blob, q) {
  let rowNumber = 0; let general = null; let rawGeneral = null; let values = null; let state = null; let headers = null;
  const matches = []; let total = 0; let over = false;
  const at = (row, name) => { const i = headers.indexOf(name); return i < 0 ? '' : norm(row[i]); };
  for await (const row of csvRecords(blob.stream())) {
    rowNumber += 1;
    if (rowNumber === 1) { rawGeneral = row; general = row.map((h) => norm(h).toLowerCase()); continue; }
    if (rowNumber === 2) { values = row; continue; }
    if (rowNumber === 3) { state = prepareCsv(rawGeneral, values, row, () => {}); headers = state.headers; continue; }
    total += 1;
    const codes = state.codeNumbers.map((n) => ({ code: at(row, `code|${n}`), type: at(row, `code|${n}|type`) })).filter((c) => c.code);
    if (!codes.some((c) => sameCode(c.code, q.code) && typeOk(q.type, c.type))) continue;
    if (matches.length >= MAX_MATCHES) { over = true; continue; }
    const payers = [];
    if (state.tall) {
      const p = { payer: at(row, 'payer_name'), plan: at(row, 'plan_name'), dollar: num(at(row, 'standard_charge|negotiated_dollar')), percentage: num(at(row, 'standard_charge|negotiated_percentage')), algorithm: at(row, 'standard_charge|negotiated_algorithm') || null, methodology: at(row, 'standard_charge|methodology') || null, median: num(at(row, 'median_amount')), p10: num(at(row, '10th_percentile')), p90: num(at(row, '90th_percentile')), count: at(row, 'count') || null };
      if (p.payer || p.dollar != null || p.percentage != null || p.algorithm) payers.push(p);
    } else {
      for (const g of state.groups) {
        const v = (f) => (g.columns.has(f) ? norm(row[g.columns.get(f)]) : '');
        const p = { payer: g.payer, plan: g.plan, dollar: num(v('negotiated_dollar')), percentage: num(v('negotiated_percentage')), algorithm: v('negotiated_algorithm') || null, methodology: v('methodology') || null, median: num(v('median_amount')), p10: num(v('10th_percentile')), p90: num(v('90th_percentile')), count: v('count') || null };
        if (p.dollar != null || p.percentage != null || p.algorithm) payers.push(p);
      }
    }
    matches.push(item(at(row, 'description'), at(row, 'setting'), codes, at(row, 'standard_charge|gross'), at(row, 'standard_charge|discounted_cash'), at(row, 'standard_charge|min'), at(row, 'standard_charge|max'), payers));
  }
  if (rowNumber < 3) throw new SyntaxError('The CSV file is missing its three header rows.');
  const g = (name) => { const i = general.indexOf(name); return i < 0 ? '' : norm(values[i]); };
  return { format: state.tall ? 'CSV tall' : 'CSV wide', hospital: g('hospital_name'), location: g('location_name') || g('hospital_location'), lastUpdated: g('last_updated_on'), rows: total, matches, truncated: over };
}

async function fromJson(blob, q) {
  const parser = new JsonParser(blob.stream()); const meta = {}; const matches = []; let total = 0; let over = false;
  await parser.expect('{');
  if ((await parser.peek()).type !== '}') {
    while (true) {
      const key = (await parser.expect('value')).value; await parser.expect(':');
      if (key === 'standard_charge_information') {
        total = await parser.arrayItems((it) => {
          const codes = (Array.isArray(it.code_information) ? it.code_information : []).map((c) => ({ code: norm(c.code), type: norm(c.type) }));
          if (!codes.some((c) => sameCode(c.code, q.code) && typeOk(q.type, c.type))) return;
          for (const sc of Array.isArray(it.standard_charges) ? it.standard_charges : []) {
            if (matches.length >= MAX_MATCHES) { over = true; return; }
            const payers = (Array.isArray(sc.payers_information) ? sc.payers_information : []).map((p) => ({ payer: norm(p.payer_name), plan: norm(p.plan_name), dollar: num(p.standard_charge_dollar), percentage: num(p.standard_charge_percentage), algorithm: norm(p.standard_charge_algorithm) || null, methodology: norm(p.methodology) || null, median: num(p.median_amount), p10: num(p['10th_percentile']), p90: num(p['90th_percentile']), count: norm(p.count) || null }));
            matches.push(item(it.description, sc.setting, codes, sc.gross_charge, sc.discounted_cash, sc.minimum, sc.maximum, payers));
          }
        });
      } else if (key === 'modifier_information') await parser.arrayItems(() => {});
      else meta[key] = await parser.value();
      const sep = await parser.next(); if (sep.type === '}') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing brace in the JSON root.');
    }
  } else await parser.next();
  const rawLoc = meta.location_name ?? meta.hospital_location;
  const loc = Array.isArray(rawLoc) ? rawLoc.join('; ') : norm(rawLoc);
  return { format: 'JSON', hospital: norm(meta.hospital_name), location: loc, lastUpdated: norm(meta.last_updated_on), rows: total, matches, truncated: over };
}

// extractForCode(blob, query) -> one file's matching items, or { error } when the file cannot be read.
export async function extractForCode(blob, query) {
  const name = String(blob.name || 'file');
  try {
    const lower = name.toLowerCase();
    let json = lower.endsWith('.json') || blob.type === 'application/json';
    if (!json && !lower.endsWith('.csv')) {
      const head = new TextDecoder().decode(new Uint8Array(await blob.slice(0, 256).arrayBuffer())).replace(/^﻿/, '').trimStart();
      json = head.startsWith('{');
    }
    return { name, ...(json ? await fromJson(blob, query) : await fromCsv(blob, query)) };
  } catch (error) {
    return { name, error: error instanceof Error ? error.message : String(error) };
  }
}

const money = (n) => (n == null ? '' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

// compareHpt(files, query) -> the side-by-side result. Pure.
export function compareHpt(files, query) {
  if (!query) return { valid: false, message: 'Enter the billing code to compare (a CPT, HCPCS, MS-DRG or revenue code).' };
  if (!Array.isArray(files) || !files.length) return { valid: false, message: 'Choose two or more hospital price files.' };
  const table = [];
  const notes = [];
  for (const f of files) {
    if (f.error) { notes.push(`${f.name} could not be read: ${f.error}`); continue; }
    if (!f.matches.length) notes.push(`${f.hospital || f.name} lists no item with code ${query.code}${query.type ? ` (${query.type})` : ''} among ${f.rows.toLocaleString('en-US')} items.`);
    if (f.truncated) notes.push(`${f.hospital || f.name} has more than ${MAX_MATCHES} items for this code; the first ${MAX_MATCHES} are shown.`);
    for (const m of f.matches) {
      const base = { hospital: f.hospital || f.name, location: f.location, updated: f.lastUpdated, description: m.description, setting: m.setting, gross: m.gross, cash: m.cash, min: m.min, max: m.max };
      if (!m.payers.length) table.push({ ...base, payer: '', plan: '', negotiated: '', methodology: '', median: null, p10: null, p90: null, count: '' });
      for (const p of m.payers) {
        table.push({ ...base, payer: p.payer, plan: p.plan, negotiated: p.dollar != null ? money(p.dollar) : p.percentage != null ? `${p.percentage}%` : p.algorithm ? `algorithm: ${p.algorithm}` : '', methodology: p.methodology || '', median: p.median, p10: p.p10, p90: p.p90, count: p.count || '' });
      }
    }
  }
  const hospitals = [...new Set(table.map((t) => t.hospital))];
  const cash = table.filter((t) => t.cash != null);
  const lowCash = cash.length ? cash.reduce((a, b) => (b.cash < a.cash ? b : a)) : null;
  let band = `${table.length ? `${table.length.toLocaleString('en-US')} price row${table.length === 1 ? '' : 's'} for ${query.code} across ${hospitals.length} hospital${hospitals.length === 1 ? '' : 's'}` : `No file lists ${query.code}`}.`;
  if (lowCash) band += ` The lowest discounted cash price is ${money(lowCash.cash)} at ${lowCash.hospital}${lowCash.setting ? ` (${lowCash.setting})` : ''}.`;
  notes.push('Prices are each hospital\'s, as its file states them; a percentage or algorithm is not converted to dollars. A file\'s date says how current it is.');
  return { valid: true, table, hospitals, band, bandLabel: lowCash ? `Lowest cash ${money(lowCash.cash)}` : `${hospitals.length} hospital${hospitals.length === 1 ? '' : 's'}`, notes };
}

export const CSV_HEADERS = ['hospital', 'location', 'file_date', 'description', 'setting', 'gross_charge', 'discounted_cash', 'minimum', 'maximum', 'payer', 'plan', 'negotiated', 'methodology', 'median_allowed', '10th_percentile', '90th_percentile', 'count'];
export const csvRow = (t) => [t.hospital, t.location, t.updated, t.description, t.setting, t.gross ?? '', t.cash ?? '', t.min ?? '', t.max ?? '', t.payer, t.plan, t.negotiated, t.methodology, t.median ?? '', t.p10 ?? '', t.p90 ?? '', t.count];
