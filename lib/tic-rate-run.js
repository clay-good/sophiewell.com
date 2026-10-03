// spec-v1604 tool 2: the rate lookup with its receipt, run in lib/tic-rate-worker.js. Each file is
// streamed once; the receipt names the files by SHA-256, the codes and providers asked about, the
// locality and the fee schedule edition.

import { extractRates, parseQuery, summarize, CSV_HEADERS, csvRow } from './tic-rate-lookup.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor, csvTrailer } from './receipt-worker.js';
import { serializeCsv } from './upload-intake.js';

// runRateLookup(files, { codes, providers }, mpfs, onProgress) -> { result, csv, receipts }.
// mpfs = { rows: { code: [rows] }, gpci, conversionFactor, edition } or null when no locality was chosen.
export async function runRateLookup(files, input, mpfs, onProgress) {
  const query = parseQuery(input.codes, input.providers);
  const facts = [];
  for (const f of files) {
    const kind = recognize(new Uint8Array(await f.slice(0, LIMITS.headBytes).arrayBuffer()), { name: f.name });
    facts.push({ name: f.name, size: f.size, sha256: await sha256Blob(f), kind: kind.kind, evidence: kind.evidence });
  }
  const options = { codes: query.codes || [], providers: query.error ? [] : [...query.npis, ...query.tins].map(String), locality: mpfs ? mpfs.gpci.name : null };
  const data = mpfs ? [{ id: 'mpfs', sourceEdition: mpfs.edition }] : [];
  if (query.error) {
    const result = { valid: false, message: query.error };
    return { result, csv: null, receipts: receiptFor('tic-rate-lookup', facts, result, options, data) };
  }
  const extracted = [];
  for (const [i, f] of files.entries()) extracted.push({ name: f.name, ...(await extractRates(f, query, (b) => onProgress?.(i, b))) });
  const ctx = mpfs ? { rowsFor: (c) => mpfs.rows[c.toUpperCase()] || [], gpci: mpfs.gpci, conversionFactor: mpfs.conversionFactor, edition: mpfs.edition } : null;
  const result = summarize(extracted, query, ctx);
  const rows = result.rows.map(csvRow);
  const receipts = receiptFor('tic-rate-lookup', facts, { rows, band: result.band }, options, data);
  return { result, csv: rows.length ? serializeCsv(CSV_HEADERS, rows, { trailer: csvTrailer(receipts.receipt) }) : null, receipts };
}
