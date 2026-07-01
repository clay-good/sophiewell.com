// spec-v186 §2.3: LV meridional wall stress (Laplace). Wall thickness h is
// guarded > 0 before the σ = P·r/(2·h) division.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lvWallStress } from '../../lib/specialtymath-v186.js';

test('tile example: worked wall stress', () => {
  // σ = 1.36·120·2.5/(2·1.0) = 1.36·150 = 204 g/cm²; dyn = 1.33322·150 = 200
  const r = lvWallStress({ p: 120, r: 2.5, h: 1.0 });
  assert.equal(r.valid, true);
  assert.equal(r.gcm2, 204);
  assert.equal(r.dyn, 200);
});

test('a thicker wall lowers wall stress', () => {
  const thin = lvWallStress({ p: 120, r: 2.5, h: 0.8 });
  const thick = lvWallStress({ p: 120, r: 2.5, h: 1.4 });
  assert.ok(thick.gcm2 < thin.gcm2);
});

test('wall stress scales with pressure and radius', () => {
  const base = lvWallStress({ p: 100, r: 2.0, h: 1.0 });
  const hi = lvWallStress({ p: 150, r: 2.0, h: 1.0 });
  assert.ok(hi.gcm2 > base.gcm2);
});

test('guards: wall thickness must be > 0; blanks fall back', () => {
  assert.equal(lvWallStress({ p: 120, r: 2.5, h: 0 }).valid, false);
  assert.equal(lvWallStress({ p: 120, r: 2.5 }).valid, false);
  assert.equal(lvWallStress({}).valid, false);
});
