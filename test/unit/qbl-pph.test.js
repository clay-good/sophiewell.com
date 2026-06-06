// spec-v58 §2.6: quantitative blood loss + PPH risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qblPph } from '../../lib/scoring-v6.js';

test('example: 300 mL measured + 800 net pad -> QBL 1100, PPH flag, medium tier', () => {
  const r = qblPph({ measuredMl: 300, padGrams: 900, dryTareGrams: 100, vaginal: true, riskFactors: 1 });
  assert.equal(r.qbl, 1100);
  assert.equal(r.pphFlag, true);
  assert.match(r.tier, /Medium/);
});
test('vaginal >=500 mL with instability flags PPH below 1000', () => {
  const r = qblPph({ measuredMl: 600, vaginal: true, unstable: true });
  assert.equal(r.pphFlag, true);
});
test('below threshold, no instability -> no PPH; high tier at >=2 risk factors', () => {
  assert.equal(qblPph({ measuredMl: 600, vaginal: true, unstable: false }).pphFlag, false);
  assert.match(qblPph({ measuredMl: 0, riskFactors: 2 }).tier, /High/);
});
test('tare cannot exceed pad grams', () => {
  assert.throws(() => qblPph({ padGrams: 100, dryTareGrams: 200 }));
});
