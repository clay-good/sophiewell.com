// spec-v1625 step 2: what a file tool's worker needs for a receipt -- each
// input file's SHA-256 and recognized kind, and the receipt itself. Runs in
// the worker that already holds the bytes; nothing is sent anywhere.

import { sha256Hex } from './sha256.js';
import { recognize, kindInfo, LIMITS } from './file-kinds.js';
import { buildReceipt, shareable } from './receipt.js';
import { BUILD } from './build-info.js';

// fileFacts([{ name, buffer }]) -> [{ name, size, sha256, kind, evidence }]
export function fileFacts(files) {
  return files.map((f) => {
    const bytes = new Uint8Array(f.buffer);
    const r = recognize(bytes.subarray(0, LIMITS.headBytes), { name: f.name });
    return { name: f.name, size: bytes.length, sha256: sha256Hex(bytes), kind: r.kind, evidence: r.evidence };
  });
}

// receiptFor(tool, facts, result, options, data) -> { receipt, shareable }
export function receiptFor(tool, facts, result, options = {}, data = []) {
  const receipt = buildReceipt({ files: facts, tool, commit: BUILD.commit, data, options, result });
  return { receipt, shareable: shareable(receipt, (k) => (kindInfo(k) || { label: k }).label) };
}

// The closing row of a CSV export (serializeCsv's `trailer`).
export const csvTrailer = (r) => `Made by sophiewell.com ${r.tool.id}, build ${r.tool.commit}${r.data.length ? `, data ${r.data.map((d) => `${d.id} ${d.sourceEdition}`).join('; ')}` : ''}, result ${r.resultHash}. Files are named by SHA-256 in the receipt.`;
