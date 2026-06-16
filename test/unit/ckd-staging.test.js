// spec-v92 §2.1: KDIGO CKD G x A risk classification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ckdStaging } from '../../lib/nephro-v92.js';

test('worked example: eGFR 38 + UACR 340 -> G3b/A3 -> very high', () => {
  const r = ckdStaging({ egfr: 38, uacr: 340 });
  assert.equal(r.gStage, 'G3b');
  assert.equal(r.aStage, 'A3');
  assert.equal(r.riskKey, 'vhigh');
  assert.match(r.band, /G3b\/A3/);
  assert.match(r.risk, /very high/);
});

test('G3a/G3b eGFR edge: 45 -> G3a, 44 -> G3b', () => {
  assert.equal(ckdStaging({ egfr: 45, aCategory: 'A1' }).gStage, 'G3a');
  assert.equal(ckdStaging({ egfr: 44, aCategory: 'A1' }).gStage, 'G3b');
});

test('A2/A3 UACR edge: 300 -> A2, 301 -> A3', () => {
  assert.equal(ckdStaging({ egfr: 50, uacr: 300 }).aStage, 'A2');
  assert.equal(ckdStaging({ egfr: 50, uacr: 301 }).aStage, 'A3');
});

test('risk cells across the heat-map', () => {
  assert.equal(ckdStaging({ egfr: 95, uacr: 10 }).riskKey, 'low');     // G1/A1
  assert.equal(ckdStaging({ egfr: 50, uacr: 200 }).riskKey, 'high');   // G3a/A2
  assert.equal(ckdStaging({ egfr: 20, uacr: 10 }).riskKey, 'vhigh');   // G4/A1
});

test('A-category accepted directly; missing albuminuria is refused', () => {
  assert.equal(ckdStaging({ egfr: 80, aCategory: 'A2' }).aStage, 'A2');
  assert.equal(ckdStaging({ egfr: 80 }).valid, false);
  assert.equal(ckdStaging({ uacr: 50 }).valid, false);
});
