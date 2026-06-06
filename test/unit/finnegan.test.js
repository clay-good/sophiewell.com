// spec-v58 §2.2: modified Finnegan NAS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finnegan } from '../../lib/scoring-v6.js';

test('example: total 10, elevated band (>=8)', () => {
  const r = finnegan({ highPitchedCry: true, moro: true, sweating: true, sleep: 2, fever: 1, looseStools: true });
  assert.equal(r.total, 10);
  assert.match(r.band, />=8/);
});
test('>=12 -> high band; empty -> below threshold', () => {
  assert.match(finnegan({ convulsions: true, markedTremorsUndisturbed: true, continuousCry: true, sleep: 3 }).band, />=12/);
  assert.match(finnegan({}).band, /<8/);
});
test('graded items clamp to range', () => {
  assert.throws(() => finnegan({ fever: 5 }));
  assert.equal(finnegan({ sleep: 3 }).total, 3);
});
