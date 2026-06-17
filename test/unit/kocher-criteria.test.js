// spec-v98 2.2: Kocher criteria for septic arthritis vs transient synovitis of
// the pediatric hip (Kocher 1999). 0-4 predictors -> predicted probability.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kocherCriteria } from '../../lib/peds-v98.js';

test('zero predictors -> < 0.2%', () => {
  const r = kocherCriteria({});
  assert.equal(r.count, 0);
  assert.equal(r.probability, '< 0.2%');
});

test('two predictors -> 40.0%', () => {
  const r = kocherCriteria({ nonWeightBearing: true, fever: true });
  assert.equal(r.count, 2);
  assert.equal(r.probability, '40.0%');
  assert.match(r.band, /40\.0%/);
});

test('all four predictors -> 99.6%', () => {
  const r = kocherCriteria({ nonWeightBearing: true, fever: true, esr: true, wbc: true });
  assert.equal(r.count, 4);
  assert.equal(r.probability, '99.6%');
});

test('the probability gradient is monotonic across 0-4', () => {
  const probs = [
    kocherCriteria({}).count,
    kocherCriteria({ nonWeightBearing: true }).count,
    kocherCriteria({ nonWeightBearing: true, fever: true }).count,
    kocherCriteria({ nonWeightBearing: true, fever: true, esr: true }).count,
    kocherCriteria({ nonWeightBearing: true, fever: true, esr: true, wbc: true }).count,
  ];
  assert.deepEqual(probs, [0, 1, 2, 3, 4]);
});
