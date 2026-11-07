// BGZF (SAMv1 §4.1): a .gz made of many gzip members, the way every bgzipped .vcf.gz is written.
// DecompressionStream('gzip') decodes one member and throws on the next, in Chrome 152 and Node 26
// alike, so a multi-member file used to be refused by the intake inventory. These fixtures are built
// to the specification here rather than checked in, so each test shows the bytes it is about.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync, deflateRawSync, crc32 } from 'node:zlib';
import { gunzipBlob, gunzipDetail } from '../../lib/zip-reader.js';
import { BGZF_EOF } from '../../lib/bgzf.js';
import { inventory } from '../../lib/intake.js';

// One BGZF block: a gzip member whose FEXTRA field carries the BC subfield with BSIZE (block size - 1).
function block(text) {
  const data = Buffer.from(text);
  const cdata = deflateRawSync(data);
  const out = Buffer.alloc(18 + cdata.length + 8);
  Buffer.from([0x1f, 0x8b, 8, 4, 0, 0, 0, 0, 0, 0xff, 6, 0, 0x42, 0x43, 2, 0]).copy(out);
  out.writeUInt16LE(out.length - 1, 16);
  cdata.copy(out, 18);
  out.writeUInt32LE(crc32(data), 18 + cdata.length);
  out.writeUInt32LE(data.length, 22 + cdata.length);
  return out;
}

const LINES = ['##fileformat=VCFv4.5\n', '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n', '20\t14370\trs6054257\tG\tA\t29\tPASS\t.\n'];
const bgzf = (withEof = true) => new Blob([...LINES.map(block), ...(withEof ? [Buffer.from(BGZF_EOF)] : [])]);

test('the end-of-file marker is the 28 bytes SAMv1 §4.1 prints', () => {
  assert.equal(Buffer.from(BGZF_EOF).toString('hex'), '1f8b08040000000000ff0600424302001b0003000000000000000000');
});

test('a BGZF file is read block by block, every line kept', async () => {
  const d = await gunzipDetail(bgzf());
  assert.equal(await d.blob.text(), LINES.join(''));
  assert.deepEqual({ bgzf: d.bgzf, blocks: d.blocks, eofMarker: d.eofMarker }, { bgzf: true, blocks: 4, eofMarker: true });
  assert.equal(await (await gunzipBlob(bgzf())).text(), LINES.join(''));
});

test('a BGZF file without its end-of-file marker still reads, and says it may be truncated', async () => {
  const d = await gunzipDetail(bgzf(false));
  assert.equal(await d.blob.text(), LINES.join(''));
  assert.equal(d.eofMarker, false);
});

test('a single-member gzip reads as before', async () => {
  const d = await gunzipDetail(new Blob([gzipSync(Buffer.from('one member\n'))]));
  assert.equal(await d.blob.text(), 'one member\n');
  assert.equal(d.bgzf, false);
});

// Runtimes differ here: Chrome 152 and Node 26 throw on the second member, so the file is refused with an
// instruction; Node 22 (CI's .nvmrc) decodes every member in full. Either is correct. The one wrong answer
// would be the first member alone, a silent truncation.
test('several plain gzip members with no block sizes are refused with an instruction, or read whole', async () => {
  const joined = new Blob([gzipSync(Buffer.from('a\n')), gzipSync(Buffer.from('b\n'))]);
  let text = null;
  try { text = await (await gunzipBlob(joined)).text(); } catch (err) { assert.match(err.message, /decompress it first/); }
  if (text !== null) assert.equal(text, 'a\nb\n');
});

test('a block size that runs past the end of the file is named as damage', async () => {
  const b = block(LINES[0]);
  b.writeUInt16LE(b.length + 500, 16);
  await assert.rejects(gunzipBlob(new Blob([b])), /damaged at byte 0/);
});

test('the intake inventory unpacks a bgzipped VCF and notes a missing marker', async () => {
  const whole = await inventory([{ file: bgzf(), name: 'sample.vcf.gz' }]);
  assert.deepEqual(whole.refused, []);
  assert.equal(whole.rows.length, 1);
  assert.equal(whole.rows[0].path, 'sample.vcf');
  assert.equal(whole.rows[0].container, 'sample.vcf.gz');
  assert.ok(!whole.rows[0].evidence.some((e) => /truncated/.test(e)));

  const cut = await inventory([{ file: bgzf(false), name: 'sample.vcf.gz' }]);
  assert.deepEqual(cut.refused, []);
  assert.ok(cut.rows[0].evidence.some((e) => /no BGZF end-of-file marker, so it may be truncated/.test(e)));
});
