// spec-v1653: the agent summary stated the Epworth bands the tile had dropped on
// October 10 (11-14 mild, 15-17 moderate, 18-24 severe); the result reads 11-12,
// 13-15 and 16-24. Each band the summary names must be the one the result gives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';

test('spec-v1653: epworth summary bands are the bands its results print', () => {
  const c = allCalculators().find((t) => t.id === 'epworth');
  const keys = Object.keys(c.inputSchema.properties);
  const pairs = [...c.summary.matchAll(/(\d+)-(\d+) (normal|mild|moderate|severe)/g)].map((m) => [+m[1], +m[2], m[3]]);
  assert.equal(pairs.length, 4);
  for (const [lo, hi, word] of pairs) {
    for (const total of [lo, hi]) {
      const inputs = Object.fromEntries(keys.map((k, i) => [k, String(Math.max(0, Math.min(3, total - 3 * i)))]));
      const r = computeCalculator({ id: 'epworth', inputs });
      assert.equal(r.result.score, total);
      assert.match(r.result.band.toLowerCase(), new RegExp(word), `total ${total}`);
    }
  }
});
