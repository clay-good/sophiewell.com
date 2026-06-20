// spec-v128 2.3: nPCR / nPNA (Depner-Daugirdas 1996). Two-point urea-kinetic
// form: nPCR (g/kg/day) = 0.22 + 0.864 x (preBUN - postBUN) / interdialytic hours.
// Published anchor (Renal Fellow Network): post 18 / pre 70 / 44 h -> 1.24.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { npcrPna } from '../../lib/renal-v128.js';

test('published worked example: post 18, pre 70, 44 h -> 1.24 g/kg/day', () => {
  const r = npcrPna({ postBun: 18, preBun: 70, hours: 44 });
  assert.equal(r.valid, true);
  assert.equal(r.npcr, 1.24);
});

test('within the 1.0-1.2 nutrition target', () => {
  const r = npcrPna({ postBun: 24, preBun: 70, hours: 44 });
  assert.equal(r.npcr, 1.12);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the ~1.0-1.2/);
});

test('low nPCR -> below the 0.8 floor (inadequate protein intake)', () => {
  const r = npcrPna({ postBun: 30, preBun: 50, hours: 68 });
  assert.ok(r.npcr < 0.8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /inadequate protein intake/);
});

test('pre must exceed post (no negative generation) and inputs guarded', () => {
  assert.equal(npcrPna({ postBun: 50, preBun: 40, hours: 44 }).valid, false);
  assert.equal(npcrPna({ postBun: 18, preBun: 70, hours: 0 }).valid, false);
  assert.equal(npcrPna({}).valid, false);
  assert.equal(npcrPna(3).valid, false);
});
