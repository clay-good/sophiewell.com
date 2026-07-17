// spec-v393: Lauren classification of gastric carcinoma (intestinal / diffuse / mixed). Worked-example
// tests: each type and its histological description, case-insensitive + i/d/m alias input, and the
// invalid-type guard. Types transcribed from Lauren 1965 (Acta Pathol Microbiol Scand) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laurenGastric } from '../../lib/lauren-gastric-v393.js';

test('diffuse type: poorly cohesive, signet-ring (the META example)', () => {
  const r = laurenGastric({ type: 'diffuse' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'diffuse');
  assert.match(r.band, /poorly cohesive cells/);
  assert.match(r.band, /signet-ring cells/);
});

test('intestinal type: cohesive, glandular', () => {
  const r = laurenGastric({ type: 'intestinal' });
  assert.equal(r.type, 'intestinal');
  assert.match(r.band, /retain glandular \/ tubular structure/);
});

test('mixed type: both components', () => {
  const r = laurenGastric({ type: 'mixed' });
  assert.equal(r.type, 'mixed');
  assert.match(r.band, /both intestinal .* and diffuse/);
});

test('case-insensitive and i/d/m alias input map to the types', () => {
  assert.equal(laurenGastric({ type: 'DIFFUSE' }).type, 'diffuse');
  assert.equal(laurenGastric({ type: 'i' }).type, 'intestinal');
  assert.equal(laurenGastric({ type: 'M' }).type, 'mixed');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(laurenGastric({}).valid, false);
  assert.equal(laurenGastric({ type: 'signet' }).valid, false);
});
