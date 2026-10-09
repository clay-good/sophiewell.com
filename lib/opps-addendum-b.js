// spec-v1614 §6 (bring your own reference file): the reader's own copy of the CMS OPPS Addendum B, read so
// claims-pct-medicare can price facility outpatient lines. The site does not bundle Addendum B: CMS serves it
// behind the AMA click-through agreement (spec-v1621 §3.4), which the reader accepts when downloading it.
//
// Layout (spec-v1621 §3.4, the 508 CSV): a few preamble rows (the first names the year), then a header that
// begins "HCPCS Code, Short Descriptor, SI, APC, Relative Weight, Payment Rate". Only the code, status
// indicator, APC and payment rate are kept; descriptors are dropped.
//
// Pricing follows the Medicare Claims Processing Manual, Pub. 100-04 ch. 4 (rev. 13799, May 28, 2026):
// status indicators S, T and V are paid separately at their APC rate (sec. 10.1.1, and the STV packaging rules
// in sec. 10.4); N is packaged; Q1 and Q2 are paid only when no S, T or V (Q1) or T (Q2) line is on the claim;
// Q3 is a composite APC; J1 and J2 are comprehensive APCs that pay for the whole claim (sec. 10.2.3); A is paid
// under another fee schedule. Only S, T and V are priced here. The rate is the national unadjusted rate: 60%
// of it is adjusted by the hospital's wage index (sec. 10.8), which a claims file does not carry, and the 50%
// reduction for a second T procedure on the same day (sec. 10.1.1) is not applied.
//
// Pure: no DOM, no fetch.

export const PRICED_SI = new Set(['S', 'T', 'V']);
const SI_REASON = {
  N: 'status indicator N: packaged, so Medicare pays nothing for it separately',
  Q1: 'status indicator Q1: paid only when no S, T or V service is on the same claim, which a line-level file cannot show',
  Q2: 'status indicator Q2: paid only when no T service is on the same claim, which a line-level file cannot show',
  Q3: 'status indicator Q3: paid through a composite APC with the other services of the episode',
  J1: 'status indicator J1: a comprehensive APC pays for the whole claim, which these lines are not grouped into',
  J2: 'status indicator J2: a comprehensive APC pays for the whole claim, which these lines are not grouped into',
  A: 'status indicator A: paid under a fee schedule other than the OPPS',
};

function splitCsvLine(line) {
  const out = []; let v = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { v += '"'; i++; } else if (c === '"') q = false; else v += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(v); v = ''; }
    else v += c;
  }
  out.push(v);
  return out.map((x) => x.trim());
}

// parseAddendumB(text) -> { edition, rates: { CODE: { si, apc, rate } }, count } or throws RangeError.
export function parseAddendumB(text) {
  const lines = String(text ?? '').replace(/^﻿/, '').split(/\r?\n/);
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  let h = -1; let cols = null;
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const cells = splitCsvLine(lines[i]).map(norm);
    if (cells.includes('hcpcs code') && cells.includes('apc') && (cells.includes('si') || cells.includes('status indicator'))) {
      cols = { code: cells.indexOf('hcpcs code'), si: cells.includes('si') ? cells.indexOf('si') : cells.indexOf('status indicator'), apc: cells.indexOf('apc'), rate: cells.indexOf('payment rate') };
      h = i; break;
    }
  }
  if (h < 0) throw new RangeError('This is not a CMS OPPS Addendum B file: no header with HCPCS Code, SI and APC was found.');
  if (cols.rate < 0) throw new RangeError('This Addendum B file has no Payment Rate column.');
  const title = lines.slice(0, h).map((l) => splitCsvLine(l).find(Boolean)).find(Boolean);
  const edition = title ? title.replace(/^Addendum B\.?\s*-?\s*/i, '').trim() : 'the Addendum B file you supplied';
  const rates = {};
  for (const line of lines.slice(h + 1)) {
    if (!line.trim()) continue;
    const c = splitCsvLine(line);
    const code = (c[cols.code] || '').toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    const raw = (c[cols.rate] || '').replace(/[$,\s]/g, '');
    const rate = raw === '' ? null : Number(raw);
    rates[code] = { si: (c[cols.si] || '').toUpperCase(), apc: c[cols.apc] || '', rate: Number.isFinite(rate) ? rate : null };
  }
  const count = Object.keys(rates).length;
  if (!count) throw new RangeError('This Addendum B file has no HCPCS rows.');
  return { edition, rates, count };
}

// oppsLine(code, units, opps) -> { amount (dollars for the units), method } | { unpriced }.
export function oppsLine(code, units, opps) {
  const row = opps.rates[code];
  if (!row) return { unpriced: `${code} is not in the Addendum B file supplied` };
  if (!PRICED_SI.has(row.si)) return { unpriced: SI_REASON[row.si] || `status indicator ${row.si || '(blank)'}: not a separately paid S, T or V service, so not priced here` };
  if (!(row.rate > 0)) return { unpriced: `${code} has no payment rate in the Addendum B file supplied` };
  return { amount: row.rate * units, method: `OPPS national rate, APC ${row.apc}, status indicator ${row.si}` };
}
