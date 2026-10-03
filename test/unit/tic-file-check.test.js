// spec-v1604 tool 1: tic-file-check. The CMS sample files (test/fixtures/tic-v2.2.1, copied from
// github.com/CMSgov/price-transparency-guide at v2.2.1) pass; a table of contents naming a file that
// was not chosen fails with its path; a rate naming an undefined provider group fails with its path.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { checkTicFiles, nameOf } from '../../lib/tic-file-check.js';
import { TIC_SCHEMA, IN_NETWORK } from '../../lib/tic-schemas.js';
import { check, walk } from '../../lib/schema-check.js';
import { JsonParser } from '../../lib/json-stream.js';

const DIR = join(process.cwd(), 'test', 'fixtures', 'tic-v2.2.1');
const read = (n) => readFileSync(join(DIR, n));
const file = (name, bytes) => new File([bytes], name);
const sample = () => JSON.parse(read('in-network-rates-fee-for-service-single-plan-sample.json'));
const one = async (name, value) => (await checkTicFiles([file(name, typeof value === 'string' || value instanceof Uint8Array ? value : JSON.stringify(value))]));
const codes = (r) => r.files[0].findings.map((f) => `${f.code} ${f.location}`);

test('the pinned schema is v2.2.1', () => {
  assert.equal(TIC_SCHEMA.version, '2.2.1');
  assert.equal(TIC_SCHEMA.tag, 'v2.2.1');
});

test('every CMS sample file passes, typed by its contents', async () => {
  const want = { 'allowed-amounts': 2, 'in-network': 6, 'table-of-contents': 1 };
  const seen = {};
  for (const n of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    const r = await one(n, read(n));
    assert.equal(r.valid, true, `${n}: ${JSON.stringify(r.files[0].findings)}`);
    seen[r.files[0].type] = (seen[r.files[0].type] || 0) + 1;
  }
  assert.deepEqual(seen, want);
});

test('a table of contents names its files; one not chosen fails with its path, a wrong type is named', async () => {
  const toc = read('table-of-contents-sample.json');
  const alone = await checkTicFiles([file('index.json', toc)]);
  assert.equal(alone.valid, true);
  assert.equal(alone.cross.checked, false);
  assert.match(alone.notes[0], /^The table of contents names 5 files\. Choose them with it/);

  const inn = JSON.stringify(sample());
  const aa = read('allowed-amounts-multiple-plan-sample.json');
  const r = await checkTicFiles([file('index.json', toc), file('in-network-file-123456.json', inn), file('allowed-amount-file-987665.json.gz', gzipSync(aa)), file('behavioral-health-0000.json', aa)]);
  assert.equal(r.cross.checked, true);
  assert.equal(r.valid, false);
  assert.deepEqual(r.cross.findings.map((f) => [f.code, f.location]), [
    ['wrong_file_type', 'index.json $.reporting_structure[0].in_network_files[1].location'],
    ['missing_file', 'index.json $.reporting_structure[1].in_network_files[0].location'],
    ['missing_file', 'index.json $.reporting_structure[1].allowed_amount_file.location'],
  ]);
  assert.match(r.cross.findings[1].message, /^names chip-in-network-file\.json, which is not among the files chosen\.$/);
  assert.match(r.band, /^3 deficiencies against the CMS Transparency in Coverage schema v2\.2\.1, in the table of contents' references\.$/);
});

test('a rate naming a provider group the file does not define fails with its path', async () => {
  const v = sample();
  v.in_network[0].negotiated_rates[0].provider_references = [1, 999];
  const r = await one('a.json', v);
  assert.deepEqual(codes(r), ['reference $.in_network[0].negotiated_rates[0].provider_references']);
  assert.match(r.files[0].findings[0].message, /provider group 999/);
});

test('the schema rules: conditional service code, identifier forms, positive rates, real dates', async () => {
  const v = sample();
  const price = v.in_network[0].negotiated_rates[0].negotiated_prices[0];
  price.billing_class = 'professional'; delete price.service_code; price.negotiated_rate = 0;
  v.provider_references[0].provider_groups[0].tin = { type: 'ein', value: '12-34' };
  v.last_updated_on = '2026-02-30';
  const r = await one('a.json', v);
  assert.deepEqual(codes(r).sort(), [
    'exclusiveMinimum $.in_network[0].negotiated_rates[0].negotiated_prices[0].negotiated_rate',
    'format $.last_updated_on',
    'oneOf $.provider_references[0].provider_groups[0].tin',
    'required $.in_network[0].negotiated_rates[0].negotiated_prices[0].service_code',
  ]);
  assert.match(r.files[0].findings.find((f) => f.code === 'oneOf').message, /Closest: .*tin\.value does not match/);
});

test('npi [0] is the stated form for a group with no NPI; a short NPI is not', async () => {
  const v = sample();
  v.provider_references[0].provider_groups[0].npi = [0];
  assert.equal((await one('a.json', v)).valid, true);
  v.provider_references[0].provider_groups[0].npi = [123];
  assert.deepEqual(codes(await one('a.json', v)), ['oneOf $.provider_references[0].provider_groups[0].npi']);
});

test('a repeated negotiated price is caught (uniqueItems), whatever its key order', async () => {
  const v = sample();
  const prices = v.in_network[0].negotiated_rates[0].negotiated_prices;
  prices.push(Object.fromEntries(Object.entries(prices[0]).reverse()));
  assert.deepEqual(codes(await one('a.json', v)), ['uniqueItems $.in_network[0].negotiated_rates[0].negotiated_prices']);
});

test('streamed and whole-value checks agree', async () => {
  const v = sample();
  v.in_network[0].billing_code_type = 'CPT4'; delete v.in_network[1].description;
  v.in_network[1].negotiated_rates[0].negotiated_prices[0].setting = 'home';
  const whole = []; check(v, IN_NETWORK, IN_NETWORK, '$', (c, l) => whole.push(`${c} ${l}`));
  const streamed = [];
  await walk(new JsonParser(new Blob([JSON.stringify(v)]).stream()), IN_NETWORK, IN_NETWORK, '$', { add: (c, l) => streamed.push(`${c} ${l}`) });
  assert.deepEqual(streamed.sort(), whole.sort());
  assert.equal(whole.length, 3);
});

test('gzipped files are read; broken JSON, other JSON and an older version are said plainly', async () => {
  const gz = await one('rates.json.gz', gzipSync(JSON.stringify(sample())));
  assert.equal(gz.valid, true); assert.equal(gz.files[0].gzip, true);
  const cut = await one('cut.json', JSON.stringify(sample()).slice(0, 300));
  assert.deepEqual(cut.files[0].findings.map((f) => f.code), ['invalid_json']);
  const other = await one('x.json', '{"hospital_name":"A"}');
  assert.match(other.band, /^This is not a Transparency in Coverage file/);
  const v = sample(); v.version = '1.0.0';
  const old = await one('old.json', v);
  assert.equal(old.valid, true);
  assert.match(old.notes.join(' '), /declares schema version 1\.0\.0; it was checked against 2\.2\.1, the current version/);
});

test('the allowed-amounts dependentRequired keyword is a note, not a deficiency (CMS sample omits issuer_name)', async () => {
  const r = await one('aa.json', read('allowed-amounts-single-plan-sample.json'));
  assert.equal(r.valid, true);
  assert.match(r.notes.join(' '), /but not issuer_name\. .*noted, not counted\./);
});

test('nameOf takes the last path segment, decoded, without .gz', () => {
  assert.equal(nameOf('https://x.example/a/b/2026-09-01_Plan%20A_in-network-rates.json.gz?sig=1'), '2026-09-01_plan a_in-network-rates.json');
  assert.equal(nameOf('not a url/file.json'), 'file.json');
});
