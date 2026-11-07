// spec-v1625 step 4 / spec-v1615 §3: recognize_file and analyze_file. Both
// read only inside the shared directories, return the recognizer's answer or
// the tool's result with its receipt, and the receipt equals the one the
// browser's run gives (same pure module; the e2e cross-surface spec compares
// the downloaded receipt too).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, symlinkSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILE_TOOL_DEFS, recognizeFile, analyzeFile, inRoots, ANALYZABLE } from '../../mcp/file-tools.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds');
const roots = [FIX];

test('two file tools, each with an object input schema and a description', () => {
  assert.deepEqual(FILE_TOOL_DEFS.map((t) => t.name), ['recognize_file', 'analyze_file']);
  for (const t of FILE_TOOL_DEFS) {
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(t.annotations.readOnlyHint);
    assert.ok(readFileSync(join(FIX, '..', '..', '..', 'mcp', 'README.md'), 'utf8').includes(`\`${t.name}\``), `${t.name} is documented in mcp/README.md`);
  }
});

test('recognize_file says what a file is, with its evidence and tools', async () => {
  const r = await recognizeFile({ path: join(FIX, 'x12-835.835') }, { roots });
  assert.equal(r.valid, true);
  assert.equal(r.kind, 'x12-835');
  assert.match(r.evidence.join(' '), /GS08 is 005010X221A1/);
  assert.deepEqual(r.tools.map((t) => t.id), ['x12-835-reader', 'denial-pattern-report', 'appeal-worklist', 'underpayment-check', 'mfp-refund-reconcile']);
  assert.ok(!r.tools.some((t) => t.route), 'a route is not a tool an agent can run');
});

test('analyze_file runs the primary tool and returns the result with a receipt', async () => {
  const bytes = readFileSync(join(FIX, 'x12-835.835'));
  const r = await analyzeFile({ path: join(FIX, 'x12-835.835') }, { roots });
  assert.equal(r.valid, true);
  assert.equal(r.tool, 'x12-835-reader');
  assert.equal(r.totals.claims, 2);
  assert.equal(r.rowCount, 2);
  assert.equal(r.receipt.files[0].sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(r.shareableReceipt.files[0].name, 'Remittance (835) file 1 of 1');
  const again = await analyzeFile({ path: join(FIX, 'x12-835.835') }, { roots });
  assert.equal(again.receipt.resultHash, r.receipt.resultHash);
});

test('analyze_file runs every tool it lists on its fixture', async () => {
  const fixture = { 'x12-835-reader': 'x12-835.835', 'x12-837-check': 'x12-837p.837', 'x12-271-reader': 'x12-271.271', 'x12-277-reader': 'x12-277.277', 'x12-999-reader': 'x12-999.999', 'x12-278-reader': 'x12-278.278', 'hpt-file-check': 'hpt-tall.csv', 'tic-file-check': 'tic-in-network.json', 'carin-eob-reader': 'carin-eob.json', 'pas-bundle-check': 'pas-request.json', 'vcf-variant-lookup': 'sample.vcf', 'vcf-qc-summary': 'sample.vcf' };
  const extra = { 'vcf-variant-lookup': { position: '20:1234567' } };
  for (const tool of ANALYZABLE) {
    const r = await analyzeFile({ path: join(FIX, fixture[tool]), tool, ...(extra[tool] || {}) }, { roots });
    assert.equal(r.valid, true, `${tool}: ${r.message}`);
    assert.match(r.receipt.resultHash, /^[0-9a-f]{64}$/);
  }
});

test('a tool not available here, and a file no tool reads, are refused by name', async () => {
  const csv = await analyzeFile({ path: join(FIX, 'fill-history.csv') }, { roots });
  assert.equal(csv.code, 'NOT_AVAILABLE');
  assert.match(csv.message, /mpr-gap-days runs on the site but not here yet/);
  const none = await analyzeFile({ path: join(FIX, 'unknown.json') }, { roots });
  assert.equal(none.code, 'NO_TOOL');
});

test('only paths inside a shared directory are read; links cannot lead out', async () => {
  const other = mkdtempSync(join(tmpdir(), 'sw-mcp-'));
  writeFileSync(join(other, 'secret.835'), readFileSync(join(FIX, 'x12-835.835')));
  assert.equal((await recognizeFile({ path: join(other, 'secret.835') }, { roots })).code, 'OUTSIDE_ROOTS');
  assert.equal((await recognizeFile({ path: 'x12-835.835' }, { roots })).code, 'OUTSIDE_ROOTS', 'a relative path is refused');
  assert.equal((await recognizeFile({ path: join(FIX, 'x12-835.835') }, { roots: [] })).code, 'NO_ROOTS');
  const shared = mkdtempSync(join(tmpdir(), 'sw-mcp-shared-'));
  symlinkSync(join(other, 'secret.835'), join(shared, 'link.835'));
  assert.equal((await analyzeFile({ path: join(shared, 'link.835') }, { roots: [shared] })).code, 'OUTSIDE_ROOTS');
  assert.equal(await inRoots(join(FIX, 'x12-835.835'), [FIX]) !== null, true);
});

// spec-v1698: a bgzipped VCF's head is compressed; recognize_file reads its first block and calls it a VCF, and
// analyze_file summarizes it without the 50 MB limit (the VCF tools stream).
test('a bgzipped VCF is recognized from its first block and summarized', async () => {
  const { deflateRawSync, crc32 } = await import('node:zlib');
  const { BGZF_EOF } = await import('../../lib/bgzf.js');
  const data = readFileSync(join(FIX, 'sample.vcf'));
  const cdata = deflateRawSync(data);
  const blk = Buffer.alloc(18 + cdata.length + 8);
  Buffer.from([0x1f, 0x8b, 8, 4, 0, 0, 0, 0, 0, 0xff, 6, 0, 0x42, 0x43, 2, 0]).copy(blk);
  blk.writeUInt16LE(blk.length - 1, 16);
  cdata.copy(blk, 18);
  blk.writeUInt32LE(crc32(data), 18 + cdata.length);
  blk.writeUInt32LE(data.length, 22 + cdata.length);
  const dir = mkdtempSync(join(tmpdir(), 'sw-mcp-vcf-'));
  writeFileSync(join(dir, 'sample.vcf.gz'), Buffer.concat([blk, Buffer.from(BGZF_EOF)]));
  const rec = await recognizeFile({ path: join(dir, 'sample.vcf.gz') }, { roots: [dir] });
  assert.equal(rec.kind, 'vcf');
  assert.match(rec.evidence[0], /bgzip-compressed/);
  const r = await analyzeFile({ path: join(dir, 'sample.vcf.gz'), sample: 'NA00003' }, { roots: [dir] });
  assert.equal(r.code, 'UNREADABLE', 'recognition picks the lookup, which needs a position');
  assert.match(r.message, /^Enter a position/);
  const s = await analyzeFile({ path: join(dir, 'sample.vcf.gz'), tool: 'vcf-qc-summary', sample: 'NA00003' }, { roots: [dir] });
  assert.equal(s.totals.records, 5);
  assert.equal(s.totals.homAlt, 3);
  const l = await analyzeFile({ path: join(dir, 'sample.vcf.gz'), position: 'rs6054257', sample: 'NA00003' }, { roots: [dir] });
  assert.equal(l.findings.matches[0].gt, '1/1');
});
