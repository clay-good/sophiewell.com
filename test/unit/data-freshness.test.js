// spec-v1622: honest data labels and freshness at run time.
//
// Step 1 -- every dataset manifest is manifest v2 and says what it is.
// Step 3 -- datasetStatus / stampText cover every status and the date wording.
// Step 4 -- the guards: no live tool reads a `sample` dataset, and no dataset a
//           live tool reads is expired. "Which tools read which dataset" is
//           scanned from the source, not maintained by hand.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { datasetStatus, stampText, stampDetail, EXPIRED_TEXT } from '../../lib/data.js';
import { manifestProblems } from '../../scripts/verify-integrity.mjs';
import { coverageLine } from '../../scripts/analyze-data-changes.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(ROOT, 'data');

function manifests() {
  const out = {};
  for (const d of readdirSync(DATA, { withFileTypes: true })) {
    const p = join(DATA, d.name, 'manifest.json');
    if (!d.isDirectory() || !existsSync(p)) continue;
    const m = JSON.parse(readFileSync(p, 'utf8'));
    if (m.dataset) out[m.dataset] = m;
  }
  return out;
}

function sourceFiles() {
  const files = [join(ROOT, 'app.js')];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) files.push(p);
    }
  };
  walk(join(ROOT, 'views'));
  walk(join(ROOT, 'lib'));
  return files;
}

// dataset id -> [file that reads it]. Covers the lib/data.js loaders, a raw
// fetchJson of data/<id>/..., and a META `source: { dataset }` (whose manifest
// app.js reads to print the stamp).
function datasetReaders() {
  const readers = new Map();
  const add = (id, file) => {
    if (!readers.has(id)) readers.set(id, new Set());
    readers.get(id).add(file.slice(ROOT.length + 1));
  };
  const patterns = [
    /load(?:File|Shard|AllShards|Manifest)\(\s*['`]([a-z0-9-]+)['`]/g,
    /fetchJson\(\s*['`]data\/([a-z0-9-]+)\//g,
    /source:\s*\{\s*dataset:\s*'([a-z0-9-]+)'/g,
  ];
  for (const f of sourceFiles()) {
    if (f.endsWith(join('lib', 'data.js'))) continue;
    const text = readFileSync(f, 'utf8');
    for (const re of patterns) for (const m of text.matchAll(re)) add(m[1], f);
  }
  return readers;
}

test('every dataset manifest is manifest v2', () => {
  const all = manifests();
  assert.ok(Object.keys(all).length > 40);
  for (const [id, m] of Object.entries(all)) assert.deepEqual(manifestProblems(m), [], id);
});

test('manifestProblems catches each way a manifest can overstate itself', () => {
  const good = { manifestVersion: 2, coverage: 'subset', coverageNote: 'x', sourceEdition: 'unversioned', curatedAt: '2026-05-05', contentChangedAt: '2026-05-05', expiresOn: '2028-05-05' };
  assert.deepEqual(manifestProblems(good), []);
  assert.match(manifestProblems({ ...good, fetchedAt: '2026-09-27' }).join(), /cannot carry fetchedAt/);
  assert.match(manifestProblems({ ...good, fetchDate: '2026-09-27' }).join(), /fetchDate is retired/);
  assert.match(manifestProblems({ ...good, offlineSeed: false }).join(), /offlineSeed is retired/);
  assert.match(manifestProblems({ ...good, coverage: 'full' }).join(), /needs fetchedAt/);
  assert.match(manifestProblems({ ...good, coverageNote: undefined }).join(), /coverageNote/);
  assert.match(manifestProblems({ ...good, expiresOn: undefined }).join(), /expiresOn/);
  assert.match(manifestProblems({ ...good, manifestVersion: 1 }).join(), /manifestVersion/);
});

test('the ICD-10-CM sample holds billable codes only: no code has a child in the sample', () => {
  const m = manifests().icd10cm;
  const codes = [];
  for (const s of m.shards) codes.push(...JSON.parse(readFileSync(join(DATA, 'icd10cm', 'shards', s.name), 'utf8')).map((r) => r.code));
  for (const c of codes) {
    const children = codes.filter((o) => o !== c && o.replace('.', '').startsWith(c.replace('.', '')));
    assert.deepEqual(children, [], `${c} is a parent of ${children.join(', ')}`);
  }
  // Retired in FY2022 and FY2021; the seed carried them until spec-v1622.
  assert.ok(!codes.includes('M54.5') && !codes.includes('R51'));
});

const NOW = new Date('2026-09-29T12:00:00Z');
const curated = { coverage: 'subset', sourceEdition: '2022 guideline', curatedAt: '2026-05-05', contentChangedAt: '2026-05-05', expiresOn: '2028-05-05' };
const fetched = { coverage: 'full', sourceEdition: 'RVU26D', effectiveFrom: '2026-10-01', fetchedAt: '2026-09-27', expiresOn: '2027-09-30', nextExpected: '2027-01-01' };

test('datasetStatus: sample, current, due, expired', () => {
  assert.equal(datasetStatus({ coverage: 'sample', expiresOn: '2000-01-01' }, NOW).status, 'sample');
  assert.equal(datasetStatus(curated, NOW).status, 'current');
  assert.equal(datasetStatus(curated, new Date('2028-05-05T12:00:00Z')).status, 'current'); // the last day still counts
  assert.equal(datasetStatus(curated, new Date('2028-05-06T12:00:00Z')).status, 'expired');
  assert.equal(datasetStatus(fetched, new Date('2027-01-31T00:00:00Z')).status, 'current'); // inside the 30-day grace
  assert.equal(datasetStatus(fetched, new Date('2027-02-15T00:00:00Z')).status, 'due');
  assert.equal(datasetStatus(fetched, new Date('2027-10-01T00:00:00Z')).status, 'expired');
  // Curated data has no nextExpected, so it is never due.
  assert.equal(datasetStatus(curated, new Date('2028-01-01T00:00:00Z')).status, 'current');
  // A manifest that cannot say when it lapses fails closed.
  assert.equal(datasetStatus({ coverage: 'subset', curatedAt: '2026-05-05' }, NOW).status, 'expired');
});

test('stampText: one sentence per kind of data, dates in words', () => {
  assert.equal(stampText({ coverage: 'sample' }, null, 'X'), 'Sample data for examples only.');
  assert.equal(stampText(curated, datasetStatus(curated, NOW), 'CDC opioid MME factors'),
    'Curated from CDC opioid MME factors (2022 guideline). Checked by a person May 5, 2026.');
  assert.equal(stampText({ ...curated, sourceEdition: 'unversioned' }, datasetStatus(curated, NOW), 'CDC'),
    'Curated from CDC. Checked by a person May 5, 2026.');
  assert.equal(stampText(fetched, datasetStatus(fetched, NOW), 'CMS physician fee schedule'),
    'CMS physician fee schedule, RVU26D, effective October 1, 2026. Checked September 27, 2026.');
  assert.equal(stampText(fetched, datasetStatus(fetched, new Date('2027-02-15T00:00:00Z')), 'CMS'),
    'CMS, RVU26D, effective October 1, 2026. Checked September 27, 2026. A newer edition is expected. This uses RVU26D.');
  assert.ok(stampText(curated, datasetStatus(curated, new Date('2029-01-01T00:00:00Z')), 'CDC').endsWith(EXPIRED_TEXT));
  assert.equal(stampDetail(curated, datasetStatus(curated, NOW)), '2022 guideline. Curated by hand; checked by a person May 5, 2026.');
  for (const s of [stampText(curated, null, 'a'), stampText(fetched, null, 'b'), stampDetail(curated), stampDetail(fetched)]) {
    assert.doesNotMatch(s, /fetched/i);
  }
});

test('coverageLine leads the refresh summary with what was actually fetched', () => {
  assert.equal(coverageLine([{ dataset: 'a', coverage: 'sample' }, { dataset: 'b', coverage: 'subset' }, { dataset: 'c', coverage: 'subset' }]),
    '1 sample dataset (not fetched) · 2 curated subsets · 0 fetched.');
});

test('the reader scan sees the loaders it is meant to see', () => {
  const r = datasetReaders();
  for (const id of ['mme-factors', 'sti-screening', 'field-triage']) assert.ok(r.has(id), id);
});

test('sample guard: no live tool reads a sample dataset', () => {
  const all = manifests();
  const bad = [];
  for (const [id, files] of datasetReaders()) {
    if (all[id] && all[id].coverage === 'sample') bad.push(`${id} (sample) read by ${[...files].join(', ')}`);
  }
  assert.deepEqual(bad, [], 'a sample cannot answer about a reader\'s input (spec-v1614 §1)');
});

test('expiry guard: no dataset a live tool reads is expired today', () => {
  const all = manifests();
  const bad = [];
  for (const [id, files] of datasetReaders()) {
    const m = all[id];
    if (!m) continue;
    const s = datasetStatus(m, new Date());
    if (s.status === 'expired') bad.push(`${id} expired ${m.expiresOn}; read by ${[...files].join(', ')}. Re-check it and re-run the data build.`);
  }
  assert.deepEqual(bad, []);
});

test('every dataset a tool reads has a manifest', () => {
  const all = manifests();
  const missing = [...datasetReaders().keys()].filter((id) => !all[id] && existsSync(join(DATA, id, 'manifest.json')) === false && id !== 'workflow');
  assert.deepEqual(missing, []);
});

// spec-v1622 step 5: dated constants fail the same way. A year-keyed row past
// its validThrough is fine while a newer row in its family is current (tools
// select by the year asked about); a family with no current row is not.
test('expiry guard: every dated-constant family has a current row today', async () => {
  const { datedRows } = await import('../../scripts/report-freshness.mjs');
  const rows = await datedRows(new Date());
  assert.ok(rows.length > 10, 'the scan found the DATED_* tables');
  const expired = rows.filter((r) => r.status === 'expired').map((r) => `${r.id} (${r.module}) lapsed ${r.through}; add the next edition`);
  assert.deepEqual(expired, []);
});

test('the freshness report calls a lapsed family expired and a replaced year superseded', async () => {
  const { datedRows } = await import('../../scripts/report-freshness.mjs');
  const rows = await datedRows(new Date('2027-06-01T00:00:00Z'));
  const by = Object.fromEntries(rows.map((r) => [r.id, r.status]));
  assert.equal(by['hospice-cap-2026'], 'superseded');
  assert.equal(by['hospice-cap-2027'], 'current');
  assert.equal(by['snf-coinsurance-2026'], 'expired');
});
