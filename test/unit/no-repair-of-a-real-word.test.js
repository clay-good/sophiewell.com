// spec-v1190: a token the catalog knows is not a typo.
//
// `lib/prompt.js` has TWO edit-distance repair paths, and only one of them ever
// asked whether the word was already a word:
//
//   tokenEditFallback    skips a token when `hasToken(vocab, t)` -- the tile
//                        vocabulary built from every name and description.
//   synonymEditFallback  skipped a token only when it appeared in a SYNONYM
//                        PHRASE, and nothing else.
//
// So a correctly spelled English word that no synonym happens to use was fair
// game. `bag` is one edit from `eag`, and every bag question a nurse asks --
// "iv bag", "bag of fluid", "how long will this bag last" -- was rewritten to
// "eag" and answered by the A1c converter, with Concentration-to-Rate and
// Infusion Time Remaining sitting underneath it. `bag` appears in five tiles.
//
// One rule written twice, and only one copy got the guard.
//
// BOTH DIRECTIONS ARE ASSERTED. The failure this creates if overdone is the
// mirror image -- a real typo that stops being repaired -- so the genuine
// misspellings the repair exists for are pinned here beside the words it must
// leave alone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { corpusDesc } from '../../lib/search-corpus.js';
import { resolvePromptRanked, rankableWords } from '../../lib/prompt.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));
const corpus = read('data/search-corpus/corpus.json');
const detail = read('data/search-corpus/corpus-detail.json');
const SYNONYMS = read('data/synonyms.json').entries;

const TILES = Object.keys(corpus).map((id) => ({
  id,
  name: corpus[id].name,
  group: corpus[id].group,
  audiences: corpus[id].audiences || [],
  desc: corpusDesc({ ...corpus[id], ...(detail[id] || {}) }),
  tags: [],
  specialties: (META[id] && Array.isArray(META[id].specialties)) ? META[id].specialties : [],
}));

const probe = (q, n = 5) =>
  (resolvePromptRanked(rankableWords(q) || q, TILES, SYNONYMS, 'all', n) || []).map((x) => x.tileId);

// `bag` is in five tiles, so it is a word this catalog uses. No bag question may
// be answered by the estimated-average-glucose converter.
for (const q of ['bag', 'iv bag', 'bag of fluid', 'how long will this bag last']) {
  test(`"${q}" is not repaired into eag`, () => {
    const r = probe(q);
    assert.ok(!r.includes('eag-a1c'),
      `a bag question reached the A1c converter: ${r.join(', ')}`);
  });
}

test('a bag question reaches something about a bag', () => {
  // Membership, not position: which infusion tile leads is a ranking detail that
  // moves when the catalog does. That one of them is present is the property.
  const r = probe('how long will this bag last');
  assert.ok(r.includes('infusion-time-remaining'), `got ${r.join(', ') || '(nothing)'}`);
});

// The other direction. If the guard were widened to skip repair whenever a token
// merely resembles something, these would stop working -- and repairing a real
// misspelling is the entire reason the pass exists.
for (const [typo, want] of [
  ['wels', /^wells-/],
  ['wels score', /^wells-/],
  ['heprin drip', /^heparin-/],
]) {
  test(`"${typo}" is still repaired`, () => {
    const r = probe(typo);
    assert.ok(r.some((id) => want.test(id)),
      `a genuine misspelling stopped being repaired: ${r.join(', ') || '(nothing)'}`);
  });
}
