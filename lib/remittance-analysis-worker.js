// spec-v1516: denial and underpayment analysis over local remittance files.
import { MAX_FILE_BYTES, parseDelimited, matchColumns, validateColumnMapping, serializeCsv } from './upload-intake.js';
import { fileFacts, receiptFor, csvTrailer } from './receipt-worker.js';
import { redactTableCell } from './pa/redact.js';
import { parse835 } from './x12-835-v1515.js';
import { appealWorklist, PAYERS } from './denial-next-step-v1516.js';
import { appealCandidates, denialPatternReport, underpaymentCheck } from './remittance-analysis-v1516.js';

const FEE_FIELDS = [
  { id: 'billing_code', label: 'Billing code', required: true, synonyms: ['code', 'hcpcs', 'cpt'] },
  { id: 'modifier', label: 'Modifier', required: false, synonyms: ['modifiers'] },
  { id: 'contracted_amount', label: 'Contracted amount', required: false, synonyms: ['contract amount', 'fee'] },
  { id: 'reference_amount', label: 'Reference amount', required: false, synonyms: ['reference rate', 'medicare amount'] },
  { id: 'contract_percent', label: 'Contract percent', required: false, synonyms: ['percent of reference', 'rate percent'] },
];
const DENIAL_HEADERS = ['source_file', 'month', 'payer', 'patient_account', 'billing_code', 'rendering_provider', 'group_code', 'reason_code', 'category', 'adjusted_amount'];
const UNDERPAYMENT_HEADERS = ['source_file', 'payer', 'patient_account', 'payer_claim_control', 'service_date', 'billing_code', 'modifier', 'rendering_provider', 'expected_allowed', 'remittance_allowed', 'variance'];
const APPEAL_HEADERS = ['source_file', 'payer_name', 'patient_account', 'payer_type', 'denial_date', 'appeal_amount', 'appeal_due', 'days_left', 'status'];

let remittances = null;
let feeParsed = null;
let exportTable = null;
let fileBase = 'remittance';
let appealRows = null;
// spec-v1625: receipts. The remittances' facts are taken once at read; the fee
// schedule's when it is chosen. Rows are hashed with each source file named by
// its position, so a renamed copy reproduces.
let remitFacts = null;
let feeFacts = null;
let receipts = null;
let payerNames = [];
const byPosition = (rows) => rows.map(([source, ...rest]) => [remittances.findIndex((r) => r.name === source), ...rest]);
const withReceipt = (message, tool, rows, facts, options) => {
  // The export rows determine every figure shown (the summaries are sums of
  // them); the result objects also carry file names, so they are not hashed.
  receipts = receiptFor(tool, facts, { rows: byPosition(rows) }, options);
  return { ...message, receipt: receipts.receipt, shareableReceipt: receipts.shareable };
};

const amount = (cents) => (cents / 100).toFixed(2);

function readRemittances(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 835 files.');
  fileBase = String(files[0].name || 'remittance').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'remittance';
  return files.map((file) => {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 835 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    return { name: file.name, result: parse835(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer)) };
  });
}

function denialResult() {
  const result = denialPatternReport(remittances);
  const rows = result.detail.map((row) => [row.sourceFile, row.month, row.payer, row.patientAccount, row.billingCode, row.renderingProvider, row.group, row.reason, row.category, amount(row.amountCents)]);
  exportTable = { headers: DENIAL_HEADERS, rows, sensitive: new Set([3]), suffix: 'denial-pattern' };
  self.postMessage(withReceipt({ type: 'denial-result', result, preview: { headers: DENIAL_HEADERS, rows: rows.slice(0, 100), total: rows.length } }, 'denial-pattern-report', rows, remitFacts, {}));
}

function underpaymentResult(feeRows, feeMapping) {
  const result = underpaymentCheck(remittances, feeRows);
  const rows = result.underpaid.map((row) => [row.sourceFile, row.payer, row.patientAccount, row.payerClaimControl, row.serviceDate, row.billingCode, row.modifier, row.renderingProvider, amount(row.expectedCents), amount(row.allowedCents), amount(row.varianceCents)]);
  exportTable = { headers: UNDERPAYMENT_HEADERS, rows, sensitive: new Set([2]), suffix: 'underpayment' };
  self.postMessage(withReceipt({ type: 'underpayment-result', result, preview: { headers: UNDERPAYMENT_HEADERS, rows: rows.slice(0, 100), total: rows.length } }, 'underpayment-check', rows, [...remitFacts, ...feeFacts], { feeScheduleColumns: feeMapping }));
}

function prepareAppeals() {
  const value = appealCandidates(remittances);
  appealRows = value.candidates;
  payerNames = value.payers;
  self.postMessage({ type: 'appeal-payers', payers: value.payers, claimCount: appealRows.length });
}

function appealResult(mapping, asOf) {
  if (!appealRows) throw new Error('Choose the remittance files first.');
  const validPayers = new Set(PAYERS.map((payer) => payer.value));
  for (const payerName of new Set(appealRows.map((row) => row.payer))) {
    const choice = mapping?.[payerName] || {};
    if (!validPayers.has(choice.payer)) throw new RangeError(`Choose the payer type for ${payerName}.`);
    if (choice.payer === 'medicaid' || choice.payer === 'other') {
      const days = Number(choice.windowDays);
      if (!Number.isInteger(days) || days < 1 || days > 730) throw new RangeError(`Enter the appeal window in whole days for ${payerName}.`);
    }
  }
  if (!appealRows.length) {
    exportTable = { headers: APPEAL_HEADERS, rows: [], sensitive: new Set([2]), suffix: 'appeal-worklist' };
    self.postMessage(withReceipt({ type: 'appeal-result', result: { valid: true, band: 'No appeal-category claims were found in these remittances.', bandLabel: '0 candidates', notes: [], note: 'Only positive adjustments mapped to authorization, medical necessity or timely filing are included.' }, preview: { headers: APPEAL_HEADERS, rows: [], total: 0 } }, 'appeal-worklist', [], remitFacts, { asOf: asOf || null, payerChoices: [] }));
    return;
  }
  const claims = appealRows.map((row) => {
    const choice = mapping[row.payer];
    return [row.reference, choice.payer, row.denialDate, amount(row.amountCents), choice.windowDays || ''].join('\t');
  }).join('\n');
  const result = appealWorklist({ claims, asOf });
  if (!result.valid) throw new RangeError(result.message);
  const rows = appealRows.map((row, index) => {
    const choice = mapping[row.payer]; const computed = result.rows[index];
    return [row.sourceFile, row.payer, row.reference, choice.payer, row.denialDate, amount(row.amountCents), computed.due, computed.left, computed.status];
  });
  exportTable = { headers: APPEAL_HEADERS, rows, sensitive: new Set([2]), suffix: 'appeal-worklist' };
  // The payer choices are recorded by the payer's position in the file, not
  // its name: a name from the file never enters the receipt.
  const payerChoices = payerNames.map((name) => ({ payer: mapping[name].payer, windowDays: mapping[name].windowDays || null }));
  self.postMessage(withReceipt({ type: 'appeal-result', result, preview: { headers: APPEAL_HEADERS, rows: rows.slice(0, 100), total: rows.length } }, 'appeal-worklist', rows, remitFacts, { asOf: asOf || null, payerChoices }));
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse-remittances') {
      remittances = readRemittances(message.files); exportTable = null; receipts = null;
      remitFacts = fileFacts(message.files);
      if (message.tool === 'denial-pattern-report') denialResult();
      else if (message.tool === 'appeal-worklist') prepareAppeals();
      else self.postMessage({ type: 'remittances-ready', fileCount: remittances.length });
      return;
    }
    if (message.type === 'map-appeal-payers') { appealResult(message.mapping || {}, message.asOf); return; }
    if (message.type === 'parse-fees') {
      if (!(message.buffer instanceof ArrayBuffer)) throw new TypeError('Choose a fee schedule CSV or TSV file.');
      if (message.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError('The fee schedule exceeds the 50 MB limit.');
      feeFacts = fileFacts([{ name: message.fileName || 'fee schedule', buffer: message.buffer }]);
      feeParsed = parseDelimited(new TextDecoder('utf-8', { fatal: true }).decode(message.buffer));
      const proposal = matchColumns(feeParsed.headers, FEE_FIELDS);
      self.postMessage({ type: 'fees-parsed', headers: feeParsed.headers, rowCount: feeParsed.rows.length, fields: FEE_FIELDS, mapping: proposal.mapping, missing: proposal.missing, ambiguous: proposal.ambiguous });
      return;
    }
    if (message.type === 'map-fees') {
      if (!remittances) throw new Error('Choose the remittance files first.');
      if (!feeParsed) throw new Error('Choose the fee schedule again before confirming its columns.');
      const errors = validateColumnMapping(feeParsed.headers, FEE_FIELDS, message.mapping || {});
      if (errors.length) throw new RangeError(errors.join(' '));
      const feeRows = feeParsed.rows.map((source) => Object.fromEntries(FEE_FIELDS.flatMap((field) => {
        const column = message.mapping[field.id]; return Number.isInteger(column) ? [[field.id, source[column]]] : [];
      })));
      feeParsed = null; underpaymentResult(feeRows, message.mapping); return;
    }
    if (message.type === 'download') {
      if (!exportTable) throw new Error('Compute results before downloading them.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportTable.rows.map((row) => row.map((cell, index) => redactTableCell(cell, { header: exportTable.headers[index], sensitive: exportTable.sensitive.has(index) }))) : exportTable.rows;
      self.postMessage({ type: 'download', blob: new Blob([serializeCsv(exportTable.headers, rows, { trailer: receipts && csvTrailer(receipts.receipt) })], { type: 'text/csv;charset=utf-8' }), filename: `${fileBase}-${exportTable.suffix}-${redacted ? 'redacted-' : ''}results.csv` });
      return;
    }
    throw new TypeError('Unknown remittance-analysis operation.');
  } catch (error) { self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }); }
});
