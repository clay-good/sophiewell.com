// spec-v407: Steinberg staging of femoral-head osteonecrosis (stages 0/I/II/III/IV/V/VI).
// Worked-example tests: representative stages and their descriptions, roman + numeric + A/B/C subtype
// input, and the invalid-stage guard. Stages transcribed from Steinberg 1995 (J Bone Joint Surg Br)
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { steinbergAvn } from '../../lib/steinberg-avn-v407.js';

test('stage III: subchondral collapse without flattening (the META example)', () => {
  const r = steinbergAvn({ stage: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'III');
  assert.match(r.band, /subchondral collapse \(crescent sign\)/);
  assert.match(r.band, /without flattening/);
});

test('stage 0 vs I: normal imaging vs normal XR abnormal MRI', () => {
  assert.match(steinbergAvn({ stage: '0' }).band, /non-diagnostic radiograph/);
  const one = steinbergAvn({ stage: 'I' });
  assert.equal(one.stage, 'I');
  assert.match(one.band, /normal radiograph; abnormal bone scan/);
});

test('stage IV vs VI: flattening vs advanced degenerative', () => {
  assert.match(steinbergAvn({ stage: 'IV' }).band, /flattening of the femoral head/);
  const six = steinbergAvn({ stage: 'VI' });
  assert.equal(six.stage, 'VI');
  assert.match(six.band, /advanced degenerative changes/);
});

test('numeric and A/B/C subtype input map to the base stages', () => {
  assert.equal(steinbergAvn({ stage: 2 }).stage, 'II');
  assert.equal(steinbergAvn({ stage: 'IIIc' }).stage, 'III');
  assert.equal(steinbergAvn({ stage: 'Vb' }).stage, 'V');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(steinbergAvn({}).valid, false);
  assert.equal(steinbergAvn({ stage: 'VII' }).valid, false);
  assert.equal(steinbergAvn({ stage: '7' }).valid, false);
});
