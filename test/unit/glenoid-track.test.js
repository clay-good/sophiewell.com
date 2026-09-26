// spec-v1571: the glenoid track.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { glenoidTrack as g } from '../../lib/glenoid-track-v1571.js';

test('the worked example: an interval wider than the track is off-track', () => {
  const r = g({ glenoidWidth: '28', defect: '5', hsWidth: '15', bridge: '5' });
  assert.equal(r.band, 'Glenoid track 18.2 mm, Hill-Sachs interval 20 mm, distance to dislocation -1.8 mm: off-track, because the Hill-Sachs interval is wider than the glenoid track. Glenoid bone loss 17.9%.');
});

test('near-track, on-track, and the 0 mm boundary', () => {
  assert.equal(g({ glenoidWidth: '28', defect: '2', hsWidth: '8', bridge: '4' }).bandLabel, 'Near-track');
  assert.equal(g({ glenoidWidth: '30', defect: '0', hsWidth: '6', bridge: '3' }).bandLabel, 'On-track');
  assert.equal(g({ glenoidWidth: '30', defect: '0.9', hsWidth: '20', bridge: '4' }).bandLabel, 'Off-track or on-track (0 mm boundary)');
});

test('blanks and impossible values are refused', () => {
  assert.match(g({}).message, ASKING);
  assert.equal(g({ glenoidWidth: '28', defect: '30', hsWidth: '10', bridge: '4' }).valid, false);
});
