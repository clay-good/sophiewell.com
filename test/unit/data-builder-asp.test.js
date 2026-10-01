// spec-v1517 asp-payment-limits: the ASP builder, against a trimmed copy of the October 2026 section 508
// CSV (its title preamble, header and eight codes, one of them the unpriced radium-223 row with a
// two-line note) and the saved landing page links.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import asp, { discover, parse } from '../../scripts/data/builders/asp.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'asp');
const MEMBER = 'section 508 version of October 2026 Medicare Part B Payment Limit File 091626.csv';
const csv = readFileSync(join(FIX, MEMBER));
const zipOf = (data) => makeZip([{ name: MEMBER, data }, { name: MEMBER.replace('section 508 version of ', '').replace('.csv', '.xls'), data: 'x', method: 0 }]);

test('discover: the newest quarter, from the link names on the page', async () => {
  const found = await discover({ getText: async () => readFileSync(join(FIX, 'landing.html'), 'utf8') });
  assert.equal(found.edition, '2026 Q4');
  assert.match(found.url, /october-2026-medicare-part-b-payment-limit-files-final\.zip$/);
  assert.equal(found.effectiveFrom, '2026-10-01');
});

test('parse: codes only, limits and coinsurance as numbers, the quarter read from the file', async () => {
  const { records, ancillary } = await parse(zipOf(csv), { effectiveFrom: '2026-10-01', edition: '2026 Q4' }, { bounds: false });
  assert.equal(records.length, 8);
  assert.deepEqual(records.find((r) => r.code === 'Q5107'), { code: 'Q5107', dosage: '10 MG', limit: 28.294, coinsurance: 20, notes: '8% of reference add-on applied' });
  assert.equal(records.find((r) => r.code === 'J0897').coinsurance, 17.885);
  const ra = records.find((r) => r.code === 'A9606');
  assert.equal(ra.limit, null);
  assert.match(ra.notes, /100% AWP/);
  assert.ok(records.every((r) => !('description' in r)), 'descriptors are dropped');
  assert.deepEqual([ancillary['period.json'].effectiveFrom, ancillary['period.json'].effectiveTo], ['2026-10-01', '2026-12-31']);
  const check = checkDataset({ records, ancillary, canaries: [...asp.stableCanaries, ...asp.canaries['2026 Q4']], shape: asp.shape });
  assert.deepEqual(check.problems, []);
});

test('a moved header, a quarter that is not the link\'s, or the bounds fail the parse', async () => {
  const text = csv.toString('latin1');
  await assert.rejects(parse(zipOf(Buffer.from(text.replace('Payment Limit,', 'Limit,'), 'latin1')), {}, { bounds: false }), /header changed/);
  await assert.rejects(parse(zipOf(csv), { effectiveFrom: '2026-07-01' }, { bounds: false }), /effective 2026-10-01, not the 2026-07-01/);
  await assert.rejects(parse(zipOf(csv), {}), /outside 700-1400/);
});
