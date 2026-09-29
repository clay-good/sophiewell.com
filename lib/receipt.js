// spec-v1625 / spec-v1615: a receipt for every file run -- which files (by
// SHA-256, never their contents), which tool and build, which data editions,
// which options -- and a hash of the result, so the answer can be shown to
// someone else and reproduced. Pure; used in the tools' workers, the page and
// the MCP server alike.

import { sha256Hex } from './sha256.js';

export const RECEIPT_VERSION = 1;

// canonicalize(value) -> one JSON text for one value: object keys sorted,
// array order kept, undefined and functions dropped, -0 written as 0. Tools
// hash their results in integer cents and fixed-decimal strings already, so
// no number here depends on a platform's float printing beyond JSON's own.
export function canonicalize(value) {
  const walk = (v) => {
    if (v === null || typeof v !== 'object') {
      if (typeof v === 'number') return Object.is(v, -0) ? '0' : JSON.stringify(v);
      return v === undefined || typeof v === 'function' ? undefined : JSON.stringify(v);
    }
    if (Array.isArray(v)) return `[${v.map((x) => walk(x) ?? 'null').join(',')}]`;
    const parts = [];
    for (const k of Object.keys(v).sort()) {
      const s = walk(v[k]);
      if (s !== undefined) parts.push(`${JSON.stringify(k)}:${s}`);
    }
    return `{${parts.join(',')}}`;
  };
  return walk(value);
}

export const resultHash = (result) => sha256Hex(canonicalize(result));

// buildReceipt -> the receipt. `files`: [{ name, size, sha256, kind, evidence }];
// `data`: [{ id, sourceEdition, coverage, status, manifestSha256 }] for each
// dataset the tool read; `options`: the reader's choices.
export function buildReceipt({ files, tool, commit, data = [], options = {}, result, ranAt }) {
  return {
    receiptVersion: RECEIPT_VERSION,
    files: files.map((f) => ({ name: f.name, size: f.size, sha256: f.sha256, kind: f.kind, evidence: f.evidence || [] })),
    tool: { id: tool, commit: commit || 'dev' },
    data,
    options,
    resultHash: resultHash(result),
    ranAt: ranAt || new Date().toISOString(),
  };
}

// shareable(receipt) -> a copy with every file name replaced by its kind and
// position ("Remittance (835) file 1 of 2"): a name can identify a patient.
export function shareable(receipt, labelOf = (kind) => kind) {
  const n = receipt.files.length;
  return { ...receipt, files: receipt.files.map((f, i) => ({ ...f, name: `${labelOf(f.kind)} ${i + 1} of ${n}` })) };
}

// isReceipt(value) -> true for a parsed receipt JSON.
export const isReceipt = (v) => Boolean(v && typeof v === 'object' && v.receiptVersion && typeof v.resultHash === 'string' && Array.isArray(v.files));

// compareReceipts(original, rerun) -> { reproduced, differences[] }. A
// difference in build or data edition is named first: it explains a
// different result before anything else does.
export function compareReceipts(a, b) {
  const out = [];
  if (a.tool.id !== b.tool.id) out.push(`The tool differs: ${a.tool.id} then, ${b.tool.id} now.`);
  if (a.tool.commit !== b.tool.commit) out.push(`The build differs: ${a.tool.commit} then, ${b.tool.commit} now.`);
  const edition = (list) => Object.fromEntries((list || []).map((d) => [d.id, d.sourceEdition]));
  const ea = edition(a.data); const eb = edition(b.data);
  for (const id of new Set([...Object.keys(ea), ...Object.keys(eb)])) {
    if (ea[id] !== eb[id]) out.push(`The ${id} data differs: ${ea[id] || 'none'} then, ${eb[id] || 'none'} now.`);
  }
  if (canonicalize(a.options) !== canonicalize(b.options)) out.push('The options differ.');
  if (a.resultHash !== b.resultHash) out.push('The result differs.');
  return { reproduced: a.resultHash === b.resultHash, differences: out };
}
