// Typing a calculator's whole name gets you that calculator.
//
// `namesInFull` is the rule that lets an exact name outrank the ranker, and it
// is shared so the search bar and find_calculator answer the same words the
// same way. It carried a guard -- a name reducing to fewer than two
// DISTINCTIVE words was never "named in full" -- which cost exactly the case
// the rule exists for: "TIMI Risk Index" reduces to `timi` alone, so a reader
// who typed the whole name got "TIMI Risk Score (UA / NSTEMI)" instead, on
// both surfaces. Same for "Carpenter-Coustan GDM Criteria", which lost to
// "IADPSG GDM Criteria".
//
// Two properties have to hold together, which is why they are one file: an
// exact name wins, AND a partial name still does not. The second is what the
// guard was protecting, and the every-token test protects it instead.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { namesInFull } from '../../lib/name-match.js';
import { findCalculator } from '../../mcp/tools.js';
import { getCalculator } from '../../mcp/catalog.js';
import { tileName } from '../../scripts/lib/tile-name.mjs';

function catalog() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  const out = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id: '([^']+)'/);
    const name = tileName(line);
    if (id && name) out.push({ id: id[1], name });
  }
  return out;
}

test('every exposed calculator is the top hit for its own exact name', () => {
  const tiles = catalog().filter((t) => getCalculator(t.id));
  assert.ok(tiles.length > 1500, `expected the exposed catalog, got ${tiles.length}`);
  const missed = [];
  for (const t of tiles) {
    const r = findCalculator({ query: t.name, limit: 1 });
    const top = r.candidates && r.candidates[0] && r.candidates[0].id;
    if (top !== t.id) missed.push(`${t.id} ("${t.name}") -> ${top}`);
  }
  assert.deepEqual(missed, [], `${missed.length} calculators cannot be found by their own name`);
});

// The routes the removed guard was written to protect. A partial name is a
// description, not a naming, and must still lose to the curated route.
const PARTIAL = [
  ['antithrombotic therapy not recommended', 'chads'],
  ['creatinine clearance', 'egfr'],
  ['wells', 'wells-pe'],
  ['timi', 'timi'],
  ['kdigo staging', 'kdigo-aki'],
  ['gdm criteria', 'iadpsg'],
  ['anion gap', 'anion-gap'],
];

for (const [query, expected] of PARTIAL) {
  test(`"${query}" still routes to ${expected}, not to a longer name it is part of`, () => {
    const r = findCalculator({ query, limit: 1 });
    const top = r.candidates && r.candidates[0] && r.candidates[0].id;
    assert.equal(top, expected);
  });
}

test('naming part of a calculator is not naming it in full', () => {
  assert.equal(namesInFull('timi', 'TIMI Risk Index'), false, 'one word of three');
  assert.equal(namesInFull('timi risk', 'TIMI Risk Index'), false, 'two words of three');
  assert.equal(namesInFull('TIMI Risk Index', 'TIMI Risk Index'), true, 'all three');
  // And a sibling whose name has a word the query did not say stays out.
  assert.equal(namesInFull('TIMI Risk Index', 'TIMI Risk Score (UA / NSTEMI)'), false);
});
