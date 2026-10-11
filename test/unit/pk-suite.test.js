// spec-v166 2.1: first-order PK suite. Each relation is computed only from the
// inputs supplied; every division (F, Vd, CL) is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pkSuite } from '../../lib/pk-v166.js';

test('tile example: half-life, steady state, loading & maintenance', () => {
  const r = pkSuite({ vd: 50, cl: 5, cp: 20, f: 1, tau: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.halfLife, 6.93); // 0.693*50/5
  assert.equal(r.steadyState, 34.65); // 5*6.93
  assert.equal(r.k, 0.1); // 5/50
  assert.equal(r.loading, 1000); // 50*20/1
  assert.equal(r.maintenance, 1200); // 5*20*12/1
});

test('partial input: Vd + CL gives k/half-life only, no loading/maintenance', () => {
  const r = pkSuite({ vd: 50, cl: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.halfLife, 6.93);
  assert.equal(r.loading, null);
  assert.equal(r.maintenance, null);
});

test('bioavailability scales loading dose', () => {
  // F = 0.5 doubles the oral loading dose vs IV
  const r = pkSuite({ vd: 50, cp: 20, f: 0.5 });
  assert.equal(r.loading, 2000);
});

test('guards: F out of (0,1], no computable relation, zero Vd', () => {
  assert.equal(pkSuite({ vd: 50, cp: 20, f: 1.5 }).valid, false);
  assert.equal(pkSuite({ vd: 50, cp: 20, f: 0 }).valid, false);
  assert.equal(pkSuite({ cp: 20 }).valid, false); // nothing computable
  assert.equal(pkSuite({ vd: 0, cl: 5 }).valid, false);
  assert.equal(pkSuite({}).valid, false);
});

// spec-v1631 backfill 4: salt factor, top-up loading dose, proportional adjustment, ln 2.
test('salt factor S divides with F; a bad S is refused', () => {
  // Aminophylline-style S = 0.8: 50 x 20 / (0.8 x 1) = 1250.
  assert.equal(pkSuite({ vd: 50, cp: 20, s: 0.8 }).loading, 1250);
  assert.equal(pkSuite({ vd: 50, cl: 5, cp: 20, tau: 12, s: 0.8, f: 0.5 }).maintenance, 3000);
  assert.equal(pkSuite({ vd: 50, cp: 20 }).s, 1);
  assert.equal(pkSuite({ vd: 50, cp: 20, s: 1.2 }).valid, false);
  assert.equal(pkSuite({ vd: 50, cp: 20, s: -1 }).valid, false);
});

test('top-up loading dose = Vd x (target - measured) / (S x F); none once at the target', () => {
  assert.equal(pkSuite({ vd: 50, cp: 20, measured: 8 }).topUp, 600);
  assert.equal(pkSuite({ vd: 50, cp: 20, measured: 8, s: 0.8 }).topUp, 750);
  const at = pkSuite({ vd: 50, cp: 20, measured: 25 });
  assert.equal(at.topUp, 0);
  assert.match(at.band, /no top-up loading dose/);
  assert.equal(pkSuite({ vd: 50, cp: 20 }).topUp, null);
});

test('proportional dose = dose x target / measured, alone or with the rest, and says what it assumes', () => {
  const r = pkSuite({ cp: 15, measured: 10, dose: 1000 });
  assert.equal(r.valid, true);
  assert.equal(r.adjusted, 1500);
  assert.match(r.detail, /linear kinetics.*does not hold for phenytoin/);
  assert.equal(pkSuite({ cp: 15, dose: 1000 }).valid, false);
});

test('half-life uses ln 2, not 0.693', () => {
  // ln 2 x 1000 / 1 = 693.15; 0.693 x 1000 would be 693.
  assert.equal(pkSuite({ vd: 1000, cl: 1 }).halfLife, 693.15);
});
