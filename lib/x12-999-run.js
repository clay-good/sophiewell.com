// The 999 run, pure -- the browser worker (lib/x12-999-worker.js) and the MCP server's analyze_file both
// call it, so a receipt is the same on either surface (spec-v1625).
import { MAX_FILE_BYTES } from './upload-intake.js';
import { fileFacts, receiptFor } from './receipt-worker.js';
import { read999 } from './x12-999-v1515.js';

export const HEADERS = ['source_file', 'acknowledged_group', 'group_functional_id', 'group_code', 'group_outcome', 'transaction_set', 'transaction_control', 'set_code', 'set_outcome', 'set_error_codes', 'segment_errors', 'element_errors', 'ak2_position'];
export const SENSITIVE = new Set();

const segErr = (e) => `${e.segment}@${e.position}${e.loop ? ` loop ${e.loop}` : ''}${e.code ? ` code ${e.code}` : ''}`;
const elErr = (e) => `${e.element}${e.component ? `.${e.component}` : ''}${e.reference ? ` ref ${e.reference}` : ''}${e.code ? ` code ${e.code}` : ''}`;

function rowsFor(fileName, result) {
  const out = [];
  for (const t of result.transactions) {
    if (!t.acks.length) out.push([fileName, t.groupControl, t.functionalId, t.groupCode, t.groupOutcome, '', '', '', '', t.groupErrorCodes.join(' '), '', '', '']);
    for (const a of t.acks) {
      out.push([fileName, t.groupControl, t.functionalId, t.groupCode, t.groupOutcome, a.setId, a.control, a.code, a.outcome, a.setErrorCodes.join(' '),
        a.errors.filter((e) => e.segment).map(segErr).join('; '), a.errors.flatMap((e) => e.elements).map(elErr).join('; '), String(a.segmentPosition)]);
    }
  }
  return out;
}

export function run(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 999 files.');
  const fileBase = String(files[0].name || 'acknowledgment').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'acknowledgment';
  const rows = []; const results = [];
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 999 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    const result = read999(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer));
    results.push(result); rows.push(...rowsFor(file.name, result));
  }
  const order = { rejected: 0, 'accepted with errors': 1, 'not acknowledged': 1, 'unknown code': 1, accepted: 2, '': 3 };
  rows.sort((a, b) => (order[a[8]] ?? 3) - (order[b[8]] ?? 3));
  const totals = results.reduce((t, r) => {
    t.groups += r.summary.groups; t.groupsRejected += r.summary.groupsRejected; t.sets += r.summary.sets;
    t.accepted += r.summary.accepted; t.acceptedWithErrors += r.summary.acceptedWithErrors; t.rejected += r.summary.rejected; t.errors += r.summary.errors;
    t.findings.push(...r.summary.findings);
    return t;
  }, { files: files.length, groups: 0, groupsRejected: 0, sets: 0, accepted: 0, acceptedWithErrors: 0, rejected: 0, errors: 0, findings: [] });
  const receipts = receiptFor('x12-999-reader', fileFacts(files), { totals, rows: rows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  return { rows, totals, fileBase, receipts };
}
