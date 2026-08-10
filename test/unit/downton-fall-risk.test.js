// spec-v688: Downton Fall Risk Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { downtonFallRisk } from '../../lib/downton-fall-risk-v688.js';

// Baseline: oriented + normal gait, nothing else -> 0.
const BASE = { mentalState: 'oriented', gait: 'normal' };

test('no items -> 0, low risk', () => {
  const r = downtonFallRisk(BASE);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('each item contributes one point', () => {
  assert.equal(downtonFallRisk({ ...BASE, previousFalls: true }).score, 1);
  assert.equal(downtonFallRisk({ ...BASE, medDiuretic: true }).score, 1);
  assert.equal(downtonFallRisk({ ...BASE, sensoryVisual: true }).score, 1);
  assert.equal(downtonFallRisk({ ...BASE, mentalState: 'confused' }).score, 1);
  assert.equal(downtonFallRisk({ ...BASE, gait: 'unsafe' }).score, 1);
});

test('medications and sensory deficits each count separately', () => {
  const r = downtonFallRisk({ ...BASE, medTranquilizer: true, medDiuretic: true, medAntihypertensive: true, medAntiparkinson: true, medAntidepressant: true, sensoryVisual: true, sensoryHearing: true, sensoryLimb: true });
  assert.equal(r.score, 8); // 5 meds + 3 sensory
});

test('gait quirk: unsafe scores 1 but unable scores 0', () => {
  assert.equal(downtonFallRisk({ ...BASE, gait: 'unsafe' }).score, 1);
  assert.equal(downtonFallRisk({ ...BASE, gait: 'unable' }).score, 0);
  assert.equal(downtonFallRisk({ ...BASE, gait: 'safe-with-aids' }).score, 0);
});

test('maximum is 11', () => {
  const r = downtonFallRisk({ previousFalls: true, medTranquilizer: true, medDiuretic: true, medAntihypertensive: true, medAntiparkinson: true, medAntidepressant: true, sensoryVisual: true, sensoryHearing: true, sensoryLimb: true, mentalState: 'confused', gait: 'unsafe' });
  assert.equal(r.score, 11);
});

test('META example: falls + diuretic + antihypertensive + visual + confused + unsafe gait -> 6 (high)', () => {
  const r = downtonFallRisk({ previousFalls: 'true', medDiuretic: 'true', medAntihypertensive: 'true', sensoryVisual: 'true', mentalState: 'confused', gait: 'unsafe' });
  assert.equal(r.score, 6);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Downton 6 of 11/);
});

test('cutoff is >= 3', () => {
  assert.equal(downtonFallRisk({ ...BASE, previousFalls: true, medDiuretic: true }).abnormal, false); // 2
  assert.equal(downtonFallRisk({ ...BASE, previousFalls: true, medDiuretic: true, sensoryVisual: true }).abnormal, true); // 3
});

test('mental state and gait are required', () => {
  assert.equal(downtonFallRisk({ gait: 'normal' }).field, 'mentalState');
  assert.equal(downtonFallRisk({ mentalState: 'oriented' }).field, 'gait');
});
