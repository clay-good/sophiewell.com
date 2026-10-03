// spec-v1621 §2 and §6: the live data pipeline's modules, tested without the
// network. Archives are built byte by byte (test/lib/zip-fixture.js) so the
// reader is checked against the real layout.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zipEntries, zipFind, tarEntries } from '../../scripts/data/zip.mjs';
import { decode, parseCsv, splitTsv, skipPreamble, moneyCents, num } from '../../scripts/data/text.mjs';
import { findLinks, newest, unwrapLicenseLink, isLicenseGated } from '../../scripts/data/discover.mjs';
import { get, USER_AGENT } from '../../scripts/data/http.mjs';
import { checkDataset, decidePublish } from '../../scripts/data/check.mjs';
import { runBuilder, shard } from '../../scripts/data/run.mjs';
import { makeZip } from '../lib/zip-fixture.js';

function tarHeader(name, size, type = '0') {
  const h = Buffer.alloc(512);
  h.write(name, 0, 100);
  h.write(size.toString(8).padStart(11, '0') + '\0', 124);
  h.write(type, 156);
  h.write('ustar\0', 257);
  return h;
}
const pad = (b) => Buffer.concat([b, Buffer.alloc((512 - (b.length % 512)) % 512)]);

test('zip: lists and extracts stored and deflated members, matching names by pattern', () => {
  const zip = makeZip([
    { name: 'RVU26D/PPRRVU2026_Oct_nonQPP.csv', data: 'a,b\n1,2\n', method: 8 },
    { name: 'README.txt', data: 'hello', method: 0 },
  ]);
  assert.deepEqual(zipEntries(zip).map((e) => e.name), ['RVU26D/PPRRVU2026_Oct_nonQPP.csv', 'README.txt']);
  assert.equal(zipFind(zip, /pprrvu\d{4}_\w+_nonqpp\.csv$/i).data.toString(), 'a,b\n1,2\n');
  assert.equal(zipFind(zip, /readme/i).data.toString(), 'hello');
  assert.equal(zipFind(zip, /missing/), null);
  assert.throws(() => zipEntries(Buffer.from('not a zip at all, just text padding it out')), /end-of-central-directory/);
});

test('tar: reads files from a gzipped tarball, including a pax path', () => {
  const a = Buffer.from('{"name":"hl7.fhir.us.core"}');
  const long = 'package/' + 'x'.repeat(120) + '.json';
  const paxBody = Buffer.from(`${String(long.length + 12).padStart(3, '0')} path=${long}\n`);
  const b = Buffer.from('{}');
  const tar = Buffer.concat([
    tarHeader('package/package.json', a.length), pad(a),
    tarHeader('PaxHeader', paxBody.length, 'x'), pad(paxBody),
    tarHeader('truncated-name', b.length), pad(b),
    Buffer.alloc(1024),
  ]);
  const files = tarEntries(gzipSync(tar));
  assert.deepEqual(files.map((f) => f.name), ['package/package.json', long]);
  assert.equal(files[0].data.toString(), '{"name":"hl7.fhir.us.core"}');
});

test('text: CSV with quoted multi-line cells, doubled quotes and CRLF', () => {
  const rows = parseCsv('"CPT codes, descriptions\r\nare AMA\'s"\r\n"HCPCS/\nCPT Code","Practitioner Services MUE Values"\r\n99213,"2"\r\n"a ""b""",c\r\n');
  assert.equal(rows.length, 4);
  assert.equal(rows[0][0], "CPT codes, descriptions\r\nare AMA's");
  assert.equal(rows[1][0], 'HCPCS/\nCPT Code');
  assert.deepEqual(rows[2], ['99213', '2']);
  assert.deepEqual(rows[3], ['a "b"', 'c']);
  const { header, rows: body } = skipPreamble(rows, (r) => /^HCPCS/.test(r[0]));
  assert.equal(header[1], 'Practitioner Services MUE Values');
  assert.equal(body.length, 2);
  assert.throws(() => skipPreamble(rows, () => false), /header row not found/);
});

test('text: TSV, Windows-1252, money and numbers', () => {
  assert.deepEqual(splitTsv('470\tMAJOR JOINT\t1.9563\r\n871\tSEPTICEMIA\t1.932\r\n'), [['470', 'MAJOR JOINT', '1.9563'], ['871', 'SEPTICEMIA', '1.932']]);
  assert.equal(decode(Buffer.from([0x93, 0x61, 0x94]), 'latin1'), '“a”');
  assert.equal(decode(Buffer.from('﻿abc')), 'abc');
  assert.equal(moneyCents('$88.91 '), 8891);
  assert.equal(moneyCents('$1,234.50'), 123450);
  assert.equal(moneyCents('.'), null);
  assert.equal(moneyCents(''), null);
  assert.equal(moneyCents('(1.00)'), -100);
  assert.throws(() => moneyCents('abc'), /not a dollar amount/);
  assert.equal(num(' 1.30 '), 1.3);
  assert.equal(num(''), null);
});

test('discover: single and double quotes, entities, absolute links, newest, license links', () => {
  const html = `<a href="/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu26d">x</a>
    <a href='/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu26a'>y</a>
    <a href="/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu25d-0">z</a>
    <a href="/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu24ar">w</a>
    <a href="/license/ama?file=/files/zip/ptp-edits-ccipra-v323r0-f1.zip&amp;x=1">ptp</a>
    <a href="/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu26d">dup</a>`;
  const links = findLinks(html, /\/rvu\d{2}[a-d]/, 'https://www.cms.gov/x');
  assert.equal(links.length, 4);
  assert.ok(links.every((l) => l.startsWith('https://www.cms.gov/medicare/')));
  const key = (l) => { const m = /rvu(\d{2})([a-d])(r\d?)?/.exec(l); return `${m[1]}${m[2]}${m[3] || ''}`; };
  assert.match(newest(links, (a, b) => key(a).localeCompare(key(b))), /rvu26d$/);
  assert.equal(newest([], () => 0), null);
  const [gated] = findLinks(html, /license/);
  assert.ok(isLicenseGated(gated));
  assert.equal(unwrapLicenseLink(gated), '/files/zip/ptp-edits-ccipra-v323r0-f1.zip');
  assert.equal(unwrapLicenseLink('/files/zip/a.zip'), '/files/zip/a.zip');
});

test('http: user agent, conditional 304, retry on 500, no retry on 404', async () => {
  let hits = 0;
  const server = createServer((req, res) => {
    hits += 1;
    if (req.url === '/cond') {
      if (req.headers['if-none-match'] === '"v1"') { res.writeHead(304); res.end(); return; }
      res.writeHead(200, { etag: '"v1"' }); res.end(req.headers['user-agent']); return;
    }
    if (req.url === '/flaky') { if (hits % 2) { res.writeHead(500); res.end(); } else { res.writeHead(200); res.end('ok'); } return; }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const first = await get(`${base}/cond`, { backoffMs: 1 });
    assert.equal(first.bytes.toString(), USER_AGENT);
    assert.equal(first.etag, '"v1"');
    const again = await get(`${base}/cond`, { etag: first.etag, backoffMs: 1 });
    assert.equal(again.notModified, true);
    assert.equal(again.bytes, null);
    hits = 0;
    assert.equal((await get(`${base}/flaky`, { backoffMs: 1 })).bytes.toString(), 'ok');
    hits = 0;
    await assert.rejects(get(`${base}/gone`, { backoffMs: 1 }), /returned 404/);
    assert.equal(hits, 1, 'a 404 is not retried');
  } finally {
    server.close();
  }
});

const records = [{ code: '99213', work: 1.3 }, { code: '99214', work: 1.92 }];

test('checkDataset: bounds, the 20% rule, canaries and shape', () => {
  assert.equal(checkDataset({ records, recordBounds: { min: 1, max: 5 } }).ok, true);
  assert.match(checkDataset({ records, recordBounds: { min: 3, max: 5 } }).problems[0], /outside the expected 3-5/);
  assert.match(checkDataset({ records, previousCount: 10 }).problems[0], /moved -80%/);
  assert.equal(checkDataset({ records, previousCount: 2 }).ok, true);
  const canaries = [
    { label: '99213 work RVU', value: (r) => r.find((x) => x.code === '99213').work, expect: 1.3 },
    { label: '99214 work RVU in range', value: (r) => r.find((x) => x.code === '99214').work, expect: { min: 1.5, max: 2.5 } },
  ];
  assert.equal(checkDataset({ records, canaries }).ok, true);
  const bad = checkDataset({ records, canaries: [{ label: 'x', value: (r) => r[0].work, expect: 1.31 }] });
  assert.equal(bad.ok, false);
  assert.match(bad.problems[0], /canary "x": expected 1.31, got 1.3/);
  const thrown = checkDataset({ records, canaries: [{ label: 'y', value: (r) => r.find((x) => x.code === '0').work, expect: 1 }] });
  assert.match(thrown.problems[0], /error:/);
  assert.match(checkDataset({ records, shape: (r) => (/^\d{5}$/.test(r.code) && r.work > 2 ? null : 'too small') }).problems[0], /record 1: too small/);
});

test('decidePublish: one outcome per case', () => {
  const up = { id: 'mpfs', status: 'updated', problems: [] };
  assert.deepEqual(decidePublish({ datasets: [{ id: 'a', status: 'unchanged', problems: [] }] }), { action: 'none', reasons: [] });
  assert.deepEqual(decidePublish({ datasets: [up, { id: 'ptp', status: 'gated', problems: [] }] }), { action: 'merge', reasons: [] });
  assert.match(decidePublish({ datasets: [{ ...up, problems: ['canary "x" failed'] }] }).reasons[0], /canary/);
  assert.match(decidePublish({ datasets: [{ ...up, problems: ['record count moved 40%'] }] }).reasons[0], /moved 40%/);
  assert.match(decidePublish({ datasets: [{ ...up, sameEditionHashChange: true, edition: 'RVU26D' }] }).reasons[0], /re-posted RVU26D/);
  assert.match(decidePublish({ datasets: [{ ...up, editionWithoutCanaries: true, edition: 'RVU27A' }] }).reasons[0], /no canaries/);
  const failed = decidePublish({ datasets: [up, { id: 'drg', status: 'failed', problems: ['no download link matched'] }] });
  assert.equal(failed.action, 'review');
  assert.match(failed.reasons[0], /previous data was kept/);
});

test('shard: groups by key and caps a file at 5,000 rows', () => {
  const many = Array.from({ length: 12001 }, (_, i) => ({ ndc: `00002${String(i).padStart(6, '0')}` }));
  const s = shard([...many, { ndc: '99999000001' }], (r) => r.ndc.slice(0, 5));
  assert.deepEqual(s.map((x) => [x.name, x.items.length]), [['00002.json', 5000], ['00002-1.json', 5000], ['00002-2.json', 2001], ['99999.json', 1]]);
});

function fakeBuilder(over = {}) {
  return {
    id: 'demo', label: 'Demo', agency: 'CMS', sourceUrl: 'https://example.test/', cadence: 'quarterly',
    recordBounds: { min: 1, max: 10 }, shardKey: (r) => r.code[0],
    discover: async () => ({ url: 'https://example.test/demo.csv', edition: 'E1', effectiveFrom: '2026-10-01', expiresOn: '2027-04-01' }),
    parse: async (bytes) => ({ records: bytes.toString().trim().split('\n').map((code) => ({ code })) }),
    canaries: { E1: [{ label: 'has 99213', value: (r) => r.some((x) => x.code === '99213'), expect: true }] },
    ...over,
  };
}

test('runBuilder: writes a full dataset, replaces a sample, then leaves an unchanged source alone', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'sw-data-'));
  await mkdir(join(dataDir, 'demo', 'shards'), { recursive: true });
  await writeFile(join(dataDir, 'demo', 'shards', 'Z.json'), '[]');
  await writeFile(join(dataDir, 'demo', 'sample-extra.json'), '[]');
  await writeFile(join(dataDir, 'demo', 'manifest.json'), JSON.stringify({ dataset: 'demo', coverage: 'sample' }));
  const body = Buffer.from('99213\n99214\n');
  const http = { get: async () => ({ status: 200, notModified: false, bytes: body, etag: '"e"', lastModified: null }) };
  const hashes = {};
  const row = await runBuilder(fakeBuilder(), { dataDir, hashes, today: '2026-10-02', http });
  assert.equal(row.status, 'updated');
  assert.deepEqual(row.problems, []);
  assert.equal(row.editionWithoutCanaries, false);
  const m = JSON.parse(await readFile(join(dataDir, 'demo', 'manifest.json'), 'utf8'));
  assert.equal(m.coverage, 'full');
  assert.equal(m.fetchedAt, '2026-10-02');
  assert.equal(m.sourceEdition, 'E1');
  assert.equal(m.recordCount, 2);
  assert.ok(m.sourceSha256 && m.recordsSha256);
  assert.deepEqual(await readdir(join(dataDir, 'demo', 'shards')), ['9.json']);
  assert.ok(!existsSync(join(dataDir, 'demo', 'sample-extra.json')), 'the sample\'s leftover files are removed');
  assert.equal(hashes.demo.etag, '"e"');

  const before = await readFile(join(dataDir, 'demo', 'manifest.json'), 'utf8');
  const again = await runBuilder(fakeBuilder(), { dataDir, hashes, today: '2026-10-09', http });
  assert.equal(again.status, 'unchanged');
  assert.equal(await readFile(join(dataDir, 'demo', 'manifest.json'), 'utf8'), before, 'an unchanged source writes nothing');

  const notMod = await runBuilder(fakeBuilder(), { dataDir, hashes, today: '2026-10-09', http: { get: async (url, v) => ({ notModified: v.etag === '"e"', bytes: null }) } });
  assert.equal(notMod.status, 'unchanged');
});

test('runBuilder: a failed discover keeps the previous data; a same-edition re-post is flagged', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'sw-data-'));
  const hashes = {};
  const http = (text) => ({ get: async () => ({ notModified: false, bytes: Buffer.from(text), etag: null }) });
  await runBuilder(fakeBuilder(), { dataDir, hashes, today: '2026-10-02', http: http('99213\n') });
  const before = await readFile(join(dataDir, 'demo', 'manifest.json'), 'utf8');
  const failed = await runBuilder(fakeBuilder({ discover: async () => null }), { dataDir, hashes, today: '2026-10-09', http: http('x') });
  assert.equal(failed.status, 'failed');
  assert.match(failed.problems[0], /no download link matched/);
  assert.equal(await readFile(join(dataDir, 'demo', 'manifest.json'), 'utf8'), before);
  const repost = await runBuilder(fakeBuilder(), { dataDir, hashes, today: '2026-10-09', http: http('99213\n99214\n') });
  assert.equal(repost.sameEditionHashChange, true);
  assert.equal(decidePublish({ datasets: [repost] }).action, 'review');
  const noCanaries = await runBuilder(fakeBuilder({ discover: async () => ({ url: 'https://example.test/e2.csv', edition: 'E2', expiresOn: '2027-07-01' }) }), { dataDir, hashes, today: '2026-10-16', http: http('99213\n99215\n') });
  assert.equal(noCanaries.editionWithoutCanaries, true);
});

test('runBuilder: a multi-part edition is fetched and hashed as one, so a changed part is a change', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'sw-data-'));
  const hashes = {};
  const files = { 'https://example.test/a.csv': '99213\n', 'https://example.test/b.csv': 'x' };
  const http = { get: async (url) => ({ notModified: false, bytes: Buffer.from(files[url]) }) };
  const multi = fakeBuilder({
    discover: async () => ({ url: 'https://example.test/a.csv', parts: ['https://example.test/b.csv'], edition: 'E1', expiresOn: '2027-04-01' }),
    parse: async (bytes, found) => ({ records: [{ code: bytes.toString().trim() }], ancillary: { 'b.json': found.partBytes['https://example.test/b.csv'].toString() } }),
  });
  assert.equal((await runBuilder(multi, { dataDir, hashes, today: '2026-10-02', http })).status, 'updated');
  assert.equal(JSON.parse(await readFile(join(dataDir, 'demo', 'b.json'), 'utf8')), 'x');
  assert.equal((await runBuilder(multi, { dataDir, hashes, today: '2026-10-09', http })).status, 'unchanged');
  files['https://example.test/b.csv'] = 'y';
  const changed = await runBuilder(multi, { dataDir, hashes, today: '2026-10-16', http });
  assert.equal(changed.status, 'updated');
  assert.equal(changed.sameEditionHashChange, true);
});

test('runBuilder: a .js ancillary is written as the module text it is, not as JSON', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'sw-data-'));
  const http = { get: async () => ({ notModified: false, bytes: Buffer.from('99213\n') }) };
  const withModule = fakeBuilder({
    discover: async () => ({ url: 'https://example.test/a.csv', edition: 'E1', expiresOn: '2027-04-01' }),
    parse: async (bytes) => ({ records: [{ code: bytes.toString().trim() }], ancillary: { 'table.js': 'export const T = 1;\n' } }),
  });
  assert.equal((await runBuilder(withModule, { dataDir, hashes: {}, today: '2026-10-03', http })).status, 'updated');
  assert.equal(await readFile(join(dataDir, 'demo', 'table.js'), 'utf8'), 'export const T = 1;\n');
});

test('summaryMarkdown: the decision and its reasons lead the pull request body', async () => {
  const { summaryMarkdown } = await import('../../scripts/data/summarize.mjs');
  const review = summaryMarkdown({ decision: { action: 'review', reasons: ['mpfs: canary "99213 work RVU": expected 1.3, got 1.31'] }, datasets: [{ id: 'mpfs', status: 'updated', editionBefore: 'RVU26C', edition: 'RVU26D', recordCount: 19453, problems: ['x'] }] });
  assert.match(review, /^\*\*Needs a person \(`data-review`\)/);
  assert.match(review, /- mpfs: canary/);
  assert.match(review, /\| mpfs \| updated \(1 problem\) \| RVU26C -> RVU26D \| 19453 \|/);
  assert.match(summaryMarkdown({ decision: { action: 'merge', reasons: [] }, datasets: [] }), /merges itself/);
  assert.match(summaryMarkdown({ datasets: [] }), /No live dataset changed/);
});
