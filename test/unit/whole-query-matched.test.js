// spec-v1186: the rubric rewarded ONE matching word more than TWO.
//
// A one-word query IS a phrase, so a single word appearing in a tile's
// description collected `exactPhraseInDesc` (5) as well as `tokenInDesc` (1).
// Two words that both appear, but not adjacently, collected 1 + 1 and fell under
// the threshold of 3. The arithmetic, for `opioid-conversion`:
//
//   "hydromorphone"          6   phrase 5 + token 1   -> found
//   "morphine hydromorphone" 2   token 1 + token 1    -> NOTHING
//
// So naming one drug the converter handles found it, and naming two -- which is
// how anyone actually asks for a conversion -- found nothing at all. spec-v1185
// put those drug names in the index and hit this the moment it tried the second
// word.
//
// `tokenInDesc` stays at 1: scaffolding words each collect +1 across hundreds of
// tiles, and raising it drowns the clinical terms. The signal added instead is
// different in kind -- not "how good is one word" but "did the reader's WHOLE
// question land here" -- and only a tile matching EVERY word can claim it, so it
// lifts a complete answer over the threshold without letting a partial one
// through.
import test from 'node:test';
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

// MEMBERSHIP, never position: a ranking derived from the whole catalog is not a
// constant, and asserting a rank books a failure for the next tile shipped.
for (const q of [
  'morphine to hydromorphone',
  'hydromorphone to morphine',
  'oxycodone to morphine',
  'fentanyl to morphine',
]) {
  test(`"${q}" finds the opioid converter`, () => {
    assert.ok(probe(q).includes('opioid-conversion'),
      `got ${probe(q).join(', ') || '(nothing)'}`);
  });
}

test('the bonus is coverage, and cannot outvote a name match', () => {
  const { RANKER_RUBRIC } = _testing;
  // Below tokenInName, so a tile that merely matches every word of a query can
  // never displace one the reader named. The threshold is what it has to clear.
  assert.ok(RANKER_RUBRIC.allTokensMatched < RANKER_RUBRIC.tokenInName,
    'a whole-query match must not outweigh a word of the tile\'s own name');
  assert.ok(2 * RANKER_RUBRIC.tokenInDesc + RANKER_RUBRIC.allTokensMatched >= RANKER_RUBRIC.threshold,
    'two description words plus the bonus must reach the threshold -- that is the defect this fixes');
  // And a PARTIAL match must still fall short, or the bonus is just a lower
  // threshold wearing a different name.
  assert.ok(RANKER_RUBRIC.tokenInDesc < RANKER_RUBRIC.threshold,
    'one description word alone must not reach the threshold');
});

test('a tile matching only PART of the query does not collect the bonus', () => {
  // Synthetic tiles, because the rule is a property of the scorer and reading it
  // off the live catalog means an escape hatch for every tile that happens to
  // match some other way -- the first version of this test had one, and it
  // passed with the bonus wired to fire on a SINGLE matched token.
  const tiles = [
    { id: 'both', name: 'Alpha', desc: 'zzqqa zzqqb', audiences: [], tags: [], specialties: [] },
    { id: 'one', name: 'Beta', desc: 'zzqqa only', audiences: [], tags: [], specialties: [] },
  ];
  const ranked = _testing.rankTilesAll('zzqqa zzqqb', tiles, 'all');
  const ids = ranked.map((r) => r.tileId);
  assert.ok(ids.includes('both'), 'a tile carrying both words must clear the threshold');
  assert.ok(!ids.includes('one'),
    'a tile carrying one of the two words must NOT -- otherwise the bonus is just a '
    + 'lower threshold wearing a different name');
});
