// spec-v918: the FMEA risk priority number. The test that matters is that two very different
// failure modes reach the same number and the tile says so rather than banding either.

import test from 'node:test';
import assert from 'node:assert/strict';
import { fmeaRpn, FMEA_NOTE } from '../../lib/fmea-rpn-v918.js';

test('fmea-rpn: the product is the three scores multiplied', () => {
  assert.equal(fmeaRpn({ severity: 10, occurrence: 5, detection: 2 }).rpn, 100);
  assert.equal(fmeaRpn({ severity: 10, occurrence: 10, detection: 10 }).rpn, 1000);
  assert.equal(fmeaRpn({ severity: 1, occurrence: 1, detection: 1 }).rpn, 1);
});

test('fmea-rpn: two unlike failure modes reach the same number', () => {
  const deadly = fmeaRpn({ severity: 10, occurrence: 5, detection: 2 });
  const trivial = fmeaRpn({ severity: 2, occurrence: 5, detection: 10 });
  assert.equal(deadly.rpn, trivial.rpn);
  assert.notEqual(deadly.profile, trivial.profile);
  assert.match(deadly.rankingNote, /only one of them describes something that kills someone/);
});

test('fmea-rpn: nothing is banded, and nothing is flagged abnormal', () => {
  const r = fmeaRpn({ severity: 10, occurrence: 10, detection: 10 });
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not banded, and it is not a rank/);
  assert.match(r.thresholdNote, /appears in no standard/);
});

test('fmea-rpn: the profile and the largest factor are reported before the product', () => {
  const r = fmeaRpn({ severity: 3, occurrence: 9, detection: 4 });
  assert.equal(r.profile, 'Severity 3, occurrence 9, detection 4.');
  assert.match(r.driverNote, /largest of the three is occurrence at 9/);
  assert.match(r.driverNote, /read the three before the one/);
});

test('fmea-rpn: a high severity is called out whatever the product comes to', () => {
  assert.match(fmeaRpn({ severity: 9, occurrence: 1, detection: 1 }).severityNote, /Severity is 9\./);
  assert.match(fmeaRpn({ severity: 8, occurrence: 10, detection: 10 }).severityNote, /can force action on its own/);
});

test('fmea-rpn: the scales are ordinal, so an off-scale value is refused rather than clamped', () => {
  assert.equal(fmeaRpn({ severity: 11, occurrence: 5, detection: 2 }).valid, false);
  assert.equal(fmeaRpn({ severity: 0, occurrence: 5, detection: 2 }).valid, false);
  assert.match(fmeaRpn({ severity: 5.5, occurrence: 5, detection: 2 }).message, /whole number from 1 to 10/);
  assert.match(fmeaRpn({ severity: 11, occurrence: 5, detection: 2 }).message, /not a score at all/);
});

test('fmea-rpn: all three are required, and the message names the missing ones', () => {
  assert.match(fmeaRpn({ severity: 5 }).message, /occurrence, detection/);
  assert.match(fmeaRpn({}).message, /severity, occurrence, detection/);
});

test('fmea-rpn: the detection direction and the 2019 successor are stated on every result', () => {
  const r = fmeaRpn({ severity: 5, occurrence: 5, detection: 5 });
  assert.match(r.detectionNote, /scored backwards from the other two/);
  assert.match(r.supersededNote, /Action Priority/);
  assert.match(r.scopeNote, /does not decide what to act on/);
  assert.match(FMEA_NOTE, /does not band it/);
});
