// spec-v1515: local 837P/837I checks and CSV export stay off the UI thread.
import { serializeCsv } from './upload-intake.js';
import { csvTrailer } from './receipt-worker.js';
import { HEADERS, SENSITIVE, run } from './x12-837-run.js';
import { redactTableCell } from './pa/redact.js';

let exportRows = null;
let receipts = null;
let fileBase = null;

function parseFiles(files) {
  const out = run(files);
  exportRows = out.rows; receipts = out.receipts; fileBase = out.fileBase;
  self.postMessage({ type: 'parsed', receipt: receipts.receipt, shareableReceipt: receipts.shareable, totals: out.totals, preview: { headers: HEADERS, rows: exportRows.slice(0, 100), total: exportRows.length } });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') { parseFiles(message.files); return; }
    if (message.type === 'download') {
      if (!exportRows) throw new Error('Check a valid claim file before downloading results.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportRows.map((row) => row.map((cell, index) => redactTableCell(cell, { header: HEADERS[index], sensitive: SENSITIVE.has(index) }))) : exportRows;
      self.postMessage({ type: 'download', blob: new Blob([serializeCsv(HEADERS, rows, { trailer: receipts && csvTrailer(receipts.receipt) })], { type: 'text/csv;charset=utf-8' }), filename: `${fileBase}-837-check-${redacted ? 'redacted-' : ''}results.csv` });
      return;
    }
    throw new TypeError('Unknown claim-check operation.');
  } catch (error) {
    exportRows = null;
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
