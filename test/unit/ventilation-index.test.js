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
