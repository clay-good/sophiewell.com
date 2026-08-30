import test from 'node:test';
import assert from 'node:assert/strict';
import { iadGlobiad as i, CATEGORIES } from '../../lib/iad-globiad-v901.js';

test('iad-globiad: the four published categories', () => {
  assert.deepEqual(CATEGORIES.map((c) => c.value), ['1A', '1B', '2A', '2B']);
});

test('iad-globiad: the category comes from skin loss and the infection signs', () => {
  assert.equal(i({}).category, '1A');
  assert.equal(i({ infectionSigns: true }).category, '1B');
  assert.equal(i({ skinLoss: true }).category, '2A');
  assert.equal(i({ skinLoss: true, infectionSigns: true }).category, '2B');
  assert.equal(i({}).abnormal, false);
  assert.equal(i({ skinLoss: true }).abnormal, true);
  assert.equal(i({ infectionSigns: true }).abnormal, true);
});

test('iad-globiad: the pattern fields do not move the category', () => {
  // They exist to let the tile push back, not to reclassify.
  const plain = i({ skinLoss: true });
  const flagged = i({ skinLoss: true, overBonyProminence: true, distinctEdges: true });
  assert.equal(plain.category, flagged.category);
  assert.equal(flagged.pressurePattern, true);
  assert.match(flagged.patternNote, /pattern of a pressure injury/);
  assert.match(flagged.patternNote, /worth reassessing before this is recorded/);
});

test('iad-globiad: one pattern feature is named, and neither restates the moisture pattern', () => {
  assert.match(i({ overBonyProminence: true }).patternNote, /over a bony prominence/);
  assert.match(i({ distinctEdges: true }).patternNote, /the edges are distinct/);
  assert.equal(i({ overBonyProminence: true }).pressurePattern, false);
  assert.match(i({}).patternNote, /diffuse, with irregular or indistinct edges/);
  assert.match(i({}).patternNote, /spares the skin directly over the bone/);
});

test('iad-globiad: it is not a pressure injury, and they can coexist, on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { skinLoss: true }, { skinLoss: true, overBonyProminence: true, distinctEdges: true }]) {
    assert.match(i(input).notPressureNote, /not a pressure injury/);
    assert.match(i(input).notPressureNote, /top-down/);
    assert.match(i(input).coexistNote, /can coexist/);
  }
});

test('iad-globiad: the infection subcategory is a prompt either way', () => {
  assert.match(i({ infectionSigns: true }).infectionNote, /prompt to look further, not a diagnosis/);
  assert.match(i({}).infectionNote, /Candidiasis in particular is easy to miss early/);
  assert.match(i({}).productNote, /does not choose a product/);
  assert.match(i({}).scopeNote, /does not stage a pressure injury/);
});

test('iad-globiad: the documented example', () => {
  const r = i({ skinLoss: true });
  assert.equal(r.category, '2A');
  assert.equal(r.bandLabel, 'GLOBIAD 2A');
});
