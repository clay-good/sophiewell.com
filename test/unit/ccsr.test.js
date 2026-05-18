// spec-v12 §3.5.2 wave 12-5: Canadian C-Spine Rule boundary examples
// per Stiell IG, et al. JAMA. 2001;286(15):1841-1848 Figure 1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ccsr } from '../../lib/scoring-v4.js';

test('ccsr rule-out: low-risk + rotates 45 -> imaging not required', () => {
  const r = ccsr({ highRisk: false, lowRisk: true, canRotate45: true });
  assert.equal(r.imagingRecommended, false);
  assert.match(r.band, /not required/);
});

test('ccsr step 1: high-risk factor -> imaging recommended', () => {
  const r = ccsr({ highRisk: true, lowRisk: true, canRotate45: true });
  assert.equal(r.imagingRecommended, true);
  assert.match(r.band, /step 1/);
});

test('ccsr step 2: no low-risk factor -> imaging recommended', () => {
  const r = ccsr({ highRisk: false, lowRisk: false, canRotate45: true });
  assert.equal(r.imagingRecommended, true);
  assert.match(r.band, /step 2/);
});

test('ccsr step 3: low-risk present but cannot rotate -> imaging recommended', () => {
  const r = ccsr({ highRisk: false, lowRisk: true, canRotate45: false });
  assert.equal(r.imagingRecommended, true);
  assert.match(r.band, /step 3/);
});
