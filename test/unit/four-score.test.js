import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourScore } from '../../lib/scoring-v4.js';

test('fourScore 16 (tile example, all maximal) -> all-maximal note', () => {
  const r = fourScore({ eye: 4, motor: 4, brainstem: 4, respiration: 4 });
  assert.equal(r.score, 16);
  assert.match(r.text, /All four components maximal/);
  assert.match(r.text, /Wijdicks 2005/);
});

test('fourScore 0 (all absent) -> AAN brain-death-workup note', () => {
  const r = fourScore({ eye: 0, motor: 0, brainstem: 0, respiration: 0 });
  assert.equal(r.score, 0);
  assert.match(r.text, /All four components absent/);
  assert.match(r.text, /AAN 2010/);
});

test('fourScore intermediate -> reports E/M/B/R pattern', () => {
  const r = fourScore({ eye: 2, motor: 3, brainstem: 4, respiration: 1 });
  assert.equal(r.score, 10);
  assert.match(r.text, /E2 M3 B4 R1/);
  assert.match(r.text, /Intermediate/);
});

test('fourScore parts mirror input', () => {
  const r = fourScore({ eye: 1, motor: 2, brainstem: 3, respiration: 4 });
  assert.deepEqual(r.parts, { eye: 1, motor: 2, brainstem: 3, respiration: 4 });
  assert.equal(r.score, 10);
});

test('fourScore minimum-nonzero (1) -> intermediate', () => {
  const r = fourScore({ eye: 1, motor: 0, brainstem: 0, respiration: 0 });
  assert.equal(r.score, 1);
  assert.match(r.text, /Intermediate/);
});

test('fourScore rejects out-of-range and non-integer', () => {
  assert.throws(() => fourScore({ eye: 5, motor: 0, brainstem: 0, respiration: 0 }));
  assert.throws(() => fourScore({ eye: -1, motor: 0, brainstem: 0, respiration: 0 }));
  assert.throws(() => fourScore({ eye: 2.5, motor: 0, brainstem: 0, respiration: 0 }));
  assert.throws(() => fourScore({ eye: NaN, motor: 0, brainstem: 0, respiration: 0 }));
});

test('fourScore rejects missing components', () => {
  assert.throws(() => fourScore({ eye: 4, motor: 4, brainstem: 4 }));
  assert.throws(() => fourScore({}));
});
