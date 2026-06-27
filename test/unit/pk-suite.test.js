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
