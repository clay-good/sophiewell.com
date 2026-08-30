// spec-v936: every tile reaches at least one audience hub.
//
// `scripts/build-hub-pages.mjs` builds `dist/for/<audience>/` from a fixed HUBS map and fills
// each page with the tiles whose `audiences` array contains that hub's key. An audience value
// that is not a hub key is descriptive metadata and nothing more -- it places the tile nowhere.
//
// Two tiles were tagged only `facility-billing` and `coders`, neither of which names a hub, so
// `apc-payment` and `drg-payment` appeared on no audience page at all and were reachable only
// by search. The billers hub is labelled "Billers and coders" and its description already names
// DRG and APC, so the fix was to add the key, not to invent a hub.
//
// The invariant is narrow: a tile may carry any descriptive audience it likes, as long as at
// least one of them is a hub key.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUBS } from '../../scripts/build-hub-pages.mjs';

// UTILITIES is the source of truth for audiences and is read the same way the hub builder
// reads it, so this test cannot drift from what actually ships.
function tiles() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const out = [];
  for (const line of src.split('\n')) {
    const id = line.match(/\{\s*id:\s*'([a-z0-9-]+)'/);
    const aud = line.match(/audiences:\s*\[([^\]]*)\]/);
    if (!id || !aud) continue;
    out.push({
      id: id[1],
      audiences: aud[1].split(',').map((s) => s.replace(/['\s]/g, '')).filter(Boolean),
    });
  }
  return out;
}

test('spec-v936: every tile carries at least one audience that names a hub', () => {
  const hubKeys = new Set(Object.keys(HUBS));
  const all = tiles();
  assert.ok(all.length > 1500, `expected the whole catalog, parsed ${all.length}`);

  const stranded = all
    .filter((t) => !t.audiences.some((a) => hubKeys.has(a)))
    .map((t) => `${t.id} [${t.audiences.join(', ')}]`);

  assert.deepEqual(stranded, [],
    'these tiles appear on no audience hub, because none of their audiences is a hub key '
      + `(${[...hubKeys].join(', ')}): ${stranded.join('; ')}`);
});
