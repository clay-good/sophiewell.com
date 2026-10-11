// spec-v1629 tool 15: percent ionized at a pH.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { percentIonized as pi } from '../../lib/percent-ionized-v1629.js';

test('pH = pKa gives 50% for both an acid and a base', () => {
  assert.equal(pi({ type: 'acid', pKa: 4, pH: 4 }).percentIonized, 50);
  assert.equal(pi({ type: 'base', pKa: 4, pH: 4 }).percentIonized, 50);
});

test('one pH unit above the pKa gives 90.9% for an acid and 9.1% for a base', () => {
  const acid = pi({ type: 'acid', pKa: 4, pH: 5 });
  const base = pi({ type: 'base', pKa: 4, pH: 5 });
  assert.deepEqual([acid.percentIonized, acid.percentUnionized], [90.9, 9.1]);
  assert.deepEqual([base.percentIonized, base.percentUnionized], [9.1, 90.9]);
  assert.match(acid.notes.join(' '), /Ionized to un-ionized: 10 to 1/);
  assert.match(base.notes.join(' '), /Ionized to un-ionized: 1 to 10/);
});

test('far from the pKa the small fraction is not rounded away to 0 or 100', () => {
  const r = pi({ type: 'acid', pKa: 3.5, pH: 7.4 });
  assert.equal(r.percentIonized, 99.9874);
  assert.equal(r.percentUnionized, 0.0125877);
});

test('the type is required, the pKa is never assumed, and one pKa is all it answers for', () => {
  assert.match(pi({ pKa: 3.5, pH: 7.4 }).message, /weak acid or a weak base: the same pH and pKa give opposite answers/);
  assert.match(pi({ type: 'acid', pH: 7.4 }).message, /Enter the pKa/);
  assert.match(pi({ type: 'acid', pKa: 3.5 }).message, /Enter the pH/);
  assert.match(pi({ type: 'acid', pKa: 3.5, pH: 15 }).message, /between 0 and 14/);
  assert.match(pi({ type: 'acid', pKa: 3.5, pH: 7.4 }).note, /answered for the pKa entered/);
  assert.match(pi({ type: 'acid', pKa: 3.5, pH: 7.4 }).note, /says nothing about absorption/);
});
