// find_calculator strips numbers from a query so values do not compete with names (spec-v765). That also
// stripped identifiers that are the curated phrase itself -- "usp 797 bud", "sb 1164", "texas 10 day rule"
// -- and 28 phrases could not reach their own tool (found October 16, 2026). Every curated phrase that
// contains a digit must put its tool in the top 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findCalculator } from '../../mcp/tools.js';
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
