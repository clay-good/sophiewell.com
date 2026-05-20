import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mnihss } from '../../lib/scoring-v4.js';

test('mnihss 0 (tile example) -> no stroke symptoms', () => {
  const r = mnihss({});
  assert.equal(r.total, 0);
  assert.equal(r.severity, 'no stroke symptoms');
});

test('mnihss 1 -> minor stroke', () => {
  const r = mnihss({ locQuestions: 1 });
  assert.equal(r.total, 1);
  assert.equal(r.severity, 'minor stroke');
});

test('mnihss 4 (upper edge of minor) -> minor stroke', () => {
  const r = mnihss({ locQuestions: 2, locCommands: 2 });
  assert.equal(r.total, 4);
  assert.equal(r.severity, 'minor stroke');
});

test('mnihss 5 (lower edge of moderate) -> moderate stroke', () => {
  const r = mnihss({ locQuestions: 2, locCommands: 2, gaze: 1 });
  assert.equal(r.total, 5);
  assert.equal(r.severity, 'moderate stroke');
});

test('mnihss 15 (upper edge of moderate) -> moderate stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, language: 3 });
  assert.equal(r.total, 15);
  assert.equal(r.severity, 'moderate stroke');
});

test('mnihss 20 (upper edge of moderate-severe) -> moderate-severe stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4, gaze: 2, language: 2 });
  assert.equal(r.total, 20);
  assert.equal(r.severity, 'moderate-severe stroke');
});

test('mnihss 21 (lower edge of severe) -> severe stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4, gaze: 2, language: 3 });
  assert.equal(r.total, 21);
  assert.equal(r.severity, 'severe stroke');
});

test('mnihss 31 (all maxima) -> severe stroke', () => {
  const r = mnihss({
    locQuestions: 2, locCommands: 2, gaze: 2, visualFields: 3,
    motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4,
    sensory: 1, language: 3, extinction: 2,
  });
  assert.equal(r.total, 31);
  assert.equal(r.severity, 'severe stroke');
});

test('mnihss rejects out-of-range item', () => {
  assert.throws(() => mnihss({ sensory: 2 }));
  assert.throws(() => mnihss({ motorArmL: 5 }));
});
