// spec-v1638 tool 18: the ACA federal upper limits builder against a fake datastore API serving six real
// rows of the September 2026 file (test/fixtures/data-sources/aca-ful/). Paging is by offset; the newest
// month is found by counting rows month by month, never by a sort on the string year and month.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import aca, { discover, parse, PAGE } from '../../scripts/data/builders/aca-ful.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'aca-ful');
const ROWS = JSON.parse(readFileSync(join(FIX, 'rows-2026-09.json'), 'utf8'));

// A datastore holding `total` rows for 2026-09 (the fixture rows repeated with distinct NDCs) and none
// for later months.
function fakeApi({ total, have = '2026-9' }) {
  const all = Array.from({ length: total }, (_, i) => (i < ROWS.length ? ROWS[i] : { ...ROWS[i % ROWS.length], ndc: `9${String(i).padStart(4, '0')}-0000-00` }));
  const getText = async (url) => {
    const u = new URL(url);
    const ym = `${u.searchParams.get('conditions[0][value]')}-${u.searchParams.get('conditions[1][value]')}`;
    const rows = ym === have ? all : [];
    if (u.searchParams.get('results') === 'false') return JSON.stringify({ count: rows.length });
    assert.equal(u.searchParams.get('sorts[0][property]'), 'ndc', 'pages are sorted so offsets are stable');
    const off = Number(u.searchParams.get('offset'));
    return JSON.stringify({ results: rows.slice(off, off + PAGE), count: rows.length });
  };
  return { getText, get: async (url) => ({ bytes: Buffer.from(await getText(url)) }) };
}

async function build(total, now = new Date('2026-10-14T00:00:00Z')) {
  const http = fakeApi({ total });
  const found = await discover(http, now);
  found.partBytes = Object.fromEntries(await Promise.all(found.parts.map(async (u) => [u, (await http.get(u)).bytes])));
  return { found, ...(await parse((await http.get(found.url)).bytes, found)) };
}

test('discover: the newest month with rows, one part per extra page, dated from the month', async () => {
  const found = await discover(fakeApi({ total: PAGE * 2 + 3 }), new Date('2026-10-14T00:00:00Z'));
  assert.equal(found.edition, '2026-09 monthly');
  assert.equal(found.parts.length, 2);
  assert.match(found.parts[1], new RegExp(`offset=${PAGE * 2}`));
  assert.deepEqual([found.effectiveFrom, found.nextExpected, found.expiresOn], ['2026-09-01', '2026-10-28', '2026-11-15']);
});

test('discover: walks back across a year end, and gives up after six empty months', async () => {
  const found = await discover(fakeApi({ total: 3, have: '2026-12' }), new Date('2027-02-03T00:00:00Z'));
  assert.deepEqual([found.edition, found.expiresOn], ['2026-12 monthly', '2027-02-15']);
  assert.equal(await discover(fakeApi({ total: 3, have: '2025-1' }), new Date('2026-10-14T00:00:00Z')), null);
});

test('parse: one record per NDC, each product group once, canaries pass', async () => {
  const { records, ancillary } = await build(PAGE + 4);
  assert.equal(records.length, PAGE + 4);
  assert.deepEqual(records[0], { ndc: '00002322730', group: '3057', pkg: 30, aRated: true });
  assert.equal(records[2].aRated, false);
  assert.deepEqual(ancillary['groups.json']['3057'], { ingredient: 'ATOMOXETINE HYDROCHLORIDE', strength: '10MG', dosage: 'CAPSULE', route: 'ORAL', unit: 'CAP', weightedAmp: 0.134701, ful: 0.32216, over175: true });
  assert.equal(ancillary['groups.json']['5028'].ful, 0.211148);
  const check = checkDataset({ records, ancillary, recordBounds: { min: 1, max: 1e6 }, canaries: aca.stableCanaries, shape: aca.shape });
  assert.deepEqual(check.problems, []);
});

test('parse: a row from another month, a bad NDC or a group that disagrees with itself fails the run', async () => {
  const found = { year: 2026, month: 9, edition: '2026-09 monthly', parts: [] };
  const one = (rows) => parse(Buffer.from(JSON.stringify({ results: rows })), found);
  await assert.rejects(one([{ ...ROWS[0], month: '8' }]), /a row from 2026-8/);
  await assert.rejects(one([{ ...ROWS[0], ndc: '0002-3227-30' }]), /not in the 5-4-2 form/);
  await assert.rejects(one([ROWS[0], { ...ROWS[3], aca_ful: '0.4' }]), /product group 3057 differs/);
});
