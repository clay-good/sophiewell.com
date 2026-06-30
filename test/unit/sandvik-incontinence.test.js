// spec-v182 §2.1: Sandvik Severity Index = frequency x amount -> 1-12.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sandvikIncontinence as si } from '../../lib/ltcga-v182.js';

test('Sandvik = frequency x amount', () => {
  assert.equal(si({ frequency: 3, amount: 2 }).value, 6);
  assert.equal(si({ frequency: 4, amount: 3 }).value, 12);
});

test('Sandvik bands at the published edges', () => {
  assert.match(si({ frequency: 1, amount: 2 }).band, /slight/); // 2
  assert.match(si({ frequency: 1, amount: 3 }).band, /moderate/); // 3
  assert.match(si({ frequency: 4, amount: 2 }).band, /severe \(8/); // 8
  assert.match(si({ frequency: 4, amount: 3 }).band, /very severe/); // 12
});

test('Sandvik guards blanks and out-of-range', () => {
  assert.equal(si({ frequency: 3 }).valid, false);
  assert.equal(si({ frequency: 5, amount: 2 }).valid, false);
  assert.equal(si({}).valid, false);
});
