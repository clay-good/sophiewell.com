// spec-v144 2.2: Garden classification (femoral neck, Garden 1961). Grades
// I-IV; stable I-II vs unstable III-IV is the management-relevant boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gardenClassification } from '../../lib/ortho-v144.js';

test('blank -> complete-the-fields fallback', () => {
  const r = gardenClassification({});
  assert.equal(r.valid, false);
});

test('incomplete valgus-impacted -> Grade I, stable', () => {
  const r = gardenClassification({ pattern: 'incomplete' });
  assert.equal(r.classification, 'I');
  assert.equal(r.abnormal, false);
});

test('complete nondisplaced -> Grade II, stable', () => {
  assert.equal(gardenClassification({ pattern: 'complete' }).classification, 'II');
  assert.equal(gardenClassification({ pattern: 'complete' }).abnormal, false);
});

test('II -> III stable -> unstable boundary', () => {
  assert.equal(gardenClassification({ pattern: 'complete' }).abnormal, false);  // II stable
  assert.equal(gardenClassification({ pattern: 'partial' }).abnormal, true);    // III unstable
});

test('fully displaced -> Grade IV, unstable', () => {
  const r = gardenClassification({ pattern: 'full' });
  assert.equal(r.classification, 'IV');
  assert.equal(r.abnormal, true);
});
