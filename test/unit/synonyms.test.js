// spec-v7 section 3.2: synonym-routed prompt bar.
// Pure-function tests of the matcher; never touches the network.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { matchSynonym, normalizePhrase } from '../../lib/synonyms.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const FIXTURE = [
  { phrases: ['my bill', 'i got a bill', 'hospital bill'], tile: 'decoder', audience: 'patients' },
  { phrases: ['my labs are weird', 'lab results', 'blood work'], tile: 'lab-interpret', audience: 'patients' },
  { phrases: ['denied', 'denial letter', 'they denied it'], tile: 'appeal-letter', audience: 'patients' },
  { phrases: ['icd-10', 'icd 10'], tile: 'icd10', audience: 'billers' },
];

test('normalizePhrase: lowercases, strips punctuation, collapses whitespace', () => {
  assert.equal(normalizePhrase('  My Labs!  '), 'my labs');
  assert.equal(normalizePhrase('ICD-10'), 'icd 10');
  assert.equal(normalizePhrase("hospital   bill...??"), 'hospital bill');
  assert.equal(normalizePhrase(''), '');
  assert.equal(normalizePhrase(null), '');
});

test('matchSynonym: exact phrase match returns the entry', () => {
  const m = matchSynonym('my bill', FIXTURE);
  assert.ok(m);
  assert.equal(m.tile, 'decoder');
  assert.equal(m.phrase, 'my bill');
});

test('matchSynonym: whitespace and case insensitive', () => {
  const m = matchSynonym('  My Bill  ', FIXTURE);
  assert.equal(m && m.tile, 'decoder');
});

test('matchSynonym: punctuation in query is stripped', () => {
  const m = matchSynonym('hospital bill!', FIXTURE);
  assert.equal(m && m.tile, 'decoder');
});

test('matchSynonym: ICD-10 phrasing variants match', () => {
  assert.equal(matchSynonym('icd-10', FIXTURE).tile, 'icd10');
  assert.equal(matchSynonym('ICD 10', FIXTURE).tile, 'icd10');
  assert.equal(matchSynonym('icd10', FIXTURE), null);
});

test('matchSynonym: substring containment of phrase in query', () => {
  // "i got a hospital bill today" contains the phrase "hospital bill"
  const m = matchSynonym('i got a hospital bill today', FIXTURE);
  assert.equal(m && m.tile, 'decoder');
});

test('matchSynonym: empty query returns null', () => {
  assert.equal(matchSynonym('', FIXTURE), null);
  assert.equal(matchSynonym('   ', FIXTURE), null);
});

test('matchSynonym: no match returns null', () => {
  assert.equal(matchSynonym('absolutely no relationship to anything', FIXTURE), null);
});

test('matchSynonym: audience match boosts the same-audience entry', () => {
  // "denied" appears only in the patient row; with audience=patients it
  // should still resolve there. With audience=billers it still resolves
  // but the score is reduced (we still return it, never hide it).
  const a = matchSynonym('denied', FIXTURE, 'patients');
  assert.equal(a && a.tile, 'appeal-letter');
  const b = matchSynonym('denied', FIXTURE, 'billers');
  assert.equal(b && b.tile, 'appeal-letter');
});

test('matchSynonym: handles missing or malformed entries gracefully', () => {
  assert.equal(matchSynonym('bill', null), null);
  assert.equal(matchSynonym('bill', undefined), null);
  assert.equal(matchSynonym('bill', [{ tile: 'x' }, { phrases: null, tile: 'y' }]), null);
});

test('synonyms.json: every tile id resolves to a real utility id in app.js', async () => {
  // Guards against a synonym row pointing at a tile that has been renamed
  // or removed. Both files are static, so this is a deterministic check.
  const json = JSON.parse(await readFile(join(ROOT, 'data', 'synonyms.json'), 'utf8'));
  const app = await readFile(join(ROOT, 'app.js'), 'utf8');
  const ids = new Set();
  const re = /\bid:\s*'([a-z0-9-]+)'/g;
  let m;
  while ((m = re.exec(app)) !== null) ids.add(m[1]);
  for (const entry of json.entries) {
    assert.ok(ids.has(entry.tile), `synonym tile "${entry.tile}" not found in UTILITIES registry`);
  }
});

test('synonyms.json: phrases are non-empty strings and entries have an audience', async () => {
  const json = JSON.parse(await readFile(join(ROOT, 'data', 'synonyms.json'), 'utf8'));
  assert.ok(Array.isArray(json.entries) && json.entries.length > 0);
  for (const entry of json.entries) {
    assert.ok(typeof entry.tile === 'string' && entry.tile.length > 0);
    assert.ok(typeof entry.audience === 'string' && entry.audience.length > 0);
    assert.ok(Array.isArray(entry.phrases) && entry.phrases.length > 0);
    for (const p of entry.phrases) assert.ok(typeof p === 'string' && p.trim().length > 0);
  }
});
