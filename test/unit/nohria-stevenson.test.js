// spec-v369: Nohria-Stevenson clinical hemodynamic profiles (A/B/C/L) from congestion x perfusion.
// Worked-example tests: the four congestion/perfusion combinations, the flag on non-A profiles, input
// aliases, and the guards. Profiles transcribed from Nohria et al. 2003 (JACC), cross-verified against
// heart-failure references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nohriaStevenson } from '../../lib/nohria-stevenson-v369.js';

test('wet + cold -> profile C, flagged (the META example)', () => {
  const r = nohriaStevenson({ congestion: 'wet', perfusion: 'cold' });
  assert.equal(r.valid, true);
  assert.equal(r.profile, 'C');
  assert.equal(r.compensated, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /worst outcomes/);
});

test('the four combinations map to A / B / C / L', () => {
  assert.equal(nohriaStevenson({ congestion: 'dry', perfusion: 'warm' }).profile, 'A');
  assert.equal(nohriaStevenson({ congestion: 'wet', perfusion: 'warm' }).profile, 'B');
  assert.equal(nohriaStevenson({ congestion: 'wet', perfusion: 'cold' }).profile, 'C');
  assert.equal(nohriaStevenson({ congestion: 'dry', perfusion: 'cold' }).profile, 'L');
});

test('profile A (dry-warm) is compensated and not flagged; B/C/L are flagged', () => {
  assert.equal(nohriaStevenson({ congestion: 'dry', perfusion: 'warm' }).abnormal, false);
  for (const [c, p] of [['wet', 'warm'], ['wet', 'cold'], ['dry', 'cold']]) {
    assert.equal(nohriaStevenson({ congestion: c, perfusion: p }).abnormal, true, `${c}/${p}`);
  }
});

test('case-insensitive input resolves', () => {
  assert.equal(nohriaStevenson({ congestion: 'WET', perfusion: 'Cold' }).profile, 'C');
  assert.equal(nohriaStevenson({ congestion: 'Dry', perfusion: 'WARM' }).profile, 'A');
});

test('a missing or invalid congestion/perfusion is guarded', () => {
  assert.equal(nohriaStevenson({}).valid, false);
  assert.equal(nohriaStevenson({ congestion: 'wet' }).valid, false);
  assert.equal(nohriaStevenson({ congestion: 'damp', perfusion: 'cold' }).valid, false);
});
