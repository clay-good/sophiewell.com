// The home box asks instead of guessing when its top matches tie (spec-v756), and offers the first
// three of the tie in catalog order. A new tool whose NAME happens to carry a tied word ("Sodium
// Chloride", "21 CFR") therefore pushes one of the intended choices off the card. That shipped once:
// "correct the sodium" offered an isotonicity tool first and dropped the sodium-correction planner,
// and only the browser suite, which no local gate runs, saw it. This is that check, in the unit suite.
import { test } from 'node:test';
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
// Ties break in catalog order, so the tiles are taken in the order app.js lists them.
const ORDER = [...readFileSync(ROOT + 'app.js', 'utf8').matchAll(/^ {2}\{ id: '([^']+)',/gm)].map((m) => m[1]).filter((id) => corpus[id]);

// app.js tileCorpus(): before the detail tier has loaded, and after.
const tiles = (withDetail) => ORDER.map((id) => ({
  id, name: corpus[id].name, group: corpus[id].group, audiences: corpus[id].audiences || [],
  desc: corpusDesc(withDetail ? { ...corpus[id], ...(detail[id] || {}) } : corpus[id]),
  tags: (META[id] && Array.isArray(META[id].tags)) ? META[id].tags : [],
  specialties: (META[id] && Array.isArray(META[id].specialties)) ? META[id].specialties : [],
}));
// app.js ambiguousMatches(): the choices on the card, or null when the box routes without asking.
const MARGIN = 0.95;
function picks(query, withDetail) {
  const ranked = resolvePromptRanked(rankableWords(query) || query, tiles(withDetail), SYNONYMS, 'all', 4);
  if (ranked.length < 2 || ranked[0].why === 'synonym' || ranked[1].score < ranked[0].score * MARGIN) return null;
  return ranked.filter((r) => r.score >= ranked[0].score * MARGIN).slice(0, 3).map((r) => r.tileId);
}

test('the catalog order was read', () => {
  assert.ok(ORDER.length > 2000);
  assert.equal(new Set(ORDER).size, ORDER.length);
});

test('"correct the sodium" offers the two sodium questions, corrected sodium first', () => {
  for (const withDetail of [false, true]) {
    const card = picks('correct the sodium', withDetail);
    assert.ok(card, 'the box should ask, not route');
    assert.equal(card[0], 'corrected-sodium', card.join(', '));
    assert.ok(card.includes('sodium-correction'), card.join(', '));
  }
});

test('a regulation number in a tool name does not make an NDC look like that tool', () => {
  for (const withDetail of [false, true]) {
    const top = resolvePromptRanked('00003-0893-21', tiles(withDetail), SYNONYMS, 'all', 5).map((r) => r.tileId);
    assert.ok(!top.includes('pn-aluminum-load'), top.join(', '));
  }
});
