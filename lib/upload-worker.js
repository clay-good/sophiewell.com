// spec-v1501 §3: parse and map local CSV/TSV files away from the UI thread.
// This worker has no network code and retains one parsed file only while its tool
// is open. Computation stays here too, so large files never cross back to the UI.
import { MAX_FILE_BYTES, parseDelimited, matchColumns, validateColumnMapping } from './upload-intake.js';
import { pdcStar, adherenceOutreachList } from './pdc-star-v1513.js';

const COMPUTES = {
  'pdc-star': pdcStar,
  'adherence-outreach-list': adherenceOutreachList,
};

let parsed = null;
let fields = null;
let mappedRows = null;

function fail(error) {
  self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
}

function compute(message, initial = false) {
  if (!mappedRows) throw new Error('Confirm the file columns before computing.');
  const fn = COMPUTES[message.compute];
  if (!fn) throw new RangeError('This upload calculation is not registered.');
  const input = message.input && typeof message.input === 'object' ? message.input : {};
  const result = fn({ ...input, fillRows: mappedRows });
  self.postMessage({ type: 'computed', result, rowCount: mappedRows.length, initial });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') {
      if (!(message.buffer instanceof ArrayBuffer)) throw new TypeError('Choose a CSV or TSV file.');
      if (message.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError('File exceeds the 50 MB limit.');
      fields = message.fields;
      mappedRows = null;
      if (!Array.isArray(fields) || !fields.length) throw new TypeError('No destination fields were provided.');
      const text = new TextDecoder('utf-8', { fatal: true }).decode(message.buffer);
      parsed = parseDelimited(text);
      const proposal = matchColumns(parsed.headers, fields);
      self.postMessage({
        type: 'parsed',
        headers: parsed.headers,
        rowCount: parsed.rows.length,
        delimiter: parsed.delimiter,
        mapping: proposal.mapping,
        missing: proposal.missing,
        ambiguous: proposal.ambiguous,
      });
      return;
    }
    if (message.type === 'map') {
      if (!parsed || !fields) throw new Error('Choose the file again before confirming its columns.');
      const errors = validateColumnMapping(parsed.headers, fields, message.mapping || {});
      if (errors.length) throw new RangeError(errors.join(' '));
      mappedRows = parsed.rows.map((source) => Object.fromEntries(fields.flatMap((field) => {
        const column = message.mapping[field.id];
        return Number.isInteger(column) ? [[field.id, source[column]]] : [];
      })));
      parsed = null;
      compute(message, true);
      return;
    }
    if (message.type === 'compute') {
      compute(message);
      return;
    }
    throw new TypeError('Unknown upload operation.');
  } catch (error) {
    fail(error);
  }
});
