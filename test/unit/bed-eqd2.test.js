// spec-v186 §2.1: radiotherapy BED & EQD2 (linear-quadratic). n, d, and α/β are
// guarded > 0 before the divisions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bedEqd2 } from '../../lib/specialtymath-v186.js';

test('tile example: 30 × 2 Gy at α/β 10', () => {
  // BED = 60·(1 + 0.2) = 72; EQD2 = 72/(1 + 0.2) = 60
  const r = bedEqd2({ n: 30, d: 2, ab: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.bed, 72);
  assert.equal(r.eqd2, 60);
});

test('a 2 Gy/fraction schedule has EQD2 equal to its physical dose', () => {
  const r = bedEqd2({ n: 25, d: 2, ab: 3 });
  assert.equal(r.eqd2, 50);
});

test('late-tissue α/β 3 gives a higher BED than tumor α/β 10 for a hypofractionated dose', () => {
  const late = bedEqd2({ n: 5, d: 8, ab: 3 });
  const tumor = bedEqd2({ n: 5, d: 8, ab: 10 });
  assert.ok(late.bed > tumor.bed);
});

test('guards: any missing / non-positive input falls back', () => {
  assert.equal(bedEqd2({ n: 30, d: 2 }).valid, false);
  assert.equal(bedEqd2({ n: 30, d: 2, ab: 0 }).valid, false);
  assert.equal(bedEqd2({}).valid, false);
});
