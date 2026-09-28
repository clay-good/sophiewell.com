// spec-v1515: local 835 parsing and CSV export stay off the UI thread.
import { MAX_FILE_BYTES, serializeCsv } from './upload-intake.js';
import { redactTableCell } from './pa/redact.js';
import { parse835 } from './x12-835-v1515.js';

const HEADERS = [
  'source_file', 'trace_number', 'payment_date', 'patient_account', 'patient_name',
  'member_id', 'payer_claim_control', 'service_date', 'status_code', 'billed_amount',
  'paid_amount', 'patient_responsibility', 'co_adjustments', 'pr_adjustments',
  'oa_adjustments', 'pi_adjustments', 'balance_residual', 'claim_balances', 'balance_issue',
];
const SENSITIVE = new Set([3, 4, 5]);
let exportRows = null;
let fileBase = 'remittance';

const amount = (value) => (value / 100).toFixed(2);

function rowFor(fileName, transaction, claim) {
  const totals = claim.balance.adjustmentTotals;
  return [
    fileName, transaction.traceNumber, transaction.paymentDate, claim.patientControlNumber,
    claim.patientName, claim.memberId, claim.payerClaimControlNumber, claim.serviceDate,
    claim.statusCode, amount(claim.billedCents), amount(claim.paidCents),
    amount(claim.balance.patientResponsibilityCents), amount(totals.CO), amount(totals.PR),
    amount(totals.OA), amount(totals.PI), amount(claim.balance.residualCents),
    claim.balance.balanced ? 'yes' : 'no',
    !claim.patientResponsibilityMatches
      ? `CLP05 patient responsibility is ${amount(claim.patientResponsibilityCents)}, but PR adjustments total ${amount(claim.balance.patientResponsibilityCents)}.`
      : claim.balance.residualCents ? `Billed minus paid and adjustments is ${amount(claim.balance.residualCents)}.` : '',
  ];
}

function parseFiles(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 835 files.');
  exportRows = [];
  fileBase = String(files[0].name || 'remittance').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'remittance';
  const results = [];
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 835 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    const text = new TextDecoder('utf-8', { fatal: true }).decode(file.buffer);
    const result = parse835(text);
    results.push(result);
    result.transactions.forEach((transaction) => transaction.claims.forEach((claim) => exportRows.push(rowFor(file.name, transaction, claim))));
  }
  const totals = results.reduce((out, result) => {
    out.transactions += result.summary.transactionCount;
    out.claims += result.summary.claimCount;
    out.lines += result.summary.serviceLineCount;
    out.balancedClaims += result.summary.balancedClaims;
    out.balancedLines += result.summary.balancedServiceLines;
    out.balancedPayments += result.summary.balancedPayments;
    out.patientResponsibilityCents += result.summary.patientResponsibilityCents;
    return out;
  }, { files: files.length, transactions: 0, claims: 0, lines: 0, balancedClaims: 0, balancedLines: 0, balancedPayments: 0, patientResponsibilityCents: 0 });
  self.postMessage({ type: 'parsed', totals, preview: { headers: HEADERS, rows: exportRows.slice(0, 100), total: exportRows.length } });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') { parseFiles(message.files); return; }
    if (message.type === 'download') {
      if (!exportRows) throw new Error('Read a valid remittance before downloading it.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportRows.map((row) => row.map((cell, index) => redactTableCell(cell, { header: HEADERS[index], sensitive: SENSITIVE.has(index) }))) : exportRows;
      self.postMessage({
        type: 'download', blob: new Blob([serializeCsv(HEADERS, rows)], { type: 'text/csv;charset=utf-8' }),
        filename: `${fileBase}-835-reader-${redacted ? 'redacted-' : ''}results.csv`,
      });
      return;
    }
    throw new TypeError('Unknown remittance-reader operation.');
  } catch (error) {
    exportRows = null;
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
