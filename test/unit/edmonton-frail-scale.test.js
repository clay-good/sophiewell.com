// spec-v690: Edmonton Frail Scale (EFS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { edmontonFrailScale } from '../../lib/edmonton-frail-scale-v690.js';

// All selects 0, no checkboxes -> 0, not frail.
const ZERO = { cognition: '0', hospitalizations: '0', selfRatedHealth: '0', iadlHelp: '0', socialSupport: '0', timedUpGo: '0' };

test('all-zero -> 0, not frail', () => {
  const r = edmontonFrailScale(ZERO);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'not-frail');
  assert.equal(r.abnormal, false);
});

test('maximum is 17 -> severe frailty', () => {
  const r = edmontonFrailScale({ cognition: '2', hospitalizations: '2', selfRatedHealth: '2', iadlHelp: '2', socialSupport: '2', timedUpGo: '2', meds5plus: true, medsForget: true, weightLoss: true, lowMood: true, incontinence: true });
  assert.equal(r.score, 17);
  assert.equal(r.tier, 'severe');
});

test('worked example sums to 8 -> mild frailty', () => {
  const r = edmontonFrailScale({ cognition: '1', hospitalizations: '1', selfRatedHealth: '1', iadlHelp: '1', socialSupport: '1', timedUpGo: '1', meds5plus: 'true', weightLoss: 'true' });
  // selects 6 + 2 checks = 8
  assert.equal(r.score, 8);
  assert.equal(r.tier, 'mild');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Edmonton Frail Scale 8 of 17/);
});

test('five bands: 5 not-frail, 6 vulnerable, 8 mild, 10 moderate, 12 severe', () => {
  const mk = (n) => {
    // build a score of n using checkboxes (max 5) + selects
    const checks = ['meds5plus', 'medsForget', 'weightLoss', 'lowMood', 'incontinence'];
    const o = { ...ZERO };
    let remaining = n;
    for (const c of checks) { if (remaining > 0) { o[c] = true; remaining -= 1; } }
    // remaining via selects (each up to 2)
    const selects = ['cognition', 'hospitalizations', 'selfRatedHealth', 'iadlHelp', 'socialSupport', 'timedUpGo'];
    let si = 0;
    while (remaining > 0 && si < selects.length) { const add = Math.min(2, remaining); o[selects[si]] = String(add); remaining -= add; si += 1; }
    return edmontonFrailScale(o).tier;
  };
  assert.equal(mk(5), 'not-frail');
  assert.equal(mk(6), 'vulnerable');
  assert.equal(mk(8), 'mild');
  assert.equal(mk(10), 'moderate');
  assert.equal(mk(12), 'severe');
});

test('selects require a valid 0-2 value; required', () => {
  assert.equal(edmontonFrailScale({}).valid, false);
  assert.equal(edmontonFrailScale({}).code, 'MISSING_INPUT');
  assert.equal(edmontonFrailScale({ ...ZERO, cognition: '3' }).valid, false);
  const partial = { ...ZERO }; delete partial.timedUpGo;
  assert.equal(edmontonFrailScale(partial).field, 'timedUpGo');
});
