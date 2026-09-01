// spec-v947: the finder's name reading, and the blind spot that hid four
// duplicate tiles from the spec-v913 audit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nameKey, nameKeyWithParens, similarity, nameScore, sharesSource, RULED,
} from '../../scripts/find-duplicate-tiles.mjs';

const CINCINNATI = 'Cincinnati Prehospital Stroke Scale';
const CPSS = 'CPSS (Cincinnati Prehospital Stroke Scale)';

test('dropping the parenthetical scores the CPSS pair at zero', () => {
  // The instrument's whole name is inside the parentheses on one tile and
  // outside on the other, so removing it leaves the two with nothing in common.
  assert.deepEqual(nameKey(CPSS), ['cpss']);
  assert.equal(similarity(nameKey(CINCINNATI), nameKey(CPSS)), 0);
});

test('keeping it scores the same pair above the floor', () => {
  const s = similarity(nameKeyWithParens(CINCINNATI), nameKeyWithParens(CPSS));
  assert.ok(s >= 0.55, String(s));
});

test('nameScore takes the higher of the two readings', () => {
  const a = { key: nameKey(CINCINNATI), keyParens: nameKeyWithParens(CINCINNATI) };
  const b = { key: nameKey(CPSS), keyParens: nameKeyWithParens(CPSS) };
  assert.equal(nameScore(a, b), similarity(a.keyParens, b.keyParens));

  // And it does not lose the case the dropped key was written for: a tile whose
  // parenthetical says which variant it is still matches its sibling.
  const c = { key: nameKey('Forrest Classification (upper GI bleeding)'), keyParens: nameKeyWithParens('Forrest Classification (upper GI bleeding)') };
  const d = { key: nameKey('Forrest Classification'), keyParens: nameKeyWithParens('Forrest Classification') };
  assert.equal(nameScore(c, d), 1);
});

test('the four duplicates the blind spot hid are ruled on and name a survivor', () => {
  for (const pair of ['cincinnati|cpss', 'abc-mtp|abc-transfusion-score', 'hodgkin-ips|ips-hodgkin', 'sort|sort-mortality']) {
    const verdict = RULED.get(pair);
    assert.ok(verdict, `${pair} has no ruling`);
    assert.ok(verdict.startsWith('DUPLICATE'), verdict);
    assert.match(verdict, /Survivor \S+/, verdict);
  }
});

// ---- spec-v950: the second signal ----

test('sharesSource sees two tiles citing one paper, and only those', () => {
  const meta = {
    a: { citationUrl: 'https://doi.org/10.1/x' },
    b: { citationUrl: 'https://DOI.org/10.1/X'.toLowerCase() },
    c: { citationUrls: [{ label: 'x', url: 'https://doi.org/10.1/x' }, { label: 'y', url: 'https://doi.org/10.1/y' }] },
    d: { citationUrl: 'https://doi.org/10.1/z' },
    e: {},
  };
  assert.equal(sharesSource('a', 'b', meta), true);
  assert.equal(sharesSource('a', 'c', meta), true, 'a citationUrls entry counts');
  assert.equal(sharesSource('a', 'd', meta), false);
  assert.equal(sharesSource('a', 'e', meta), false, 'a tile with no link shares nothing');
});

test('sharing a source is not evidence of a duplicate on its own', () => {
  // One guideline defines several instruments. Every pair that matched on both
  // signals was read and ruled DISTINCT, which is why this is reported next to
  // the score rather than used to widen the net.
  for (const pair of ['homa-beta|homa-ir', 'sun-ac-cell|sun-ac-flare', 'concussion-rtl|concussion-rts']) {
    assert.match(RULED.get(pair) || '', /^DISTINCT/, pair);
  }
});
