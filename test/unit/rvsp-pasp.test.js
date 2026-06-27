// spec-v158 2.4: RVSP / PASP from the TR jet. RVSP = 4·(TR Vmax)² + RAP.
// The square term is exercised at edge values; RAP is a fixed 3/8/15 select.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rvspPasp } from '../../lib/echo-v158.js';

test('tile example: TR 2.8 m/s + RAP 8 -> elevated', () => {
  // 4 * 2.8^2 + 8 = 4*7.84 + 8 = 31.36 + 8 = 39.36 -> 39.4 mmHg
  const r = rvspPasp({ trVmax: 2.8, rap: 8 });
  assert.equal(r.valid, true);
  assert.equal(r.rvsp, 39.4);
  assert.equal(r.abnormal, true);
});

test('low-normal RVSP not flagged', () => {
  // 4 * 2.0^2 + 3 = 16 + 3 = 19 mmHg (<= 35)
  const r = rvspPasp({ trVmax: 2.0, rap: 3 });
  assert.equal(r.rvsp, 19);
  assert.equal(r.abnormal, false);
  assert.equal(r.bandLabel, 'Not elevated');
});

test('high TR jet with dilated IVC', () => {
  // 4 * 4.0^2 + 15 = 64 + 15 = 79 mmHg
  const r = rvspPasp({ trVmax: 4.0, rap: 15 });
  assert.equal(r.rvsp, 79);
  assert.equal(r.abnormal, true);
});

test('RAP must be one of 3 / 8 / 15; blank TR falls back', () => {
  assert.equal(rvspPasp({ trVmax: 2.8, rap: 10 }).valid, false); // 10 not allowed
  assert.equal(rvspPasp({ trVmax: 2.8 }).valid, false); // no RAP
  assert.equal(rvspPasp({ rap: 8 }).valid, false); // no TR
  assert.equal(rvspPasp({}).valid, false);
});
