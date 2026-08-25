#!/usr/bin/env node
// Tile ids are addresses, not words. This gate keeps them out of the prose a
// reader sees on the tile.
//
// 549 tiles ended their on-screen explanation with a line written for whoever
// maintains the catalog: "Near-neighbors: curb-65, psi, smart-cop." Raw ids, in
// the middle of a sentence aimed at someone holding a patient chart. 95% of
// them named a tile the page already listed under "Related tools:", by its real
// name and as a link; 34 named nothing at all -- `qsofa`, `crb-65`,
// `egfr-ckd-epi` and 31 more are not ids, so a reader who went looking for one
// found nothing.
//
// `META[id].related` is where a sibling tile belongs: the app renders it as the
// tile's name and links it. So a bare id in prose is always either a duplicate
// of that or a dead pointer, and this check says so.
//
// What counts as a violation: a hyphenated lowercase token that IS a catalog
// id, inside a string a view renders. Hyphenated words that merely look like
// ids ("age-adjusted", "well-being") are not ids and never match. A tile whose
// id is also an ordinary word would be a false positive, so single-word ids are
// exempt -- the pattern this exists to catch is the multi-word slug.
//
// Exit 0 clean, 1 on any violation. `findTileIdCopy` is exported so
// test/unit can prove the gate bites on a reintroduced line.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

// The helpers that put a string on screen. A string handed to one of these is
// read by a person; a string anywhere else in a view (a dom id, a data key, a
// route) is not.
const RENDERERS = /\b(?:note|postureNote|introNote)\s*\(/;

// A hyphenated lowercase slug: two or more segments, which is what a tile id
// looks like and what an English word does not. Single-segment ids are left
// alone -- several are ordinary words ("forrest", "bethesda") and matching them
// would fire on prose.
const SLUG = /\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/g;

// Slugs that are real words or standard terms in this domain and happen to be
// hyphenated the same way. Checked before the catalog lookup, so a term stays
// usable in prose even if a tile is later given that id.
const PROSE = new Set([
  'age-adjusted', 'follow-up', 'well-being', 'x-ray', 'left-to-right',
  'right-to-left', 'point-of-care', 'end-of-life', 'time-to-event',
  // A tile id that is also the ordinary name of the thing: RIFLE and AKIN
  // both stage on "the creatinine and urine-output criteria", which is the
  // measurement, not a link to the tile that computes it.
  'urine-output',
]);

// findTileIdCopy(text, isId) -> [{ line, id, snippet }]. Pure; line-numbered.
// `isId` answers "is this string a catalog tile id?" so the detector can be
// unit-tested without loading the catalog.
export function findTileIdCopy(text, isId) {
  const out = [];
  const lines = String(text || '').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!RENDERERS.test(line)) continue;
    if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) continue;
    const seen = new Set();
    for (const m of line.matchAll(SLUG)) {
      const id = m[0];
      if (seen.has(id) || PROSE.has(id) || !isId(id)) continue;
      seen.add(id);
      out.push({ line: i + 1, id, snippet: line.trim().slice(0, 140) });
    }
  }
  return out;
}

async function main() {
  const { META } = await import(join(ROOT, 'lib', 'meta.js'));
  const ids = new Set(Object.keys(META));
  const isId = (s) => ids.has(s);
  const names = (await readdir(join(ROOT, 'views'))).filter((n) => n.endsWith('.js'));
  const violations = [];
  for (const name of names) {
    const rel = `views/${name}`;
    const text = await readFile(join(ROOT, rel), 'utf8');
    for (const v of findTileIdCopy(text, isId)) {
      violations.push(`${rel}:${v.line}  names "${v.id}"  ${v.snippet}`);
    }
  }
  if (violations.length) {
    console.error(`check-tile-copy: FAIL -- ${violations.length} on-screen line(s) name a tile by its id.`);
    console.error('  Use the tile\'s name in the sentence, and put the id in META[<id>].related');
    console.error('  so the app renders it as a named link under "Related tools:".');
    for (const v of violations.slice(0, 30)) console.error('  ' + v);
    if (violations.length > 30) console.error(`  ... and ${violations.length - 30} more`);
    process.exit(1);
  }
  console.log(`check-tile-copy: clean (${names.length} view files scanned; no tile ids in on-screen copy).`);
}

if (process.argv[1] && process.argv[1].endsWith('check-tile-copy.mjs')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
