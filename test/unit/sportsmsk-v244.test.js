// spec-v244: worked examples for the sports-medicine / MSK measures. Point systems
// spec-v97 verified (Lysholm & Gillquist 1982; Marx 2001; Redmond 2006; Riemann &
// Guskiewicz).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lysholm, marxActivity, footPostureIndex, bess } from '../../lib/sportsmsk-v244.js';

test('lysholm: good band', () => {
  const r = lysholm({ limp: 5, support: 5, locking: 15, instability: 20, pain: 20, swelling: 10, stair: 10, squat: 5 });
  assert.equal(r.score, 90);
  assert.match(r.band, /good/);
});
test('lysholm: perfect is excellent', () => {
  const r = lysholm({ limp: 5, support: 5, locking: 15, instability: 25, pain: 25, swelling: 10, stair: 10, squat: 5 });
  assert.equal(r.score, 100);
  assert.equal(r.abnormal, false);
});

test('marx: sum 0-16', () => {
  const r = marxActivity({ running: 4, cutting: 3, deceleration: 3, pivoting: 2 });
  assert.equal(r.score, 12);
});

test('foot-posture-index: pronated band', () => {
  const r = footPostureIndex({ talar: 1, supra: 1, calcaneal: 1, talonavicular: 1, arch: 1, forefoot: 1 });
  assert.equal(r.score, 6);
  assert.match(r.band, /pronated/);
});
test('foot-posture-index: supinated negative sum', () => {
  const r = footPostureIndex({ talar: -1, supra: -1, calcaneal: -1 });
  assert.equal(r.score, -3);
  assert.match(r.band, /supinated/);
});

test('bess: sum of errors', () => {
  const r = bess({ dlFirm: 3, slFirm: 3, tandemFirm: 3, dlFoam: 3, slFoam: 3, tandemFoam: 3 });
  assert.equal(r.score, 18);
});
// spec-v1718: this test was called "caps each stance at 10" and asserted that 99 errors score ZERO, with
// the other five stances blank and also scoring zero. The name said one thing and the body pinned the
// opposite, so the defect had a passing test guarding it: a rater who recorded 11 errors on a stance
// scored that stance as if they had recorded none, and the total FELL from 25 to 15.
const SIX = { dlFirm: 3, slFirm: 3, tandemFirm: 3, dlFoam: 3, slFoam: 3, tandemFoam: 3 };

test('bess: a count above the 10 a stance is scored out of is refused, never read as none', () => {
  assert.equal(bess({ ...SIX, dlFirm: 10 }).score, 25, 'ten errors is the top of the stance and scores');
  for (const bad of [10.5, 11, 99, 150]) {
    const r = bess({ ...SIX, dlFirm: bad });
    assert.equal(r.valid, false, `${bad} must be refused`);
    assert.match(r.message, /Double-leg, firm/);
  }
  // The shape of the defect, pinned as arithmetic: more errors can never lower the total.
  let last = -1;
  for (let e = 0; e <= 10; e += 1) {
    const s = bess({ ...SIX, dlFirm: e }).score;
    assert.ok(s > last, `BESS must rise with errors: ${e} gave ${s} after ${last}`);
    last = s;
  }
});

test('bess: a blank, a negative and a word are each refused by name, not scored as zero', () => {
  for (const bad of ['', null, undefined, -1, 'abc']) {
    const r = bess({ ...SIX, slFoam: bad });
    assert.equal(r.valid, false, `${JSON.stringify(bad)} must be refused`);
    assert.match(r.message, /Single-leg, foam/);
  }
  assert.equal(bess({ dlFirm: 3 }).valid, false, 'five unrated stances are not five zeros');
});
