// spec-v912: the NICHD three-tier fetal heart rate categories. The tests that matter are the
// minimal-versus-absent line and the residual nature of Category II.

import test from 'node:test';
import assert from 'node:assert/strict';
import { nichdFhr, NICHD_FHR_NOTE, VARIABILITY_OPTIONS, DECEL_OPTIONS } from '../../lib/nichd-fhr-v912.js';

test('nichd-fhr: the baseline is required', () => {
  assert.equal(nichdFhr({}).valid, false);
  assert.match(nichdFhr({}).message, /baseline fetal heart rate/);
  assert.equal(nichdFhr({ baseline: 0 }).valid, false);
});

test('nichd-fhr: a normal baseline with moderate variability and no decelerations is Category I', () => {
  const r = nichdFhr({ baseline: 140 });
  assert.equal(r.category, 'I');
  assert.equal(r.abnormal, false);
});

test('nichd-fhr: minimal variability with recurrent lates is Category II, not III', () => {
  const r = nichdFhr({ baseline: 140, variability: 'minimal', lateDecels: 'recurrent' });
  assert.equal(r.category, 'II');
  assert.match(r.minimalNote, /entered as minimal, not absent/);
  assert.match(r.minimalNote, /most common way this system is got wrong/);
});

test('nichd-fhr: absent variability with recurrent lates is Category III', () => {
  assert.equal(nichdFhr({ baseline: 140, variability: 'absent', lateDecels: 'recurrent' }).category, 'III');
  assert.equal(nichdFhr({ baseline: 140, variability: 'absent', variableDecels: 'recurrent' }).category, 'III');
  assert.equal(nichdFhr({ baseline: 100, variability: 'absent' }).category, 'III');
});

test('nichd-fhr: absent variability on its own is not Category III', () => {
  const r = nichdFhr({ baseline: 140, variability: 'absent' });
  assert.equal(r.category, 'II');
});

test('nichd-fhr: intermittent decelerations do not reach Category III, and do leave Category I', () => {
  assert.equal(nichdFhr({ baseline: 140, variability: 'absent', lateDecels: 'intermittent' }).category, 'II');
  assert.equal(nichdFhr({ baseline: 140, variableDecels: 'intermittent' }).category, 'II');
});

test('nichd-fhr: a sinusoidal pattern is Category III on its own', () => {
  const r = nichdFhr({ baseline: 140, sinusoidal: 'present' });
  assert.equal(r.category, 'III');
  assert.match(r.band, /reaches this category on its own/);
  assert.equal(nichdFhr({ baseline: 140, sinusoidal: true }).category, 'III');
});

test('nichd-fhr: the baseline band is 110 to 160 inclusive', () => {
  assert.equal(nichdFhr({ baseline: 110 }).category, 'I');
  assert.equal(nichdFhr({ baseline: 160 }).category, 'I');
  assert.equal(nichdFhr({ baseline: 109 }).bradycardia, true);
  assert.equal(nichdFhr({ baseline: 161 }).tachycardia, true);
  assert.equal(nichdFhr({ baseline: 161 }).category, 'II');
});

test('nichd-fhr: tachycardia is never on its own a route into Category III', () => {
  assert.equal(nichdFhr({ baseline: 180, variability: 'absent' }).category, 'II');
});

test('nichd-fhr: marked variability leaves Category I without reaching III', () => {
  assert.equal(nichdFhr({ baseline: 140, variability: 'marked' }).category, 'II');
});

test('nichd-fhr: an unrecognized option falls back rather than throwing', () => {
  const r = nichdFhr({ baseline: 140, variability: 'wobbly', lateDecels: 'sometimes' });
  assert.equal(r.variability, 'moderate');
  assert.equal(r.lateDecels, 'absent');
  assert.equal(r.category, 'I');
});

test('nichd-fhr: the Category II band names what kept it out of Category I', () => {
  const r = nichdFhr({ baseline: 170, variability: 'minimal', variableDecels: 'recurrent' });
  assert.match(r.band, /the baseline is outside 110 to 160/);
  assert.match(r.band, /variability is minimal, not moderate/);
  assert.match(r.band, /variable decelerations are recurrent/);
});

test('nichd-fhr: the residual, point-in-time and ignored-findings notes always print', () => {
  const r = nichdFhr({ baseline: 140 });
  assert.match(r.residualNote, /residual, not a middle severity/);
  assert.match(r.momentNote, /none of the three is a management algorithm/);
  assert.match(r.ignoredNote, /do not change any category/);
  assert.match(r.scopeNote, /does not decide on delivery/);
  assert.match(NICHD_FHR_NOTE, /most tracings fall in it/);
  assert.equal(VARIABILITY_OPTIONS.length, 4);
  assert.equal(DECEL_OPTIONS.length, 3);
});
