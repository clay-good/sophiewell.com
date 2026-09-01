// spec-v947: the finder's name reading, and the blind spot that hid four
// duplicate tiles from the spec-v913 audit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nameKey, nameKeyWithParens, similarity, nameScore, sharesSource, pairShape, namesTheOther, parenKey, RULED,
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

// ---- spec-v956: naming the shape a pair is ----

const N = (name) => ({ name, key: nameKey(name), keyParens: nameKeyWithParens(name) });

test('parenKey reads only what is inside the parentheses', () => {
  assert.deepEqual(parenKey('CPSS (Cincinnati Prehospital Stroke Scale)'), ['cincinnati', 'prehospital', 'stroke']);
  assert.deepEqual(parenKey('Cincinnati Prehospital Stroke Scale'), []);
});

test('the shape that hides duplicates: one parenthetical holds the other whole name', () => {
  assert.equal(pairShape(N('Cincinnati Prehospital Stroke Scale'), N('CPSS (Cincinnati Prehospital Stroke Scale)')),
    'NAMES THE OTHER IN PARENTHESES');
  // and it is symmetric
  assert.ok(namesTheOther(N('CPSS (Cincinnati Prehospital Stroke Scale)'), N('Cincinnati Prehospital Stroke Scale')));
});

test('sharing a clinical domain in the parentheses is NOT that shape', () => {
  // Two different instruments for one problem. The earlier, looser rule fired
  // on these and buried the real candidates under them.
  assert.equal(pairShape(N('Egami Score (IVIG Resistance, Kawasaki)'), N('Kobayashi Score (IVIG Resistance, Kawasaki)')), '');
  assert.equal(pairShape(N('Marshall CT Classification (Traumatic Brain Injury)'), N('Rotterdam CT Score (Traumatic Brain Injury)')), '');
});

test('one shared word is a family name, not an identity', () => {
  // Each of these parentheticals holds the other's single surviving token,
  // `meld`, and they are obviously not the same instrument. Requiring two words
  // keeps them out of the sharp shape; what is left is the honest reading --
  // one acronym, told apart by what is in the brackets.
  assert.equal(namesTheOther(N('MELD-Na (Sodium-Augmented MELD)'), N('MELD-XI (MELD excluding INR)')), false);
  assert.equal(pairShape(N('MELD-Na (Sodium-Augmented MELD)'), N('MELD-XI (MELD excluding INR)')), 'ACRONYM COLLISION');
});

test('an acronym collision is named as one', () => {
  assert.equal(pairShape(N('ATLAS Score (C. difficile Infection)'), N('ATLAS Score (AF Recurrence After PVI)')), 'ACRONYM COLLISION');
  assert.equal(pairShape(N("CDAI (Crohn's Disease Activity Index)"), N('CDAI (Clinical Disease Activity Index, rheumatoid arthritis)')), 'ACRONYM COLLISION');
});

test('the two pairs the sharp shape isolated are read and ruled', () => {
  for (const pair of ['cam|cam-icu', 'tyg-bmi|tyg-index']) {
    assert.match(RULED.get(pair) || '', /^DISTINCT/, pair);
  }
});
