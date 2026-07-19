// spec-v473: Todani choledochal cyst classification (types I-V).
// Worked-example tests: each type and its location/shape description, numeric input, invalid-type guard.
// Types transcribed from Todani 1977 (Am J Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todaniCholedochal } from '../../lib/todani-choledochal-v473.js';

test('type I: extrahepatic dilatation (the META example)', () => {
  const r = todaniCholedochal({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /cystic or fusiform dilatation of the extrahepatic bile duct/);
});

test('type II: true diverticulum', () => {
  assert.match(todaniCholedochal({ type: 'II' }).band, /a true diverticulum of the extrahepatic bile duct/);
});

test('type III: choledochocele', () => {
  assert.match(todaniCholedochal({ type: 'III' }).band, /choledochocele/);
});

test('type IV: multiple cysts', () => {
  assert.match(todaniCholedochal({ type: 'IV' }).band, /multiple cysts; IVa/);
});

test('type V: Caroli disease', () => {
  const r = todaniCholedochal({ type: 'V' });
  assert.equal(r.type, 'V');
  assert.match(r.band, /Caroli disease/);
});

test('numeric input maps to the types', () => {
  assert.equal(todaniCholedochal({ type: 1 }).type, 'I');
  assert.equal(todaniCholedochal({ type: 5 }).type, 'V');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(todaniCholedochal({}).valid, false);
  assert.equal(todaniCholedochal({ type: 'VI' }).valid, false);
  assert.equal(todaniCholedochal({ type: '0' }).valid, false);
});
