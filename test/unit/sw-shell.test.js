// Guard: the service-worker precache list must contain every local asset the
// application shell (index.html) references, so an offline cold reload renders
// the complete shell -- not a broken logo or missing favicons.
//
// This is the durable fix for the spec-v75/spec-v84 drift class: SHELL_ASSETS
// is hand-maintained, and twice now it fell behind index.html (v75 missed the
// two shell scripts; v84 the icon/manifest links and the topbar logo). The
// install-time fetch swallows individual failures, so a missing entry never
// surfaces at runtime -- only here. The check is one-directional: every local
// href/src in index.html must be precached; SHELL_ASSETS may carry extras (the
// CHANGELOG.md / docs/stability.md doc bodies are fetched by JS, not the HTML).

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

function shellAssets() {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const block = sw.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/);
  assert.ok(block, 'sw.js must declare a SHELL_ASSETS array');
  return new Set(
    [...block[1].matchAll(/'([^']+)'/g)].map((mm) => mm[1])
  );
}

test('sw.js precaches every local asset index.html references', () => {
  const referenced = indexHtmlLocalAssets();
  const precached = shellAssets();
  // index.html must reference something -- guard against a regex that matched nothing.
  assert.ok(referenced.size >= 6, `expected >=6 local assets in index.html, found ${referenced.size}`);
  const missing = [...referenced].filter((a) => !precached.has(a));
  assert.deepEqual(
    missing,
    [],
    `SHELL_ASSETS is missing shell assets index.html loads: ${missing.join(', ')}. `
      + 'Add them to sw.js SHELL_ASSETS so an offline cold reload renders the full shell.'
  );
});

test('sw.js SHELL_ASSETS entries are all relative ./ paths (no /data/* manifests)', () => {
  for (const a of shellAssets()) {
    assert.ok(a.startsWith('./'), `SHELL_ASSETS entry "${a}" must be a relative ./ path`);
    assert.ok(!a.includes('/data/'), `SHELL_ASSETS must not precache data shards (got "${a}"); data is cached lazily via DATA_CACHE`);
  }
});
