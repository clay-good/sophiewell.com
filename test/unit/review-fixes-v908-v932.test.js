// Regression tests for the v908 to v932 laboratory and ventilator tools (spec-v1679), each with the input that
// showed a value printed across the line it was judged against, or an impossible entry accepted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sigmaMetric } from '../../lib/sigma-metric-v921.js';
import { hepaticIronIndex } from '../../lib/hepatic-iron-index-v932.js';
import { autoPeep } from '../../lib/auto-peep-v928.js';
import { referenceChangeValue } from '../../lib/reference-change-value-v920.js';
import { biologicalVariationGoals } from '../../lib/biological-variation-goals-v923.js';

test('printed on the side of the cut it was judged', () => {
  assert.equal(sigmaMetric({ totalAllowableError: 10, bias: 1.012, cv: 3 }).bandLabel, '2.996 sigma - unacceptable');
  assert.equal(hepaticIronIndex({ hepaticIronConcentration: 94.9, ageYears: 50 }).bandLabel, 'Hepatic iron index 1.898 - below 1.9');
  assert.equal(autoPeep({ setPeep: 5, totalPeep: 5.04 }).bandLabel, 'Auto-PEEP 0.04 cmH2O');
  assert.match(referenceChangeValue({ cvAnalytical: 3, cvIntraindividual: 4, previousResult: 100, currentResult: 113.86 }).band, /13\.9% exceeds the reference change value of 13\.859%/);
});

test('impossible entries are refused', () => {
  assert.equal(autoPeep({ setPeep: 5, totalPeep: 8, plateauPressure: 6 }).valid, false);
  assert.equal(autoPeep({ setPeep: -2, totalPeep: 5 }).valid, false);
  assert.equal(biologicalVariationGoals({ cvWithinSubject: 5, cvBetweenSubject: -3 }).valid, false);
});
