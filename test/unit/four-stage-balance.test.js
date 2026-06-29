// spec-v176 §2.3: 4-Stage Balance Test. Full tandem hold time vs 10 s cut-point.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourStageBalance } from '../../lib/ltcga-v176.js';

test('Tandem held < 10 s -> increased fall risk', () => {
  const r = fourStageBalance({ tandemSeconds: 8 });
  assert.equal(r.valid, true);
  assert.equal(r.held, false);
  assert.match(r.band, /increased fall risk/);
});

test('Tandem 9.9 -> 10 s boundary flip', () => {
  assert.equal(fourStageBalance({ tandemSeconds: 9.9 }).held, false);
  assert.equal(fourStageBalance({ tandemSeconds: 10 }).held, true);
});

test('Tandem held >= 10 s -> not flagged by this test', () => {
  const r = fourStageBalance({ tandemSeconds: 12 });
  assert.equal(r.held, true);
  assert.match(r.band, /not flagged/);
});

test('Blank or negative time -> complete-the-fields fallback', () => {
  assert.equal(fourStageBalance({ tandemSeconds: '' }).valid, false);
  assert.equal(fourStageBalance({ tandemSeconds: -1 }).valid, false);
  assert.equal(fourStageBalance({}).valid, false);
});
