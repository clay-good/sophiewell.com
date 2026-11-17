// spec-v195 2.4: ventilationIndex worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ventilationIndex } from '../../lib/vent-v195.js';

test('worked example', () => {
  const r = ventilationIndex({rr:30,pip:30,paco2:50});
  assert.equal(r.valid, true);
  assert.equal(r.value, 45);
});

test('lower value for lower settings', () => {
  const r = ventilationIndex({rr:15,pip:20,paco2:40});
  assert.equal(r.value, 12);
});

test('guards: PIP required', () => {
  const r = ventilationIndex({rr:30,paco2:50});
  assert.equal(r.valid, false);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: a respiratory rate past the 80/min envelope is refused', () => {
  const ex = { rr: 30, pip: 30, paco2: 50 };
  const past = ventilationIndex({ ...ex, rr: 120 });
  assert.equal(past.valid, false);
  assert.match(past.message, /respiratory rate/);
  assert.equal(ventilationIndex({ ...ex, rr: 80 }).valid, true);
  assert.equal(ventilationIndex(ex).value, 45);
});
