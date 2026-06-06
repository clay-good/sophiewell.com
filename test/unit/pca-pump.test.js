// spec-v56 §2.8: PCA pump settings + hourly-maximum guardrail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcaPump } from '../../lib/medication-v5.js';

test('lockout 10 min -> 6 demand doses/h, 6 mg/h max, 1 mL/dose', () => {
  const r = pcaPump({ concMgPerMl: 1, demandMg: 1, lockoutMin: 10 });
  assert.equal(r.dosesPerHour, 6);
  assert.equal(r.maxDemandMg, 6);
  assert.equal(r.maxHourlyMg, 6);
  assert.equal(r.demandVolMl, 1);
});

test('basal rate adds to the hourly maximum', () => {
  const r = pcaPump({ concMgPerMl: 1, demandMg: 1, lockoutMin: 15, basalMgPerH: 0.5 });
  assert.equal(r.dosesPerHour, 4);
  assert.equal(r.maxHourlyMg, 4.5);
});

test('1-h limit at/above lockout maximum never binds', () => {
  const r = pcaPump({ concMgPerMl: 1, demandMg: 1, lockoutMin: 10, oneHourLimitMg: 10 });
  assert.match(r.limitNote, /never binds/);
});

test('1-h limit below lockout maximum binds', () => {
  const r = pcaPump({ concMgPerMl: 1, demandMg: 1, lockoutMin: 6, oneHourLimitMg: 5 });
  assert.equal(r.dosesPerHour, 10);
  assert.match(r.limitNote, /binds below/);
});

test('rejects impossible lockout / concentration', () => {
  assert.throws(() => pcaPump({ concMgPerMl: 0, demandMg: 1, lockoutMin: 10 }), /concMgPerMl/);
  assert.throws(() => pcaPump({ concMgPerMl: 1, demandMg: 1, lockoutMin: 0 }), /lockoutMin/);
});
