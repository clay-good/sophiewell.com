// spec-v178 §2.4: SNAQ, 4 items 1-5, total 4-20, <= 14 predicts weight loss.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snaq } from '../../lib/ltcga-v178.js';

test('SNAQ 12/20 -> predicts weight loss', () => {
  const r = snaq({ appetite: 3, fullness: 3, taste: 3, meals: 3 });
  assert.equal(r.total, 12);
  assert.equal(r.atRisk, true);
});

test('SNAQ 14 -> at risk, 15 -> not (the cut edge)', () => {
  assert.equal(snaq({ appetite: 4, fullness: 4, taste: 3, meals: 3 }).total, 14);
  assert.equal(snaq({ appetite: 4, fullness: 4, taste: 3, meals: 3 }).atRisk, true);
  assert.equal(snaq({ appetite: 4, fullness: 4, taste: 4, meals: 3 }).atRisk, false); // 15
});

test('SNAQ floor 4 and ceiling 20', () => {
  assert.equal(snaq({ appetite: 1, fullness: 1, taste: 1, meals: 1 }).total, 4);
  assert.equal(snaq({ appetite: 5, fullness: 5, taste: 5, meals: 5 }).total, 20);
});

test('SNAQ guards out-of-range and blank', () => {
  assert.equal(snaq({ appetite: 0, fullness: 3, taste: 3, meals: 3 }).valid, false);
  assert.equal(snaq({}).valid, false);
});
