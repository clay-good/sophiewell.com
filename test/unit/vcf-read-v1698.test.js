// spec-v1698: the VCF readers on the VCFv4.5 §1.1 example (test/fixtures/file-kinds/sample.vcf, copied from
// hts-specs with its columns tab-separated), plain, gzip and BGZF. Every vector is from the change's design.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, deflateRawSync, crc32 } from 'node:zlib';
import { readVcf, genotype, alleleType, sniffVcfGz } from '../../lib/vcf-read-v1698.js';
import { runVcf } from '../../lib/vcf-run-v1698.js';
import { BGZF_EOF } from '../../lib/bgzf.js';

const BYTES = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds', 'sample.vcf'));
const plain = () => new Blob([BYTES]);
const lookup = (query, sample = '', blob = plain()) => readVcf(blob, { mode: 'lookup', query, sample });

function block(buf) {
  const cdata = deflateRawSync(buf);
  const out = Buffer.alloc(18 + cdata.length + 8);
  Buffer.from([0x1f, 0x8b, 8, 4, 0, 0, 0, 0, 0, 0xff, 6, 0, 0x42, 0x43, 2, 0]).copy(out);
  out.writeUInt16LE(out.length - 1, 16);
  cdata.copy(out, 18);
  out.writeUInt32LE(crc32(buf), 18 + cdata.length);
  out.writeUInt32LE(buf.length, 22 + cdata.length);
  return out;
}
// Split mid-line on purpose, so a record straddles two blocks.
const bgzf = (eof = true) => new Blob([block(BYTES.subarray(0, 700)), block(BYTES.subarray(700, 1300)), block(BYTES.subarray(1300)), ...(eof ? [Buffer.from(BGZF_EOF)] : [])]);

test('20:14370 in NA00003 is 1/1, unphased, homozygous alternate, DP 5', async () => {
  const r = await lookup({ chrom: '20', pos: '14370' }, 'NA00003');
  assert.equal(r.found, true);
  assert.deepEqual([r.matches[0].gt, r.matches[0].phased, r.matches[0].zygosity, r.matches[0].dp], ['1/1', false, 'homozygous alternate', 5]);
});

test('the first sample is the default: NA00001 at 20:14370 is 0|0, phased, homozygous reference', async () => {
  const r = await lookup({ chrom: '20', pos: '14370' });
  assert.equal(r.file.sample, 'NA00001');
  assert.deepEqual([r.matches[0].gt, r.matches[0].phased, r.matches[0].zygosity], ['0|0', true, 'homozygous reference']);
  assert.ok(r.notes.some((n) => /3 samples; reporting NA00001 \(the first/.test(n)));
});

test('20:1110696 A>T in NA00001 is 1|2, heterozygous, and T is ALT 2', async () => {
  const r = await lookup({ chrom: '20', pos: '1110696', ref: 'A', alt: 'T' }, 'NA00001');
  assert.equal(r.matches[0].zygosity, 'heterozygous');
  assert.ok(r.notes.some((n) => n.includes('G (ALT 1) | T (ALT 2)')));
});

test('20:1230237 is a reference-only site', async () => {
  const r = await lookup({ chrom: '20', pos: '1230237' });
  assert.ok(r.notes[0].includes('a reference-only site'));
});

test('an absent position is "not in this file", never "reference"', async () => {
  const r = await lookup({ chrom: '20', pos: '15000' });
  assert.equal(r.found, false);
  assert.match(r.band, /is not in this file/);
  assert.ok(r.notes.some((n) => /not evidence that the genotype there is reference/.test(n)));
  assert.ok(r.notes.some((n) => /stopped once the file passed/.test(n)), 'a sorted file stops early');
  assert.equal(r.file.sha256, null, 'a partial read has no file hash');
});

test('chr20 is matched to 20, and the alias is said', async () => {
  const r = await lookup({ chrom: 'chr20', pos: '17330' }, 'NA00002');
  assert.equal(r.matches[0].zygosity, 'heterozygous');
  assert.ok(r.notes.some((n) => /"chr" prefix ignored/.test(n)));
});

test('an ID lookup, and the assembly line beside every lookup', async () => {
  const r = await lookup({ id: 'microsat1' }, 'NA00002');
  assert.equal(r.matches[0].gt, '0/2');
  assert.ok(r.notes.some((n) => n.includes('Assembly as the file states it: B36')));
});

test('allele balance is AD of the ALT over all AD: 10,8 gives 0.444', async () => {
  const text = '##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tS1\n1\t100\t.\tC\tT\t50\tPASS\t.\tGT:AD:DP\t0/1:10,8:18\n';
  const r = await lookup({ chrom: '1', pos: '100' }, '', new Blob([text]));
  assert.equal(r.matches[0].alleleBalance, 0.444);
  assert.ok(r.notes.some((n) => n.includes('no assembly')));
});

test('summary of the example for NA00003: 5 records, 4 PASS, Ti 2, Tv 2, 0 het, 3 hom-alt', async () => {
  const r = await readVcf(plain(), { mode: 'summary', sample: 'NA00003' });
  const t = r.totals;
  assert.deepEqual([t.records, t.pass, t.transitions, t.transversions, t.titv, t.het, t.homAlt], [5, 4, 2, 2, 1, 0, 3]);
  assert.deepEqual([t.snv, t.insertion, t.deletion, t.other, t.multiallelic, t.refOnly], [4, 1, 1, 0, 2, 1]);
  assert.equal(t.hetHomAlt, 0);
  assert.equal(r.file.sha256, createHash('sha256').update(BYTES).digest('hex'));
});

test('BGZF with the marker reads whole; without it, the truncation note; plain gzip reads; sniff sees a VCF', async () => {
  const a = await readVcf(bgzf(), { mode: 'summary' });
  assert.equal(a.totals.records, 5);
  assert.equal(a.file.compression, 'bgzf');
  assert.equal(a.file.eofMarker, true);
  assert.ok(!a.notes.some((n) => /truncated/.test(n)));
  const b = await readVcf(bgzf(false), { mode: 'summary' });
  assert.equal(b.totals.records, 5);
  assert.ok(b.notes.some((n) => /may be truncated/.test(n)));
  const c = await readVcf(new Blob([gzipSync(BYTES)]), { mode: 'summary' });
  assert.equal(c.totals.records, 5);
  assert.equal(c.file.compression, 'gzip');
  assert.equal(await sniffVcfGz(bgzf()), 'VCFv4.5');
  assert.equal(await sniffVcfGz(plain()), null);
});

test('a file seen out of order is read to the end', async () => {
  const text = '##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n1\t100\t.\tC\tT\t50\tPASS\t.\n1\t50\t.\tC\tT\t50\tPASS\t.\n1\t300\t.\tC\tT\t50\tPASS\t.\n1\t200\t.\tA\tG\t50\tPASS\t.\n';
  const r = await lookup({ chrom: '1', pos: '200' }, '', new Blob([text]));
  assert.equal(r.found, true);
  assert.ok(r.notes.some((n) => /not in position order/.test(n)));
  assert.ok(r.notes.some((n) => /no sample columns/.test(n)));
});

test('zygosity and allele types', () => {
  const k = ['GT'];
  assert.equal(genotype(k, './.').zygosity, 'missing');
  assert.equal(genotype(k, '1').zygosity, 'haploid or hemizygous, alternate');
  assert.equal(genotype(k, '0/1/1').zygosity, '3 alleles (polyploid); not classified');
  assert.equal(alleleType('GTC', 'GTCT'), 'insertion');
  assert.equal(alleleType('GTC', 'G'), 'deletion');
  assert.equal(alleleType('A', '<DEL>'), 'other');
  assert.equal(alleleType('AC', 'GT'), 'other');
});

test('refusals: not a VCF, an unknown sample, no position, a bad position', async () => {
  assert.match((await readVcf(new Blob(['hello\n']), { mode: 'summary' })).message, /not a VCF/);
  assert.match((await lookup({ chrom: '20', pos: '14370' }, 'NOPE')).message, /Its samples are: NA00001, NA00002, NA00003/);
  assert.match((await lookup({})).message, /^Enter a position/);
  assert.match((await lookup({ chrom: '20', pos: '0' })).message, /at least 1/);
  assert.match((await lookup({ chrom: '20' })).message, /whole number/);
  assert.match((await readVcf(null)).message, /Choose a VCF/);
});

test('the run gives a receipt only when the whole file was read', async () => {
  const whole = await runVcf('vcf-qc-summary', plain(), 'sample.vcf');
  assert.equal(whole.receipts.receipt.files[0].sha256, createHash('sha256').update(BYTES).digest('hex'));
  const early = await runVcf('vcf-variant-lookup', plain(), 'sample.vcf', { query: { chrom: '20', pos: '14370' } });
  assert.equal(early.receipts, null);
});

// spec-v1716: review fixes.
const vcf = (body, samples = 'S1\tS2') => new Blob([`##fileformat=VCFv4.4\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t${samples}\n${body}`]);

test('spec-v1716: a leading phase mark is read (VCFv4.4); a malformed GT is not called heterozygous', () => {
  assert.equal(genotype(['GT'], '|1').zygosity, 'haploid or hemizygous, alternate');
  assert.equal(genotype(['GT'], '|1').phased, true);
  assert.equal(genotype(['GT'], '|0/1').zygosity, 'heterozygous');
  assert.match(genotype(['GT'], '1/').zygosity, /not a readable genotype/);
  assert.match(genotype(['GT'], 'A/1').zygosity, /not a readable genotype/);
});

test('spec-v1716: a position inside a called deletion says the deletion spans it', async () => {
  const r = await readVcf(vcf('1\t100\t.\tACGT\tA\t50\tPASS\t.\tGT\t1/1\t0/0\n1\t200\t.\tC\tT\t50\tPASS\t.\tGT\t0/1\t0/1\n'), { mode: 'lookup', query: { chrom: '1', pos: '102' } });
  assert.equal(r.found, false);
  assert.match(r.band, /1:102 has no record of its own, but the record at 1:100 \(REF ACGT, ALT A, GT 1\/1\) spans it/);
  assert.equal(r.covering.length, 1);
});

test('spec-v1716: ID "." is refused; N is not an SNV; a hex or empty POS is refused; skipped genotypes are counted', async () => {
  assert.match((await readVcf(vcf('1\t100\t.\tA\tG\t50\tPASS\t.\tGT\t0/1\t0/1\n'), { mode: 'lookup', query: { id: '.' } })).message, /missing value/);
  assert.equal(alleleType('N', 'A'), 'other');
  const sum = await readVcf(vcf('1\t100\t.\tN\tA\t50\tPASS\t.\tGT\t0/1\t0/1\n1\t101\t.\tA\tG\t50\tPASS\t.\tGT\t0/1\t0/1\n1\t102\t.\tC\tT\t50\tPASS\t.\n'), { mode: 'summary' });
  assert.deepEqual([sum.totals.transitions, sum.totals.transversions], [2, 0]);
  assert.match(sum.notes.join(' '), /1 record with no genotype column for this sample, not counted/);
  assert.match((await readVcf(vcf('1\t0x64\t.\tA\tG\t50\tPASS\t.\tGT\t0/1\t0/1\n'), { mode: 'summary' })).message, /not a whole number/);
  assert.match((await readVcf(vcf('1\t\t.\tA\tG\t50\tPASS\t.\tGT\t0/1\t0/1\n'), { mode: 'summary' })).message, /not a whole number/);
});

test('spec-v1716: a damaged BGZF block names itself; a sample name is in a receipt only by its hash', async () => {
  const blocks = [block(BYTES.subarray(0, 700)), block(BYTES.subarray(700, 1300)), block(BYTES.subarray(1300)), Buffer.from(BGZF_EOF)];
  blocks[1][30] ^= 0xff;
  const bad = await readVcf(new Blob(blocks), { mode: 'summary' });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /The BGZF block at byte \d+ is damaged/);
  const { receipts } = await runVcf('vcf-qc-summary', plain(), 'jane.vcf', { sample: 'NA00002' });
  assert.equal(JSON.stringify(receipts.shareable).includes('NA00002'), false);
  assert.equal(JSON.stringify(receipts.receipt).includes('NA00002'), false);
  assert.match(receipts.shareable.options.sample.sha256, /^[0-9a-f]{64}$/);
});
