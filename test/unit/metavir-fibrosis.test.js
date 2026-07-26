// spec-v504: METAVIR liver-fibrosis stage (F0-F4).
// Worked-example tests: each stage, the F3 bridging / F4 cirrhosis endpoints, numeric input, invalid-stage guard.
// Stages transcribed from the METAVIR Cooperative Study Group 1994 (Hepatology) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metavirFibrosis } from '../../lib/metavir-fibrosis-v504.js';

test('stage F2: portal fibrosis with a few septa (the META example)', () => {
  const r = metavirFibrosis({ stage: 'F2' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'F2');
  assert.match(r.band, /portal fibrosis with a few septa/);
});

test('stage F0: no fibrosis', () => {
  assert.match(metavirFibrosis({ stage: 'F0' }).band, /no fibrosis/);
});

test('stage F3 is bridging fibrosis without cirrhosis', () => {
  assert.match(metavirFibrosis({ stage: 'F3' }).band, /numerous septa without cirrhosis \(bridging fibrosis\)/);
});

test('stage F4 is cirrhosis', () => {
  const r = metavirFibrosis({ stage: 'F4' });
  assert.equal(r.stage, 'F4');
  assert.match(r.band, /cirrhosis/);
});

test('numeric input maps to the F-stages', () => {
  assert.equal(metavirFibrosis({ stage: 0 }).stage, 'F0');
  assert.equal(metavirFibrosis({ stage: 4 }).stage, 'F4');
});

test('lowercase input maps to the canonical stage', () => {
  assert.equal(metavirFibrosis({ stage: 'f3' }).stage, 'F3');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(metavirFibrosis({}).valid, false);
  assert.equal(metavirFibrosis({ stage: 'F5' }).valid, false);
  assert.equal(metavirFibrosis({ stage: '5' }).valid, false);
});
