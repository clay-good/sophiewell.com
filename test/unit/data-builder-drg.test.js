// spec-v1621 §3.2 and §6: the IPPS Table 5 builder, against trimmed copies of
// the FY2026 final rule and FY2027 correction notice tables (the quoted
// two-line title, the header, six DRGs) and the saved landing page.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import drg, { discover, parse, parseTable5, fiscalDates } from '../../scripts/data/builders/drg.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'drg');
const read = (f) => readFileSync(join(FIX, f));
const fy26 = makeZip([{ name: 'CMS-1833-F Table 5.txt', data: read('CMS-1833-F Table 5.txt') }, { name: 'CMS-1833-F Table 5.xlsx', data: 'x', method: 0 }]);
const fy27 = makeZip([
  { name: 'CMS-1849-FR Table 5.txt', data: read('CMS-1849-CN Table 5.txt').toString('latin1').replace(/\t1\.9563\t1\.9563/, '\t9.9999\t9.9999') },
  { name: 'CMS-1849-CN Table 5.txt', data: read('CMS-1849-CN Table 5.txt') },
]);

const landing = read('landing.html').toString();
const fyPage = (fy) => `<a href="/files/zip/fy${fy}-ipps-fr-table-5.zip">Table 5</a>`;
const http = {
  getText: async (url) => { const m = /fy-(\d{4})-ipps/.exec(url); return m ? fyPage(m[1]) : landing; },
  get: async (url) => ({ bytes: /fy2027/.test(url) ? fy27 : fy26 }),
};

test('fiscal-year dates', () => {
  assert.deepEqual(fiscalDates(2027), { effectiveFrom: '2026-10-01', nextExpected: '2027-08-01', expiresOn: '2028-10-01' });
});

test('discover: the newest year in effect is current, and next year is upcoming until October 1', async () => {
  const before = await discover(http, new Date('2026-09-29T12:00:00Z'));
  assert.equal(before.edition, 'FY2026');
  assert.equal(before.url, 'https://www.cms.gov/files/zip/fy2026-ipps-fr-table-5.zip');
  assert.equal(before.upcoming.edition, 'FY2027');
  assert.equal(before.nextExpected, '2027-08-01', 'with next year in hand, no newer edition is outstanding');
  const after = await discover(http, new Date('2026-10-01T00:00:00Z'));
  assert.equal(after.edition, 'FY2027');
  assert.equal(after.upcoming, undefined);
  assert.equal(after.nextExpected, '2027-08-01');
});

test('parse: position-mapped columns, the capped weight, DRGs 998/999 kept without weights', () => {
  const { member, rows } = parseTable5(fy26);
  assert.equal(member, 'CMS-1833-F Table 5.txt');
  assert.equal(rows.length, 6);
  assert.deepEqual(rows.find((r) => r.drg === '470'), {
    drg: '470', mdc: '08', type: 'SURG', title: 'MAJOR HIP AND KNEE JOINT REPLACEMENT OR REATTACHMENT OF LOWER EXTREMITY WITHOUT MCC',
    postAcute: true, specialPay: false, weightBeforeCap: 1.9289, relativeWeight: 1.9289, gmlos: 1.9, amlos: 2.2,
  });
  assert.equal(rows.find((r) => r.drg === '999').relativeWeight, null);
});

test('parse: the correction notice wins over the final rule', () => {
  const { member, rows } = parseTable5(fy27);
  assert.equal(member, 'CMS-1849-CN Table 5.txt');
  assert.equal(rows.find((r) => r.drg === '470').relativeWeight, 1.9563);
});

test('the FY2026 canaries pass, including next year\'s table stored as upcoming', async () => {
  const found = await discover(http, new Date('2026-09-29T12:00:00Z'));
  assert.deepEqual(found.parts, [found.upcoming.url], 'next year\'s table is fetched and hashed with this year\'s');
  found.partBytes = { [found.upcoming.url]: fy27 };
  const { records, ancillary } = await parse(fy26, found);
  assert.equal(ancillary['upcoming.json'].edition, 'FY2027');
  assert.equal(ancillary['upcoming.json'].effectiveFrom, '2026-10-01');
  const check = checkDataset({ records, ancillary, canaries: [...drg.stableCanaries, ...drg.canaries.FY2026], shape: drg.shape });
  assert.deepEqual(check.problems, []);
});

test('a header that moved fails the parse', () => {
  const moved = read('CMS-1833-F Table 5.txt').toString('latin1').replace('Weights - 10% Cap Applied', 'Weights');
  assert.throws(() => parseTable5(makeZip([{ name: 'CMS-1833-F Table 5.txt', data: Buffer.from(moved, 'latin1') }])), /header changed/);
});
