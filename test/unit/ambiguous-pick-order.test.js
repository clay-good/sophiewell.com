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
import { buildNameCounts, buildNameIndex, findNamed } from '../../lib/name-match.js';

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

// A search phrase captures any query that is a whole word inside it (lib/synonyms.js, rule 2), and
// the shortest such phrase wins. So a new tool's phrase "aluminum in tpn" took the bare word "tpn"
// from the TPN calculator, and "vancomycin infusion time" took "vancomycin" from the vancomycin AUC
// tool. These are the words that were taken that way in October 2026 and given back.
test('a bare drug or topic word still reaches the tool that owned it', () => {
  const owners = { vancomycin: 'vanc-auc', tpn: 'tpn-macro', gir: 'gir', crrt: 'crrt-dose', aminoglycoside: 'aminoglycoside', clearance: 'egfr', energy: 'icu-nutrition-target', carboplatin: 'calvert-carboplatin', noise: 'noise-exposure', lead: 'blood-lead' };
  for (const withDetail of [false, true]) {
    for (const [word, owner] of Object.entries(owners)) {
      const top = resolvePromptRanked(word, tiles(withDetail), SYNONYMS, 'all', 3);
      assert.equal(top[0].tileId, owner, `${word}: ${top.map((r) => r.tileId).join(', ')}`);
    }
  }
});

test('where a word fits several tools, the older ones are still offered', () => {
  const offered = { digoxin: ['digoxin', 'digifab-dosing'], nitrogen: ['nitrogen-balance'], phosphate: ['calcium-phosphate-product'], compounding: ['compounding-bud'], auc: ['vanc-auc'] };
  for (const [word, want] of Object.entries(offered)) {
    const top = resolvePromptRanked(word, tiles(true), SYNONYMS, 'all', 3).map((r) => r.tileId);
    for (const id of want) assert.ok(top.includes(id), `${word}: ${top.join(', ')}`);
  }
});


// The search list promotes the tool a query NAMES with two distinctive words over a curated phrase
// (app.js, findNamed with minHits 2). A new tool called "DOAC Dose by Indication and Kidney
// Function" therefore took "kidney function" from the eGFR tool, and again only the browser suite
// saw it. These are the curated phrases the browser suite types; no tool's name may claim them.
test('no tool name claims a curated phrase the home box routes by synonym', () => {
  const named = ORDER.map((id) => ({ id, name: corpus[id].name }));
  const byId = new Map(named.map((t) => [t.id, t]));
  const index = buildNameIndex(named);
  const counts = buildNameCounts(named.map((t) => t.name));
  for (const [phrase, owner] of [['kidney function', 'egfr'], ['they denied it', 'appeal-letter']]) {
    const hit = findNamed(phrase, index, counts, (id) => byId.get(id), { minHits: 2 });
    assert.ok(!hit || hit.id === owner, `"${phrase}" is named by ${hit && hit.id} ("${hit && hit.name}")`);
    assert.equal(resolvePromptRanked(rankableWords(phrase) || phrase, tiles(true), SYNONYMS, 'all', 3)[0].tileId, owner);
  }
});
