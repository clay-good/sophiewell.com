// spec-v1604 tool 2: tic-rate-lookup. Streams an insurer's in-network rates file once and keeps only
// the rates for the billing codes the reader names (and, if given, the providers by NPI or TIN), then
// sets each professional rate beside the Medicare physician fee schedule amount for the locality the
// reader chose. Memory follows one in_network item plus the matches, never the file.

import { JsonParser } from './json-stream.js';
import { skip } from './schema-check.js';
import { repriceProfessional, repriceOutpatient, repriceInpatient } from './medicare-reprice.js';

export const MAX_CODES = 50;
export const MAX_ROWS = 20000;
const ITEM_KEYS = ['billing_code', 'billing_code_type', 'billing_code_type_version', 'name', 'description', 'negotiation_arrangement'];
const DOLLAR_TYPES = new Set(['negotiated', 'fee schedule', 'derived']);
const PROFESSIONAL_CODE_TYPES = new Set(['CPT', 'HCPCS']);

// parseQuery(codesText, providersText) -> { codes, npis, tins, error }
export function parseQuery(codesText, providersText = '') {
  const codes = [...new Set(String(codesText || '').toUpperCase().split(/[\s,;]+/).filter(Boolean))];
  if (!codes.length) return { error: 'Enter at least one billing code.' };
  if (codes.length > MAX_CODES) return { error: `Enter at most ${MAX_CODES} billing codes; ${codes.length} were entered.` };
  const npis = new Set(); const tins = new Set(); const bad = [];
  for (const t of String(providersText || '').split(/[\s,;]+/).filter(Boolean)) {
    if (/^[1-9]\d{9}$/.test(t)) npis.add(Number(t));
    else if (/^\d{2}-?\d{7}$/.test(t)) tins.add(t.replace('-', ''));
    else bad.push(t);
  }
  if (bad.length) return { error: `${bad[0]} is neither a 10-digit NPI nor a 9-digit TIN.` };
  return { codes, npis, tins };
}

const groupMatches = (g, q) => (!q.npis.size && !q.tins.size)
  || (g.npi || []).some((n) => q.npis.has(Number(n)))
  || (g.tin && q.tins.has(String(g.tin.value || '').replace('-', '')));

const describeGroups = (groups) => {
  const tins = [...new Set(groups.map((g) => (g.tin ? `${g.tin.business_name ? `${g.tin.business_name} ` : ''}${String(g.tin.type || '').toUpperCase()} ${g.tin.value}` : '')).filter(Boolean))];
  const npis = new Set(groups.flatMap((g) => (g.npi || []).filter((n) => n)));
  return `${tins.slice(0, 3).join('; ')}${tins.length > 3 ? `; and ${tins.length - 3} more` : ''}${npis.size ? ` (${npis.size.toLocaleString('en-US')} NPI${npis.size === 1 ? '' : 's'})` : ''}`;
};

// extractRates(blob, query, onProgress) -> { rows, items, matchedItems, truncated, meta, error }
// rows hold provider group ids until the end, because provider_references may follow in_network.
export async function extractRates(blob, query, onProgress) {
  const wanted = new Set(query.codes);
  const magic = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  let bytes = 0;
  const counted = blob.stream().pipeThrough(new TransformStream({ transform(chunk, c) { bytes += chunk.byteLength; onProgress?.(bytes); c.enqueue(chunk); } }));
  const parser = new JsonParser(magic[0] === 0x1f && magic[1] === 0x8b ? counted.pipeThrough(new DecompressionStream('gzip')) : counted);
  const groups = new Map(); const raw = []; const meta = {};
  let items = 0; let matchedItems = 0; let truncated = false;
  const takeRates = (item, rates) => {
    for (const rate of rates) {
      const inline = Array.isArray(rate.provider_groups) ? rate.provider_groups : null;
      for (const price of rate.negotiated_prices || []) {
        if (raw.length >= MAX_ROWS) { truncated = true; return; }
        raw.push({ item, refs: rate.provider_references || [], inline, price });
      }
    }
  };
  try {
    await parser.expect('{');
    if ((await parser.peek()).type !== '}') {
      while (true) {
        const key = (await parser.expect('value')).value; await parser.expect(':');
        if (key === 'provider_references') {
          await parser.arrayItems((g) => { if (g && g.provider_group_id != null) groups.set(g.provider_group_id, g.provider_groups || []); });
        } else if (key === 'in_network') {
          await parser.expect('[');
          if ((await parser.peek()).type === ']') await parser.next();
          else {
            while (true) {
              items += 1;
              const item = {}; let rates = null; let pending = null;
              await parser.expect('{');
              if ((await parser.peek()).type !== '}') {
                while (true) {
                  const k = (await parser.expect('value')).value; await parser.expect(':');
                  if (ITEM_KEYS.includes(k)) item[k] = await parser.value();
                  else if (k === 'negotiated_rates' && (item.billing_code == null || wanted.has(String(item.billing_code).toUpperCase()))) {
                    // A billing code read after its rates is rare; the rates are held until it is known.
                    pending = []; await parser.arrayItems((r) => { if (pending.length < MAX_ROWS) pending.push(r); });
                  } else await skip(parser);
                  const sep = await parser.next(); if (sep.type === '}') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing brace in an in_network item.');
                }
              } else await parser.next();
              rates = pending;
              if (rates && wanted.has(String(item.billing_code ?? '').toUpperCase())) { matchedItems += 1; if (!truncated) takeRates(item, rates); }
              const sep = await parser.next(); if (sep.type === ']') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing bracket in in_network.');
            }
          }
        } else if (['reporting_entity_name', 'last_updated_on', 'plan_name', 'version'].includes(key)) meta[key] = await parser.value();
        else await skip(parser);
        const sep = await parser.next(); if (sep.type === '}') break; if (sep.type !== ',') throw new SyntaxError('Expected a comma or closing brace in the JSON root.');
      }
    } else await parser.next();
  } catch (error) {
    return { error: `${blob.name || 'The file'} could not be read: ${error instanceof Error ? error.message : String(error)}`, rows: [], items, matchedItems, truncated, meta };
  }
  const rows = [];
  for (const r of raw) {
    const g = r.inline || r.refs.flatMap((id) => groups.get(id) || []);
    const kept = g.filter((x) => groupMatches(x, query));
    if (!kept.length && (query.npis.size || query.tins.size)) continue;
    rows.push({
      code: String(r.item.billing_code), codeType: r.item.billing_code_type || '', description: r.item.description || r.item.name || '',
      arrangement: r.item.negotiation_arrangement || '', providers: g.length ? describeGroups(kept.length ? kept : g) : `provider group ${r.refs.join(', ')} (not defined in the file)`,
      negotiatedType: r.price.negotiated_type || '', rate: r.price.negotiated_rate, billingClass: r.price.billing_class || '', setting: r.price.setting || '',
      serviceCodes: r.price.service_code || [], modifiers: r.price.billing_code_modifier || [], expiration: r.price.expiration_date || '',
    });
  }
  return { rows, items, matchedItems, truncated, meta };
}

// medicareFor(row, ctx, opps) -> { amount, method, edition } | { unpriced }. ctx = { rowsFor(code), gpci,
// conversionFactor, edition } or null when no locality was chosen; opps is the reader's own Addendum B, or null.
export function medicareFor(row, ctx, opps = null) {
  if (row.arrangement && row.arrangement !== 'ffs') return { unpriced: `a ${row.arrangement} arrangement has no single Medicare equivalent` };
  if (!DOLLAR_TYPES.has(row.negotiatedType)) return { unpriced: row.negotiatedType === 'percentage' ? 'the rate is a percentage, not a dollar amount' : `a ${row.negotiatedType || 'missing'} rate type has no Medicare equivalent here` };
  if (row.billingClass === 'institutional') return row.setting === 'inpatient' ? repriceInpatient() : repriceOutpatient({ code: row.code, codeType: row.codeType, opps });
  if (row.billingClass !== 'professional') return { unpriced: 'the rate is for professional and institutional billing together' };
  if (!PROFESSIONAL_CODE_TYPES.has(row.codeType)) return { unpriced: `${row.codeType || 'this'} codes are not on the physician fee schedule` };
  if (!ctx) return { unpriced: 'choose a Medicare locality to compare' };
  return repriceProfessional({ code: row.code, modifiers: row.modifiers, serviceCodes: row.serviceCodes, rows: ctx.rowsFor(row.code), gpci: ctx.gpci, conversionFactor: ctx.conversionFactor, edition: ctx.edition });
}

const pctOf = (rate, amount) => Math.round((rate / amount) * 1000) / 10;
const median = (xs) => (xs.length % 2 ? xs[(xs.length - 1) / 2] : Math.round(((xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2) * 10) / 10);

// summarize(files, query, ctx, opps) -> the answer: priced rows, the band and notes.
export function summarize(files, query, ctx, opps = null) {
  const rows = [];
  for (const f of files) for (const r of f.rows) {
    const m = medicareFor(r, ctx, opps);
    rows.push({ file: f.name, ...r, medicare: m.amount ?? null, pctMedicare: m.amount ? pctOf(r.rate, m.amount) : null, medicareBasis: m.amount ? `${m.method}, ${m.edition}` : m.unpriced });
  }
  const notes = [];
  for (const f of files) {
    if (f.error) notes.push(f.error);
    else if (f.truncated) notes.push(`${f.name}: only the first ${MAX_ROWS.toLocaleString('en-US')} matching rates were kept.`);
  }
  const found = new Set(rows.map((r) => r.code.toUpperCase()));
  const absent = query.codes.filter((c) => !found.has(c));
  if (absent.length) notes.push(`No rates for ${absent.join(', ')} in ${files.length === 1 ? 'the file' : 'the files'}${query.npis.size || query.tins.size ? ' for the providers named' : ''}.`);
  const priced = rows.filter((r) => r.pctMedicare != null).map((r) => r.pctMedicare).sort((a, b) => a - b);
  const groups = new Set(rows.map((r) => r.providers)).size;
  const band = !rows.length ? 'No matching rates were found.'
    : `${rows.length.toLocaleString('en-US')} rate${rows.length === 1 ? '' : 's'} for ${found.size.toLocaleString('en-US')} code${found.size === 1 ? '' : 's'} across ${groups.toLocaleString('en-US')} provider group${groups === 1 ? '' : 's'}.${priced.length ? ` ${priced.length === 1 ? `The one rate priced against Medicare is ${priced[0]}% of Medicare` : `Rates priced against Medicare run ${priced[0]}% to ${priced.at(-1)}% of Medicare (median ${median(priced)}%)`}.` : ''}`;
  return { valid: true, band, rows, notes, priced: priced.length };
}

export const CSV_HEADERS = ['File', 'Billing code', 'Code type', 'Description', 'Provider group', 'Rate type', 'Negotiated rate', 'Billing class', 'Setting', 'Place of service', 'Modifiers', 'Expires', 'Medicare amount', 'Percent of Medicare', 'Medicare basis'];
export const csvRow = (r) => [r.file, r.code, r.codeType, r.description, r.providers, r.negotiatedType, r.rate, r.billingClass, r.setting, r.serviceCodes.join(' '), r.modifiers.join(' '), r.expiration, r.medicare ?? '', r.pctMedicare ?? '', r.medicareBasis];
