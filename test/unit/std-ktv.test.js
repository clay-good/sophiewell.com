// spec-v128 2.4: Standard Kt/V (Leypoldt 2003, FHN fixed-volume form). eKt/V =
// spKt/V x t/(t+35) (Tattersall, minutes); stdKt/V = (10080 x (1 - e^-eKtV)/t) /
// ((1 - e^-eKtV)/eKtV + 10080/(N x t) - 1). KDOQI 2015 weekly target >= 2.1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stdKtv } from '../../lib/renal-v128.js';

test('thrice-weekly worked example: spKt/V 1.4, 240 min, 3/wk -> 2.18 (adequate)', () => {
  const r = stdKtv({ spKtv: 1.4, minutes: 240, sessions: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.std, 2.18);
  assert.equal(r.ekt, 1.22);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /meets the >= 2.1\/week/);
});

test('boundary companion: spKt/V 1.2, 240 min, 3/wk -> 2.00 (below target)', () => {
  const r = stdKtv({ spKtv: 1.2, minutes: 240, sessions: 3 });
  assert.equal(r.std, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /below the >= 2.1\/week/);
});

test('more frequent schedule raises the weekly standard Kt/V', () => {
  const thrice = stdKtv({ spKtv: 1.0, minutes: 180, sessions: 3 }).std;
  const daily = stdKtv({ spKtv: 1.0, minutes: 180, sessions: 6 }).std;
  assert.ok(daily > thrice);
});

test('overflow-safe / guarded inputs', () => {
  const big = stdKtv({ spKtv: 50, minutes: 240, sessions: 3 });
  assert.equal(Number.isFinite(big.std), true);
  assert.equal(stdKtv({}).valid, false);
  assert.equal(stdKtv('x').valid, false);
});
