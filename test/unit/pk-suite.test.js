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

// spec-v1744: the adapter declared 0 or more; pos() read a negative Vd, CL, Cp or tau as not entered.
test('spec-v1744: a negative Vd, CL, target concentration or interval is refused', () => {
  const ex = { vd: '50', cl: '5', cp: '20', f: '1', tau: '12' };
  assert.equal(pkSuite(ex).valid, true);
  for (const k of ['vd', 'cl', 'cp']) {
    assert.equal(pkSuite({ ...ex, [k]: '-10' }).valid, false, k);
    assert.match(pkSuite({ ...ex, [k]: '-10' }).message, /must be at least 0/);
    assert.equal(pkSuite({ ...ex, [k]: '0' }).valid, true, k);
  }
  // spec-v1783: the interval's row is two-sided now, so its sentence names both ends.
  assert.equal(pkSuite({ ...ex, tau: '-10' }).valid, false);
  assert.match(pkSuite({ ...ex, tau: '-10' }).message, /must be between 0 and 1000/);
  assert.equal(pkSuite({ ...ex, tau: '0' }).valid, true);
});

// spec-v1783: `pos(o.tau, 1000)` returned null above its ceiling and every caller reads null as absent, so
// a dosing interval of 999999 h gave the answer a BLANK interval gives -- no maintenance dose, and nothing
// said why. The ceiling is not new; it moved from where it discarded a number to where it refuses one.
test('spec-v1783: an interval above the ceiling is refused, not read as blank', () => {
  const ex = { vd: '50', cl: '5', cp: '20', f: '1', tau: '12' };
  assert.equal(pkSuite({ ...ex, tau: '1000' }).valid, true);
  assert.equal(pkSuite({ ...ex, tau: '1001' }).valid, false);
  assert.match(pkSuite({ ...ex, tau: '999999' }).message, /dosing interval must be between 0 and 1000/);
  // A blank interval stays optional: it is the one reading that SHOULD leave the maintenance dose out.
  const blank = pkSuite({ ...ex, tau: '' });
  assert.equal(blank.valid, true);
  assert.equal(blank.maintenance, null);
  assert.notEqual(pkSuite(ex).maintenance, null);
});
