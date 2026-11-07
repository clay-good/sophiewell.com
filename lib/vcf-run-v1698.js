// spec-v1698: one VCF run for both surfaces -- the browser worker (lib/vcf-worker.js) and the MCP server's
// analyze_file call it, so a receipt is the same on either. The receipt needs the file's SHA-256, which the
// reader computes in the same pass; a lookup that stopped early did not read the whole file, so it has none.
import { readVcf } from './vcf-read-v1698.js';
import { receiptFor } from './receipt-worker.js';
import { sha256Hex } from './sha256.js';

export const TOOLS = { 'vcf-variant-lookup': 'lookup', 'vcf-qc-summary': 'summary' };

export async function runVcf(tool, blob, name, { query, sample, onProgress } = {}) {
  const mode = TOOLS[tool];
  if (!mode) return { result: { valid: false, message: `${String(tool).slice(0, 40)} is not a VCF tool.` }, receipts: null };
  const result = await readVcf(blob, { mode, query, sample, onProgress });
  if (!result.valid || !result.file.sha256) return { result, receipts: null };
  const facts = [{ name: String(name || 'file.vcf'), size: blob.size, sha256: result.file.sha256, kind: 'vcf', evidence: [`The first line is ##fileformat=${result.file.fileformat}.`] }];
  // A sample name can name a person, so a receipt records it by its SHA-256 (as privateOptions does free text): the
  // receipt can still be checked against the name without holding it (spec-v1716).
  const sampleRef = result.file.sample ? { sha256: sha256Hex(result.file.sample) } : null;
  const options = mode === 'lookup' ? { ...query, sample: sampleRef } : { sample: sampleRef };
  const body = mode === 'lookup' ? { band: result.band, matches: result.matches } : { band: result.band, totals: result.totals };
  return { result, receipts: receiptFor(tool, facts, body, options) };
}
