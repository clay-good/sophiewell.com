// docs/design.md 4: the shared plot's geometry (lib/plot.js) -- ticks that enclose the data, a log axis by decades,
// paths inside the plotting box, and the text alternative's range.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niceTicks, tickLabel, geometry, describe, VIEW } from '../../lib/plot.js';

test('ticks are round and enclose the data', () => {
  assert.deepEqual(niceTicks(0, 16.9), [0, 5, 10, 15, 20]);
  assert.deepEqual(niceTicks(0, 99.99), [0, 25, 50, 75, 100]);
  assert.deepEqual(niceTicks(-50, 0), [-60, -40, -20, 0]);
  assert.deepEqual(niceTicks(0.3, 1), [0.2, 0.4, 0.6, 0.8, 1]);
  assert.equal(tickLabel(0.30000000000000004), '0.3');
  assert.equal(tickLabel(250000), '2.5e+5');
});

test('a linear plot keeps every point inside the box; a log axis ticks by decade', () => {
  const g = geometry({ series: [{ points: [[0, 0], [12, 20], [24, 15]] }] });
  const nums = g.paths[0].match(/-?\d+(\.\d+)?/g).map(Number);
  for (let i = 0; i < nums.length; i += 2) {
    assert.ok(nums[i] >= VIEW.left && nums[i] <= VIEW.width - VIEW.right);
    assert.ok(nums[i + 1] >= VIEW.top && nums[i + 1] <= VIEW.height - VIEW.bottom);
  }
  const log = geometry({ series: [{ points: [[0.1, 1], [10, 50], [1000, 99]] }], xLog: true });
  assert.deepEqual(log.xTicks.map((t) => t.label), ['0.1', '1', '10', '100', '1000']);
});

test('nothing to draw, and the text alternative', () => {
  assert.equal(geometry({ series: [{ points: [[1, Number.NaN]] }] }).error, 'Not enough points to draw.');
  const g = geometry({ series: [{ points: [[0, 0], [168, 96]] }] });
  assert.equal(describe('Enzyme level', 'hours', 'percent', g), 'Enzyme level: percent from 0 to 96 as hours runs from 0 to 168. The values are in the table below.');
});
