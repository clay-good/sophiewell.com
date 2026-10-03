// spec-v1625 step 4: the price file check with its receipt, shared by the
// browser worker (lib/hpt-worker.js) and the MCP server's analyze_file. The
// file is validated by streaming, then hashed in a second streamed pass: a
// price file can be gigabytes and is never held whole.

import { validateHptFile } from './hpt-stream-v1515.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor } from './receipt-worker.js';

// runHpt(blob, name, onProgress) -> { result, receipts }. `name` decides CSV or
// JSON the way the page does (a Blob from Node has no name of its own).
export async function runHpt(blob, name, onProgress) {
  const file = blob.name === name ? blob : new File([blob], name, { type: blob.type });
  const result = await validateHptFile(file, onProgress);
  const head = new Uint8Array(await file.slice(0, LIMITS.headBytes).arrayBuffer());
  const kind = recognize(head, { name });
  const facts = [{ name, size: file.size, sha256: await sha256Blob(file), kind: kind.kind, evidence: kind.evidence }];
  return { result, receipts: receiptFor('hpt-file-check', facts, result) };
}
