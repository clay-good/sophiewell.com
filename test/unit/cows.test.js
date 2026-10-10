// COWS item anchors (Wesson and Ling 2003, as tabulated in Tompkins 2009 Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cows } from '../../lib/scoring-v4.js';

test('cows: an off-sheet value is refused, naming the allowed values', () => {
  assert.throws(() => cows({ tremor: 3 }), /tremor is scored 0, 1, 2, 4/);
  assert.throws(() => cows({ gooseflesh: 1 }), /gooseflesh skin is scored 0, 3, 5/);
  assert.equal(cows({ pulse: 4, sweating: 3, restlessness: 5, pupil: 5, jointAches: 4, runnyNose: 4, gi: 5, tremor: 4, yawning: 4, anxiety: 4, gooseflesh: 5 }).score, 47);
});
