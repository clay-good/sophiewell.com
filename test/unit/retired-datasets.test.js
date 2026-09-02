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
  const readByATile = new Set(Object.values(META).map((m) => m.source?.dataset).filter(Boolean));
  const known = new Set([...deleted, ...stillBuilt, ...BUILD_TIME, ...readByATile]);
  const dirs = (await readdir(join(ROOT, 'data'), { withFileTypes: true }))
    .filter((d) => d.isDirectory()).map((d) => d.name);
  const unaccounted = dirs.filter((d) => !known.has(d)).sort();
  assert.deepEqual(unaccounted, [],
    `these data/ folders are read by no tile and appear in neither list in ${DOC}`);
});
