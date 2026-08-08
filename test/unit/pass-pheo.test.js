// spec-v660: PASS pheochromocytoma histologic score.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { passPheo, PASS_FEATURES } from '../../lib/pass-pheo-v660.js';

test('there are 12 features and the max is 20 (8x2 + 4x1)', () => {
  assert.equal(PASS_FEATURES.length, 12);
  const all = {};
  for (const f of PASS_FEATURES) all[f.key] = true;
  assert.equal(passPheo(all).total, 20);
});

test('empty = 0, benign', () => {
  const r = passPheo({});
  assert.equal(r.total, 0);
  assert.equal(r.aggressive, false);
});

test('weights: a 2-point feature adds 2, a 1-point feature adds 1', () => {
  assert.equal(passPheo({ largeNests: true }).total, 2);
  assert.equal(passPheo({ vascularInvasion: true }).total, 1);
  assert.equal(passPheo({ largeNests: true, vascularInvasion: true }).total, 3);
});

test('cutoff: >= 4 is aggressive, < 4 is benign (exact boundary)', () => {
  // three 1-point features = 3 -> benign
  assert.equal(passPheo({ vascularInvasion: true, capsularInvasion: true, pleomorphism: true }).total, 3);
  assert.equal(passPheo({ vascularInvasion: true, capsularInvasion: true, pleomorphism: true }).aggressive, false);
  // two 2-point features = 4 -> aggressive
  assert.equal(passPheo({ largeNests: true, necrosis: true }).total, 4);
  assert.equal(passPheo({ largeNests: true, necrosis: true }).aggressive, true);
});

test('META example: large nests + necrosis = 4, potential aggressive', () => {
  const r = passPheo({ largeNests: true, necrosis: true });
  assert.equal(r.total, 4);
  assert.equal(r.aggressive, true);
  assert.match(r.bandLabel, /PASS 4 of 20/);
});
