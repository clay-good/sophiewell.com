// The browser tab, written once.
//
// The pre-rendered page and the app open the same tab for the same tool, and
// they used to write it two different ways: scripts/build-tool-pages.mjs
// clamped to 65 characters and joined the brand with "·", while app.js did
// `name + ' | Sophie Well'` with no clamp at all. 30 tools opened a tab the
// browser cut mid-word in the app -- `thakar-aki` ran 91 characters -- and a
// clamped one on the static page, with a different separator between.
//
// Both now call lib/page-title.js. This holds the property that broke: every
// tile in the catalog has a tab that fits.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageTitle, clampTitle, TITLE_MAX, BRAND } from '../../lib/page-title.js';
import { tileName } from '../../scripts/lib/tile-name.mjs';

function catalogNames() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  assert.ok(arr, 'UTILITIES must be readable from app.js');
  const names = [];
  for (const line of arr[1].split('\n')) {
    const name = tileName(line);
    if (name) names.push(name);
  }
  return names;
}

test('every tile in the catalog gets a tab that fits', () => {
  const names = catalogNames();
  assert.ok(names.length > 1500, `expected the full catalog, got ${names.length}`);
  const over = names.map((n) => [n, pageTitle(n)]).filter(([, t]) => t.length > TITLE_MAX);
  assert.deepEqual(over, [], `${over.length} tabs run past ${TITLE_MAX} characters`);
});

test('a short name keeps the brand, a long one keeps itself', () => {
  assert.equal(pageTitle('Wells Score for DVT'), `Wells Score for DVT · ${BRAND}`);
  // Long enough to crowd out the brand, short enough to print whole.
  const long = 'HLH-2004 Diagnostic Criteria (Hemophagocytic Lymphohistiocytosis)';
  assert.equal(long.length, TITLE_MAX);
  assert.equal(pageTitle(long), long, 'the brand is dropped whole, never half-printed');
  // Longer than the tab: clamped, and never inside a bracket.
  const longer = 'Cleveland Clinic (Thakar) Score, Dialysis-Requiring ARF After Cardiac Surgery';
  const clamped = pageTitle(longer);
  assert.equal(clamped.length, TITLE_MAX);
  assert.ok(clamped.endsWith('…'), 'a cut tab says it was cut');
  assert.equal((clamped.match(/\(/g) || []).length, (clamped.match(/\)/g) || []).length,
    'the cut never leaves a bracket open');
});

test('clampTitle backs a cut out of a bracket', () => {
  const s = 'Name of the thing (with a long parenthetical that will not fit here)';
  const out = clampTitle(s, 40);
  assert.ok(!out.includes('('), `expected the cut to back out of the bracket, got ${out}`);
  assert.ok(out.length <= 40);
});

test('the app and the builder read the same module', () => {
  const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const build = readFileSync(new URL('../../scripts/build-tool-pages.mjs', import.meta.url), 'utf8');
  assert.match(app, /from '\.\/lib\/page-title\.js'/, 'app.js imports the shared title rule');
  assert.match(build, /from '\.\.\/lib\/page-title\.js'/, 'the builder imports the shared title rule');
  // And neither carries a second copy of it.
  assert.doesNotMatch(app, /document\.title\s*=\s*[^;]*\+\s*'[^']*Sophie Well/,
    'app.js must not build a title by concatenating the brand');
});
