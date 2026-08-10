// spec-v689: Elderly Mobility Scale (EMS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { elderlyMobilityScale } from '../../lib/elderly-mobility-scale-v689.js';

const MAX = { lyingToSitting: '2', sittingToLying: '2', sitToStand: '3', standing: '3', gait: '3', timedWalk: '3', functionalReach: '4' };

test('maximum is 20 -> independent', () => {
  const r = elderlyMobilityScale(MAX);
  assert.equal(r.valid, true);
  assert.equal(r.score, 20);
  assert.equal(r.tier, 'independent');
  assert.equal(r.abnormal, false);
});

test('worked example: all mid values sum to 14 (independent, the band edge)', () => {
  const r = elderlyMobilityScale({ lyingToSitting: '2', sittingToLying: '2', sitToStand: '2', standing: '2', gait: '2', timedWalk: '2', functionalReach: '2' });
  assert.equal(r.score, 14);
  assert.equal(r.tier, 'independent');
  assert.match(r.band, /EMS 14 of 20/);
});

test('bands: 14-20 independent, 10-13 borderline, <10 dependent', () => {
  // 13 -> borderline: 2+2+2+2+2+2+1(reach<10=0) ... build 13 explicitly
  const borderline = elderlyMobilityScale({ lyingToSitting: '2', sittingToLying: '2', sitToStand: '2', standing: '2', gait: '2', timedWalk: '1', functionalReach: '2' }); // 13
  assert.equal(borderline.score, 13);
  assert.equal(borderline.tier, 'borderline');
  const dependent = elderlyMobilityScale({ lyingToSitting: '1', sittingToLying: '1', sitToStand: '1', standing: '1', gait: '1', timedWalk: '1', functionalReach: '2' }); // 8
  assert.equal(dependent.score, 8);
  assert.equal(dependent.tier, 'dependent');
  assert.equal(dependent.abnormal, true);
});

test('per-item point sets are enforced (reach only 0/2/4; walk has no 0)', () => {
  assert.equal(elderlyMobilityScale({ ...MAX, functionalReach: '1' }).valid, false); // 1 not allowed for reach
  assert.equal(elderlyMobilityScale({ ...MAX, functionalReach: '3' }).valid, false); // 3 not allowed for reach
  assert.equal(elderlyMobilityScale({ ...MAX, timedWalk: '0' }).valid, false);        // 0 not allowed for walk
  assert.equal(elderlyMobilityScale({ ...MAX, lyingToSitting: '3' }).valid, false);   // 3 not allowed for a 0-2 item
});

test('inputs are validated / required', () => {
  assert.equal(elderlyMobilityScale({}).valid, false);
  assert.equal(elderlyMobilityScale({}).code, 'MISSING_INPUT');
  const partial = { ...MAX }; delete partial.gait;
  assert.equal(elderlyMobilityScale(partial).field, 'gait');
});
