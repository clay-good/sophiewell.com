// spec-v105 2.3: SVS WIfI limb-threat clinical stage 1-4 (Mills 2014 amputation-
// risk expert-panel grid). STAGE[ischemia][wound][infection].
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wifi } from '../../lib/vascular-v105.js';

test('W2 I3 fI1 -> clinical stage 4 (high amputation risk)', () => {
  const r = wifi({ wound: 2, ischemia: 3, infection: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 4);
  assert.equal(r.abnormal, true);
});

test('W0 I0 fI0 -> stage 1 (very low)', () => {
  const r = wifi({ wound: 0, ischemia: 0, infection: 0 });
  assert.equal(r.stage, 1);
  assert.equal(r.abnormal, false);
});

test('grid anchors: W0 I0 fI1 -> 1, W3 I3 fI3 -> 4', () => {
  assert.equal(wifi({ wound: 0, ischemia: 0, infection: 1 }).stage, 1);
  assert.equal(wifi({ wound: 3, ischemia: 3, infection: 3 }).stage, 4);
});

test('mid-grid: W1 I2 fI2 -> 4, W0 I2 fI0 -> 2', () => {
  assert.equal(wifi({ wound: 1, ischemia: 2, infection: 2 }).stage, 4);
  assert.equal(wifi({ wound: 0, ischemia: 2, infection: 0 }).stage, 2);
});

test('accepts string grades from selects', () => {
  assert.equal(wifi({ wound: '2', ischemia: '3', infection: '1' }).stage, 4);
});

test('out-of-range / blank grade -> surfaced fallback', () => {
  assert.equal(wifi({ wound: 4, ischemia: 0, infection: 0 }).valid, false);
  assert.equal(wifi({ wound: 0, ischemia: 0 }).valid, false);
});
