// spec-v707: Amsler-Krumeich keratoconus classification.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { amslerKrumeich } from '../../lib/amsler-krumeich-v707.js';

test('worked example: K 50, thickness 450, refraction 6 -> stage 2', () => {
  const r = amslerKrumeich({ meanK: '50', thinnestThickness: '450', refraction: '6' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /stage 2/);
});

test('most-advanced-parameter wins: K stage 2 but thickness stage 3 -> stage 3', () => {
  const r = amslerKrumeich({ meanK: '50', thinnestThickness: '250' });
  assert.equal(r.stage, 3);
  assert.equal(r.abnormal, true);
});

test('mean-K bands: <48=1, 48-53=2, 54-55=3, >55=4', () => {
  assert.equal(amslerKrumeich({ meanK: '47', thinnestThickness: '520' }).stage, 1);
  assert.equal(amslerKrumeich({ meanK: '48', thinnestThickness: '520' }).stage, 2);
  assert.equal(amslerKrumeich({ meanK: '54', thinnestThickness: '520' }).stage, 3);
  assert.equal(amslerKrumeich({ meanK: '56', thinnestThickness: '520' }).stage, 4);
});

test('thickness bands: >500=1, 400-500=2, 200-400=3, <200=4', () => {
  assert.equal(amslerKrumeich({ meanK: '46', thinnestThickness: '510' }).stage, 1);
  assert.equal(amslerKrumeich({ meanK: '46', thinnestThickness: '450' }).stage, 2);
  assert.equal(amslerKrumeich({ meanK: '46', thinnestThickness: '300' }).stage, 3);
  assert.equal(amslerKrumeich({ meanK: '46', thinnestThickness: '190' }).stage, 4);
});

test('central scar forces stage 4', () => {
  const r = amslerKrumeich({ meanK: '46', thinnestThickness: '520', centralScar: true });
  assert.equal(r.stage, 4);
});

test('inputs are validated', () => {
  assert.equal(amslerKrumeich({}).valid, false);
  assert.equal(amslerKrumeich({}).code, 'MISSING_INPUT');
  assert.equal(amslerKrumeich({ meanK: '50' }).field, 'thinnestThickness');
});
