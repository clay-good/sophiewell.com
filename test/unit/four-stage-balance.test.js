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

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746 a hold time of -999999 s is told its range; a blank is still asked for', () => {
  const bad = fourStageBalance({ tandemSeconds: -999999 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /must be at least 0/);
  assert.equal(fourStageBalance({ tandemSeconds: '' }).message, 'Enter the time (seconds) the full tandem stance was held.');
  assert.equal(fourStageBalance({ tandemSeconds: 8 }).valid, true);
});
