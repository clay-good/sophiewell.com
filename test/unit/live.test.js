// Unit tests for the debounce helper used by the live-render pattern.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from '../../lib/live.js';

test('debounce: coalesces rapid calls into one', async () => {
  let calls = 0;
  const f = debounce(() => { calls += 1; }, 10);
  f(); f(); f();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(calls, 1);
});

test('debounce: passes the most recent args', async () => {
  let captured;
  const f = debounce((x) => { captured = x; }, 10);
  f(1); f(2); f(3);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(captured, 3);
});

test('debounce: separated calls fire independently', async () => {
  let calls = 0;
  const f = debounce(() => { calls += 1; }, 10);
  f();
  await new Promise((r) => setTimeout(r, 30));
  f();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(calls, 2);
});
