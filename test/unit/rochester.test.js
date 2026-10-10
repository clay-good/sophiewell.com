import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rochester } from '../../lib/scoring-v4.js';

test('rochester 0/8 (tile example) -> not low risk', () => {
  const r = rochester({});
  assert.equal(r.metCount, 0);
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /NOT low risk for SBI/);
});

test('rochester 7/8 (one failed) -> not low risk; failing list captures it', () => {
  const r = rochester({
    appearsWell: true, ageLte60Days: true, termAndPreviouslyHealthy: true, noFocalInfection: true,
    wbc5to15: true, bandsLte1Point5: true, urineWbcLte10PerHpf: true,
    // stoolWbcLte5PerHpf missing
  });
  assert.equal(r.metCount, 7);
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.failing, ['stoolWbcLte5PerHpf']);
});

test('rochester 8/8 -> LOW risk', () => {
  const r = rochester({
    appearsWell: true, ageLte60Days: true, termAndPreviouslyHealthy: true, noFocalInfection: true,
    wbc5to15: true, bandsLte1Point5: true, urineWbcLte10PerHpf: true,
    stoolWbcLte5PerHpf: true,
  });
  assert.equal(r.metCount, 8);
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /LOW risk for SBI per Jaskiewicz 1994/);
});

test('rochester: an infant who does not appear well is not low risk, whatever the labs', () => {
  const r = rochester({ ageLte60Days: true, termAndPreviouslyHealthy: true, noFocalInfection: true,
    wbc5to15: true, bandsLte1Point5: true, urineWbcLte10PerHpf: true, stoolWbcLte5PerHpf: true });
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.failing, ['appearsWell']);
  assert.equal(r.totalCount, 8);
});
