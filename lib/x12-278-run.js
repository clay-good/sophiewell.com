// The 278 response run, pure -- the browser worker (lib/x12-278-worker.js) and the MCP server's analyze_file both
// call it, so a receipt is the same on either surface (spec-v1625).
import { MAX_FILE_BYTES } from './upload-intake.js';
import { fileFacts, receiptFor } from './receipt-worker.js';
import { read278 } from './x12-278-v1515.js';

export const HEADERS = ['source_file', 'level', 'decision', 'action_code', 'review_number', 'reason_code', 'patient_name', 'member_id', 'requester', 'payer', 'trace_number', 'service_code', 'service_type', 'certified_dates', 'service_dates', 'rejection_codes', 'payer_message', 'segment_position'];
export const SENSITIVE = new Set([6, 7, 10]);

const rej = (list) => list.map((r) => `${r.reason}${r.followUp ? `/${r.followUp}` : ''}`).join(' ');

export function run(files) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Choose one or more 278 response files.');
  const fileBase = String(files[0].name || 'prior-auth').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80) || 'prior-auth';
  const rows = []; const totals = { files: files.length, transactions: 0, decisions: 0, approved: 0, denied: 0, pended: 0, rejected: 0, other: 0 };
  for (const file of files) {
    if (!(file.buffer instanceof ArrayBuffer)) throw new TypeError('Choose one or more 278 text files.');
    if (file.buffer.byteLength > MAX_FILE_BYTES) throw new RangeError(`${file.name || 'A file'} exceeds the 50 MB limit.`);
    const r = read278(new TextDecoder('utf-8', { fatal: true }).decode(file.buffer));
    for (const k of ['decisions', 'approved', 'denied', 'pended', 'rejected', 'other']) totals[k] += r.summary[k];
    totals.transactions += r.summary.transactionCount;
    for (const d of r.decisions) rows.push([file.name, d.level, d.decision, d.actionCode, d.reviewNumber, d.reasonCode, d.patientName, d.memberId, d.requester, d.payer, d.trace, d.code, d.serviceType, d.certified, d.serviceDates, rej(d.rejections), d.message, String(d.segmentPosition)]);
    if (!r.decisions.length) for (const x of r.rejects) rows.push([file.name, x.level, 'rejected', '', '', '', '', '', '', '', '', '', '', '', '', rej([x]), '', String(x.segmentPosition)]);
  }
  const receipts = receiptFor('x12-278-reader', fileFacts(files), { totals, rows: rows.map(([source, ...rest]) => [files.findIndex((f) => f.name === source), ...rest]) });
  return { rows, totals, fileBase, receipts };
}
