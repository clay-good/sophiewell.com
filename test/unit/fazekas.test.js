// spec-v349: Fazekas scale for white matter hyperintensities (PVH + DWMH, each 0-3). Worked-example
// tests: both region grades and their descriptions, the combined total, the warn flag when either
// region reaches grade 2, and the invalid-grade guard. Definitions transcribed from Fazekas 1987
// (AJR), cross-verified against neuroradiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fazekas } from '../../lib/fazekas-v349.js';

test('PVH 2 / DWMH 2: halo + beginning confluence, combined 4, flagged (the META example)', () => {
  const r = fazekas({ pvh: 2, dwmh: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.pvh, 2);
  assert.equal(r.dwmh, 2);
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /smooth periventricular halo/);
  assert.match(r.band, /beginning confluence of foci/);
});

test('grade 0 / 0 is normal and not flagged', () => {
  const r = fazekas({ pvh: 0, dwmh: 0 });
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /grade 0 - absent/);
});

test('either region at grade 2+ flags abnormal; grade 1 does not', () => {
  assert.equal(fazekas({ pvh: 3, dwmh: 0 }).abnormal, true);
  assert.equal(fazekas({ pvh: 0, dwmh: 2 }).abnormal, true);
  assert.equal(fazekas({ pvh: 1, dwmh: 1 }).abnormal, false);
});

test('string inputs from the select map to numeric grades', () => {
  const r = fazekas({ pvh: '3', dwmh: '1' });
  assert.equal(r.pvh, 3);
  assert.equal(r.dwmh, 1);
  assert.equal(r.total, 4);
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(fazekas({}).valid, false);
  assert.equal(fazekas({ pvh: 2 }).valid, false);
  assert.equal(fazekas({ pvh: 4, dwmh: 0 }).valid, false);
  assert.equal(fazekas({ pvh: -1, dwmh: 1 }).valid, false);
});
