// spec-v706: Leeds Enthesitis Index (LEI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { leedsEnthesitisIndex } from '../../lib/leeds-enthesitis-index-v706.js';

test('no tender sites -> 0, none', () => {
  const r = leedsEnthesitisIndex({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'none');
  assert.equal(r.abnormal, false);
});

test('all six tender -> 6', () => {
  const r = leedsEnthesitisIndex({ leftEpicondyle: true, rightEpicondyle: true, leftFemoralCondyle: true, rightFemoralCondyle: true, leftAchilles: true, rightAchilles: true });
  assert.equal(r.score, 6);
  assert.equal(r.tier, 'enthesitis');
});

test('worked example: 3 tender sites', () => {
  const r = leedsEnthesitisIndex({ leftAchilles: 'true', rightAchilles: 'true', leftEpicondyle: 'true' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /LEI 3 of 6/);
});

test('any single tender site flags enthesitis', () => {
  assert.equal(leedsEnthesitisIndex({ rightFemoralCondyle: true }).score, 1);
  assert.equal(leedsEnthesitisIndex({ rightFemoralCondyle: true }).abnormal, true);
});
