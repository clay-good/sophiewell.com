#!/usr/bin/env node
// spec-v913: find tiles that are the SAME instrument twice.
//
// Run: node scripts/find-duplicate-tiles.mjs
//
// This is a FINDER, not a gate. It reports candidate pairs and a human decides; the four
// duplicates it was written to surface were all confirmed by reading both adapters, and three
// other pairs that looked identical by every automatic signal turned out to be deliberate.
//
// Why it is not automatic:
//
//   Comparing COMPUTED OUTPUT over the whole input space is too coarse. Any two tiles that
//   return a plain 0..N total match each other -- the first cut paired Guy's stone score with an
//   anaphylaxis grade.
//
//   Comparing DECLARED INPUT SIGNATURES is too narrow. The same instrument gets built twice with
//   different field counts and different unit toggles, so three of the four real duplicates have
//   different signatures and this misses them.
//
//   What actually works is the tile NAME. Two authors building the same instrument years apart
//   write nearly the same name, because the instrument has a name.
//
// So: normalize names, drop the words every tile shares, and report pairs above a similarity
// floor. It is deliberately noisy -- most hits are legitimate families (ICHD-3 has seven, the
// RADS reporting systems several) -- and the reader is expected to reject most of them.
//
// The floor is 0.55 rather than 0.6 because one of the four confirmed duplicates sits at 0.57:
// "University of Texas Diabetic Foot WOUND Classification" against "University of Texas Diabetic
// Foot ULCER Class". One word apart on the thing they both name, and a 0.6 floor hid it.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CORPUS = fileURLToPath(new URL('../data/search-corpus/corpus.json', import.meta.url));

// Words that appear in so many tile names that they carry no signal about which instrument
// this is.
const STOP = new Set([
  'the', 'of', 'and', 'for', 'in', 'a', 'an', 'score', 'scale', 'index', 'criteria',
  'classification', 'system', 'tool', 'grade', 'grading', 'staging', 'stage', 'risk', 'rule',
  'test', 'assessment', 'calculator', 'model', 'definition', 'definitions',
]);

// The parenthetical is dropped: it is where a tile says which VARIANT it is, and two tiles of
// the same instrument routinely disagree there while naming the same thing.
export function nameKey(name) {
  const base = String(name).toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9 ]/g, ' ');
  return [...new Set(base.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].sort();
}

export function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((w) => b.includes(w)).length;
  return shared / (a.length + b.length - shared);
}

export function candidatePairs(corpus, floor = 0.55) {
  const rows = Object.entries(corpus).map(([id, r]) => ({ id, name: r.name, key: nameKey(r.name) }));
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const score = similarity(rows[i].key, rows[j].key);
      if (score >= floor) out.push({ score, a: rows[i], b: rows[j] });
    }
  }
  return out.sort((x, y) => y.score - x.score);
}

// Pairs already read and ruled on, so a re-run shows only what is new. A verdict here is a
// claim that someone opened both adapters. The four RETIRED entries no longer appear in the
// corpus and so no longer match; they stay as the record of what was removed and why.
// claim that someone opened both adapters.
export const RULED = new Map(Object.entries({
  'forrest|forrest-classification': 'RETIRED in spec-v914 -- one instrument, one input, same six classes.',
  'gbs|glasgow-blatchford': 'RETIRED in spec-v914 -- the same Blatchford 2000 score; the survivor takes urea in either unit.',
  'osi-oxygenation|oxygenation-index': 'RETIRED in spec-v914 -- the survivor returns the same OSI and the same band, and an OI besides.',
  'university-texas-dfu|ut-diabetic-foot': 'RETIRED in spec-v914 -- the same grade-by-stage grid; the survivor is the fuller build.',
  'npiap-staging|pressure-injury-stage': 'DISTINCT -- one DERIVES the stage from observations, the other explains a stage already assigned.',
  'benzo-equiv|benzodiazepine-equivalence': 'DISTINCT -- overlapping, but benzo-equiv carries midazolam and the other does not.',
  'unit-converter|unit-converter-v4': 'DISTINCT -- overlapping, but unit-converter carries volume and unit-converter-v4 does not.',
}));

function main() {
  const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
  const pairs = candidatePairs(corpus);
  let unruled = 0;
  for (const { score, a, b } of pairs) {
    const verdict = RULED.get(`${a.id}|${b.id}`) || RULED.get(`${b.id}|${a.id}`);
    if (verdict) {
      console.log(`${score.toFixed(2)}  ${a.id} / ${b.id}\n        ${verdict}`);
    } else {
      unruled++;
      console.log(`${score.toFixed(2)}  ${a.id} / ${b.id}   NOT YET RULED ON`);
      console.log(`        ${a.name}`);
      console.log(`        ${b.name}`);
    }
  }
  console.log(`\nfind-duplicate-tiles: ${pairs.length} candidate pairs, ${RULED.size} already ruled on, ${unruled} not yet read.`);
}

if (process.argv[1] && process.argv[1].endsWith('find-duplicate-tiles.mjs')) main();
