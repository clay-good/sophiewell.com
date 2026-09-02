// spec-v995: the guard for the datasets whose SOURCE PROSE is restricted.
//
// docs/legal.md and docs/threat-model.md both name `test/unit/aha-no-flowchart.test.js` and
// `test/unit/cpt-no-ama.test.js` as the automated enforcement of the project's licensing posture:
// numeric facts from AHA, NUBC, CoTCCC and the Ashton Manual are bundled, their published prose is
// not. Both files were deleted by the spec-v29 wave 29-2 prune along with the tiles that used them,
// while the DATA they guarded stayed in the repo and stayed shipped. The claim outlived its proof
// by roughly a year. They are restored beside this file.
//
// This is the half neither of them had: `status: numeric-facts-with-attribution` is a declaration
// any dataset can make, and four of the seven that made it -- benzo-equiv, nubc-special-codes,
// revenue-codes and tccc -- carried no attribution and no notes at all, which is precisely what the
// status is named for. The guard covers the SET, so a new dataset cannot join the category and go
// unexamined: an unlisted one fails here and has to be added deliberately.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATUS = 'numeric-facts-with-attribution';

// Every dataset that declares the restricted-prose status, and the source whose prose is at
// stake. Adding a row is a deliberate act: read the payload before you do.
const DECLARED = {
  'aha-reference': 'AHA flowcharts',
  'cpr-aha-numeric': 'AHA flowcharts',
  'benzo-equiv': 'Ashton Manual',
  'nubc-special-codes': 'NUBC manuals',
  'revenue-codes': 'NUBC manuals',
  'tob-codes': 'NUBC manuals',
  'tccc': 'CoTCCC guidelines',
};

async function manifestsWithStatus() {
  const out = {};
  for (const dir of await readdir(join(ROOT, 'data'), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    let m;
    try { m = JSON.parse(await readFile(join(ROOT, 'data', dir.name, 'manifest.json'), 'utf8')); } catch { continue; }
    if (m.status === STATUS) out[dir.name] = m;
  }
  return out;
}

test('the declared set is exactly the set on disk', async () => {
  const found = await manifestsWithStatus();
  assert.deepEqual(
    Object.keys(found).sort(),
    Object.keys(DECLARED).sort(),
    'a dataset declaring restricted-prose status is not listed in this guard (or vice versa); '
    + 'read its payload and add it here deliberately',
  );
});

test('every one of them states what it does and does not reproduce', async () => {
  const found = await manifestsWithStatus();
  for (const [name, m] of Object.entries(found)) {
    const text = `${m.notes || ''} ${m.attribution || ''}`.trim();
    assert.ok(text.length > 40, `data/${name}/manifest.json declares "${STATUS}" and carries no attribution or notes`);
    assert.match(text, /not (bundled|reproduced|included|derived)/i,
      `data/${name}/manifest.json does not say what is NOT reproduced from ${DECLARED[name]}`);
  }
});

test('no payload carries the AHA algorithm prose', async () => {
  // Phrases characteristic of the published AHA flowcharts. Kept to the two AHA datasets, where
  // the source text is identifiable; the NUBC, CoTCCC and Ashton payloads are guarded by the
  // attribution rule above rather than by phrases invented from memory.
  const FORBIDDEN = [
    /\bshockable rhythm\?\b/i,
    /\bif return of spontaneous circulation\b/i,
    /\bbegin cpr\b/i,
    /\battach monitor\/defibrillator\b/i,
    /\bcheck rhythm every 2 minutes\b/i,
    /\b5 cycles of cpr\b/i,
  ];
  for (const name of ['aha-reference', 'cpr-aha-numeric']) {
    const m = JSON.parse(await readFile(join(ROOT, 'data', name, 'manifest.json'), 'utf8'));
    // Two manifest shapes in the tree: `shards`, a list of objects with a
    // `name`, and -- for aha-reference -- `files`, a list of bare filenames.
    const parts = (m.shards || m.files || []).map((p) => (typeof p === 'string' ? p : p.name));
    assert.ok(parts.length > 0, `data/${name}/manifest.json lists no payload files to check`);
    for (const file of parts) {
      const blob = await readFile(join(ROOT, 'data', name, file), 'utf8');
      for (const pat of FORBIDDEN) {
        assert.equal(pat.test(blob), false, `data/${name}/${file} matches AHA flowchart pattern ${pat}`);
      }
    }
  }
});

test('the two tests the licensing docs name are present', async () => {
  // docs/legal.md, docs/threat-model.md and docs/operations.md each name these by path. A doc that
  // cites an automated check is only as true as the check's existence.
  const files = await readdir(join(ROOT, 'test', 'unit'));
  for (const named of ['aha-no-flowchart.test.js', 'cpt-no-ama.test.js']) {
    assert.ok(files.includes(named), `docs name test/unit/${named} as enforcement and it does not exist`);
  }
});
