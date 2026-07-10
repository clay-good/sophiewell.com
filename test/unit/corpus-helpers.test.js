// Pure helpers shared by the browser prompt bar and the MCP find_calculator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { corpusDesc, corpusOneLiner } from '../../lib/search-corpus.js';

test('corpusDesc: flattens prose fields; empty for a bare row', () => {
  assert.equal(corpusDesc({ summary: 'A', bands: ['B', 'C'], what: 'D' }), 'A B C D');
  assert.equal(corpusDesc(null), '');
  assert.equal(corpusDesc({}), '');
});

test('corpusOneLiner: prefers what, else first sentence of summary, trimmed', () => {
  assert.equal(corpusOneLiner({ what: 'What this is', summary: 'Long summary.' }), 'What this is');
  assert.equal(corpusOneLiner({ summary: 'First sentence. Second sentence.' }), 'First sentence');
  assert.equal(corpusOneLiner({}), '');
  const long = 'x'.repeat(200);
  assert.ok(corpusOneLiner({ summary: long }, 120).length <= 120);
});
