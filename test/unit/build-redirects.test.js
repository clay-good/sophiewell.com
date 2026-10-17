// spec-v1643: /tools/<retired-id>/ redirects to the survivor's page instead of falling through to the
// home page (scripts/build-redirects.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { redirectLines } from '../../scripts/build-redirects.mjs';

const { aliases } = JSON.parse(readFileSync(new URL('../../data/id-aliases.json', import.meta.url), 'utf8'));
const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const live = new Set([...app.match(/const UTILITIES = \[([\s\S]*?)\n\];/)[1].matchAll(/id: '([^']+)'/g)].map((m) => m[1]));

test('every retired id redirects, with and without the trailing slash, to a tile still in the catalog', () => {
  const lines = redirectLines(aliases, (id) => live.has(id));
  for (const [oldId, { canonical }] of Object.entries(aliases)) {
    assert.ok(live.has(canonical), `${oldId} points at ${canonical}, which is not in the catalog`);
    assert.ok(!live.has(oldId), `${oldId} is retired but still in the catalog`);
    assert.ok(lines.includes(`/tools/${oldId}/ /tools/${canonical}/ 301`), oldId);
    assert.ok(lines.includes(`/tools/${oldId} /tools/${canonical}/ 301`), oldId);
  }
  assert.equal(lines.length, Object.keys(aliases).length * 2);
});

test('an alias whose survivor has no page is left out, not sent to the home page', () => {
  assert.deepEqual(redirectLines({ old: { canonical: 'gone' } }, () => false), []);
  assert.deepEqual(redirectLines({ same: { canonical: 'same' } }, () => true), []);
});
