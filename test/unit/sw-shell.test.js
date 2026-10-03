// Guard: the service-worker precache list must contain every local asset the
// application shell (index.html) references, so an offline cold reload renders
// the complete shell -- not a broken logo or missing favicons.
//
// This is the durable fix for the spec-v75/spec-v84 drift class: SHELL_ASSETS
// is hand-maintained, and twice now it fell behind index.html (v75 missed the
// two shell scripts; v84 the icon/manifest links and the topbar logo). The
// install-time fetch swallows individual failures, so a missing entry never
// surfaces at runtime -- only here.
//
// It reads in both directions. It used to allow extras, on the grounds that
// CHANGELOG.md and docs/stability.md were fetched by JS rather than by the
// HTML -- true when the #changelog and #stability routes existed, and false
// from the moment those routes were removed. Nothing referenced either file
// afterwards and nothing noticed, so every visitor's install went on
// downloading 1.35 MB of changelog that no page links to. An entry the shell
// does not load is as much a defect as one it loads and cannot find.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Local resource references in index.html: <link href>, <script src>, <img src>
// pointing at a same-origin relative path (not http(s)://, //, #, mailto:, data:).
function indexHtmlLocalAssets() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const assets = new Set();
  const tagRe = /<(?:link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const url = m[1].trim();
    if (/^(?:https?:)?\/\//.test(url)) continue; // absolute / protocol-relative
    if (/^(?:#|mailto:|data:|tel:)/.test(url)) continue; // anchors / non-asset schemes
    // Normalize to the './x' form SHELL_ASSETS uses.
    assets.add('./' + url.replace(/^\.?\//, ''));
  }
  return assets;
}

// spec-v1541: the shell is the root of the offline pack, and lives with the
// builder that walks the rest of the app from it.
async function shellAssets() {
  const { SHELL_ASSETS } = await import('../../scripts/build-precache.mjs');
  return new Set(SHELL_ASSETS);
}

test('sw.js precaches every local asset index.html references', async () => {
  const referenced = indexHtmlLocalAssets();
  const precached = await shellAssets();
  // index.html must reference something -- guard against a regex that matched nothing.
  assert.ok(referenced.size >= 6, `expected >=6 local assets in index.html, found ${referenced.size}`);
  const missing = [...referenced].filter((a) => !precached.has(a));
  assert.deepEqual(
    missing,
    [],
    `SHELL_ASSETS is missing shell assets index.html loads: ${missing.join(', ')}. `
      + 'Add them to SHELL_ASSETS in scripts/build-precache.mjs so an offline cold reload renders the full shell.'
  );
});

test('sw.js precaches nothing the shell does not load', async () => {
  const referenced = indexHtmlLocalAssets();
  // The document itself, under both the names a navigation can arrive as. No
  // tag inside it references it, and precaching it is the whole point.
  const SELF = new Set(['./', './index.html']);
  const extra = [...(await shellAssets())].filter((a) => !SELF.has(a) && !referenced.has(a));
  assert.deepEqual(
    extra,
    [],
    `SHELL_ASSETS precaches ${extra.join(', ')}, which index.html does not load. `
      + 'Either the shell stopped referencing it -- drop it from scripts/build-precache.mjs -- or it is '
      + 'fetched some other way, in which case say where, here.'
  );
});

test('sw.js SHELL_ASSETS entries are all relative ./ paths (no /data/* manifests)', async () => {
  for (const a of await shellAssets()) {
    assert.ok(a.startsWith('./'), `SHELL_ASSETS entry "${a}" must be a relative ./ path`);
    assert.ok(!a.includes('/data/'), `SHELL_ASSETS must not precache data shards (got "${a}"); the builder adds the pack's data after the shell`);
  }
});
