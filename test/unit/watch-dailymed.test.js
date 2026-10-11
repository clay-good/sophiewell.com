// spec-v1628 section 1, route D: the label-edition watcher's extraction, hashing and decisions (no fetching).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  extractSection, normalize, sectionHashes, latest, isoDate, addMonths, decide, expired, markdown, STATE, SECTIONS,
} from '../../scripts/data/watch-dailymed.mjs';
import { META } from '../../lib/meta.js';

const FIX = join(import.meta.dirname, '..', 'fixtures', 'label-watch');
const acetadote = (v) => readFileSync(join(FIX, `acetadote-v${v}-section-2.xml`), 'utf8');
const D = '34068-7';
const rows = JSON.parse(readFileSync(STATE, 'utf8'));

test('a section is found by its LOINC code and closed by nesting, subsections included', () => {
  const xml = '<document><component><section><code code="34066-1"/><text>Boxed</text></section></component>'
    + '<component><section ID="s2"><code code="34068-7" displayName="DOSAGE"/><title>2 DOSAGE</title>'
    + '<component><section><code code="42229-5"/><text>2.1 Adults: 5&#160;mg &lt; once</text></section></component></section></component>'
    + '<component><section><code code="34070-3"/><text>None.</text></section></component></document>';
  assert.equal(normalize(extractSection(xml, D)), '2 DOSAGE 2.1 Adults: 5 mg < once');
  assert.equal(normalize(extractSection(xml, '34070-3')), 'None.');
  assert.equal(extractSection(xml, '34069-5'), null);
  assert.equal(sectionHashes(xml, ['34069-5'])['34069-5'], null);
});

test('a label that carries the section twice is hashed across both', () => {
  const part = (t) => `<component><section><code code="34068-7"/><text>${t}</text></section></component>`;
  const both = `<document>${part('As a mucolytic')}${part('As an antidote: 140 mg/kg')}</document>`;
  assert.equal(normalize(extractSection(both, D)), 'As a mucolytic As an antidote: 140 mg/kg');
  assert.notEqual(sectionHashes(both, [D])[D], sectionHashes(both.replace('140', '70'), [D])[D]);
});

test('markup, ids and whitespace do not move the hash; a word does', () => {
  const a = '<section ID="a1"><code code="34068-7"/><paragraph styleCode="bold">Give 1&#160;mg/kg\n   every 12 hours.</paragraph></section>';
  const b = '<section ID="zz"><code code="34068-7"/><paragraph>Give 1 mg/kg every 12 hours.</paragraph></section>';
  assert.equal(sectionHashes(a, [D])[D], sectionHashes(b, [D])[D]);
  assert.notEqual(sectionHashes(a, [D])[D], sectionHashes(a.replace('12 hours', '24 hours'), [D])[D]);
});

// Two real pairs of one label (Acetadote): versions 16 and 17 share their Dosage and Administration
// section; version 15 to 16 changed it. Run on October 10, 2026 across three versions each of five
// labels before these three were kept as fixtures.
test('real versions: an unchanged section 2 hashes the same, a changed one does not', () => {
  const h = (v) => sectionHashes(acetadote(v), [D])[D];
  assert.equal(h(16), h(17));
  assert.notEqual(h(15), h(16));
  assert.equal(h(17), rows.find((r) => r.setId === '472f158a-5ab9-4308-8e49-1116e6ea3d39').sections[D]);
});

test('history.json: the newest version and its published date; an empty history is a retired set id', () => {
  const history = { data: { history: [{ spl_version: 18, published_date: 'Sep 06, 2024' }, { spl_version: 20, published_date: 'Aug 17, 2026' }] } };
  assert.deepEqual(latest(history), { version: 20, published: '2026-08-17' });
  assert.equal(latest({ data: { spl: { title: '', setid: '' }, history: [] } }), null);
  assert.equal(isoDate('Feb 2, 2026'), '2026-02-02');
  assert.equal(isoDate('2026-02-02'), null);
  assert.equal(addMonths('2026-10-10', 12), '2027-10-10');
});

test('decide: same version renews; a new version with the same sections moves forward; a changed section supersedes', () => {
  const row = { label: 'Acetadote', setId: 'x', tools: ['nac-dosing'], splVersion: 16, publishedOn: '2025-06-06', verifiedOn: '2026-01-01', validThrough: '2027-01-01', sections: { [D]: sectionHashes(acetadote(16), [D])[D] } };
  const today = '2026-10-10';
  const same = decide(row, { version: 16, published: '2025-06-06' }, null, today);
  assert.equal(same.status, 'same');
  assert.equal(same.row.validThrough, '2027-10-10');
  assert.equal(same.row.verifiedOn, '2026-01-01'); // nobody re-read it
  // With 11 months or more left the row is not rewritten, so a quiet week changes no file.
  const fresh = { ...row, validThrough: '2027-10-03' };
  assert.equal(decide(fresh, { version: 16, published: '2025-06-06' }, null, today).row, fresh);

  const renewed = decide(row, { version: 17, published: '2025-07-30' }, sectionHashes(acetadote(17), [D]), today);
  assert.equal(renewed.status, 'renewed');
  assert.deepEqual([renewed.row.splVersion, renewed.row.publishedOn, renewed.row.validThrough], [17, '2025-07-30', '2027-10-10']);
  assert.deepEqual(renewed.row.sections, row.sections);
  assert.equal(renewed.row.supersededOn, undefined);

  const old = { ...row, splVersion: 15, sections: { [D]: sectionHashes(acetadote(15), [D])[D] } };
  const superseded = decide(old, { version: 16, published: '2025-06-06' }, sectionHashes(acetadote(16), [D]), today);
  assert.equal(superseded.status, 'superseded');
  assert.deepEqual(superseded.changed, [D]);
  assert.equal(superseded.row.supersededOn, today);
  assert.equal(superseded.row.splVersion, 15); // the row still says what was read
  assert.deepEqual(superseded.row.sections, old.sections); // and no hash is rewritten

  // A section that vanished from the new version is a change; so is a retired set id.
  assert.equal(decide(row, { version: 17, published: null }, { [D]: null }, today).status, 'superseded');
  assert.equal(decide(row, null, null, today).status, 'retired');
  assert.equal(decide(row, null, null, today).row.supersededOn, today);
  // Once superseded, a row waits for a person: the watch does not renew or re-supersede it.
  assert.equal(decide(superseded.row, { version: 17, published: null }, sectionHashes(acetadote(17), [D]), '2026-10-17').status, 'already superseded');
});

test('the pull-request text names the section, the version and the tools; a renewal needs no one', () => {
  const base = { label: 'Lovenox', setId: 'abc', tools: ['vte-prophylaxis-dose'], splVersion: 33, validThrough: '2027-10-10', sections: { [D]: '1' } };
  const md = markdown([
    { status: 'superseded', changed: [D], row: { ...base, supersededOn: '2026-10-17', supersededBy: 'version 34 (2026-10-15)' } },
    { status: 'renewed', row: { ...base, label: 'Digoxin', splVersion: 21 } },
    { status: 'retired', row: { ...base, label: 'Old label', supersededOn: '2026-10-17' } },
    { status: 'same', row: { ...base, label: 'Stale', validThrough: '2026-10-01' } },
  ], { unreachable: ['Omegaven'], today: '2026-10-17' });
  assert.match(md, /- Lovenox: Dosage and Administration changed in version 34 \(2026-10-15\)\. Re-read these rows in `vte-prophylaxis-dose`/);
  assert.match(md, /--record abc/);
  assert.match(md, /Old label .* is no longer on DailyMed under this set id/);
  assert.match(md, /1 label has a new version whose watched sections did not change: Digoxin \(now version 21\)\./);
  assert.match(md, /Past their 12 months without a renewal: Stale\./);
  assert.match(md, /DailyMed could not answer for 1 label: Omegaven\./);
  assert.match(markdown([{ status: 'same', row: base }], { today: '2026-10-17' }), /No label section a tool reads changed \(1 of 1 labels compared\)\./);
  assert.deepEqual(expired([{ validThrough: '2026-10-01' }, { validThrough: '2026-10-01', supersededOn: '2026-09-01' }, { validThrough: '2027-01-01' }], '2026-10-17').length, 1);
});

test('every recorded label has a set id, a version, a published date, a reading date, 12 months, a hash and a tool', () => {
  assert.ok(rows.length >= 20);
  assert.equal(new Set(rows.map((r) => r.setId)).size, rows.length);
  for (const r of rows) {
    assert.match(r.setId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, r.label);
    assert.ok(Number.isInteger(r.splVersion) && r.splVersion > 0, r.label);
    for (const k of ['publishedOn', 'verifiedOn', 'validThrough']) assert.match(r[k], /^\d{4}-\d{2}-\d{2}$/, `${r.label} ${k}`);
    assert.ok(r.validThrough > r.verifiedOn, `${r.label}: validThrough is not after the reading`);
    assert.ok(r.publishedOn <= r.verifiedOn, `${r.label}: read before it was published`);
    assert.ok(Object.keys(r.sections).length >= 1, r.label);
    for (const [loinc, hash] of Object.entries(r.sections)) {
      assert.ok(SECTIONS[loinc], `${r.label}: unknown section ${loinc}`);
      assert.match(hash, /^[0-9a-f]{64}$/, r.label);
    }
    assert.ok(r.tools.length >= 1, r.label);
    for (const t of r.tools) assert.ok(META[t], `${r.label}: no such tool ${t}`);
  }
});

test('no watched label is a repackager\'s or relabeler\'s copy', () => {
  const deny = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'scripts', 'data', 'label-repackagers.json'), 'utf8')).labelers;
  assert.ok(deny.includes('PROPHARMA DISTRIBUTION'));
  for (const r of rows) {
    assert.ok(r.labeler, `${r.label}: no labeler recorded`);
    assert.ok(!deny.includes(r.labeler), `${r.label} is pinned to ${r.labeler}; pin the application holder's or a manufacturer's label`);
  }
});

// The watch is only as good as its list: a tool that links a DailyMed label must have that label on it,
// under its own name, and so must every label row in a shipped dataset.
test('every DailyMed label a tool links, and every label row in a dataset, is under the watch', () => {
  const watched = new Map(rows.map((r) => [r.setId, r.tools]));
  const SETID = /dailymed\.nlm\.nih\.gov\/[^'"\s]*setid=([0-9a-f-]{36})/;
  for (const [tool, m] of Object.entries(META)) {
    const urls = [m.citationUrl, ...(Array.isArray(m.citationUrls) ? m.citationUrls.map((u) => u.url) : [])].filter(Boolean);
    for (const u of urls) {
      const id = (SETID.exec(u) || [])[1];
      if (!id) continue;
      assert.ok(watched.has(id), `${tool} links label ${id}, which is not in scripts/data/label-editions.json`);
      assert.ok(watched.get(id).includes(tool), `label ${id} does not list ${tool} among its tools`);
    }
  }
  const root = join(import.meta.dirname, '..', '..', 'data');
  const abx = JSON.parse(readFileSync(join(root, 'abx-renal', 'abx.json'), 'utf8'));
  for (const r of abx) assert.ok(watched.get(r.setId)?.includes('abx-renal'), `abx-renal ${r.drug}: label ${r.setId} is not watched`);
  const tpn = JSON.parse(readFileSync(join(root, 'tpn-rules', 'tpn.json'), 'utf8'));
  for (const r of [tpn.kcalPerGram, ...tpn.lipidProducts]) {
    const w = rows.find((x) => x.setId === r.setId);
    assert.ok(w && w.tools.includes('tpn-macro'), `tpn-rules: label ${r.setId} is not watched`);
    assert.equal(w.splVersion, r.version, `tpn-rules ${r.setId}: version differs from the watch`);
  }
});
