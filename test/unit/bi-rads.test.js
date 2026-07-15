// spec-v322: ACR BI-RADS assessment categories. Worked-example tests: the benign end
// (0-3, not suspicious), the suspicious end (4/4A/4B/4C/5/6), the 4A/4B/4C likelihood
// sub-divisions, case-insensitive input, and the invalid-category guard. Categories
// transcribed from the ACR BI-RADS Atlas 5th ed (2013), cross-verified against StatPearls
// (NBK459169) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { biRads } from '../../lib/bi-rads-v322.js';

test('category 4B: moderate suspicion, biopsy (the META example)', () => {
  const r = biRads({ category: '4B' });
  assert.equal(r.valid, true);
  assert.equal(r.category, '4B');
  assert.equal(r.suspicious, true);
  assert.match(r.band, /greater than 10% to no more than 50% likelihood/);
});

test('categories 0-3 are not flagged suspicious', () => {
  for (const c of ['0', '1', '2', '3']) {
    assert.equal(biRads({ category: c }).suspicious, false, `category ${c}`);
  }
});

test('category 3 is probably benign with the <= 2% band', () => {
  const r = biRads({ category: '3' });
  assert.match(r.band, /greater than 0% but no more than 2% likelihood/);
  assert.match(r.band, /[Ss]hort-interval/);
});

test('the 4A/4B/4C sub-divisions carry distinct likelihood bands, all suspicious', () => {
  assert.match(biRads({ category: '4A' }).band, /greater than 2% to no more than 10%/);
  assert.match(biRads({ category: '4B' }).band, /greater than 10% to no more than 50%/);
  assert.match(biRads({ category: '4C' }).band, /greater than 50% to less than 95%/);
  for (const c of ['4A', '4B', '4C']) assert.equal(biRads({ category: c }).suspicious, true);
});

test('category 5 is highly suggestive of malignancy (>= 95%)', () => {
  const r = biRads({ category: '5' });
  assert.equal(r.suspicious, true);
  assert.match(r.band, /at least 95% likelihood/);
});

test('category 6 is known biopsy-proven malignancy', () => {
  assert.match(biRads({ category: '6' }).band, /known biopsy-proven malignancy/);
});

test('sub-division letter input is case-insensitive', () => {
  assert.equal(biRads({ category: '4b' }).category, '4B');
});

test('a missing or unknown category is invalid', () => {
  assert.equal(biRads({}).valid, false);
  assert.equal(biRads({ category: '7' }).valid, false);
  assert.equal(biRads({ category: '4D' }).valid, false);
});
