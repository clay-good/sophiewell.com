// spec-v58 §2.1: New Ballard Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ballard } from '../../lib/scoring-v6.js';

const six = (v) => [v, v, v, v, v, v];
test('mid example: all +3 -> score 36, GA 38.4', () => {
  const r = ballard({ neuromuscular: six(3), physical: six(3) });
  assert.equal(r.score, 36);
  assert.equal(r.gaWeeks, 38.4);
});
test('GA clamps at the extremes', () => {
  assert.equal(ballard({ neuromuscular: six(-1), physical: six(-1) }).gaWeeks, 20);
  assert.equal(ballard({ neuromuscular: six(5), physical: six(5) }).gaWeeks, 44);
});
test('wrong criterion count throws; out-of-range item throws', () => {
  assert.throws(() => ballard({ neuromuscular: [1, 2, 3], physical: six(3) }));
  assert.throws(() => ballard({ neuromuscular: six(6), physical: six(3) }));
});
