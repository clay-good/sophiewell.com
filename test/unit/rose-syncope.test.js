// spec-v104 2.4: ROSE rule (BRACES + bradycardia), any-positive -> high risk (Reed 2010).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roseSyncope } from '../../lib/cardio-v104.js';

test('all negative -> low risk', () => {
  const r = roseSyncope({});
  assert.equal(r.highRisk, false);
  assert.equal(r.count, 0);
});

test('any single positive -> high risk (BNP)', () => {
  const r = roseSyncope({ bnp: true });
  assert.equal(r.highRisk, true);
  assert.equal(r.count, 1);
});

test('bradycardia alone -> high risk', () => {
  const r = roseSyncope({ bradycardia: true });
  assert.equal(r.highRisk, true);
});

test('multiple positives counted', () => {
  const r = roseSyncope({ anemia: true, qWave: true, saturation: true });
  assert.equal(r.highRisk, true);
  assert.equal(r.count, 3);
});
