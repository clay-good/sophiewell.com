// The check-tile-copy gate must bite on a reintroduced line, and must not fire
// on the prose that legitimately looks like one.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTileIdCopy } from '../../scripts/check-tile-copy.mjs';

// Only hyphenated ids are in range: the gate deliberately ignores
// single-segment ids like `psi`, which collide with ordinary words.
const CATALOG = new Set(['curb-65', 'psi', 'smart-cop', 'urine-output', 'a-drop']);
const isId = (s) => CATALOG.has(s);

test('catches the line this gate exists for', () => {
  const src = "    note(root, 'A-DROP severity. Near-neighbors: curb-65, psi, smart-cop.');";
  const found = findTileIdCopy(src, isId);
  assert.deepEqual(found.map((f) => f.id), ['curb-65', 'smart-cop']);
  assert.equal(found[0].line, 1);
});

test('catches an id embedded in an ordinary sentence', () => {
  const found = findTileIdCopy("  note(root, 'Companion tile: smart-cop.');", isId);
  assert.deepEqual(found.map((f) => f.id), ['smart-cop']);
});

test('does not fire on a hyphenated word that is not a tile id', () => {
  const src = "  note(root, 'An age-adjusted, point-of-care follow-up estimate.');";
  assert.deepEqual(findTileIdCopy(src, isId), []);
});

test('does not fire on an id that is also the name of the measurement', () => {
  const src = "  note(root, 'The stage is the worse of the creatinine and urine-output criteria.');";
  assert.deepEqual(findTileIdCopy(src, isId), []);
});

test('ignores lines that render nothing to the reader', () => {
  assert.deepEqual(findTileIdCopy("  const target = 'curb-65';", isId), []);
  assert.deepEqual(findTileIdCopy("  // Near-neighbors: curb-65, psi.", isId), []);
});

test('reports each id once per line', () => {
  const src = "  note(root, 'smart-cop and smart-cop again, plus curb-65.');";
  assert.deepEqual(findTileIdCopy(src, isId).map((f) => f.id), ['smart-cop', 'curb-65']);
});

test('a single-segment id is out of range, by design', () => {
  assert.deepEqual(findTileIdCopy("  note(root, 'Companion tile: psi.');", isId), []);
});
