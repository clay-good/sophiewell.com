// spec-v1517 hpt-schema: the pinned-upstream watcher. The CMS repository has no tags, so a module pins a commit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { snapshots, compare, markdown, compareVersions } from '../../scripts/data/watch-upstream.mjs';

const SHA = '5333564a710f80d7740180b9ffab8dbdcba9b502';

test('the pins are read from the modules, not a list kept by hand', () => {
  const found = snapshots();
  assert.deepEqual(found.map((s) => [s.repo || s.package, s.sha || s.tag || s.version, s.modules]), [
    ['hl7.fhir.us.carin-bb', '2.2.0', ['lib/carin-eob-reader.js']],
    ['CMSgov/hospital-price-transparency', SHA, ['lib/hpt-v1515.js']],
    ['hl7.fhir.us.davinci-pas', '2.2.1', ['lib/pas-bundle-check.js']],
    ['CMSgov/price-transparency-guide', 'v2.2.1', ['lib/tic-schemas.js']],
  ]);
  const dir = mkdtempSync(join(tmpdir(), 'pins-'));
  writeFileSync(join(dir, 'a.js'), `// Source snapshot: CMSgov/x commit ${SHA}.\n`);
  writeFileSync(join(dir, 'b.js'), `// Source snapshot: CMSgov/x commit ${SHA}.\n// Source snapshot: org/y commit ${'a'.repeat(40)}.\n`);
  assert.deepEqual(snapshots(dir).map((s) => [s.repo, s.modules.length]), [['CMSgov/x', 2], ['org/y', 1]]);
});

const fake = (compareBody, status = 200) => async (url) => ({
  ok: status === 200,
  status,
  json: async () => (url.includes('/compare/') ? compareBody : { default_branch: 'master' }),
});

test('commits since the pin are listed with their files, for a person to read', async () => {
  const r = await compare({ repo: 'CMSgov/hospital-price-transparency', sha: SHA, modules: ['lib/hpt-v1515.js'] }, fake({
    ahead_by: 1,
    commits: [{ sha: 'b'.repeat(40), commit: { message: 'Release v3.1.0\n\nbody', committer: { date: '2027-01-15T00:00:00Z' } } }],
    files: [{ filename: 'documentation/JSON/schemas/v3.1.0.json' }],
  }));
  assert.equal(r.status, 'behind');
  const md = markdown([r]);
  assert.match(md, /1 commit on master since the pin/);
  assert.match(md, /2027-01-15 bbbbbbbbbbbb: Release v3\.1\.0/);
  assert.match(md, /`documentation\/JSON\/schemas\/v3\.1\.0\.json`/);
});

test('an unchanged pin says so, and an unreachable API is named as unchecked, never as current', async () => {
  const s = { repo: 'CMSgov/hospital-price-transparency', sha: SHA, modules: ['lib/hpt-v1515.js'] };
  assert.match(markdown([await compare(s, fake({ ahead_by: 0, commits: [], files: [] }))]), /no change on master since the pin/);
  const down = await compare(s, fake({}, 404));
  assert.equal(down.status, 'unchecked');
  assert.match(markdown([down]), /not checked \(compare returned 404\)/);
  const offline = await compare(s, async () => { throw new Error('getaddrinfo ENOTFOUND'); });
  assert.equal(offline.status, 'unchecked');
});

test('a tag pin lists only newer version tags, compared as numbers', async () => {
  assert.ok(compareVersions('v2.10.0', 'v2.9.1') > 0);
  assert.equal(compareVersions('v2.2.1', '2.2.1'), 0);
  const tags = async () => ({ ok: true, status: 200, json: async () => [{ name: 'v2.0.0' }, { name: 'v2.10.0' }, { name: 'v2.2.1' }, { name: 'v2.3.0' }, { name: 'draft-x' }] });
  const r = await compare({ repo: 'CMSgov/price-transparency-guide', tag: 'v2.2.1', modules: ['lib/tic-schemas.js'] }, tags);
  assert.deepEqual(r.newer, ['v2.3.0', 'v2.10.0']);
  assert.match(markdown([r]), /newer versions v2\.3\.0, v2\.10\.0\. A new version is a new pin/);
  const same = await compare({ repo: 'o/r', tag: 'v2.10.0', modules: ['lib/x.js'] }, tags);
  assert.match(markdown([same]), /no newer version tag/);
});

// spec-v1621 §3.7: FHIR packages are pinned by version and compared with packages.fhir.org's dist-tags.latest.
test('a FHIR package pin is read from its module and matches the profile builder', async () => {
  const pkgs = snapshots().filter((s) => s.package);
  assert.deepEqual(pkgs.map((s) => [s.package, s.version]), [['hl7.fhir.us.carin-bb', '2.2.0'], ['hl7.fhir.us.davinci-pas', '2.2.1']]);
  const { PIN } = await import('../../scripts/data/builders/pas-profiles.mjs');
  assert.equal(pkgs.find((s) => s.package === 'hl7.fhir.us.davinci-pas').version, PIN);
});

test('a package behind the registry says so; a prerelease or missing latest is unchecked, never current', async () => {
  const reg = (body, status = 200) => async (url) => {
    assert.equal(url, 'https://packages.fhir.org/hl7.fhir.us.carin-bb');
    return { ok: status === 200, status, json: async () => body };
  };
  const s = { package: 'hl7.fhir.us.carin-bb', version: '2.2.0', modules: ['lib/carin-eob-reader.js'] };
  const behind = await compare(s, reg({ 'dist-tags': { latest: '2.10.0' } }));
  assert.equal(behind.status, 'behind');
  assert.match(markdown([behind]), /`hl7\.fhir\.us\.carin-bb` \(pinned at 2\.2\.0 by `lib\/carin-eob-reader\.js`\): the registry's latest version is 2\.10\.0\. A new version is a new pin/);
  assert.match(markdown([await compare(s, reg({ 'dist-tags': { latest: '2.2.0' } }))]), /the registry's latest version is the pin/);
  assert.equal((await compare(s, reg({ 'dist-tags': { latest: '2.3.0-ballot' } }))).status, 'unchecked');
  assert.equal((await compare(s, reg({}))).status, 'unchecked');
  assert.match(markdown([await compare(s, reg({}, 404))]), /not checked \(the registry returned 404\)/);
});
