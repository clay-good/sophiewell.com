// spec-v1625 step 4: the 837 run, pure -- the browser worker
// (lib/x12-837-worker.js) and the MCP server's analyze_file both call it,
// so a receipt is the same on either surface.
import { MAX_FILE_BYTES } from './upload-intake.js';
import { fileFacts, receiptFor } from './receipt-worker.js';
import { check837 } from './x12-837-v1515.js';

export const HEADERS = ['source_file', 'claim_reference', 'claim_type', 'patient_name', 'member_id', 'payer', 'claim_charge', 'line_charge_total', 'line_count', 'diagnosis_codes', 'clean', 'finding_count', 'findings'];
export const SENSITIVE = new Set([1, 3, 4]);

const amount = (value) => (value / 100).toFixed(2);

function rowFor(fileName, claim) {
  return [
    fileName, claim.reference, claim.type, claim.patientName, claim.memberId, claim.payerName,
    amount(claim.chargeCents), amount(claim.lineChargeCents), claim.lines.length, claim.diagnoses.join(' '),
    claim.clean ? 'yes' : 'no', claim.findings.length,
    claim.findings.map((item) => `${item.check} at segment ${item.segmentPosition}: ${item.message}`).join(' | '),
  ];
}

export function run(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 837 files.');
  const exportRows = [];
  const fileBase = String(files[0].name || 'claims').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'claims';
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
  // spec-v1625: the receipt hashes the totals and every exported row, with
  // each row's file named by its position, so a renamed copy reproduces.
  const receipts = receiptFor('x12-837-check', fileFacts(files), { totals, rows: exportRows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  return { rows: exportRows, totals, fileBase, receipts };
}
