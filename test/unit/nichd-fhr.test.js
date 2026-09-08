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
  const r = nichdFhr({ baseline: 140, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' });
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
  const r = nichdFhr({ baseline: 140, variability: 'absent', lateDecels: 'absent', variableDecels: 'absent' });
  assert.equal(r.category, 'II');
});

test('nichd-fhr: intermittent decelerations do not reach Category III, and do leave Category I', () => {
  assert.equal(nichdFhr({ baseline: 140, variability: 'absent', lateDecels: 'intermittent', variableDecels: 'absent' }).category, 'II');
  assert.equal(nichdFhr({ baseline: 140, variability: 'moderate', lateDecels: 'absent', variableDecels: 'intermittent' }).category, 'II');
});

test('nichd-fhr: a sinusoidal pattern is Category III on its own', () => {
  const r = nichdFhr({ baseline: 140, sinusoidal: 'present' });
  assert.equal(r.category, 'III');
  assert.match(r.band, /reaches this category on its own/);
  assert.equal(nichdFhr({ baseline: 140, sinusoidal: true }).category, 'III');
});

test('nichd-fhr: the baseline band is 110 to 160 inclusive', () => {
  assert.equal(nichdFhr({ baseline: 110, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' }).category, 'I');
  assert.equal(nichdFhr({ baseline: 160, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' }).category, 'I');
  assert.equal(nichdFhr({ baseline: 109 }).bradycardia, true);
  assert.equal(nichdFhr({ baseline: 161 }).tachycardia, true);
  assert.equal(nichdFhr({ baseline: 161, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' }).category, 'II');
});

test('nichd-fhr: tachycardia is never on its own a route into Category III', () => {
  assert.equal(nichdFhr({ baseline: 180, variability: 'absent', lateDecels: 'absent', variableDecels: 'absent' }).category, 'II');
});

test('nichd-fhr: marked variability leaves Category I without reaching III', () => {
  assert.equal(nichdFhr({ baseline: 140, variability: 'marked', lateDecels: 'absent', variableDecels: 'absent' }).category, 'II');
});

test('nichd-fhr: an unrecognized option falls back rather than throwing', () => {
  const r = nichdFhr({ baseline: 140, variability: 'wobbly', lateDecels: 'sometimes', variableDecels: 'absent' });
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
  const r = nichdFhr({ baseline: 140, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' });
  assert.match(r.residualNote, /residual, not a middle severity/);
  assert.match(r.momentNote, /none of the three is a management algorithm/);
  assert.match(r.ignoredNote, /do not change any category/);
  assert.match(r.scopeNote, /does not decide on delivery/);
  assert.match(NICHD_FHR_NOTE, /most tracings fall in it/);
  // spec-v1118: each list gained a leading "Not observed" option, without which
  // spec-v1102's guard could never fire on the page. The published levels are
  // what the counts below assert; the empty option is not one of them.
  assert.equal(VARIABILITY_OPTIONS.filter((o) => o.value !== '').length, 4);
  assert.equal(DECEL_OPTIONS.filter((o) => o.value !== '').length, 3);
  assert.equal(VARIABILITY_OPTIONS[0].value, '', 'the control must be able to say "not observed"');
  assert.equal(DECEL_OPTIONS[0].value, '');
});

test('spec-v1118: the page opens uncategorisable, not on Category I', () => {
  // Every select used to open on its NORMAL level, so spec-v1102's guard --
  // correct, and reached by every test because they call the library directly --
  // never fired on the browser. A baseline and nothing else answered
  // "Category I ... moderate variability, and neither late nor variable
  // decelerations": three findings asserted from one number.
  const asRendered = {
    baseline: 140,
    variability: VARIABILITY_OPTIONS[0].value,
    lateDecels: DECEL_OPTIONS[0].value,
    variableDecels: DECEL_OPTIONS[0].value,
  };
  const r = nichdFhr(asRendered);
  assert.match(r.band, /Not categorisable yet/);
  assert.doesNotMatch(r.band, /Category I:/);

  // Chosen explicitly, "absent" still means absent.
  const rated = nichdFhr({ baseline: 140, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent' });
  assert.match(rated.band, /Category I:/);
});

// spec-v1102: every fallback in this tile is the NORMAL value -- moderate
// variability, no decelerations, no sinusoidal pattern. So a feature nobody
// described read as a feature somebody looked at and found reassuring, and with
// a baseline alone the tile answered:
//
//   "Category I: a baseline of 140 beats per minute, which is normal, moderate
//    variability, and neither late nor variable decelerations."
//
// Three findings asserted from one number, in the category that means no action
// is needed. The tests above were written against those fallbacks: each now
// passes the features its own name claims.
test('spec-v1102: a tracing nobody described is not a Category I tracing', () => {
  const baselineOnly = nichdFhr({ baseline: 140 });
  assert.equal(baselineOnly.category, null, 'never Category I from one number');
  assert.match(baselineOnly.band, /Not categorisable yet/);
  assert.match(baselineOnly.band, /the variability/);
  assert.doesNotMatch(baselineOnly.band, /moderate variability, and neither/, 'never assert the findings');

  // Observed and normal is Category I, exactly as before.
  assert.equal(nichdFhr({
    baseline: 140, variability: 'moderate', lateDecels: 'absent', variableDecels: 'absent',
  }).category, 'I');
});

test('spec-v1102: an omitted variability does not take Category III down to II', () => {
  const complete = {
    baseline: 110, variability: 'absent', lateDecels: 'recurrent',
    variableDecels: 'absent', sinusoidal: 'absent',
  };
  assert.equal(nichdFhr(complete).category, 'III');

  const noVariability = { ...complete };
  delete noVariability.variability;
  const r = nichdFhr(noVariability);
  assert.equal(r.category, null, 'III is reached through the variability');
  assert.match(r.band, /Category III turns on the variability/);
});

test('spec-v1102: Category II still stands wherever both I and III are ruled out by what WAS observed', () => {
  // A first version of the guard refused whenever anything was missing, and the
  // suite above caught it: minimal variability with recurrent late
  // decelerations cannot be I (minimal, and lates present) and cannot be III
  // (III needs ABSENT variability), whatever the variable decelerations are.
  assert.equal(nichdFhr({ baseline: 140, variability: 'minimal', lateDecels: 'recurrent' }).category, 'II');

  // But II is not asserted merely because a feature is unrecorded: that would
  // claim "not Category I" from something nobody looked at.
  assert.equal(nichdFhr({ baseline: 140, variability: 'moderate', lateDecels: 'absent' }).category, null);
});
