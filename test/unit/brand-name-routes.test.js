// spec-v1187: a nurse types the name on the bag, not the name in the paper.
//
// After spec-v1185 and spec-v1186, three bedside queries out of thirty still
// returned NOTHING, and all three failed for one reason: not one of the 664
// synonym entries was a brand name.
//
//   "how much tylenol"     -> nothing, while Acetaminophen 24-Hour Total exists
//   "morphine to dilaudid" -> nothing, while the opioid converter handles both
//   "how much bicarb"      -> nothing, while Bicarbonate Deficit exists
//
// THE ROUTING WAS GROUNDED, NOT GUESSED -- and the grounding is the interesting
// part, because the obvious rule is wrong.
//
// "Send a brand where its GENERIC already lands" sounds principled and produces
// confidently wrong answers: `acetaminophen` lands on King's College criteria
// (non-acetaminophen ALF), `warfarin` on HAS-BLED, `ceftriaxone` on Boston
// febrile-infant criteria, `furosemide` on the Furosemide Stress Test. A brand
// routed there is worse than one that returns nothing -- a nurse asking how much
// Tylenol would get a liver-failure prognosis.
//
// So the rule that shipped is checkable and narrower: route a brand only where
// the landing tile's NAME names that drug, its generic, or the conversion it
// belongs to. Every route below satisfies it, and the ones that could not are
// listed in docs/spec-v1187.md rather than shipped.
//
// RANK 1 IS ASSERTED HERE, unlike the sibling search gates that assert
// membership only. A synonym is matched before ranking and does not depend on
// how the catalog reweights, so it does not go stale when a tile is added --
// which is exactly the reason those other gates avoid position.
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

const top = (q) => (resolvePromptRanked(rankableWords(q) || q, TILES, SYNONYMS, 'all', 3) || [])
  .map((x) => x.tileId)[0];

const ROUTES = [
  ['tylenol', 'apap-24h-max'],
  ['how much tylenol', 'apap-24h-max'],
  ['dilaudid', 'opioid-conversion'],
  ['morphine to dilaudid', 'opioid-conversion'],
  ['narcan', 'naloxone'],
  ['zosyn', 'abx-renal'],
  ['maxipime', 'abx-renal'],
  ['cipro', 'abx-renal'],
  ['ativan', 'benzodiazepine-equivalence'],
  ['versed', 'benzo-equiv'],
  ['solu-medrol', 'steroid-equiv'],
  ['dilantin', 'corrected-phenytoin'],
  ['vanc', 'vanc-auc'],
  ['levophed', 'norepi-equiv'],
  ['bicarb', 'acid-base-deficit'],
  ['how much bicarb', 'acid-base-deficit'],
  ['lovenox', 'vte-prophylaxis-dose'],
  ['diprivan', 'ketamine-propofol'],
];

for (const [query, tile] of ROUTES) {
  test(`"${query}" reaches ${tile}`, () => {
    assert.equal(top(query), tile);
  });
}

// The rule the routes were chosen by, asserted rather than described: a brand
// may not be sent to a tile whose name says nothing about it. This is what stops
// the next batch from shipping "warfarin -> HAS-BLED".
test('every brand route lands on a tile whose name carries the drug or its converter', () => {
  const NAMES = Object.fromEntries(TILES.map((t) => [t.id, t.name.toLowerCase()]));
  // The word the tile's name must carry for each route to be legible.
  const EVIDENCE = {
    'apap-24h-max': 'acetaminophen',
    'opioid-conversion': 'opioid',
    naloxone: 'naloxone',
    'abx-renal': 'antibiotic',
    'benzodiazepine-equivalence': 'benzodiazepine',
    'benzo-equiv': 'benzodiazepine',
    'steroid-equiv': 'steroid',
    'corrected-phenytoin': 'phenytoin',
    'vanc-auc': 'vancomycin',
    'norepi-equiv': 'norepinephrine',
    'acid-base-deficit': 'bicarbonate',
    'vte-prophylaxis-dose': 'enoxaparin',
    'ketamine-propofol': 'propofol',
    vasopressor: 'vasopressor',
  };
  for (const [, tile] of ROUTES) {
    assert.ok(NAMES[tile], `${tile} must be a catalog tile`);
    assert.ok(NAMES[tile].includes(EVIDENCE[tile]),
      `${tile} is named "${NAMES[tile]}" and does not carry "${EVIDENCE[tile]}"`);
  }
});
