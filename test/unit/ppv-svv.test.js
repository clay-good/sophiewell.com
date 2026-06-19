// spec-v113 2.2: pulse-pressure / stroke-volume variation (Michard 2000).
// variation = (max - min) / ([max + min] / 2) x 100; PPV > ~13% / SVV > ~12%.
// Mean denominator guarded (max + min > 0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ppvSvv } from '../../lib/fluidresp-v113.js';

test('worked example: PPV 50/40 mmHg is 22.2%, above ~13%', () => {
  const r = ppvSvv({ mode: 'ppv', max: 50, min: 40 });
  assert.equal(r.valid, true);
  assert.equal(r.mode, 'ppv');
  assert.equal(r.variation, 22.2);
  assert.equal(r.responsive, true);
  assert.match(r.band, /Pulse-pressure variation 22.2% \(max 50 \/ min 40 mmHg\)/);
});

test('a PPV just under 13% is below the threshold', () => {
  const r = ppvSvv({ mode: 'ppv', max: 53, min: 47 }); // 12%
  assert.equal(r.variation, 12);
  assert.equal(r.responsive, false);
  assert.match(r.band, /below the cited fluid-responsiveness threshold/);
});

test('SVV uses the ~12% cutoff and the mL unit', () => {
  const r = ppvSvv({ mode: 'svv', max: 80, min: 70 }); // (10)/75*100 = 13.3%
  assert.equal(r.mode, 'svv');
  assert.equal(r.variation, 13.3);
  assert.equal(r.responsive, true);
  assert.match(r.band, /Stroke-volume variation 13.3% \(max 80 \/ min 70 mL\)/);
});

test('mean denominator guarded: max + min 0 returns a fallback', () => {
  const r = ppvSvv({ mode: 'ppv', max: 0, min: 0 });
  assert.equal(r.valid, false);
  assert.match(r.band, /mean of the maximum and minimum must be greater than 0/);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(ppvSvv({ mode: 'ppv', max: 50 }).valid, false);
  assert.equal(ppvSvv({}).valid, false);
});
