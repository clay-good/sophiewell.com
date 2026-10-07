// spec-v1605 open exports: the /open-data/ page, the preventive code export and the dataset changelog.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openDatasets, preventiveCodesExport, pageHtml } from '../../scripts/build-open-data.mjs';
import { changelogEntry } from '../../scripts/data/run.mjs';
import { DATED_PREVENTIVE_CODES } from '../../lib/preventive-codes.js';

test('a fetched dataset is offered as its bundled files, which exist and match the manifest', () => {
  const [uspstf] = openDatasets();
  for (const f of uspstf.files) assert.ok(existsSync(join('.', f)), f);
  const m = JSON.parse(readFileSync('data/uspstf/manifest.json', 'utf8'));
  assert.equal(uspstf.sha256, m.recordsSha256);
  const rows = uspstf.files.filter((f) => f.includes('/shards/')).flatMap((f) => JSON.parse(readFileSync(join('.', f), 'utf8')));
  assert.equal(rows.length, m.recordCount);
  for (const r of rows) assert.match(r.url, /^https:\/\/www\.uspreventiveservicestaskforce\.org\//);
});

test('the preventive code export is the bundled constant, one row per code, each with its source and read date', () => {
  const x = preventiveCodesExport();
  const row = Object.values(DATED_PREVENTIVE_CODES).at(-1);
  assert.deepEqual(x.rows.map((r) => r.code), row.values.services.flatMap((s) => s.codes));
  for (const r of x.rows) { assert.equal(r.sourceUrl, row.source.url); assert.match(r.readOn, /^\d{4}-\d{2}-\d{2}$/); }
  assert.ok(!JSON.stringify(x).match(/descriptor":/));
});

test('the page lists every dataset with its terms and download links, escaped', () => {
  const html = pageHtml(openDatasets());
  for (const d of openDatasets()) { assert.ok(html.includes(`id="${d.id}"`)); for (const f of d.files) assert.ok(html.includes(`href="${f}"`)); }
  assert.match(html, /None of it is about a person\./);
  assert.match(html, /<title>Open data - Sophie Well<\/title>/);
});

test('the changelog names what a refresh added, removed and changed, and nothing when nothing moved', () => {
  const key = (r) => r.key;
  const before = [{ key: 'a', g: 'A' }, { key: 'b', g: 'B' }, { key: 'c', g: 'B' }];
  const after = [{ key: 'a', g: 'A' }, { key: 'c', g: 'A' }, { key: 'd', g: 'B' }];
  assert.deepEqual(changelogEntry(before, after, key, { date: '2026-11-03', edition: 'e2' }), { date: '2026-11-03', edition: 'e2', records: 3, added: ['d'], removed: ['b'], changed: ['c'] });
  assert.equal(changelogEntry(before, before, key, { date: '2026-11-03', edition: 'e2' }), null);
  assert.deepEqual(changelogEntry([], after, key, { date: '2026-10-04', edition: 'e1' }), { date: '2026-10-04', edition: 'e1', records: 3, first: true });
});

test('the uspstf changelog starts at the bundled edition', () => {
  const log = JSON.parse(readFileSync('data/uspstf/changelog.json', 'utf8'));
  const m = JSON.parse(readFileSync('data/uspstf/manifest.json', 'utf8'));
  assert.equal(log.at(-1).first, true);
  assert.equal(log[0].edition, m.sourceEdition);
});
