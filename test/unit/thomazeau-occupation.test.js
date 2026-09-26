// spec-v1572: the Thomazeau occupation ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { thomazeauOccupation as t } from '../../lib/thomazeau-occupation-v1572.js';

test('the worked example: half the fossa is grade II', () => {
  assert.equal(t({ muscle: '3.1', fossa: '6.2' }).band, 'Occupation ratio 0.5 (50%): Thomazeau grade II, moderate atrophy of the supraspinatus.');
});

test('the grades are read on the exact ratio, not a rounded one', () => {
  assert.equal(t({ muscle: '6', fossa: '10' }).grade, 'I');
  assert.equal(t({ muscle: '5.95', fossa: '10' }).grade, 'II');
  assert.equal(t({ muscle: '3.99', fossa: '10' }).grade, 'III');
});

test('blanks and a muscle larger than its fossa are refused', () => {
  assert.match(t({}).message, ASKING);
  assert.equal(t({ muscle: '9', fossa: '5' }).valid, false);
});
