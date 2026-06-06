// spec-v57 §2.7: San Francisco Syncope Rule (CHESS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sfsr } from '../../lib/scoring-v5.js';

test('no criterion -> low risk', () => {
  const r = sfsr({});
  assert.equal(r.highRisk, false); assert.match(r.band, /Low risk/);
});
test('any criterion -> high risk', () => {
  assert.equal(sfsr({ ecgAbnormal: true }).highRisk, true);
  assert.equal(sfsr({ sbpLow: true }).highRisk, true);
});
test('CHF alone is high risk', () => {
  assert.equal(sfsr({ chf: true }).highRisk, true);
});
