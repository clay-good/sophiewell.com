// spec-v1621 §3.5 and §6: the NADAC builder against a fake datastore API
// serving six real rows from the 2026-09-30 week
// (test/fixtures/data-sources/nadac/). The page size is shrunk by serving
// fewer rows per page than the builder asks for; paging is by offset.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nadac, { discover, parse, PAGE } from '../../scripts/data/builders/nadac.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'nadac');
const ROWS = JSON.parse(readFileSync(join(FIX, 'rows-2026-09-30.json'), 'utf8'));

// A datastore of `total` rows for 2026-09-30 (the fixture rows repeated with
// distinct NDCs), plus an empty 2027 dataset.
function fakeApi({ total, withYear = [2025, 2026, 2027], emptyYears = [2027] }) {
  const all = Array.from({ length: total }, (_, i) => ({ ...ROWS[i % ROWS.length], ndc: String(10000000000 + i).padStart(11, '0') }));
  const ids = Object.fromEntries(withYear.map((y) => [y, `id-${y}`]));
  const getText = async (url) => {
    const u = new URL(url);
    if (u.pathname.endsWith('/metastore/schemas/dataset/items')) {
      return JSON.stringify([{ title: 'Something else', identifier: 'x' }, ...withYear.map((y) => ({ title: `NADAC (National Average Drug Acquisition Cost) ${y}`, identifier: ids[y] }))]);
    }
    const id = u.pathname.split('/')[5];
    const year = Number(id.slice(3));
    const rows = emptyYears.includes(year) ? [] : all;
    if (u.searchParams.get('limit') === '1') return JSON.stringify({ results: rows.slice(0, 1) });
    const off = Number(u.searchParams.get('offset'));
    assert.equal(u.searchParams.get('sorts[0][property]'), 'ndc', 'pages are sorted so offsets are stable');
    return JSON.stringify({ results: rows.slice(off, off + PAGE), count: rows.length });
  };
  return { getText, get: async (url) => ({ bytes: Buffer.from(await getText(url)) }) };
}

test('discover: this year\'s dataset, its latest week, one part per extra page', async () => {
  const http = fakeApi({ total: PAGE * 2 + 3, emptyYears: [] });
  const found = await discover(http, new Date('2026-10-02T00:00:00Z'));
  assert.equal(found.datasetId, 'id-2026');
  assert.equal(found.edition, '2026-09-30 weekly');
  assert.equal(found.count, PAGE * 2 + 3);
  assert.equal(found.parts.length, 2);
  assert.match(found.parts[1], new RegExp(`offset=${PAGE * 2}`));
  assert.deepEqual([found.nextExpected, found.expiresOn], ['2026-10-07', '2026-10-14']);
});

test('discover: in early January an empty new-year dataset falls back to last year', async () => {
  const http = fakeApi({ total: 3 });
  const found = await discover(http, new Date('2027-01-03T00:00:00Z'));
  assert.equal(found.datasetId, 'id-2026');
});

test('parse: every page, keys renamed, numbers and dates typed, canaries pass', async () => {
  const http = fakeApi({ total: PAGE + 4, emptyYears: [] });
  const found = await discover(http, new Date('2026-10-02T00:00:00Z'));
  found.partBytes = Object.fromEntries(await Promise.all(found.parts.map(async (u) => [u, (await http.get(u)).bytes])));
  const { records, ancillary } = await parse((await http.get(found.url)).bytes, found);
  assert.equal(records.length, PAGE + 4);
  assert.deepEqual(Object.keys(records[0]), ['ndc', 'description', 'perUnit', 'effectiveDate', 'pricingUnit', 'pharmacyType', 'otc', 'explanation', 'classification', 'genericPerUnit', 'genericEffectiveDate']);
  const r = records.find((x) => x.description === ROWS[0].ndc_description);
  assert.equal(r.perUnit, Number(ROWS[0].nadac_per_unit));
  assert.equal(r.genericPerUnit, null);
  assert.equal(ancillary['week.json'].apiCount, PAGE + 4);
  const check = checkDataset({ records, ancillary, canaries: nadac.stableCanaries, shape: nadac.shape });
  assert.deepEqual(check.problems, []);
  const short = checkDataset({ records: records.slice(1), ancillary, canaries: nadac.stableCanaries });
  assert.match(short.problems[0], /row count equals the API count/);
});

test('a row from another week fails the parse', async () => {
  const page = Buffer.from(JSON.stringify({ results: [{ ...ROWS[0], as_of_date: '2026-09-23' }] }));
  await assert.rejects(parse(page, { asOf: '2026-09-30', parts: [] }), /a row from 2026-09-23/);
});
