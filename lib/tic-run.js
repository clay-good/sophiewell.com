// spec-v1604 tool 1: the insurer price file check with its receipt, shared by the browser worker
// (lib/tic-worker.js) and the MCP server's analyze_file. Each file is checked by streaming, then
// hashed in a second streamed pass: an insurer file can be hundreds of gigabytes and is never held whole.

import { checkTicFiles } from './tic-file-check.js';
import { TIC_SCHEMA } from './tic-schemas.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor } from './receipt-worker.js';

// runTic([{ blob, name }], onProgress(index, bytes)) -> { result, receipts }. `name` is passed
// separately because a Blob from Node has no name of its own.
export async function runTic(entries, onProgress) {
  const files = entries.map(({ blob, name }) => (blob.name === name ? blob : new File([blob], name, { type: blob.type })));
  const result = await checkTicFiles(files, onProgress);
  const facts = [];
  for (const file of files) {
    const kind = recognize(new Uint8Array(await file.slice(0, LIMITS.headBytes).arrayBuffer()), { name: file.name });
    facts.push({ name: file.name, size: file.size, sha256: await sha256Blob(file), kind: kind.kind, evidence: kind.evidence });
  }
  return { result, receipts: receiptFor('tic-file-check', facts, result, { schema: `CMS price-transparency-guide ${TIC_SCHEMA.tag}` }) };
}
