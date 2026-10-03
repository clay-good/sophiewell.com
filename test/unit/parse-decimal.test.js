// spec-v1542 §3: parseDecimal reads either decimal convention, refuses a comma that could be grouping, and
// never truncates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDecimal, GROUPING_MESSAGE, AMBIGUOUS_GROUPING } from '../../lib/num.js';

test('both decimal conventions read the same; a dot is always a decimal point', () => {
  for (const [raw, v] of [['37,5', 37.5], ['37.5', 37.5], ['0,125', 0.125], ['-0,5', -0.5], [' 42 ', 42], ['75.492', 75.492], ['1.000', 1], [7, 7]]) assert.deepEqual(parseDecimal(raw), { value: v }, String(raw));
});

test('a comma that could be a thousands separator, or mixed separators, is refused; nothing is truncated', () => {
  for (const raw of ['1,500', '3,200', '1,234.5', '1.234,5', '1,2,3']) assert.deepEqual(parseDecimal(raw), { error: GROUPING_MESSAGE }, raw);
  assert.deepEqual(parseDecimal('37 5'), { error: 'Enter a number.' });
  assert.deepEqual(parseDecimal('abc'), { error: 'Enter a number.' });
  assert.deepEqual(parseDecimal('   '), { blank: true });
});

test('the page refuses the dot form of a typed grouping comma', () => {
  assert.ok(AMBIGUOUS_GROUPING.test('1.500') && AMBIGUOUS_GROUPING.test('1,500'));
  assert.ok(!AMBIGUOUS_GROUPING.test('37.5') && !AMBIGUOUS_GROUPING.test('0.125') && !AMBIGUOUS_GROUPING.test('1500'));
});
