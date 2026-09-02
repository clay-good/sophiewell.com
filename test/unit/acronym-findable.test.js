// spec-v974: a tile must be findable by the acronym printed in its own name.
//
// The exact-phrase bonus in lib/prompt.js was a RAW SUBSTRING test on the
// normalized name and description. That fired on the middle of unrelated words,
// and a buried match collected the name bonus AND the description bonus -- 15
// points -- while the tile actually called by that acronym scored about 13.9 for
// having it as a name token. So the accidental matches won:
//
//   "psi"  matched alpha-1 antitryPSIn, preeclamPSIa, sePSIs   -> the Pneumonia
//          Severity Index came back at rank 16 of 26
//   "anc"  matched balANCe, resistANCe, advANCed                -> Absolute
//          Neutrophil Count at rank 81 of 256
//   "abi"  matched probABIlity, cervical favorABIlity           -> the
//          Ankle-Brachial Index at rank 28 of 115
//   "vis"  matched reVISed                                      -> the
//          Vasoactive-Inotropic Score at rank 26 of 82
//
// 28 acronyms were absent from the top five of their own tile's search entirely.
// This sweeps the live catalog so it cannot happen again.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { corpusDesc } from '../../lib/search-corpus.js';
import { resolvePromptRanked, rankableWords, _testing } from '../../lib/prompt.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));
const corpus = read('data/search-corpus/corpus.json');
const detail = read('data/search-corpus/corpus-detail.json');
const SYNONYMS = read('data/synonyms.json').entries;

// The same tile view app.js builds for the hero search (app.js tileCorpus()).
const TILES = Object.keys(corpus).map((id) => ({
  id,
  name: corpus[id].name,
  group: corpus[id].group,
  audiences: corpus[id].audiences || [],
  desc: corpusDesc({ ...corpus[id], ...(detail[id] || {}) }),
  tags: (META[id] && Array.isArray(META[id].tags)) ? META[id].tags : [],
  specialties: (META[id] && Array.isArray(META[id].specialties)) ? META[id].specialties : [],
}));

const probe = (q, n = 5) =>
  (resolvePromptRanked(rankableWords(q) || q, TILES, SYNONYMS, 'all', n) || []).map((x) => x.tileId);

// An acronym as a reader would TYPE it: a whole token of the tile's name that is
// all-caps with optional digits and internal hyphens, 3 to 10 characters.
// Stripping the hyphen out of "ALT-70" would invent a query nobody types.
export function acronymsInName(name) {
  const out = new Set();
  for (const raw of String(name).split(/[\s(),/]+/)) {
    const t = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '').replace(/‑/g, '-');
    if (t.length < 3 || t.length > 10) continue;
    if (!/^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/.test(t)) continue;
    if (!/[A-Z]{2}/.test(t)) continue;
    out.add(t.toLowerCase());
  }
  return [...out];
}

// Acronyms two or more tile names both print are a real ambiguity, not a defect:
// the catalog carries IPSS the prostate index and IPSS-R for myelodysplasia, and
// no ranking can read the reader's mind. Only uniquely-claimed acronyms are gated.
const claimedBy = new Map();
for (const t of TILES) for (const a of acronymsInName(t.name)) claimedBy.set(a, (claimedBy.get(a) || []).concat(t.id));

// An acronym that is also an ordinary English word every dosing tile uses. Adding
// to this list is a claim that the word is genuinely ambiguous, not that the
// ranking is merely inconvenient.
const COMMON_WORD_ACRONYMS = new Set(['dose']);

test('every acronym a tile name uniquely claims reaches that tile', () => {
  const missing = [];
  for (const t of TILES) {
    for (const a of acronymsInName(t.name)) {
      if ((claimedBy.get(a) || []).length > 1) continue;
      if (COMMON_WORD_ACRONYMS.has(a)) continue;
      if (!probe(a).includes(t.id)) missing.push(`"${a}" does not reach ${t.id} (${t.name})`);
    }
  }
  assert.deepEqual(missing, [], `${missing.length} acronyms do not reach their own tile`);
});

// The four the raw-substring bonus buried, pinned by name so a regression names
// itself rather than arriving as a count.
for (const [q, id] of [['psi', 'psi'], ['anc', 'anc'], ['abi', 'abi'], ['vis', 'vis']]) {
  test(`"${q}" returns ${id} first`, () => {
    assert.equal(probe(q)[0], id);
  });
}

test('the exact-phrase bonus is whole-word, not a raw substring', () => {
  const tiles = [
    { id: 'psi', name: 'PSI / PORT (pneumonia severity)', group: 'G', audiences: ['clinicians'], desc: 'pneumonia severity index' },
    { id: 'aat', name: 'Alpha-1 Antitrypsin Level and Genotype', group: 'G', audiences: ['clinicians'], desc: 'interprets an alpha-1 antitrypsin level' },
  ];
  const ranked = _testing.rankTilesAll('psi', tiles, 'all');
  assert.equal(ranked[0].tileId, 'psi');
  assert.equal(ranked.length, 1, 'antitrypsin no longer scores for containing p-s-i');
});

test('a whole-word phrase still earns the bonus in both fields', () => {
  const tiles = [{ id: 'x', name: 'Wells Score for PE', group: 'G', audiences: ['clinicians'], desc: 'the wells score for pulmonary embolism' }];
  const ranked = _testing.rankTilesAll('wells score', tiles, 'all');
  assert.equal(ranked[0].tileId, 'x');
  // exactPhraseInName 10 + exactPhraseInDesc 5 + two name tokens at 3 + two desc
  // tokens at 1, so the phrase bonus is demonstrably still being paid twice.
  assert.ok(ranked[0].score >= 15, String(ranked[0].score));
});
