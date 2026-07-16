// spec-v326: ACR O-RADS US v2022 risk categories. Worked-example tests: the benign end
// (0-3, not high-risk), the intermediate/high end (4-5), the risk-of-malignancy bands, and
// the invalid-category guard. Categories transcribed from Andreotti 2020 / ACR O-RADS US
// v2022, cross-verified against secondary reproductions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oRads } from '../../lib/o-rads-v326.js';

test('category 4: intermediate risk, flagged high-risk (the META example)', () => {
  const r = oRads({ category: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 4);
  assert.equal(r.highRisk, true);
  assert.match(r.band, /10% to less than 50% risk of malignancy/);
});

test('categories 0-3 are not flagged high-risk', () => {
  for (const c of ['0', '1', '2', '3']) {
    assert.equal(oRads({ category: c }).highRisk, false, `category ${c}`);
  }
});

test('category 1 is a normal premenopausal ovary (0%)', () => {
  assert.match(oRads({ category: '1' }).band, /normal premenopausal ovary \(0% risk/);
});

test('category 2 is almost certainly benign (< 1%)', () => {
  assert.match(oRads({ category: '2' }).band, /less than 1% risk of malignancy/);
});

test('category 3 is low risk (1% to < 10%)', () => {
  assert.match(oRads({ category: '3' }).band, /1% to less than 10% risk of malignancy/);
});

test('category 5 is high risk (>= 50%), flagged high-risk', () => {
  const r = oRads({ category: '5' });
  assert.equal(r.highRisk, true);
  assert.match(r.band, /at least 50% risk of malignancy/);
  assert.match(r.band, /gynecologic oncologist/);
});

test('a missing or unknown category is invalid', () => {
  assert.equal(oRads({}).valid, false);
  assert.equal(oRads({ category: '6' }).valid, false);
  assert.equal(oRads({ category: 'X' }).valid, false);
});
