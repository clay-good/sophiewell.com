// plain-language-search task 5.3: the search corpus is an accelerator, not a dependency. When both corpus
// files fail to load, app.js tileCorpus() gives every tile an empty description (corpusDesc(undefined)) and,
// if the synonym table failed too, there are no synonyms. Search must still route a tool's own name to it.
// The names here are the catalog's own (the corpus index carries the same name as UTILITIES); only the
// description channel is removed, as it is in the browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../../lib/meta.js';
import { corpusDesc } from '../../lib/search-corpus.js';
import { resolvePromptRanked, rankableWords } from '../../lib/prompt.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const corpus = JSON.parse(readFileSync(ROOT + 'data/search-corpus/corpus.json', 'utf8'));
const ORDER = [...readFileSync(ROOT + 'app.js', 'utf8').matchAll(/^ {2}\{ id: '([^']+)',/gm)].map((m) => m[1]).filter((id) => corpus[id]);
const bare = ORDER.map((id) => ({
  id, name: corpus[id].name, group: corpus[id].group, audiences: corpus[id].audiences || [],
  desc: corpusDesc(undefined),
  tags: (META[id] && Array.isArray(META[id].tags)) ? META[id].tags : [],
  specialties: (META[id] && Array.isArray(META[id].specialties)) ? META[id].specialties : [],
}));
const top = (q) => resolvePromptRanked(rankableWords(q) || q, bare, [], 'all', 3).map((r) => r.tileId);

test('with no corpus, every description is empty', () => {
  assert.equal(corpusDesc(undefined), '');
  assert.ok(bare.length > 2000);
});

test('with no corpus and no synonyms, a tool name still routes to that tool', () => {
  for (const [q, id] of [
    ['wells score for pe', 'wells-pe'], ['heart score', 'heart'], ['apgar', 'apgar'], ['cockcroft gault', 'cockcroft-gault'],
    ['glasgow coma scale', 'gcs'], ['curb-65', 'curb-65'], ['t-macs', 't-macs'], ['noise dose', 'osha-noise-dose'],
  ]) {
    assert.equal(top(q)[0], id, `${q}: ${top(q).join(', ')}`);
  }
});
