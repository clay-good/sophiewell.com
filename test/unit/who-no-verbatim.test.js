// spec-v1540 §6: the WHO reproduction guard. The field-health program restates WHO thresholds, doses and
// decision logic in its own words with a citation; it never reproduces chart text (WHO's chart booklets
// are "All rights reserved", and its 2019-onward guidelines are CC BY-NC-SA, which this MIT project cannot
// carry). This fails if any shipped text -- every library and view module, the catalog's META, and the
// hand-written tool copy -- contains eight or more consecutive words of a phrase read from a WHO source
// (test/fixtures/who-phrases.json). Short classification names ("severe pneumonia or very severe
// disease") are the clinical category itself and stay allowed, because they are under eight words.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RUN = 8;
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);

// shingles(phrases) -> Map 'w1 ... w8' -> the phrase it came from.
export function shingles(phrases) {
  const out = new Map();
  for (const p of phrases) {
    const w = words(p);
    for (let i = 0; i + RUN <= w.length; i += 1) out.set(w.slice(i, i + RUN).join(' '), p);
  }
  return out;
}

// reproduced(text, table) -> the phrases an 8-word run of `text` reproduces.
export function reproduced(text, table) {
  const w = words(text);
  const hits = new Set();
  for (let i = 0; i + RUN <= w.length; i += 1) {
    const p = table.get(w.slice(i, i + RUN).join(' '));
    if (p) hits.add(p);
  }
  return [...hits];
}

const FIXTURE = JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'who-phrases.json'), 'utf8'));
const ALL = Object.values(FIXTURE.sources).flatMap((s) => s.phrases);

function shipped() {
  const files = [];
  for (const dir of ['lib', 'views', 'data/tool-copy']) {
    const walk = (d) => {
      for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|json)$/.test(e.name)) files.push(p);
      }
    };
    walk(dir);
  }
  return files;
}

test('every guarded phrase is long enough to guard, and each source names its licence', () => {
  for (const [id, s] of Object.entries(FIXTURE.sources)) {
    assert.match(s.source, /All rights reserved|CC BY-NC-SA/, `${id} names its licence`);
    for (const p of s.phrases) assert.ok(words(p).length >= RUN, `${id}: "${p}" is shorter than ${RUN} words and guards nothing`);
  }
});

test('the guard catches a planted chart sentence and lets a classification name through', () => {
  const table = shingles(ALL);
  assert.deepEqual(reproduced('Dosing: give the first dose of artemether-lumefantrine in the clinic and observe for one hour, then send home.', table),
    ['Give the first dose of artemether-lumefantrine in the clinic and observe for one hour.']);
  assert.deepEqual(reproduced('Severe pneumonia or very severe disease (pink): refer urgently.', table), []);
  assert.deepEqual(reproduced('Give the first artemether-lumefantrine dose at the clinic and watch the child for an hour.', table), [], 'a restatement is not a reproduction');
});

test('no shipped text reproduces eight consecutive words of a WHO chart phrase', () => {
  const table = shingles(ALL);
  const offenders = [];
  for (const f of shipped()) {
    for (const p of reproduced(readFileSync(join(ROOT, f), 'utf8'), table)) offenders.push(`${f}: "${p}"`);
  }
  assert.deepEqual(offenders, [], 'restate the source in your own words and cite it (spec-v1540 §6)');
});
