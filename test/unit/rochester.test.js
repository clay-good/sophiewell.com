import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rochester } from '../../lib/scoring-v4.js';

test('rochester 0/7 (tile example) -> not low risk', () => {
  const r = rochester({});
  assert.equal(r.metCount, 0);
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /NOT low risk for SBI/);
});

test('rochester 6/7 (one failed) -> not low risk; failing list captures it', () => {
  const r = rochester({
    ageLte60Days: true, termAndPreviouslyHealthy: true, noFocalInfection: true,
    wbc5to15: true, bandsLte1Point5: true, urineWbcLte10PerHpf: true,
    // stoolWbcLte5PerHpf missing
  });
  assert.equal(r.metCount, 6);
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.failing, ['stoolWbcLte5PerHpf']);
});

test('rochester 7/7 -> LOW risk', () => {
  const r = rochester({
    ageLte60Days: true, termAndPreviouslyHealthy: true, noFocalInfection: true,
    wbc5to15: true, bandsLte1Point5: true, urineWbcLte10PerHpf: true,
    stoolWbcLte5PerHpf: true,
  });
  assert.equal(r.metCount, 7);
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /LOW risk for SBI per Jaskiewicz 1994/);
});
