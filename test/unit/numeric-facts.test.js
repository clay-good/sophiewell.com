// spec-v1055: the rules two sweeps share, pinned once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numericFacts, matchesLoosely, firstFactWithoutItsOwnNumber } from '../lib/numeric-facts.js';

const raws = (s) => numericFacts(s).map((f) => f.raw);

test('a citation year is not a result', () => {
  assert.deepEqual(raws('Wells 4.5 per Wells 2000 Table 2'), ['4.5', '2']);
});

test('spec-v1023: a digit glued to a letter is a label, not a value', () => {
  // T2 is a train-of-four count, G2 a GOLD grade, S3 a heart sound.
  assert.deepEqual(raws('70 kg at T2: 140 mg'), ['70', '140']);
  assert.deepEqual(raws('GOLD group B, G2 spirometry'), []);
});

test('spec-v1055: the digit in a unit is part of the unit', () => {
  assert.deepEqual(raws('Du Bois ~1.85 m^2; Mosteller ~1.84 m^2'), ['~1.85', '~1.84']);
  assert.deepEqual(raws('Driving pressure 15 cmH2O; compliance 26.7 mL/cmH2O'), ['15', '26.7']);
});

test('~ widens the window to 15%, a plain number to 2%', () => {
  const [approx] = numericFacts('~100');
  const [exact] = numericFacts('100');
  assert.equal(matchesLoosely('112', approx), true);
  assert.equal(matchesLoosely('112', exact), false);
  assert.equal(matchesLoosely('101', exact), true);
});

test('a range accepts anything inside it', () => {
  const [f] = numericFacts('4.0-5.6');
  assert.equal(matchesLoosely('5.4', f), true);
  assert.equal(matchesLoosely('9', f), false);
});

test('spec-v1048: two documented numbers may not share one output number', () => {
  const facts = numericFacts('Ranson 2 - roughly 2% mortality');
  // A result carrying only one "2" cannot account for both claims...
  assert.ok(firstFactWithoutItsOwnNumber('score 2', facts));
  // ...and one carrying both can.
  assert.equal(firstFactWithoutItsOwnNumber('score 2, mortality 2%', facts), null);
});

test('a perfect matching is found even when a greedy pass would fail', () => {
  // 5 could take the 5.0 slot greedily and strand the 5.05-only fact.
  const facts = numericFacts('5 and 5.2');
  assert.equal(firstFactWithoutItsOwnNumber('5.2 and 5.0', facts), null);
});
