// spec-v1185: a tile must be findable by the things it can ANSWER FOR, not only
// by the prose someone wrote about it.
//
// The search corpus indexed a tile's name, summary and interpretation bands and
// nothing else. So `opioid-conversion` -- whose two picklists list thirteen
// source opioids and thirteen targets -- was invisible to the drugs it converts
// between:
//
//   "hydromorphone"            -> nothing
//   "fentanyl patch conversion" -> catch-head, at rank 1
//
// Not a bad ranking: an EMPTY RESULT, while the tile that does exactly that sat
// in the catalog. The same held for `abx-renal` and cefepime, piperacillin,
// tazobactam -- a renal antibiotic dose is a bedside question, and the drug name
// is how it gets asked.
//
// The values were never missing. They ship in every adapter's field registry and
// in data/fields/; the corpus builder simply never read them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { corpusDesc } from '../../lib/search-corpus.js';
import { resolvePromptRanked, rankableWords } from '../../lib/prompt.js';
import { corpusOneLiner } from '../../lib/search-corpus.js';

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

// MEMBERSHIP, never position. A ranking derived from the whole catalog is not a
// constant: any tile added, retired or renamed reweights it, so asserting "rank
// 2" books a failure for the next wave that ships a tile.
const CASES = [
  ['hydromorphone', 'opioid-conversion'],
  ['oxymorphone', 'opioid-conversion'],
  ['cefepime', 'abx-renal'],
  ['tazobactam', 'abx-renal'],
];

for (const [query, tile] of CASES) {
  test(`"${query}" finds ${tile}`, () => {
    assert.ok(probe(query).includes(tile),
      `${tile} accepts "${query}" as an option and must be findable by it; got ${probe(query).join(', ') || '(nothing)'}`);
  });
}

test('option words are indexed only where they discriminate', () => {
  const df = new Map();
  let tiles = 0;
  for (const row of Object.values(detail)) {
    if (!row.answers) continue;
    tiles += 1;
    for (const w of new Set(row.answers.split(' '))) df.set(w, (df.get(w) || 0) + 1);
  }
  // The reach, asserted: "clean" must not come to mean "indexed nothing".
  // Measured at 205 tiles / 637 words when this shipped; the floors sit below
  // that with room, because the exact counts move whenever a tile is added or an
  // adapter's picklist changes.
  assert.ok(tiles >= 150, `expected many tiles to carry option words; saw ${tiles}`);
  assert.ok(df.size >= 450, `expected many distinct option words; saw ${df.size}`);

  // A picklist is mostly generic answer vocabulary. Unfiltered, `yes` was an
  // option on 95 tiles, `none` on 73, `female` on 49 -- indexing those makes
  // "other" a query that returns tiles. The cut is by discriminating power, so
  // this asserts the property rather than a list of banned words.
  const shared = [...df].filter(([, n]) => n > 2).map(([w, n]) => `${w} (${n} tiles)`);
  assert.deepEqual(shared, [],
    'these option words name too many tiles to tell a reader anything apart');

  // And the words that carry the signal survived the cut.
  for (const w of ['hydromorphone', 'cefepime']) {
    assert.ok(df.has(w), `${w} is a drug a reader searches for and must stay indexed`);
  }
  // While the generic vocabulary did not.
  for (const w of ['yes', 'none', 'other', 'female', 'normal', 'severe']) {
    assert.ok(!df.has(w), `${w} is generic picklist vocabulary and must not be indexed`);
  }
});

// `answers` is an INDEX channel, and must stay one.
//
// These are registry values written for agents, not sentences for a person --
// this repo has already printed one to a reader once (`onevaso`, from the MCP
// field registry) -- so they belong in the text the ranker reads and nowhere a
// reader or an agent sees. `corpusOneLiner` is the display path (the search
// result's second line, and the same helper the static tool pages use), and
// `mcp/tools.js` returns each candidate's `summary` rather than its `desc`.
//
// This pins the display half, which is the half a person would notice.
test('the option words never reach the display one-liner', () => {
  const withAnswers = Object.entries(detail).filter(([, r]) => r.answers);
  assert.ok(withAnswers.length >= 150, `expected many rows to carry answers; saw ${withAnswers.length}`);

  for (const [id, row] of withAnswers) {
    const shown = corpusOneLiner({ ...corpus[id], ...row });
    for (const word of row.answers.split(' ')) {
      // A word may legitimately appear because the SUMMARY says it. What must
      // not happen is the one-liner reaching into `answers` for its text -- so
      // the test is that the one-liner is a prefix of the prose fields, never of
      // the appended token list.
      if (!shown.includes(word)) continue;
      const prose = `${row.what || ''} ${row.summary || ''} ${row.expected || ''}`.toLowerCase();
      assert.ok(prose.includes(word),
        `${id}: one-liner shows "${word}", which only exists in the option-word channel`);
    }
  }
});

// And a row that carries ONLY option words must render no one-liner at all,
// rather than a bare list of drug names where a sentence belongs.
test('a row with nothing but option words shows no one-liner', () => {
  assert.equal(corpusOneLiner({ answers: 'hydromorphone oxymorphone tapentadol' }), '');
});
