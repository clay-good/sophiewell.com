// spec-v92 §2.3: hemodialysis adequacy (URR + Daugirdas single-pool Kt/V).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ktvUrr } from '../../lib/nephro-v92.js';

test('worked example: pre 60, post 18, UF 3 L, 4 h, 70 kg -> URR 70%, Kt/V 1.44', () => {
  const r = ktvUrr({ preBun: 60, postBun: 18, ufVolume: 3, dialysisTime: 4, postWeight: 70 });
  assert.equal(r.urr, 70);
  assert.equal(r.ktv, 1.44);
  assert.equal(r.urrMet, true);
  assert.equal(r.ktvMet, true);
});

test('URR 65% target edge', () => {
  // post/pre = 0.35 -> URR 65%, met (>= 65)
  const r = ktvUrr({ preBun: 100, postBun: 35 });
  assert.equal(r.urr, 65);
  assert.equal(r.urrMet, true);
  // post/pre = 0.36 -> URR 64%, below target
  assert.equal(ktvUrr({ preBun: 100, postBun: 36 }).urrMet, false);
});

test('Kt/V 1.2 target edge is reported with the band', () => {
  const r = ktvUrr({ preBun: 70, postBun: 21, ufVolume: 2, dialysisTime: 3.5, postWeight: 75 });
  assert.equal(typeof r.ktv, 'number');
  assert.equal(r.ktvMet, r.ktv >= 1.2);
});

test('URR reported alone when Kt/V inputs are blank (partial input)', () => {
  const r = ktvUrr({ preBun: 60, postBun: 21 });
  assert.equal(r.urr, 65);
  assert.equal(r.ktv, undefined);
  assert.match(r.band, /enter UF volume/);
});

test('domain guards: pre-BUN <= 0 invalid; ln domain (R - 0.008t <= 0) surfaced', () => {
  assert.equal(ktvUrr({ preBun: 0, postBun: 10 }).valid, false);
  const r = ktvUrr({ preBun: 100, postBun: 99, dialysisTime: 200, ufVolume: 1, postWeight: 70 });
  assert.equal(r.valid, true); // URR still reported
  assert.equal(r.ktv, undefined);
  assert.equal(r.ktvDomain, false);
});
