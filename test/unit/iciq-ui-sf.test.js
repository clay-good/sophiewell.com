// spec-v182 §2.2: ICIQ-UI-SF = freq(0-5)+amount(0-6)+impact(0-10) -> 0-21.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iciqUiSf as iciq } from '../../lib/ltcga-v182.js';

test('ICIQ-UI-SF sums the three scored items', () => {
  assert.equal(iciq({ frequency: 3, amount: 4, impact: 6 }).total, 13);
});

test('ICIQ-UI-SF bands at the published edges', () => {
  assert.match(iciq({ frequency: 0, amount: 0, impact: 0 }).band, /no incontinence/);
  assert.match(iciq({ frequency: 1, amount: 0, impact: 0 }).band, /slight/); // 1
  assert.match(iciq({ frequency: 0, amount: 0, impact: 6 }).band, /moderate/); // 6
  assert.match(iciq({ frequency: 3, amount: 4, impact: 6 }).band, /severe/); // 13
  assert.match(iciq({ frequency: 5, amount: 6, impact: 10 }).band, /very severe/); // 21
});

test('ICIQ-UI-SF guards out-of-range and blank', () => {
  assert.equal(iciq({ frequency: 6, amount: 0, impact: 0 }).valid, false);
  assert.equal(iciq({ frequency: 0, amount: 0 }).valid, false);
  assert.equal(iciq({}).valid, false);
});
