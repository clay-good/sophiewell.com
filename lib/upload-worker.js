// spec-v1501 §3: parse and map local CSV/TSV files away from the UI thread.
// This worker has no network code and retains one parsed file only while its tool
// is open. Computation stays here too, so large files never cross back to the UI.
import { MAX_FILE_BYTES, parseDelimited, matchColumns, validateColumnMapping, serializeCsv } from './upload-intake.js';
import { pdcStar, adherenceOutreachList } from './pdc-star-v1513.js';
import { mprGapDays, medSyncPlan } from './adherence-v1513.js';
import { patientCheck340b } from './entity-340b-v1509.js';
import { appealWorklist } from './denial-next-step-v1516.js';
import { redactTableCell } from './pa/redact.js';

const COMPUTES = {
  'pdc-star': pdcStar,
  'adherence-outreach-list': adherenceOutreachList,
  'mpr-gap-days': mprGapDays,
  'med-sync-plan': medSyncPlan,
  '340b-patient-check': patientCheck340b,
  'appeal-worklist': appealWorklist,
};

const BATCH_COMPUTES = new Set(['340b-patient-check']);

let parsed = null;
let fields = null;
let mappedRows = null;
let sourceHeaders = null;
let sourceRows = null;
let mapping = null;
let exportTable = null;
let fileBase = 'upload';

function fail(error) {
  self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
}

const key = (patient, measure) => `${String(patient ?? '').trim().toLowerCase()}|${String(measure ?? '').trim().toUpperCase()}`;

function makeExport(computeName, result) {
  if (!result.valid) return null;
  let resultHeaders;
  let resultRows;
  if (computeName === 'pdc-star') {
    resultHeaders = ['sophiewell_pdc_percent', 'sophiewell_in_denominator', 'sophiewell_reason'];
    const byPatientMeasure = new Map(result.rows.map((row) => [key(row.patient, row.measure), row]));
    resultRows = mappedRows.map((row) => {
      const value = byPatientMeasure.get(key(row.patient, row.measure));
      return value ? [value.pdc, value.inDenominator, value.reason] : ['', '', ''];
    });
  } else if (computeName === 'adherence-outreach-list') {
    resultHeaders = ['sophiewell_can_reach_80_percent', 'sophiewell_slack_days', 'sophiewell_next_due', 'sophiewell_reason'];
    const byPatientMeasure = new Map(result.rows.map((row) => [key(row.patient, row.measure), row]));
    resultRows = mappedRows.map((row) => {
      const value = byPatientMeasure.get(key(row.patient, row.measure));
      return value ? [value.canReach, value.slack, value.nextDue, value.reason] : ['', '', '', ''];
    });
  } else if (computeName === 'mpr-gap-days') {
    resultHeaders = ['sophiewell_pdc_percent', 'sophiewell_mpr_percent'];
    resultRows = mappedRows.map(() => [result.pdc, result.mpr]);
  } else if (computeName === 'med-sync-plan') {
    resultHeaders = ['sophiewell_full_fills_before_sync', 'sophiewell_short_fill_date', 'sophiewell_short_fill_days', 'sophiewell_short_fill_units'];
    resultRows = mappedRows.map((row, index) => {
      const value = result.rows[index];
      return value ? [value.fullFills, value.shortFillDate, value.shortFillDays, value.shortFillUnits] : ['', '', '', ''];
    });
  } else if (computeName === 'appeal-worklist') {
    resultHeaders = ['sophiewell_appeal_due', 'sophiewell_days_left', 'sophiewell_status'];
    resultRows = result.rows.map((row) => [row.due, row.left, row.status]);
  } else {
    resultHeaders = ['sophiewell_340b_patient', 'sophiewell_result'];
    resultRows = result.rows.map((row) => [row.patient ?? '', row.message]);
  }
  const headers = [...sourceHeaders, ...resultHeaders];
  const rows = sourceRows.map((row, index) => [...row, ...resultRows[index]]);
  const sensitiveColumns = new Set(fields.flatMap((field) => field.sensitive && Number.isInteger(mapping[field.id]) ? [mapping[field.id]] : []));
  return { headers, rows, sensitiveColumns };
}

function compute(message, initial = false) {
  if (!mappedRows) throw new Error('Confirm the file columns before computing.');
  const fn = COMPUTES[message.compute];
  if (!fn) throw new RangeError('This upload calculation is not registered.');
  const input = message.input && typeof message.input === 'object' ? message.input : {};
  let result;
  if (BATCH_COMPUTES.has(message.compute)) {
    const rows = mappedRows.map((row) => {
      const value = fn(row);
      return { patient: value.valid ? value.patient : null, message: value.valid ? value.band : value.message };
    });
    const eligible = rows.filter((row) => row.patient === true).length;
    const invalid = rows.filter((row) => row.patient === null).length;
    result = {
      valid: true, rows,
      band: `${eligible.toLocaleString('en-US')} of ${rows.length.toLocaleString('en-US')} rows ${eligible === 1 ? 'meets' : 'meet'} the 340B patient definition.${invalid ? ` ${invalid.toLocaleString('en-US')} row${invalid === 1 ? '' : 's'} need${invalid === 1 ? 's' : ''} corrected inputs.` : ''}`,
      bandLabel: `${eligible.toLocaleString('en-US')} patient${eligible === 1 ? '' : 's'}`,
      abnormal: invalid > 0,
      notes: invalid ? ['Rows that need corrected inputs are identified in the result table and download.'] : [],
      note: 'Each row uses the same 1996 patient-definition check as the form.',
    };
  } else if (message.compute === 'appeal-worklist') {
    const claims = mappedRows.map((row) => [row.reference, row.payer, row.denial_date, row.amount, row.window_days].join('\t')).join('\n');
    result = fn({ ...input, claims });
  } else {
    const rowKey = message.compute === 'med-sync-plan' ? 'medicationRows' : 'fillRows';
    result = fn({ ...input, [rowKey]: mappedRows });
  }
  exportTable = makeExport(message.compute, result);
  const preview = exportTable ? { headers: exportTable.headers, rows: exportTable.rows.slice(0, 100), total: exportTable.rows.length } : null;
  self.postMessage({ type: 'computed', result, rowCount: mappedRows.length, initial, preview });
}

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type === 'parse') {
      if (!(message.buffer instanceof ArrayBuffer)) throw new TypeError('Choose a CSV or TSV file.');
      if (message.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError('File exceeds the 50 MB limit.');
      fields = message.fields;
      mappedRows = null;
      exportTable = null;
      fileBase = String(message.fileName || 'upload').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'upload';
      if (!Array.isArray(fields) || !fields.length) throw new TypeError('No destination fields were provided.');
      const text = new TextDecoder('utf-8', { fatal: true }).decode(message.buffer);
      parsed = parseDelimited(text);
      sourceHeaders = parsed.headers;
      sourceRows = parsed.rows;
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
      mapping = message.mapping;
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
    if (message.type === 'download') {
      if (!exportTable) throw new Error('Compute valid file results before downloading them.');
      const redacted = message.flavor === 'redacted';
      const rows = redacted
        ? exportTable.rows.map((row) => row.map((cell, index) => redactTableCell(cell, {
          header: exportTable.headers[index], sensitive: exportTable.sensitiveColumns.has(index),
        })))
        : exportTable.rows;
      const csv = serializeCsv(exportTable.headers, rows);
      self.postMessage({
        type: 'download', blob: new Blob([csv], { type: 'text/csv;charset=utf-8' }),
        filename: `${fileBase}-${message.compute}-${redacted ? 'redacted-' : ''}results.csv`,
      });
      return;
    }
    throw new TypeError('Unknown upload operation.');
  } catch (error) {
    fail(error);
  }
});
