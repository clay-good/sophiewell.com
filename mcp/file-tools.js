// spec-v1625 step 4 / spec-v1615 §3: the file recognizer and file tools for
// agents. recognize_file says what a file on the user's machine is;
// analyze_file runs the tool that reads it and returns the result with its
// receipt. Both read the file locally through Node and run the same pure
// modules as the browser, so the receipt is the one the page would give.
//
// The server's posture stands: no network, no writes, no state. A path is
// read only inside a directory the client shares (its MCP roots, or
// SOPHIEWELL_MCP_ROOTS when the client shares none); anything else is refused.

import { open, realpath, stat } from 'node:fs/promises';
import { openAsBlob } from 'node:fs';
import { basename, isAbsolute, relative, sep } from 'node:path';
import { recognize, LIMITS } from '../lib/file-kinds.js';
import { CSV_TOOLS } from '../lib/upload-fields.js';
import { MAX_FILE_BYTES } from '../lib/upload-intake.js';
import * as R835 from '../lib/x12-835-run.js';
import * as R837 from '../lib/x12-837-run.js';
import * as R271 from '../lib/x12-271-run.js';
import * as R277 from '../lib/x12-277-run.js';
import { runHpt } from '../lib/hpt-run.js';
import { runTic } from '../lib/tic-run.js';
import { run as runCarin, CLAIM_HEADERS, claimRow } from '../lib/carin-run.js';
import { checkPasBundle, profileSet } from '../lib/pas-bundle-check.js';
import { fileFacts, receiptFor } from '../lib/receipt-worker.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const X12_RUNS = { 'x12-835-reader': R835, 'x12-837-check': R837, 'x12-271-reader': R271, 'x12-277-reader': R277 };
export const ANALYZABLE = [...Object.keys(X12_RUNS), 'hpt-file-check', 'tic-file-check', 'carin-eob-reader', 'pas-bundle-check'];
const PREVIEW_ROWS = 20;

const readOnly = (title) => ({ title, readOnlyHint: true, idempotentHint: true, openWorldHint: false });
const refusal = ({ code }, message) => ({ valid: false, code, message });

export const FILE_TOOL_DEFS = [
  {
    name: 'recognize_file',
    description: 'Says what a file on the user\'s machine is -- an 835, 837, 271 or 277 X12 file, a hospital or insurer price file, a FHIR or C-CDA health record, a CSV one of the tools reads, a CMS reference table -- from its first 256 KB, with the facts that decided it and the tools that read it. The file is read locally and never leaves the machine. The path must be inside a directory the client shares.',
    annotations: readOnly('Recognize a file'),
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', maxLength: 4096, description: 'Absolute path to the file, inside a shared directory.' } },
      required: ['path'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' }, name: { type: 'string' }, size: { type: 'number' },
        kind: { type: 'string' }, label: { type: 'string' }, confidence: { type: 'string' },
        evidence: { type: 'array' }, tools: { type: 'array' }, ambiguous: { type: 'boolean' },
        code: { type: 'string' }, message: { type: 'string' },
      },
    },
  },
  {
    name: 'analyze_file',
    description: `Recognizes a file and runs the tool that reads it (or the tool named), returning the result's totals, the first ${PREVIEW_ROWS} result rows and a receipt: each file's SHA-256 and kind, the tool and build, and the SHA-256 of the whole result, so the answer can be reproduced on the site or here. Reads locally; nothing leaves the machine. Tools available: ${ANALYZABLE.join(', ')}.`,
    annotations: readOnly('Analyze a file'),
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', maxLength: 4096, description: 'Absolute path to the file, inside a shared directory.' },
        tool: { type: 'string', maxLength: 80, description: 'A tool id to run instead of the one recognition picks.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' }, tool: { type: 'string' }, kind: { type: 'string' },
        totals: { type: 'object' }, findings: { type: 'object' }, headers: { type: 'array' }, rows: { type: 'array' }, rowCount: { type: 'number' },
        receipt: { type: 'object' }, shareableReceipt: { type: 'object' },
        code: { type: 'string' }, message: { type: 'string' },
      },
    },
  },
];

// inRoots(path, roots) -> the real path when it lies inside one of the
// shared directories, else null. Symbolic links are resolved first, so a link
// cannot lead out of a shared directory.
export async function inRoots(path, roots) {
  if (typeof path !== 'string' || !isAbsolute(path)) return null;
  let real;
  try { real = await realpath(path); } catch { return null; }
  for (const root of roots) {
    let r;
    try { r = await realpath(root); } catch { continue; }
    const rel = relative(r, real);
    if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel) && !rel.startsWith(`..${sep}`))) return real;
  }
  return null;
}

async function head(path) {
  const fh = await open(path, 'r');
  try {
    const buf = Buffer.alloc(LIMITS.headBytes);
    const { bytesRead } = await fh.read(buf, 0, LIMITS.headBytes, 0);
    return new Uint8Array(buf.buffer, buf.byteOffset, bytesRead);
  } finally { await fh.close(); }
}

async function resolve(args, roots) {
  if (!roots || !roots.length) return { error: refusal({ code: 'NO_ROOTS' }, 'No directory is shared: the client lists no roots and SOPHIEWELL_MCP_ROOTS is not set, so no file can be read.') };
  const real = await inRoots(args && args.path, roots);
  if (!real) return { error: refusal({ code: 'OUTSIDE_ROOTS' }, 'That path is not a file inside a directory the client shares.') };
  const st = await stat(real);
  if (!st.isFile()) return { error: refusal({ code: 'NOT_A_FILE' }, 'That path is not a file.') };
  return { real, size: st.size, name: basename(real) };
}

export async function recognizeFile(args, { roots }) {
  const r = await resolve(args, roots);
  if (r.error) return r.error;
  const res = recognize(await head(r.real), { name: r.name, size: r.size }, { csvTools: CSV_TOOLS });
  return { valid: true, name: r.name, size: r.size, kind: res.kind, label: res.label, confidence: res.confidence, evidence: res.evidence, tools: res.tools.filter((t) => !t.route), ambiguous: Boolean(res.ambiguous) };
}

export async function analyzeFile(args, { roots }) {
  const r = await resolve(args, roots);
  if (r.error) return r.error;
  const rec = recognize(await head(r.real), { name: r.name, size: r.size }, { csvTools: CSV_TOOLS });
  const tool = (args && args.tool) || (rec.tools.find((t) => t.status === 'live' && !t.route) || {}).id;
  if (!tool) return refusal({ code: 'NO_TOOL' }, `${rec.label}: no tool here reads it. ${rec.evidence.join(' ')}`);
  if (!ANALYZABLE.includes(tool)) return refusal({ code: 'NOT_AVAILABLE' }, `${tool} runs on the site but not here yet. Tools available here: ${ANALYZABLE.join(', ')}.`);
  if (tool === 'hpt-file-check') {
    const { result, receipts } = await runHpt(await openAsBlob(r.real), r.name);
    return { valid: true, tool, kind: rec.kind, findings: result, receipt: receipts.receipt, shareableReceipt: receipts.shareable };
  }
  if (tool === 'tic-file-check') {
    const { result, receipts } = await runTic([{ blob: await openAsBlob(r.real), name: r.name }]);
    return { valid: true, tool, kind: rec.kind, findings: result, receipt: receipts.receipt, shareableReceipt: receipts.shareable };
  }
  if (r.size > MAX_FILE_BYTES) return refusal({ code: 'TOO_LARGE' }, `${r.name} is over the 50 MB limit these tools share with the site.`);
  const fh = await open(r.real, 'r');
  let bytes;
  try { bytes = await fh.readFile(); } finally { await fh.close(); }
  if (tool === 'pas-bundle-check') {
    let bundle;
    try { bundle = JSON.parse(new TextDecoder().decode(bytes)); } catch (err) { return refusal({ code: 'UNREADABLE' }, `${r.name} is not JSON: ${err.message}`); }
    const dir = fileURLToPath(new URL('../data/pas-profiles/', import.meta.url));
    const manifest = JSON.parse(readFileSync(`${dir}manifest.json`, 'utf8'));
    const set = profileSet(JSON.parse(readFileSync(`${dir}shards/profiles.json`, 'utf8')), JSON.parse(readFileSync(`${dir}valuesets.json`, 'utf8')));
    const out = checkPasBundle(bundle, set);
    if (!out.valid) return refusal({ code: 'UNREADABLE' }, out.message);
    const receipts = receiptFor('pas-bundle-check', fileFacts([{ name: r.name, buffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }]), { findings: out.findings }, {}, [{ id: 'pas-profiles', sourceEdition: manifest.sourceEdition }]);
    return { valid: true, tool, kind: rec.kind, findings: out, receipt: receipts.receipt, shareableReceipt: receipts.shareable };
  }
  if (tool === 'carin-eob-reader') {
    let read;
    try { read = runCarin([{ name: r.name, buffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }]); } catch (err) { return refusal({ code: 'UNREADABLE' }, err instanceof Error ? err.message : String(err)); }
    if (!read.result.valid) return refusal({ code: 'UNREADABLE' }, read.result.message);
    return {
      valid: true, tool, kind: rec.kind, totals: { band: read.result.band, years: read.result.years, flags: read.result.flags },
      headers: CLAIM_HEADERS, rows: read.result.claims.slice(0, PREVIEW_ROWS).map(claimRow), rowCount: read.result.claims.length,
      receipt: read.receipts.receipt, shareableReceipt: read.receipts.shareable,
    };
  }
  let out;
  try {
    out = X12_RUNS[tool].run([{ name: r.name, buffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }]);
  } catch (err) {
    return refusal({ code: 'UNREADABLE' }, err instanceof Error ? err.message : String(err));
  }
  return {
    valid: true, tool, kind: rec.kind, totals: out.totals,
    headers: X12_RUNS[tool].HEADERS, rows: out.rows.slice(0, PREVIEW_ROWS), rowCount: out.rows.length,
    receipt: out.receipts.receipt, shareableReceipt: out.receipts.shareable,
  };
}

// fileDispatch(name, args, { roots }) -> the tool's result, or null when the
// name is not a file tool.
export async function fileDispatch(name, args, ctx) {
  if (name === 'recognize_file') return recognizeFile(args, ctx);
  if (name === 'analyze_file') return analyzeFile(args, ctx);
  return null;
}
