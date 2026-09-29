// spec-v1515: local 271 parsing and CSV export stay off the UI thread.
import { MAX_FILE_BYTES, serializeCsv } from './upload-intake.js';
import { fileFacts, receiptFor, csvTrailer } from './receipt-worker.js';
import { redactTableCell } from './pa/redact.js';
import { read271 } from './x12-271-v1515.js';

const HEADERS = ['source_file', 'relationship', 'person_name', 'member_id', 'plan_identifiers', 'benefit_code', 'benefit_label', 'coverage_level_code', 'coverage_level_label', 'service_type_codes', 'service_type_labels', 'insurance_type_code', 'plan_description', 'time_period_code', 'time_period_label', 'amount', 'percent', 'quantity_qualifier', 'quantity', 'network_code', 'network_label', 'authorization_required', 'procedure_code', 'dates', 'messages', 'segment_position'];
// A policy identifier and free-text MSG can carry patient-specific data too.
const SENSITIVE = new Set([2, 3, 4, 24]);
let exportRows = null;
let receipts = null;
let fileBase = 'eligibility';

function rowFor(fileName, person, benefit) {
  return [
    fileName, person.relationship, person.name, person.memberId,
    person.planIdentifiers.map((item) => `${item.qualifier}:${item.value}`).join(' | '),
    benefit.informationCode, benefit.informationLabel, benefit.coverageLevel, benefit.coverageLabel,
    benefit.serviceTypeCodes.join('^'), benefit.serviceTypeLabels.join(' | '), benefit.insuranceType, benefit.description,
    benefit.timePeriod, benefit.timePeriodLabel, benefit.amount == null ? '' : benefit.amount.toFixed(2),
    benefit.percent == null ? '' : (benefit.percent * 100).toFixed(2), benefit.quantityQualifier,
    benefit.quantity == null ? '' : benefit.quantity, benefit.network, benefit.networkLabel,
    benefit.authorizationRequired, benefit.procedure,
    benefit.dates.map((item) => `${item.qualifier}:${item.value}`).join(' | '), benefit.messages.join(' | '), benefit.segmentPosition,
  ];
}

function parseFiles(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose a 271 file or paste a response.');
  exportRows = []; fileBase = String(files[0].name || 'eligibility').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'eligibility';
  const results = [];
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose a 271 text file or paste a response.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'The response'} exceeds the 50 MB limit.`);
    const result = read271(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer));
    results.push(result);
    result.people.forEach((person) => person.benefits.forEach((benefit) => exportRows.push(rowFor(file.name, person, benefit))));
  }
  const totals = results.reduce((out, result) => {
    out.transactions += result.summary.transactionCount; out.people += result.summary.personCount;
    out.benefits += result.summary.benefitCount; out.active += result.summary.activePeople;
    out.inactive += result.summary.inactivePeople; out.errors += result.summary.errorCount;
    return out;
  }, { files: files.length, transactions: 0, people: 0, benefits: 0, active: 0, inactive: 0, errors: 0 });
  const summaries = results.flatMap((result, index) => result.people.flatMap((person) => person.summary.map((text) => ({ file: files[index].name, person: person.name || person.relationship, text })))).slice(0, 100);
  // spec-v1625: the receipt hashes the totals and every exported row, with
  // each row's file named by its position, so a renamed copy reproduces.
  receipts = receiptFor('x12-271-reader', fileFacts(files), { totals, rows: exportRows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  self.postMessage({ type: 'parsed', receipt: receipts.receipt, shareableReceipt: receipts.shareable, totals, summaries, preview: { headers: HEADERS, rows: exportRows.slice(0, 100), total: exportRows.length } });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') { parseFiles(message.files); return; }
    if (message.type === 'download') {
      if (!exportRows) throw new Error('Read a valid 271 response before downloading benefits.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportRows.map((row) => row.map((cell, index) => redactTableCell(cell, { header: HEADERS[index], sensitive: SENSITIVE.has(index) }))) : exportRows;
      self.postMessage({ type: 'download', blob: new Blob([serializeCsv(HEADERS, rows, { trailer: receipts && csvTrailer(receipts.receipt) })], { type: 'text/csv;charset=utf-8' }), filename: `${fileBase}-271-${redacted ? 'redacted-' : ''}benefits.csv` });
      return;
    }
    throw new TypeError('Unknown eligibility-reader operation.');
  } catch (error) {
    exportRows = null;
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
