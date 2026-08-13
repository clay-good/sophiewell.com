// spec-v728: HHIE-S (Hearing Handicap Inventory for the Elderly - Screening).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hhieS } from '../../lib/hhie-s-v728.js';

const ALL = (n) => Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, String(n)]));

test('all No -> 0, no handicap', () => {
  const r = hhieS(ALL(0));
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'none');
  assert.equal(r.abnormal, false);
});

test('all Yes -> 40, significant handicap', () => {
  const r = hhieS(ALL(4));
  assert.equal(r.score, 40);
  assert.equal(r.tier, 'significant');
});

test('worked example sums to 16 -> mild-to-moderate', () => {
  const r = hhieS({ q1: '4', q2: '4', q3: '4', q4: '2', q5: '2', q6: '0', q7: '0', q8: '0', q9: '0', q10: '0' });
  assert.equal(r.score, 16);
  assert.equal(r.tier, 'mild-moderate');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /HHIE-S 16 of 40/);
});

test('bands: 0-8 none, 10-24 mild-moderate, 26-40 significant; >8 screen-positive', () => {
  assert.equal(hhieS(ALL(0)).abnormal, false); // 0
  const eight = hhieS({ ...ALL(0), q1: '4', q2: '4' }); // 8
  assert.equal(eight.score, 8);
  assert.equal(eight.tier, 'none');
  assert.equal(eight.abnormal, false);
  const ten = hhieS({ ...ALL(0), q1: '4', q2: '4', q3: '2' }); // 10
  assert.equal(ten.tier, 'mild-moderate');
  assert.equal(ten.abnormal, true);
});

test('items require 0/2/4; all required', () => {
  assert.equal(hhieS({}).valid, false);
  assert.equal(hhieS({}).code, 'MISSING_INPUT');
  assert.equal(hhieS({ ...ALL(2), q5: '3' }).valid, false); // 3 not allowed
});
