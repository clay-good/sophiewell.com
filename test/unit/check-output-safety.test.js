// spec-v53 §4.4 / §6: prove the output-safety gate bites on the leak
// fingerprint and does not false-positive on the safe fmt() pattern.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findOutputSafetyViolations } from '../../scripts/check-output-safety.mjs';

test('the gate flags a reintroduced compute()?.toFixed( interpolation (Class-A leak)', () => {
  const bad = "el('li', { text: `Shock index: ${V4.shockIndex({ hr, sbp })?.toFixed(2)}` })";
  const hits = findOutputSafetyViolations(bad);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 1);
});

test('the gate also flags ?.toString( and ?.toPrecision( on a call result', () => {
  assert.equal(findOutputSafetyViolations('x = fn(a)?.toString()').length, 1);
  assert.equal(findOutputSafetyViolations('x = fn(a)?.toPrecision(3)').length, 1);
});

test('the gate does NOT flag the safe fmt() pattern or a plain .toFixed on a guarded local', () => {
  assert.equal(findOutputSafetyViolations("`${fmt(V4.shockIndex({ hr, sbp }), { digits: 2, fallback: '(enter)' })}`").length, 0);
  // ckdEpi is a local already guarded by safe(); a plain (non-optional) .toFixed throws
  // (caught) rather than leaking `undefined`, so it is not the banned fingerprint.
  assert.equal(findOutputSafetyViolations('`${ckdEpi.toFixed(1)} mL/min`').length, 0);
});

test('the gate reports the correct line number across a multi-line file', () => {
  const text = 'line one\nline two\nx = fn(y)?.toFixed(2)\nline four';
  const hits = findOutputSafetyViolations(text);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 3);
});
