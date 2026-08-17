// `scripts/check-lede-copy.mjs` guards the one sentence most readers ever see:
// the first sentence of an adapter summary, which is the lede on the tile's
// /tools/<id>/ page and its line in search results.
//
// The gate matched only `summary: '...'`. Adapters also write summaries as
// backtick template literals and as double-quoted strings, and 101 of the
// 1,540 summaries used one of those, so 6.6% of the catalog's ledes were
// outside the check entirely. `bauer-score` sat in that gap and shipped "The
// BAUER SCORE ... estimate survival after surgery for SKELETAL METASTASES"
// while the gate reported clean. Thirty ledes were shouting when the
// extractor was widened.
//
// This test is about coverage, not content: whatever the stoplist says, the
// extractor must see every summary in the tree. A new adapter written with a
// delimiter the regex does not handle would otherwise be silently unguarded.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ADAPTERS = fileURLToPath(new URL('../../mcp/adapters', import.meta.url));

// Kept identical to the gate's. If you change one, change both: that is the
// point of the test.
const SUMMARY = /summary:\s*(['"`])((?:[^\\]|\\.)*?)\1/g;

function sources() {
  return readdirSync(ADAPTERS)
    .filter((f) => f.endsWith('.js'))
    .map((f) => [f, readFileSync(join(ADAPTERS, f), 'utf8')]);
}

test('the lede check extracts every summary in the adapter tree', () => {
  const short = [];
  let declared = 0;
  let matched = 0;
  for (const [file, src] of sources()) {
    const d = [...src.matchAll(/^\s*summary:\s*/gm)].length;
    const m = [...src.matchAll(SUMMARY)].length;
    declared += d;
    matched += m;
    if (m < d) short.push(`${file}: ${d} summaries declared, ${m} extracted`);
  }
  assert.ok(declared > 1500, `expected the full catalog of summaries, saw ${declared}`);
  assert.deepEqual(short, [], `summaries the lede check cannot see:\n${short.join('\n')}`);
  assert.equal(matched, declared);
});

test('no adapter lede is written entirely in capitals', () => {
  const shouting = [];
  for (const [file, src] of sources()) {
    for (const match of src.matchAll(SUMMARY)) {
      const text = match[2].replace(/\$\{[^}]*\}/g, ' ');
      const end = /[.!?]\s+/.exec(text);
      const lede = end ? text.slice(0, end.index + 1) : text;
      // A lede with no lowercase letter at all is shouting whatever the
      // stoplist happens to contain.
      if (lede.length > 30 && !/[a-z]/.test(lede)) shouting.push(`${file}: ${lede.slice(0, 80)}`);
    }
  }
  assert.deepEqual(shouting, [], `all-capitals ledes:\n${shouting.join('\n')}`);
});
