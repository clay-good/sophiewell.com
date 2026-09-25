// spec-v1483: Simplified Oral Hygiene Index (Greene and Vermillion 1964).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { ohiS } from '../../lib/ohi-s-v1483.js';

const six = (d, c) => ({ d16: d, d11: d, d26: d, d36: d, d31: d, d46: d, c16: c, c11: c, c26: c, c36: c, c31: c, c46: c });

test('the worked example: debris 1.0 plus calculus 1.0 is 2.0, fair', () => {
  const r = ohiS({ d16: '1', d11: '0', d26: '2', d36: '1', d31: '0', d46: '2', c16: '1', c11: '0', c26: '1', c36: '2', c31: '1', c46: '1' });
  assert.equal(r.band, 'OHI-S 2.0: fair oral hygiene (debris index 1.0, calculus index 1.0).');
});

test('the bands at their edges', () => {
  assert.match(ohiS(six('0', '0')).band, /good/);
  assert.match(ohiS({ ...six('1', '0'), d16: '1', d11: '0' }).bandLabel, /good/); // 5/6 + 0 = 0.8
  assert.match(ohiS(six('1', '1')).band, /fair/); // 2.0
  assert.match(ohiS(six('2', '1')).band, /fair/); // 3.0
  assert.match(ohiS(six('3', '1')).band, /poor/); // 4.0
  assert.match(ohiS(six('3', '3')).band, /poor/); // 6.0
});

test('a blank tooth is not examined, not a 0', () => {
  const r = ohiS({ d16: '2', c16: '1' });
  assert.equal(r.dis, 2);
  assert.match(r.notes.join(' '), /no score was entered for the rest/);
  assert.equal(ohiS({}).valid, false);
  assert.match(ohiS({ d16: '2' }).message, ASKING);
});
