// spec-v205 2.5: Sleep Apnea Clinical Score (Flemons) worked examples. Adjusted
// neck circumference = neck + 4(HTN) + 3(snoring) + 3(choking); bands <=43 low,
// 43-48 intermediate, >48 high. Increments + bands spec-v97 cross-verified
// (MedicalAlgorithms, SACS validation literature, BioSerenity).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sacsOsa as sacs } from '../../lib/pulm-copd-v205.js';

test('high pretest probability (worked example, ANC 49)', () => {
  const r = sacs({ neck: 42, hypertension: true, snoring: true, choking: false });
  assert.equal(r.valid, true);
  assert.equal(r.score, 49); // 42 + 4 + 3
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high pretest probability/);
});

test('low pretest probability (no adjustments)', () => {
  const r = sacs({ neck: 38 });
  assert.equal(r.score, 38);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low pretest probability/);
});

test('intermediate band (43-48)', () => {
  const r = sacs({ neck: 41, snoring: true, choking: false, hypertension: false }); // 44
  assert.equal(r.score, 44);
  assert.match(r.band, /intermediate/);
});

test('each adjustment adds its increment', () => {
  assert.equal(sacs({ neck: 40 }).score, 40);
  assert.equal(sacs({ neck: 40, hypertension: true }).score, 44);
  assert.equal(sacs({ neck: 40, snoring: true }).score, 43);
  assert.equal(sacs({ neck: 40, choking: true }).score, 43);
  assert.equal(sacs({ neck: 40, hypertension: true, snoring: true, choking: true }).score, 50);
});

test('missing neck -> complete-the-fields', () => {
  const r = sacs({ hypertension: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /neck circumference/);
});
