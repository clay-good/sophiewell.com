// spec-v1625 step 4: the 277 run, pure -- the browser worker
// (lib/x12-277-worker.js) and the MCP server's analyze_file both call it,
// so a receipt is the same on either surface.
import { MAX_FILE_BYTES } from './upload-intake.js';
import { fileFacts, receiptFor } from './receipt-worker.js';
import { read277 } from './x12-277-v1515.js';

export const HEADERS = ['source_file', 'response_type', 'outcome', 'claim_reference', 'trace_number', 'patient_name', 'member_id', 'billing_provider', 'claim_amount', 'service_codes', 'status_categories', 'status_codes', 'entity_codes', 'action_codes', 'effective_dates', 'additional_status_codes', 'segment_positions'];
export const SENSITIVE = new Set([3, 4, 5, 6]);

function rowFor(fileName, claim) {
  return [
    fileName, claim.responseType, claim.outcome, claim.reference, claim.trace, claim.patientName, claim.memberId, claim.provider,
    claim.amount == null ? '' : claim.amount.toFixed(2), claim.serviceCodes.join(' '),
    claim.statuses.map((item) => item.category).join(' '), claim.statuses.map((item) => item.status).join(' '),
    claim.statuses.map((item) => item.entity).join(' '), claim.statuses.map((item) => item.actionCode).join(' '),
    claim.statuses.map((item) => item.effectiveDate).join(' '),
    claim.statuses.flatMap((item) => item.additional.map((extra) => extra.raw)).join(' '),
    claim.statuses.map((item) => item.segmentPosition).join(' '),
  ];
}

export function run(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 277 or 277CA files.');
  const exportRows = []; const fileBase = String(files[0].name || 'claim-status').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'claim-status';
  const results = [];
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 277 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    const result = read277(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer));
    results.push(result); result.claims.forEach((claim) => exportRows.push(rowFor(file.name, claim)));
  }
  const order = { rejected: 0, pending: 1, accepted: 2 }; exportRows.sort((a, b) => order[a[2]] - order[b[2]]);
  const totals = results.reduce((out, result) => {
    out.transactions += result.summary.transactionCount; out.claims += result.summary.claimCount;
    out.accepted += result.summary.accepted; out.rejected += result.summary.rejected;
    out.pending += result.summary.pending; out.statuses += result.summary.statusCount;
    return out;
  }, { files: files.length, transactions: 0, claims: 0, accepted: 0, rejected: 0, pending: 0, statuses: 0 });
  // spec-v1625: the receipt hashes the totals and every exported row, with
  // each row's file named by its position, so a renamed copy reproduces.
  const receipts = receiptFor('x12-277-reader', fileFacts(files), { totals, rows: exportRows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  return { rows: exportRows, totals, fileBase, receipts };
}
