// spec-v996: retiring a tile did not delete its dataset, and docs/data-sources.md
// listed all forty folders from the spec-v29 / spec-v10 waves together as
// "retired". Twenty-eight of them are still on disk, still built, still hashed,
// still shipped and still re-stamped weekly. The section now separates the two,
// and this holds both lists to the tree so the distinction cannot rot.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { META } from '../../lib/meta.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOC = 'docs/data-sources.md';

// Folders that exist for the build or the search surface rather than for one
// tile, so they are not part of the retired/live question at all.
const BUILD_TIME = ['search-corpus', 'fields', 'tool-copy', 'workflow', 'clinical'];

// Pull the two lists out of the doc's own prose, so the doc is the declaration
// and this is the check -- not two more copies to drift apart.
async function lists() {
  const text = await readFile(join(ROOT, DOC), 'utf8');
  const section = (heading) => {
    const i = text.indexOf(heading);
    assert.notEqual(i, -1, `${DOC} no longer carries the "${heading}" list`);
    const body = text.slice(i, text.indexOf('\n\n', i));
    return [...body.matchAll(/`([a-z0-9-]+)\//g)].map((m) => m[1]);
  };
  return {
    deleted: section('**Deleted'),
    stillBuilt: section('**Tile retired, data still built and shipped'),
  };
}

test('a folder listed as deleted is really gone', async () => {
  const { deleted } = await lists();
  assert.ok(deleted.length > 0, 'the deleted list parsed empty');
  const present = deleted.filter((d) => existsSync(join(ROOT, 'data', d)));
  assert.deepEqual(present, [], `${DOC} lists these as deleted and data/ still has them`);
});

test('a folder listed as still built is really there', async () => {
  const { stillBuilt } = await lists();
  assert.ok(stillBuilt.length > 0, 'the still-built list parsed empty');
  const missing = stillBuilt.filter((d) => !existsSync(join(ROOT, 'data', d)));
  assert.deepEqual(missing, [], `${DOC} says these are still built and data/ does not have them`);
});

test('every folder under data/ is accounted for', async () => {
  // The whole defect was a folder existing while the doc said it did not. The
  // reverse -- a folder nobody has written down at all -- is the same blind spot
  // from the other side, so close both.
  const { deleted, stillBuilt } = await lists();
  const known = new Set([...deleted, ...stillBuilt, ...BUILD_TIME, ...await reachableDatasets()]);
  const dirs = (await readdir(join(ROOT, 'data'), { withFileTypes: true }))
    .filter((d) => d.isDirectory()).map((d) => d.name);
  const unaccounted = dirs.filter((d) => !known.has(d)).sort();
  assert.deepEqual(unaccounted, [],
    `these data/ folders are read by no tile and appear in neither list in ${DOC}`);
});


// spec-v998: the list above claims these are built and unreachable. Check the claim rather than
// trusting it -- and check the other direction too, which is what caught `mpfs/`, `icd10cm/` and
// `drg/` sitting under "tile retired" while rvu-payment, icd10-validate and drg-payment load them.
//
// A dataset reaches the browser exactly two ways: a loader call in app.js / lib/ / views/, or a
// `META[id].source.dataset` declaration. Nothing else. Every apparent mention of one of these
// names in app.js is its TILE id inside a REMOVED_V29_IDS tombstone, which is why a plain grep
// gives the wrong answer here.
async function reachableDatasets() {
  const files = ['app.js'];
  for (const d of ['lib', 'views']) {
    for (const f of await readdir(join(ROOT, d))) if (f.endsWith('.js')) files.push(`${d}/${f}`);
  }
  const out = new Set();
  for (const f of files) {
    const text = await readFile(join(ROOT, f), 'utf8');
    for (const m of text.matchAll(/load(?:File|Shard|AllShards|Manifest)\('([a-z0-9-]+)'/g)) out.add(m[1]);
  }
  for (const m of Object.values(META)) if (m.source?.dataset) out.add(m.source.dataset);
  return out;
}

test('nothing on the still-built list can actually be loaded', async () => {
  const { stillBuilt } = await lists();
  const reachable = await reachableDatasets();
  const live = stillBuilt.filter((d) => reachable.has(d)).sort();
  assert.deepEqual(live, [],
    `${DOC} lists these under "tile retired" and a live tile loads them; they are not retired`);
});

test('nothing a tile loads is missing from the tree', async () => {
  const reachable = await reachableDatasets();
  const missing = [...reachable].filter((d) => !existsSync(join(ROOT, 'data', d))).sort();
  assert.deepEqual(missing, [], 'code loads these datasets and data/ does not have them');
});
