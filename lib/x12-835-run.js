// spec-v1625 step 4: the 835 run, pure -- the browser worker
// (lib/x12-835-worker.js) and the MCP server's analyze_file both call it,
// so a receipt is the same on either surface.
import { MAX_FILE_BYTES } from './upload-intake.js';
import { fileFacts, receiptFor } from './receipt-worker.js';
import { parse835 } from './x12-835-v1515.js';

export const HEADERS = [
  'source_file', 'trace_number', 'payment_date', 'patient_account', 'patient_name',
  'member_id', 'payer_claim_control', 'service_date', 'status_code', 'billed_amount',
  'paid_amount', 'patient_responsibility', 'co_adjustments', 'pr_adjustments',
  'oa_adjustments', 'pi_adjustments', 'balance_residual', 'claim_balances', 'balance_issue',
];
export const SENSITIVE = new Set([3, 4, 5]);

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

export function run(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 835 files.');
  const exportRows = [];
  const fileBase = String(files[0].name || 'remittance').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'remittance';
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
  // spec-v1625: the receipt hashes the totals and every exported row, with
  // each row's file named by its position, so a renamed copy reproduces.
  const receipts = receiptFor('x12-835-reader', fileFacts(files), { totals, rows: exportRows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  return { rows: exportRows, totals, fileBase, receipts };
}
