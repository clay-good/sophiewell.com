// spec-v718: Ellis dental-fracture classification.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ellisToothFracture } from '../../lib/ellis-tooth-fracture-v718.js';

test('enamel only -> Class I (non-urgent)', () => {
  const r = ellisToothFracture({ deepestLayer: 'enamel' });
  assert.equal(r.valid, true);
  assert.equal(r.ellisClass, 'I');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Ellis Class I/);
});

test('enamel + dentin -> Class II', () => {
  const r = ellisToothFracture({ deepestLayer: 'dentin' });
  assert.equal(r.ellisClass, 'II');
  assert.match(r.band, /enamel and dentin exposed/);
});

test('pulp exposed -> Class III (emergency, flagged)', () => {
  const r = ellisToothFracture({ deepestLayer: 'pulp' });
  assert.equal(r.ellisClass, 'III');
  assert.equal(r.abnormal, true);
  assert.match(r.detail, /emergency/);
});

test('the layer is required and validated', () => {
  assert.equal(ellisToothFracture({}).valid, false);
  assert.equal(ellisToothFracture({}).field, 'deepestLayer');
  assert.equal(ellisToothFracture({ deepestLayer: 'cementum' }).valid, false);
});
