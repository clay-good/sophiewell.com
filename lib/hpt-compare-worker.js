// spec-v1515 tool 6: compare one code across hospital price files, streamed in a Worker so a file of
// gigabytes never sits in the page. No network code; the result carries a receipt naming each file by
// its SHA-256 (spec-v1625).
import { extractForCode, compareHpt, parseQuery, CSV_HEADERS, csvRow } from './hpt-compare.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor, csvTrailer } from './receipt-worker.js';
import { serializeCsv } from './upload-intake.js';

self.addEventListener('message', async (event) => {
  try {
    const message = event.data || {};
    if (message.type !== 'compare') throw new TypeError('Choose the hospital price files.');
    const files = [...(message.files || [])].filter((f) => f instanceof Blob);
    const query = parseQuery(message.code, message.codeType);
    const extracted = [];
    for (const [i, f] of files.entries()) {
      self.postMessage({ type: 'progress', done: i, total: files.length, name: f.name });
      extracted.push(await extractForCode(f, query));
    }
    const result = compareHpt(extracted, query);
    const facts = [];
    for (const f of files) {
      const kind = recognize(new Uint8Array(await f.slice(0, LIMITS.headBytes).arrayBuffer()), { name: f.name });
      facts.push({ name: f.name, size: f.size, sha256: await sha256Blob(f), kind: kind.kind, evidence: kind.evidence });
    }
    const rows = result.valid ? result.table.map(csvRow) : [];
    const receipts = receiptFor('hpt-price-compare', facts, result.valid ? { rows } : { refused: result.message }, { input: { code: query ? query.code : null, codeType: query ? query.type : null } });
    const csv = result.valid ? serializeCsv(CSV_HEADERS, rows, { trailer: csvTrailer(receipts.receipt) }) : null;
    self.postMessage({ type: 'compared', ...result, csv, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
