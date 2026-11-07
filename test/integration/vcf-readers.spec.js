// spec-v1698: the two VCF readers driven through a real file (example-correctness lists them as file-driven).
// The fixture is the VCFv4.5 §1.1 example; the bgzipped copy is built here to SAMv1 §4.1.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const VCF = readFileSync(join(process.cwd(), 'test', 'fixtures', 'file-kinds', 'sample.vcf'));
const EOF = Buffer.from('1f8b08040000000000ff0600424302001b0003000000000000000000', 'hex');
function bgzf(data) {
  const cdata = deflateRawSync(data);
  const blk = Buffer.alloc(18 + cdata.length + 8);
  Buffer.from([0x1f, 0x8b, 8, 4, 0, 0, 0, 0, 0, 0xff, 6, 0, 0x42, 0x43, 2, 0]).copy(blk);
  blk.writeUInt16LE(blk.length - 1, 16);
  cdata.copy(blk, 18);
  blk.writeUInt32LE(crc32(data), 18 + cdata.length);
  blk.writeUInt32LE(data.length, 22 + cdata.length);
  return Buffer.concat([blk, EOF]);
}

test('vcf-variant-lookup reads a bgzipped VCF in the tab and reports the genotype as written', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#vcf-variant-lookup');
  await page.locator('#vcfl-chrom').fill('chr20');
  await page.locator('#vcfl-pos').fill('14370');
  await page.locator('#vcfl-sample').fill('NA00003');
  await page.locator('#vcfl-file').setInputFiles({ name: 'sample.vcf.gz', mimeType: 'application/gzip', buffer: bgzf(VCF) });
  await expect(page.locator('#vcfl-status')).toHaveText('sample.vcf.gz read.');
  await expect(page.locator('#q-results')).toContainText('chr20:14370: 1/1, homozygous alternate in NA00003.');
  await expect(page.locator('#q-results')).toContainText('"chr" prefix ignored');
  await page.locator('#vcfl-pos').fill('15000');
  await page.locator('#vcfl-run').click();
  await expect(page.locator('#q-results')).toContainText('chr20:15000 is not in this file.');
  await expectNoHScroll(page, 'vcf-variant-lookup');
  expect(offOrigin).toEqual([]);
});

test('vcf-qc-summary counts the example and prints its receipt', async ({ page }) => {
  await page.goto('/#vcf-qc-summary');
  await page.locator('#vcfs-sample').fill('NA00003');
  await page.locator('#vcfs-file').setInputFiles({ name: 'sample.vcf', mimeType: 'text/plain', buffer: VCF });
  await expect(page.locator('#vcfs-status')).toHaveText('sample.vcf read.');
  await expect(page.locator('#q-results')).toContainText('5 records, 4 PASS; Ti/Tv 1.00; NA00003 het/hom-alt 0.00.');
  await expect(page.locator('#q-results')).toContainText('homozygous alternate 3');
  await expect(page.locator('#q-results details.receipt')).toHaveCount(1);
});
