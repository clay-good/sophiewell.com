import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abcMtp } from '../../lib/scoring-v4.js';

test('abc-mtp 0/4 (tile example) -> do not activate', () => {
  const r = abcMtp({});
  assert.equal(r.score, 0);
  assert.equal(r.activateMtp, false);
  assert.match(r.band, /MTP activation not indicated/);
});

test('abc-mtp 1/4 (penetrating only) -> do not activate', () => {
  const r = abcMtp({ penetratingMechanism: true });
  assert.equal(r.score, 1);
  assert.equal(r.activateMtp, false);
});

test('abc-mtp 2/4 (positive FAST + HR>=120) -> activate', () => {
  const r = abcMtp({ positiveFast: true, hrGe120: true });
  assert.equal(r.score, 2);
  assert.equal(r.activateMtp, true);
  assert.deepEqual(r.criteriaPresent, ['hrGe120', 'positiveFast']);
  assert.match(r.band, /activate massive transfusion protocol/);
});

test('abc-mtp 4/4 (all present) -> activate', () => {
  const r = abcMtp({
    penetratingMechanism: true, sbpLe90: true, hrGe120: true, positiveFast: true,
  });
  assert.equal(r.score, 4);
  assert.equal(r.activateMtp, true);
});
