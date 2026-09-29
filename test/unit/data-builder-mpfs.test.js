// spec-v1621 §3.1 and §6: the physician fee schedule builder, against trimmed
// copies of the real RVU26D files (test/fixtures/data-sources/mpfs/: the
// preamble, the stacked header, a handful of rows with the AMA descriptors
// blanked, and the full GPCI table) and saved copies of the landing pages.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mpfs, { discover, parse, releaseKey, compareReleases, releaseDates } from '../../scripts/data/builders/mpfs.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'mpfs');
const read = (f) => readFileSync(join(FIX, f));

function rvuZip(overrides = {}) {
  return makeZip([
    { name: 'GPCI2026.csv', data: overrides.gpci || read('GPCI2026.csv') },
    { name: 'PPRRVU2026_Oct_nonQPP.csv', data: overrides.nonQpp || read('PPRRVU2026_Oct_nonQPP.csv') },
    { name: 'PPRRVU2026_Oct_QPP.csv', data: overrides.qpp || read('PPRRVU2026_Oct_QPP.csv') },
    { name: 'RVU26D.pdf', data: '%PDF', method: 0 },
  ]);
}

test('release keys order years, quarters, corrections and duplicate slugs', () => {
  assert.equal(releaseKey('/x/rvu26d').edition, 'RVU26D');
  assert.equal(releaseKey('/x/rvu24ar').edition, 'RVU24AR');
  assert.equal(releaseKey('/x/rvu25d-0').edition, 'RVU25D');
  assert.equal(releaseKey('/x/about'), null);
  const sorted = ['/x/rvu24ar', '/x/rvu26a', '/x/rvu24a', '/x/rvu25d-0', '/x/rvu26d', '/x/rvu24ar1'].sort(compareReleases);
  assert.deepEqual(sorted, ['/x/rvu24a', '/x/rvu24ar', '/x/rvu24ar1', '/x/rvu25d-0', '/x/rvu26a', '/x/rvu26d']);
  assert.deepEqual(releaseDates(releaseKey('/x/rvu26d')), { effectiveFrom: '2026-10-01', nextExpected: '2026-11-27', expiresOn: '2027-04-01' });
  assert.deepEqual(releaseDates(releaseKey('/x/rvu27a')), { effectiveFrom: '2027-01-01', nextExpected: '2027-02-25', expiresOn: '2027-07-01' });
});

test('discover picks RVU26D from the saved landing and release pages', async () => {
  const pages = { landing: read('landing.html').toString(), release: read('release-rvu26d.html').toString() };
  const asked = [];
  const http = { getText: async (url) => { asked.push(url); return /\/rvu26d$/.test(url) ? pages.release : pages.landing; } };
  const found = await discover(http);
  assert.equal(found.edition, 'RVU26D');
  assert.equal(found.url, 'https://www.cms.gov/files/zip/rvu26d-updated-08-26-2026.zip');
  assert.equal(found.effectiveFrom, '2026-10-01');
  assert.match(asked[1], /\/pfs-relative-value-files\/rvu26d$/);
  assert.equal(await discover({ getText: async () => '<p>no links</p>' }), null, 'a page with no match is a failed fetch');
});

test('parse keeps codes and RVUs, drops the AMA descriptor, and passes the RVU26D canaries', async () => {
  const found = { edition: 'RVU26D', effectiveFrom: '2026-10-01' };
  const { records, ancillary } = await parse(rvuZip(), found);
  const r99213 = records.find((r) => r.code === '99213');
  assert.deepEqual(r99213, {
    code: '99213', statusCode: 'A', workRvu: 1.3, peRvuNonFacility: 1.46, peRvuFacility: 0.33, mpRvu: 0.09,
    totalNonFacility: 2.85, totalFacility: 1.72, pctc: '0', globalPeriod: 'XXX',
    multProc: '0', bilatSurg: '0', asstSurg: '0', coSurg: '0', teamSurg: '0',
  });
  assert.ok(records.some((r) => r.code === '71046' && r.modifier === '26'));
  assert.ok(records.every((r) => !('description' in r) && !JSON.stringify(r).includes('Office')));
  assert.equal(ancillary['gpci.json'].length, 109);
  assert.deepEqual(ancillary['gpci.json'].find((g) => g.state === 'AK'), { mac: '02102', state: 'AK', locality: '01', name: 'ALASKA', workGpci: 1.5, peGpci: 1.065, mpGpci: 0.551 });
  assert.equal(ancillary['conversion-factor.json'].conversionFactor, 33.4009);
  assert.equal(ancillary['conversion-factor.json'].qppConversionFactor, 33.5675);
  const check = checkDataset({ records, ancillary, canaries: [...mpfs.stableCanaries, ...mpfs.canaries.RVU26D], shape: mpfs.shape });
  assert.deepEqual(check.problems, []);
});

test('parse refuses a moved column and a QPP file that disagrees', async () => {
  const text = read('PPRRVU2026_Oct_nonQPP.csv').toString('latin1');
  const moved = text.replace('HCPCS,MOD,DESCRIPTION,CODE', 'HCPCS,DESCRIPTION,MOD,CODE');
  await assert.rejects(parse(rvuZip({ nonQpp: Buffer.from(moved, 'latin1') }), {}), /header changed/);
  const qpp = read('PPRRVU2026_Oct_QPP.csv').toString('latin1').replace(/^99213,,,A,,1\.30/m, '99213,,,A,,1.31');
  await assert.rejects(parse(rvuZip({ qpp: Buffer.from(qpp, 'latin1') }), {}), /RVUs differ for 99213/);
});
