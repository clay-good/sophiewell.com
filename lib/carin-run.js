// spec-v1602 tool 1: the claims-file read with its receipt, shared by the browser worker
// (lib/carin-worker.js) and the MCP server's analyze_file, so a receipt is the same on either surface.
import { MAX_FILE_BYTES, serializeCsv } from './upload-intake.js';
import { fileFacts, receiptFor, csvTrailer } from './receipt-worker.js';
import { readEob, CSV_HEADERS, csvRow } from './carin-eob-reader.js';

export { CSV_HEADERS as CLAIM_HEADERS, csvRow as claimRow };

// run([{ name, buffer }], { coinsurancePct }) -> { result, csv, receipts }. Several files (a Bundle per
// year, say) are read as one set of claims.
export function run(files, options = {}) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose a claims file.');
  for (const f of files) if (f.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${f.name} is over the 50 MB limit.`);
  const decoder = new TextDecoder('utf-8');
  const parts = files.map((f) => decoder.decode(f.buffer).replace(/^﻿/, '').trim());
  // Each file becomes NDJSON lines of its resources, so a Bundle and an NDJSON export read together.
  const text = parts.map((t) => {
    try { const j = JSON.parse(t); return (j.resourceType === 'Bundle' ? (j.entry || []).map((e) => e && e.resource).filter(Boolean) : [j]).map((r) => JSON.stringify(r)).join('\n'); } catch { return t; }
  }).join('\n');
  const pct = options.coinsurancePct === '' || options.coinsurancePct == null ? null : Number(options.coinsurancePct);
  const result = readEob(text, { coinsurancePct: Number.isFinite(pct) && pct >= 0 && pct <= 100 ? pct : null });
  const rows = result.valid ? result.claims.map(csvRow) : [];
  const receipts = receiptFor('carin-eob-reader', fileFacts(files), result.valid ? { rows, flags: result.flags } : { refused: result.message }, { coinsurancePct: result.valid ? (Number.isFinite(pct) ? pct : null) : null });
  return { result, csv: rows.length ? serializeCsv(CSV_HEADERS, rows, { trailer: csvTrailer(receipts.receipt) }) : null, receipts };
}
