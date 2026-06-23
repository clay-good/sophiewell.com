// spec-v145 2.2: Mirels impending-pathologic-fracture score (Mirels 1989). Four
// factors each 1-3, total 4-12: <=7 low, 8 borderline, >=9 high (prophylactic
// fixation). Includes the 8->9 prophylactic-fixation flip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mirelsScore } from '../../lib/ortho-v145.js';

test('minimum 4 -> low risk, not abnormal', () => {
  const r = mirelsScore({ site: 'upper', pain: 'mild', lesion: 'blastic', size: 'small' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 4);
  assert.equal(r.bandLabel, 'Low risk');
  assert.equal(r.abnormal, false);
});

test('total 7 -> still low risk', () => {
  // lower(2) + moderate(2) + mixed(2) + small(1) = 7
  const r = mirelsScore({ site: 'lower', pain: 'moderate', lesion: 'mixed', size: 'small' });
  assert.equal(r.score, 7);
  assert.equal(r.bandLabel, 'Low risk');
});

test('total 8 -> borderline, not abnormal', () => {
  // lower(2) + moderate(2) + lytic(3) + small(1) = 8
  const r = mirelsScore({ site: 'lower', pain: 'moderate', lesion: 'lytic', size: 'small' });
  assert.equal(r.score, 8);
  assert.equal(r.bandLabel, 'Borderline');
  assert.equal(r.abnormal, false);
});

test('total 9 -> high risk flip (prophylactic fixation, abnormal)', () => {
  // lower(2) + functional(3) + lytic(3) + small(1) = 9
  const r = mirelsScore({ site: 'lower', pain: 'functional', lesion: 'lytic', size: 'small' });
  assert.equal(r.score, 9);
  assert.equal(r.bandLabel, 'High risk');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /prophylactic fixation/);
});

test('maximum 12 -> high risk', () => {
  const r = mirelsScore({ site: 'peritrochanteric', pain: 'functional', lesion: 'lytic', size: 'large' });
  assert.equal(r.score, 12);
  assert.deepEqual(r.factors, { site: 3, pain: 3, lesion: 3, size: 3 });
});

test('any missing factor -> invalid', () => {
  assert.equal(mirelsScore({ site: 'lower', pain: 'mild', lesion: 'lytic' }).valid, false);
  assert.equal(mirelsScore({}).valid, false);
});
