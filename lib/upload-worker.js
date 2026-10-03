// spec-v1501 §3: parse and map local CSV/TSV files away from the UI thread.
// This worker has no network code and retains one parsed file only while its tool
// is open. Computation stays here too, so large files never cross back to the UI.
import { MAX_FILE_BYTES, parseDelimited, matchColumns, validateColumnMapping, serializeCsv } from './upload-intake.js';
import { pdcStar, adherenceOutreachList } from './pdc-star-v1513.js';
import { mprGapDays, medSyncPlan } from './adherence-v1513.js';
import { patientCheck340b } from './entity-340b-v1509.js';
import { appealWorklist } from './denial-next-step-v1516.js';
import { pharmacySpreadCheck } from './pharmacy-spread-check.js';
import { authRunoutWorklist } from './auth-runout-v1502.js';
import { nadacMarginBatch } from './nadac-margin.js';
import { chairDayPlanner } from './chair-day-planner.js';
import { claimsPctMedicare, CSV_RESULT_HEADERS as CPM_HEADERS, csvResult as cpmResult } from './claims-pct-medicare.js';
import { mfpRefundReconcile, CSV_RESULT_HEADERS as MRR_HEADERS, csvResult as mrrResult } from './mfp-refund-reconcile.js';
import { BATCH_TOOLS, runBatch, BATCH_RESULT_HEADERS, batchResultRow } from './batch-tools.js';
import { redactTableCell } from './pa/redact.js';
import { fileFacts, receiptFor, csvTrailer, privateOptions } from './receipt-worker.js';

const COMPUTES = {
  'pdc-star': pdcStar,
  'adherence-outreach-list': adherenceOutreachList,
  'mpr-gap-days': mprGapDays,
  'med-sync-plan': medSyncPlan,
  '340b-patient-check': patientCheck340b,
  'appeal-worklist': appealWorklist,
  'pharmacy-spread-check': pharmacySpreadCheck,
  'auth-runout': authRunoutWorklist,
  'nadac-margin': nadacMarginBatch,
  'chair-day-planner': chairDayPlanner,
  'claims-pct-medicare': claimsPctMedicare,
  'mfp-refund-reconcile': mfpRefundReconcile,
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
// spec-v1625: the file's facts, taken when it is read, and the last receipt.
let facts = null;
let receipts = null;

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
  } else if (computeName === 'auth-runout') {
    resultHeaders = ['sophiewell_submit_renewal_by', 'sophiewell_first_uncovered_administration', 'sophiewell_limited_by', 'sophiewell_status'];
    resultRows = result.rows.map((row) => (row.submitBy ? [row.submitBy, row.needBy, row.limitedBy, row.status] : ['', '', '', row.reason]));
  } else if (computeName === 'chair-day-planner') {
    resultHeaders = ['sophiewell_chair', 'sophiewell_start', 'sophiewell_end', 'sophiewell_status'];
    const byLine = new Map([
      ...result.placed.map((x) => [x.line, [x.chair, x.start, x.end, 'scheduled']]),
      ...result.unplaced.map((x) => [x.line, ['', '', '', x.earliest ? `does not fit; earliest slot ${x.earliest}` : 'does not fit today']]),
      ...result.invalid.map((x) => [x.line, ['', '', '', x.reason]]),
    ]);
    resultRows = mappedRows.map((row, index) => byLine.get(index + 1) || ['', '', '', '']);
  } else if (computeName === 'nadac-margin') {
    const dollars = (c) => (c / 100).toFixed(2);
    resultHeaders = ['sophiewell_cost_basis', 'sophiewell_cost', 'sophiewell_margin', 'sophiewell_status'];
    resultRows = result.rows.map((row) => (row.status === 'priced' ? [row.basis, dollars(row.cost), dollars(row.margin), row.margin < 0 ? 'below cost' : 'priced'] : ['', '', '', row.reason]));
  } else if (computeName === 'mfp-refund-reconcile') {
    resultHeaders = MRR_HEADERS;
    resultRows = result.rows.map(mrrResult);
  } else if (computeName === 'claims-pct-medicare') {
    resultHeaders = CPM_HEADERS;
    resultRows = result.rows.map(cpmResult);
  } else if (computeName === 'pharmacy-spread-check') {
    const dollars = (c) => (c / 100).toFixed(2);
    resultHeaders = ['sophiewell_nadac_per_unit', 'sophiewell_nadac_cost', 'sophiewell_paid_above_nadac', 'sophiewell_spread', 'sophiewell_status'];
    resultRows = result.rows.map((row) => (row.status === 'priced'
      ? [row.perUnit, dollars(row.nadacCost), dollars(row.gap), row.spread == null ? '' : dollars(row.spread), 'priced']
      : ['', '', '', '', row.reason]));
  } else if (BATCH_TOOLS[computeName]) {
    resultHeaders = BATCH_RESULT_HEADERS;
    resultRows = result.rows.map(batchResultRow);
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
  if (!fn && !BATCH_TOOLS[message.compute]) throw new RangeError('This upload calculation is not registered.');
  const input = message.input && typeof message.input === 'object' ? message.input : {};
  let result;
  // spec-v1501 §3: a form tool over a file, one case per row; the form's answers fill the columns it lacks.
  if (BATCH_TOOLS[message.compute]) {
    result = runBatch(message.compute, mappedRows, input);
  } else if (BATCH_COMPUTES.has(message.compute)) {
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
    const rowKey = { 'med-sync-plan': 'medicationRows', 'pharmacy-spread-check': 'claimRows', 'nadac-margin': 'claimRows', 'auth-runout': 'authRows', 'chair-day-planner': 'apptRows', 'claims-pct-medicare': 'claimRows', 'mfp-refund-reconcile': 'claimRows' }[message.compute] || 'fillRows';
    result = fn({ ...input, [rowKey]: mappedRows });
  }
  exportTable = makeExport(message.compute, result);
  const preview = exportTable ? { headers: exportTable.headers, rows: exportTable.rows.slice(0, 100), total: exportTable.rows.length } : null;
  // The receipt hashes every output row (the file's rows with the result
  // columns appended), or the refusal; the options are the confirmed column
  // mapping and the form values the run used.
  // A benchmark the page loaded (NADAC, the fee schedule) is named in the receipt by its edition, not copied into it.
  // The 835 refunds a page read are named in the receipt by each file's SHA-256 (remitFiles), not copied.
  const { nadac, mpfs, remits, ...options } = input;
  const data = nadac && nadac.edition ? [nadac.edition] : mpfs && mpfs.edition ? [{ id: 'mpfs', sourceEdition: mpfs.edition }] : [];
  receipts = receiptFor(message.compute, facts, exportTable ? { rows: exportTable.rows } : { refused: result.message || null }, { columns: mapping, input: privateOptions(options) }, data);
  self.postMessage({ type: 'computed', result, rowCount: mappedRows.length, initial, preview, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
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
      facts = fileFacts([{ name: message.fileName || 'upload', buffer: message.buffer }]);
      receipts = null;
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
      const csv = serializeCsv(exportTable.headers, rows, { trailer: receipts && csvTrailer(receipts.receipt) });
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
