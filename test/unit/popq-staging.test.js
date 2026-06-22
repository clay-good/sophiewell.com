// spec-v139 2.6: POP-Q staging (Bump 1996). Leading edge (most positive of the
// measured points) drives stage 0-IV against the hymen and TVL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { popqStaging } from '../../lib/gyn-v139.js';

test('stage II: leading edge within 1 cm of the hymen', () => {
  const r = popqStaging({ aa: -1, ba: -1, c: -5, ap: -3, bp: -3, d: -6, tvl: 9 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'II');
  assert.equal(r.leadingEdge, -1);
});

test('stage III: leading edge flips past +1 cm', () => {
  const r = popqStaging({ aa: 2, ba: 3, c: -2, ap: -3, bp: -3, d: -5, tvl: 9 });
  assert.equal(r.stage, 'III');
  assert.equal(r.leadingEdge, 3);
  assert.equal(r.leadingPoint, 'Ba');
  assert.equal(r.abnormal, true);
});

test('stage 0: no descent (points at -3, cervix above -(TVL-2))', () => {
  const r = popqStaging({ aa: -3, ba: -3, c: -8, ap: -3, bp: -3, d: -9, tvl: 9 });
  assert.equal(r.stage, '0');
  assert.match(r.band, /no prolapse/);
});

test('stage IV: essentially complete eversion', () => {
  const r = popqStaging({ aa: 3, ba: 8, c: 7, ap: 2, bp: 3, d: 6, tvl: 9 });
  assert.equal(r.stage, 'IV');
});

test('stage I: leading edge more than 1 cm above the hymen', () => {
  const r = popqStaging({ aa: -2, ba: -2, c: -6, ap: -3, bp: -3, d: -7, tvl: 9 });
  assert.equal(r.stage, 'I');
  assert.equal(r.abnormal, false);
});

test('missing point or TVL -> valid:false', () => {
  assert.equal(popqStaging({ aa: -1, ba: -1, c: -5, ap: -3, bp: -3 }).valid, false);
  assert.equal(popqStaging({ ba: -1, c: -5, ap: -3, bp: -3, tvl: 9 }).valid, false);
});

test('D optional: post-hysterectomy stages without point D', () => {
  const r = popqStaging({ aa: 2, ba: 3, c: -2, ap: -3, bp: -3, tvl: 9 });
  assert.equal(r.stage, 'III');
  assert.equal(r.leadingPoint, 'Ba');
});
