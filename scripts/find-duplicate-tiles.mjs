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
import { META } from '../lib/meta.js';

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

// spec-v947: and the same key with the parenthetical KEPT. Dropping it is right when the
// parenthetical says which variant a tile is; it is wrong when the parenthetical holds the
// instrument's name and an acronym stands outside it. "Cincinnati Prehospital Stroke Scale"
// against "CPSS (Cincinnati Prehospital Stroke Scale)" scores 0 on the dropped key and 0.80 on
// this one -- and those two tiles are the same instrument, built twice. Every pair is scored
// both ways and keeps the higher score.
export function nameKeyWithParens(name) {
  const base = String(name).toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  return [...new Set(base.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].sort();
}

export function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((w) => b.includes(w)).length;
  return shared / (a.length + b.length - shared);
}

// spec-v950: a second, independent signal -- do the two tiles cite the SAME PAPER? It is much
// sharper than the name, and on its own it is not evidence of a duplicate: one guideline
// routinely defines several distinct instruments (TG18 grades diagnosis and severity; the SUN
// group grades cell and flare). Every pair that scored on both signals turned out to be a
// companion, so this is reported next to the score rather than used to widen the net -- it
// tells the reader WHY a pair matched, which is what makes a pair quick to rule on.
export function sharesSource(aId, bId, meta = META) {
  const links = (id) => {
    const m = meta[id] || {};
    return new Set([m.citationUrl, ...(m.citationUrls || []).map((e) => e.url)]
      .filter(Boolean).map((u) => u.toLowerCase()));
  };
  const a = links(aId);
  return [...links(bId)].some((u) => a.has(u));
}

// nameScore(a, b) -> number. The higher of the two readings of the name.
export function nameScore(a, b) {
  return Math.max(similarity(a.key, b.key), similarity(a.keyParens, b.keyParens));
}

export function candidatePairs(corpus, floor = 0.55) {
  const rows = Object.entries(corpus).map(([id, r]) => ({
    id, name: r.name, key: nameKey(r.name), keyParens: nameKeyWithParens(r.name),
  }));
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const score = nameScore(rows[i], rows[j]);
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
  'kings-college|kings-college-nonapap': 'DISTINCT -- the two ARMS of one rule, and they share no variables: the acetaminophen arm turns on arterial pH, creatinine and encephalopathy grade, the other on INR, age, cause, jaundice interval and bilirubin (spec-v910).',

  // spec-v947: the four the parenthetical rule had been hiding. Each pair was confirmed by
  // reading both adapters -- same source, same items, same threshold, and in two cases the same
  // worked-example number to the decimal. Retirement is spec-v948.
  'cincinnati|cpss': 'DUPLICATE -- one CPSS: the same three items from Kothari 1999 and the same >=1-abnormal rule. Survivor cpss (it carries the interpretation bands; cincinnati has none).',
  'abc-mtp|abc-transfusion-score': 'DUPLICATE -- one ABC score: the same four Nunez 2009 items and the same >=2 threshold. Survivor abc-transfusion-score (its bands carry the derivation sensitivity and specificity).',
  'hodgkin-ips|ips-hodgkin': 'DUPLICATE -- one Hasenclever IPS: the same seven adverse factors. Survivor hodgkin-ips (its bands give freedom-from-progression per band; ips-hodgkin lists the factors instead of interpreting the score).',
  'sort|sort-mortality': 'DUPLICATE -- one SORT model, coefficient for coefficient, and both worked examples return 14.67%. Survivor sort-mortality (its name says what the number is).',

  // spec-v950: the pairs that are name-similar AND cite the same paper -- the sharpest signal
  // there is, and every one of them turned out to be a COMPANION rather than a duplicate. One
  // guideline or one paper routinely defines several distinct instruments, and the catalog
  // splits them on purpose. Recorded so the finder stops asking.
  'homa-beta|homa-ir': 'DISTINCT -- one HOMA paper, two quantities: beta-cell function and insulin resistance.',
  'spina-gd|spina-gt': 'DISTINCT -- one SPINA paper, two constants: deiodinase activity and thyroid secretory capacity.',
  'nexus-chest|nexus-chest-ct': 'DISTINCT -- the chest-radiograph rule and the chest-CT rule, different criteria sets from the same NEXUS programme.',
  'cholangitis-diagnosis|cholangitis-severity': 'DISTINCT -- TG18 defines diagnosis and severity separately; one says whether, the other says how bad.',
  'cholecystitis-diagnosis|cholecystitis-severity': 'DISTINCT -- same TG18 split as the cholangitis pair.',
  'cholangitis-diagnosis|cholecystitis-diagnosis': 'DISTINCT -- two diseases, one guideline.',
  'cholangitis-severity|cholecystitis-severity': 'DISTINCT -- two diseases, one guideline.',
  'aortic-regurgitation-stage|aortic-stenosis-stage': 'DISTINCT -- two lesions staged by one ACC/AHA guideline.',
  'aortic-stenosis-stage|mitral-stenosis-stage': 'DISTINCT -- two valves staged by one ACC/AHA guideline.',
  'mitral-regurgitation-stage|secondary-mitral-regurgitation-stage': 'DISTINCT -- primary and secondary MR are staged on different variables in the same guideline.',
  'concussion-rtl|concussion-rts': 'DISTINCT -- return to LEARN and return to SPORT are separate graduated ladders in one consensus statement.',
  'engel-classification|ilae-surgical-outcome': 'DISTINCT -- two competing outcome scales for the same operation, reported side by side in the literature.',
  'sun-ac-cell|sun-ac-flare': 'DISTINCT -- the SUN working group grades cell and flare on separate scales.',
  'cdc-stature-for-age|cdc-weight-for-age': 'DISTINCT -- two growth charts from one CDC reference.',
  'posas-observer-scar|posas-patient-scar': 'DISTINCT -- the observer and patient halves of POSAS are scored by different people.',
  'dme-severity|icdr-retinopathy': 'DISTINCT -- the ICDR scale grades retinopathy and macular edema separately.',
  'anion-gap-dd|delta-gap': 'DISTINCT -- overlapping arithmetic, but anion-gap-dd computes the gap itself and delta-gap the ratio against bicarbonate.',
  'ccsr|nexus-cspine': 'DISTINCT -- the single-rule tile and the combined tile that runs NEXUS and the Canadian rule together, the same shape as egfr / egfr-suite.',
  'wells-dvt|wells-dvt-caprini': 'DISTINCT -- the same single-rule / combined-suite shape.',
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
      const same = sharesSource(a.id, b.id) ? '   SAME SOURCE' : '';
      console.log(`${score.toFixed(2)}  ${a.id} / ${b.id}   NOT YET RULED ON${same}`);
      console.log(`        ${a.name}`);
      console.log(`        ${b.name}`);
    }
  }
  console.log(`\nfind-duplicate-tiles: ${pairs.length} candidate pairs, ${RULED.size} already ruled on, ${unruled} not yet read.`);
}

if (process.argv[1] && process.argv[1].endsWith('find-duplicate-tiles.mjs')) main();
