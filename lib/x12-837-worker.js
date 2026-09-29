// spec-v1515: local 837P/837I checks and CSV export stay off the UI thread.
import { MAX_FILE_BYTES, serializeCsv } from './upload-intake.js';
import { redactTableCell } from './pa/redact.js';
import { check837 } from './x12-837-v1515.js';

const HEADERS = ['source_file', 'claim_reference', 'claim_type', 'patient_name', 'member_id', 'payer', 'claim_charge', 'line_charge_total', 'line_count', 'diagnosis_codes', 'clean', 'finding_count', 'findings'];
const SENSITIVE = new Set([1, 3, 4]);
let exportRows = null;
let fileBase = 'claims';

const amount = (value) => (value / 100).toFixed(2);

function rowFor(fileName, claim) {
  return [
    fileName, claim.reference, claim.type, claim.patientName, claim.memberId, claim.payerName,
    amount(claim.chargeCents), amount(claim.lineChargeCents), claim.lines.length, claim.diagnoses.join(' '),
    claim.clean ? 'yes' : 'no', claim.findings.length,
    claim.findings.map((item) => `${item.check} at segment ${item.segmentPosition}: ${item.message}`).join(' | '),
  ];
}

function parseFiles(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 837 files.');
  exportRows = [];
  fileBase = String(files[0].name || 'claims').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'claims';
  const results = [];
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 837 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    const result = check837(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer));
    results.push(result); result.claims.forEach((claim) => exportRows.push(rowFor(file.name, claim)));
  }
  const totals = results.reduce((out, result) => {
    out.transactions += result.summary.transactionCount; out.claims += result.summary.claimCount;
    out.clean += result.summary.cleanClaims; out.failing += result.summary.failingClaims; out.findings += result.summary.findingCount;
    return out;
  }, { files: files.length, transactions: 0, claims: 0, clean: 0, failing: 0, findings: 0 });
  self.postMessage({ type: 'parsed', totals, preview: { headers: HEADERS, rows: exportRows.slice(0, 100), total: exportRows.length } });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') { parseFiles(message.files); return; }
    if (message.type === 'download') {
      if (!exportRows) throw new Error('Check a valid claim file before downloading results.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportRows.map((row) => row.map((cell, index) => redactTableCell(cell, { header: HEADERS[index], sensitive: SENSITIVE.has(index) }))) : exportRows;
      self.postMessage({ type: 'download', blob: new Blob([serializeCsv(HEADERS, rows)], { type: 'text/csv;charset=utf-8' }), filename: `${fileBase}-837-check-${redacted ? 'redacted-' : ''}results.csv` });
      return;
    }
    throw new TypeError('Unknown claim-check operation.');
  } catch (error) {
    exportRows = null;
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
