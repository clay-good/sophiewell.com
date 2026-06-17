// spec-v95 2.3: Hoehn & Yahr Parkinson staging, original + modified (1967).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hoehnYahr } from '../../lib/neuro-v95.js';

test('original integer stages belong to the original scale', () => {
  const r = hoehnYahr({ stage: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.variant, 'original');
  assert.match(r.descriptor, /Bilateral/);
});

test('half-step 2.5 is a modified-scale stage', () => {
  const r = hoehnYahr({ stage: '2.5' });
  assert.equal(r.variant, 'modified');
  assert.match(r.band, /modified/);
  assert.match(r.descriptor, /pull test/);
});

test('stage 0 (no disease) and 1.5 are modified-only', () => {
  assert.equal(hoehnYahr({ stage: '0' }).variant, 'modified');
  assert.equal(hoehnYahr({ stage: '1.5' }).variant, 'modified');
});

test('stage 5 endpoint', () => {
  assert.match(hoehnYahr({ stage: '5' }).descriptor, /Wheelchair/);
});

test('an unknown stage returns a surfaced guard', () => {
  assert.equal(hoehnYahr({ stage: '3.5' }).valid, false);
  assert.equal(hoehnYahr({ stage: '6' }).valid, false);
  assert.equal(hoehnYahr({}).valid, false);
});
