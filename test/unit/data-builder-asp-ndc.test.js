// spec-v1517 asp-ndc-hcpcs-crosswalk: the crosswalk builder, against a trimmed copy of the October 2026
// section 508 CSV (Avastin's two vials, Retacrit under two codes, and the J7331 row whose product
// number is not an NDC) and the saved landing page links.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import aspNdc, { discover, parse } from '../../scripts/data/builders/asp-ndc.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'asp-ndc');
const MEMBER = 'section 508 version of October 2026 ASP NDC-HCPCS Crosswalk 091126.csv';
const csv = readFileSync(join(FIX, MEMBER));
const zipOf = (data) => makeZip([{ name: MEMBER, data }, { name: 'section 508 version of October 2026 OPPS NDC-HCPCS Crosswalk 090426.csv', data: 'x' }]);

test('discover: the newest quarter\'s crosswalk, never the seasonal vaccine one', async () => {
  const found = await discover({ getText: async () => readFileSync(join(FIX, 'landing.html'), 'utf8') });
  assert.equal(found.edition, '2026 Q4');
  assert.match(found.url, /october-2026-ndc-hcpcs-crosswalk-final\.zip$/);
});

test('parse: one record per 11-digit NDC, every code it bills under, the non-NDC row named', async () => {
  const { records, ancillary } = await parse(zipOf(csv), { edition: '2026 Q4' }, { bounds: false });
  assert.deepEqual(records.map((r) => r.ndc), ['00069130510', '50242006001', '50242006101']);
  assert.equal(records.find((r) => r.ndc === '50242006101').codes[0].billUnitsPkg, 40);
  assert.deepEqual(records.find((r) => r.ndc === '00069130510').codes.map((c) => c.code), ['Q5105', 'Q5106']);
  assert.ok(records.every((r) => r.codes.every((c) => !('description' in c))));
  assert.deepEqual(ancillary['member.json'].skipped, [{ code: 'J7331', id: '888867413689' }]);
  const check = checkDataset({ records, ancillary, canaries: aspNdc.stableCanaries, shape: aspNdc.shape });
  assert.deepEqual(check.problems, []);
});

test('a moved header or too many non-NDC rows fail the parse', async () => {
  const text = csv.toString('latin1');
  await assert.rejects(parse(zipOf(Buffer.from(text.replace('BILLUNITSPKG', 'UNITS PER PKG'), 'latin1')), {}, { bounds: false }), /header changed/);
  await assert.rejects(parse(zipOf(Buffer.from(text.replace(/50242-0060-01/g, 'X').replace(/50242-0061-01/g, 'Y'), 'latin1')), {}, { bounds: false }), /have no 5-4-2 NDC/);
  await assert.rejects(parse(zipOf(csv), {}), /outside 5000-12000/);
});
