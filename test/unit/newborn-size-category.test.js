// spec-v1559 tool 5: newborn size categories (WHO 2022). The 1,000/1,500/2,500 g and 28/32/37/42-week edges,
// a blank gestational age, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newbornSizeCategory as n } from '../../lib/newborn-size-category-v1559.js';

test('weight categories: 2,500 g exactly is not low birth weight', () => {
  assert.match(n({ weight: '999', weeks: '39' }).band, /extremely low birth weight/);
  assert.match(n({ weight: '1000', weeks: '39' }).band, /very low birth weight/);
  assert.match(n({ weight: '1499', weeks: '39' }).band, /very low birth weight/);
  assert.match(n({ weight: '2499', weeks: '39' }).band, /: low birth weight/);
  assert.match(n({ weight: '2500', weeks: '39' }).band, /not low birth weight/);
});

test('gestational categories: 36+6 preterm, 37+0 term, 42+0 post-term', () => {
  assert.match(n({ weight: '3000', weeks: '27', days: '6' }).band, /extremely preterm/);
  assert.match(n({ weight: '3000', weeks: '31', days: '6' }).band, /very preterm/);
  assert.match(n({ weight: '3000', weeks: '36', days: '6' }).band, /; preterm/);
  assert.match(n({ weight: '3000', weeks: '37' }).band, /; term/);
  assert.match(n({ weight: '3000', weeks: '42' }).band, /post-term/);
});

test('kangaroo care for low birth weight or preterm; a blank gestational age is disclosed', () => {
  assert.match(n({ weight: '2000', weeks: '38' }).notes.join(' '), /Kangaroo mother care/);
  assert.doesNotMatch(n({ weight: '3200', weeks: '39' }).notes.join(' '), /Kangaroo/);
  assert.match(n({ weight: '2000' }).notes[0], /No gestational age was entered/);
});

test('refusals', () => {
  assert.equal(n({}).valid, false);
  assert.equal(n({ weight: '200' }).valid, false);
  assert.equal(n({ weight: '3000', weeks: '50' }).valid, false);
});
