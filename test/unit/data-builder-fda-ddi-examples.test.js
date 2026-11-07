// spec-v1701: the FDA interaction-examples builder on a saved copy of FDA's page (test/fixtures/data-sources/
// fda-ddi-examples/page-2026-05-29.html, "Content current as of: 05/29/2026"; the page as read was 108,266 bytes,
// SHA-256 8f364f50...; its script, noscript, style and link elements were removed so the repository holds no
// analytics tag, leaving 102,193 bytes, SHA-256 e8507e1e...). Each trap the
// design names has a case: Table 1 chosen by its header, the merged duplicate, in-cell and name markers, the
// combination row, empty cells, a moved table, a renamed column, and a 20% row drop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fda, { discover, parse, cell, components, enzymes } from '../../scripts/data/builders/fda-ddi-examples.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const PAGE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources', 'fda-ddi-examples', 'page-2026-05-29.html'), 'utf8');
const find = (records, n) => records.find((r) => r.name.toLowerCase() === n);

test('245 rows of Table 1 become 244 drugs, with 21 footnotes and FDA\'s not-comprehensive sentence', async () => {
  const { records, ancillary } = await parse(Buffer.from(PAGE));
  assert.equal(records.length, 244);
  assert.equal(Object.keys(ancillary['footnotes.json']).length, 21);
  assert.match(ancillary['footnotes.json'][20], /^Ciprofloxacin is generally classified a moderate CYP 1A2 inhibitor/);
  assert.match(ancillary['notice.json'].sentence, /are a guide and not considered a comprehensive list .* that fit these categories\.$/);
  const check = checkDataset({ records, ancillary, recordBounds: fda.recordBounds, canaries: fda.stableCanaries, shape: fda.shape });
  assert.deepEqual(check.problems, []);
});

test('aprepitant\'s two rows merge; empty cells are not kept', async () => {
  const { records } = await parse(Buffer.from(PAGE));
  const a = find(records, 'aprepitant');
  assert.deepEqual(Object.keys(a.cells).sort(), ['moderateInhibitor', 'moderateSensitiveSubstrate', 'weakInducer']);
  assert.equal(records.filter((r) => r.name.toLowerCase() === 'aprepitant').length, 1);
});

test('markers come out of the text: ciprofloxacin\'s in-cell 20, ritonavir\'s 14, 15, 16', async () => {
  const { records } = await parse(Buffer.from(PAGE));
  const c = find(records, 'ciprofloxacin').cells.moderateInhibitor;
  assert.equal(c.text, '1A2; 3A moderate inhibitor');
  assert.deepEqual(c.markers, [20]);
  assert.deepEqual(c.enzymes, ['1A2', '3A']);
  const r = find(records, 'ritonavir');
  assert.deepEqual(r.markers, [14, 15, 16]);
  assert.equal(r.name, 'ritonavir');
});

test('a combination row keeps FDA\'s wording and its components', async () => {
  const { records } = await parse(Buffer.from(PAGE));
  const p = find(records, 'paritaprevir and ritonavir and (ombitasvir and/or dasabuvir)');
  assert.deepEqual(p.components, ['paritaprevir', 'ritonavir', 'ombitasvir', 'dasabuvir']);
  assert.deepEqual(components('lopinavir and ritonavir'), ['lopinavir', 'ritonavir']);
});

test('helpers: a cell, and enzymes with 3A4 folded into 3A', () => {
  assert.deepEqual(cell('2C9&nbsp; weak&nbsp; inducer'), { text: '2C9 weak inducer', markers: [] });
  assert.deepEqual(enzymes('3A4; 2C19 moderate inhibitor'), ['3A', '2C19']);
});

test('Table 1 is found by its header, not its position', async () => {
  const tables = [...PAGE.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  const moved = PAGE.replace(tables[0], '').replace(tables[1], `${tables[1]}${tables[0]}`);
  assert.equal((await parse(Buffer.from(moved))).records.length, 244);
});

test('a renamed column fails the build instead of shifting every role', async () => {
  await assert.rejects(parse(Buffer.from(PAGE.replace('>CYP Mod INH<', '>CYP Moderate INH<'))), /columns changed/);
});

test('a page with 20% of its rows removed fails the bounds', async () => {
  const t = /<table[\s\S]*?<\/table>/i.exec(PAGE)[0];
  const rows = [...t.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
  let cut = t;
  for (const r of rows.slice(1, 50)) cut = cut.replace(r, '');
  await assert.rejects(parse(Buffer.from(PAGE.replace(t, cut))), /outside 220 to 400/);
});

test('discover reads the "Content current as of" date and sets a 14-day check', async () => {
  const http = { getText: async () => PAGE };
  const d = await discover(http, new Date('2026-11-07T00:00:00Z'));
  assert.equal(d.edition, '2026-05-29');
  assert.equal(d.expiresOn, '2026-11-21');
  await assert.rejects(discover({ getText: async () => '<html></html>' }), /no "Content current as of"/);
});
