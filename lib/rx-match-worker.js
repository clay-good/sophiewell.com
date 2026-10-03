// spec-v1509 tool 4: four-file 340B matching stays entirely in this Worker.
import { MAX_FILE_BYTES, parseDelimited, matchColumns, validateColumnMapping, serializeCsv } from './upload-intake.js';
import { matchPrescriptions340b } from './entity-340b-v1509.js';
import { redactTableCell } from './pa/redact.js';
import { fileFacts, receiptFor, csvTrailer } from './receipt-worker.js';

const datasets = new Map();
let exportTable = null;
let fileBase = 'prescriptions';
// spec-v1625: each file's facts, taken when it is read, and the last receipt.
const facts = new Map();
let receipts = null;

function fail(error) {
  self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
}

function compute(policy) {
  const required = ['prescriptions', 'encounters', 'prescribers', 'sites'];
  if (required.some((name) => !datasets.get(name)?.rows)) throw new Error('Load and confirm all four files before matching.');
  const result = matchPrescriptions340b({
    ...policy,
    prescriptions: datasets.get('prescriptions').rows,
    encounters: datasets.get('encounters').rows,
    prescribers: datasets.get('prescribers').rows,
    sites: datasets.get('sites').rows,
  });
  exportTable = null;
  let preview = null;
  if (result.valid) {
    const source = datasets.get('prescriptions');
    const resultHeaders = ['sophiewell_340b_eligible', 'sophiewell_reason', 'sophiewell_matched_encounter_date', 'sophiewell_matched_location'];
    const headers = [...source.headers, ...resultHeaders];
    const rows = source.sourceRows.map((row, index) => {
      const value = result.rows[index];
      return [...row, value.eligible, value.reason, value.matchedEncounterDate, value.matchedLocation];
    });
    const sensitiveColumns = new Set(source.fields.flatMap((field) => field.sensitive && Number.isInteger(source.mapping[field.id]) ? [source.mapping[field.id]] : []));
    exportTable = { headers, rows, sensitiveColumns };
    preview = { headers, rows: rows.slice(0, 100), total: rows.length };
  }
  // The receipt names the four files in a fixed order and hashes every output
  // row (or the refusal); the options are the policy and each file's columns.
  const order = ['prescriptions', 'encounters', 'prescribers', 'sites'];
  receipts = receiptFor('340b-rx-match', order.map((name) => facts.get(name)), exportTable ? { rows: exportTable.rows } : { refused: result.message || null }, { policy, columns: Object.fromEntries(order.map((name) => [name, datasets.get(name).mapping])) });
  self.postMessage({ type: 'computed', result, preview, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') {
      if (!(message.buffer instanceof ArrayBuffer)) throw new TypeError('Choose a CSV or TSV file.');
      if (message.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError('File exceeds the 50 MB limit.');
      if (!Array.isArray(message.fields) || !message.fields.length) throw new TypeError('No destination fields were provided.');
      facts.set(message.dataset, fileFacts([{ name: message.fileName || message.dataset, buffer: message.buffer }])[0]);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(message.buffer);
      const parsed = parseDelimited(text);
      const proposal = matchColumns(parsed.headers, message.fields);
      datasets.set(message.dataset, { parsed, fields: message.fields });
      exportTable = null;
      if (message.dataset === 'prescriptions') fileBase = String(message.fileName || 'prescriptions').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'prescriptions';
      self.postMessage({
        type: 'parsed', dataset: message.dataset, headers: parsed.headers,
        rowCount: parsed.rows.length, mapping: proposal.mapping,
        missing: proposal.missing, ambiguous: proposal.ambiguous,
      });
      return;
    }
    if (message.type === 'map') {
      const dataset = datasets.get(message.dataset);
      if (!dataset?.parsed) throw new Error('Choose this file again before confirming its columns.');
      const errors = validateColumnMapping(dataset.parsed.headers, dataset.fields, message.mapping || {});
      if (errors.length) throw new RangeError(errors.join(' '));
      dataset.mapping = message.mapping;
      dataset.headers = dataset.parsed.headers;
      dataset.sourceRows = dataset.parsed.rows;
      dataset.rows = dataset.sourceRows.map((source) => Object.fromEntries(dataset.fields.flatMap((field) => {
        const column = message.mapping[field.id];
        return Number.isInteger(column) ? [[field.id, source[column]]] : [];
      })));
      dataset.parsed = null;
      exportTable = null;
      self.postMessage({ type: 'mapped', dataset: message.dataset, rowCount: dataset.rows.length });
      return;
    }
    if (message.type === 'compute') { compute(message.policy || {}); return; }
    if (message.type === 'download') {
      if (!exportTable) throw new Error('Compute valid matches before downloading them.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted ? exportTable.rows.map((row) => row.map((cell, index) => redactTableCell(cell, {
        header: exportTable.headers[index], sensitive: exportTable.sensitiveColumns.has(index),
      }))) : exportTable.rows;
      self.postMessage({
        type: 'download',
        blob: new Blob([serializeCsv(exportTable.headers, rows, { trailer: receipts && csvTrailer(receipts.receipt) })], { type: 'text/csv;charset=utf-8' }),
        filename: `${fileBase}-340b-rx-match-${redacted ? 'redacted-' : ''}results.csv`,
      });
      return;
    }
    throw new TypeError('Unknown prescription-match operation.');
  } catch (error) { fail(error); }
});
