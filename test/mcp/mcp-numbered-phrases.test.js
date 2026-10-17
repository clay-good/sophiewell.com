// find_calculator strips numbers from a query so values do not compete with names (spec-v765). That also
// stripped identifiers that are the curated phrase itself -- "usp 797 bud", "sb 1164", "texas 10 day rule"
// -- and 28 phrases could not reach their own tool (found October 16, 2026). Every curated phrase that
// contains a digit must put its tool in the top 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findCalculator, answerQuery } from '../../mcp/tools.js';
import { REGISTRY } from '../../mcp/catalog.js';

const entries = JSON.parse(readFileSync(new URL('../../data/synonyms.json', import.meta.url), 'utf8')).entries;

test('every curated phrase with a number in it reaches its own tool', () => {
  const misses = [];
  let n = 0;
  for (const e of entries) {
    if (!REGISTRY.has(e.tile)) continue;
    for (const p of e.phrases) {
      if (!/\d/.test(p)) continue;
      n += 1;
      const ids = (findCalculator({ query: p, limit: 3 }).candidates || []).map((c) => c.id);
      if (!ids.includes(e.tile)) misses.push(`${p} -> ${ids.join(', ') || '(nothing)'} [${e.tile}]`);
    }
  }
  assert.ok(n > 300, `only ${n} numbered phrases`);
  assert.deepEqual(misses, []);
});

test('a value in an ordinary question is still stripped', () => {
  const r = findCalculator({ query: 'crcl for a 72 year old woman 68 kg creatinine 1.4', limit: 3 });
  assert.ok(r.candidates.some((c) => /cockcroft|crcl|creatinine/i.test(c.id + c.name)), JSON.stringify(r.candidates.map((c) => c.id)));
});

test('answer_query: a curated phrase with no values points to its tool; a weak guess is still a miss', () => {
  for (const [q, tile] of [['usp 797 bud', 'compounding-bud'], ['kidney function', 'egfr']]) {
    const r = answerQuery({ query: q });
    assert.deepEqual([r.code, r.tile], ['NO_VALUES', tile], q);
  }
  assert.equal(answerQuery({ query: 'what is the meaning of life' }).code, 'NO_MATCH');
  assert.equal(answerQuery({ query: 'index' }).code, 'NO_MATCH', 'one word of the phrase "lee index" is not the phrase');
});

test('answer_query: a calculator named in full is the one answered, never a neighbour', () => {
  // Found October 16, 2026 by asking answer_query for every calculator's own name: four did not come back.
  for (const [q, tile] of [
    ["Hy's Law (drug-induced liver injury)", 'hys-law'],
    ['HOMA-B (Steady-State β-Cell Function)', 'homa-beta'],
    ['Assistant / Co- / Team-Surgeon Payment', 'multi-surgeon-pay'],
    ['DIPSS-Plus (myelofibrosis survival score)', 'dipss-plus-mf'],
  ]) assert.equal(answerQuery({ query: q }).tile, tile, q);
});
