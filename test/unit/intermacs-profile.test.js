// spec-v494: INTERMACS profiles of advanced heart failure (profiles 1-7).
// Worked-example tests: each profile and its clinical-severity description, numeric input, invalid-profile guard.
// Profiles transcribed from Stevenson and colleagues 2009 (J Heart Lung Transplant) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intermacsProfile } from '../../lib/intermacs-profile-v494.js';

test('profile 3: stable but inotrope dependent (the META example)', () => {
  const r = intermacsProfile({ profile: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.profile, '3');
  assert.match(r.band, /stable but inotrope dependent \(dependent stability\)/);
});

test('profile 1: critical cardiogenic shock', () => {
  assert.match(intermacsProfile({ profile: '1' }).band, /critical cardiogenic shock \(crash and burn\)/);
});

test('profile 2: progressive decline on inotropes', () => {
  assert.match(intermacsProfile({ profile: '2' }).band, /progressive decline \(sliding on inotropes\)/);
});

test('profile 4: resting symptoms', () => {
  assert.match(intermacsProfile({ profile: '4' }).band, /resting symptoms \(frequent flyer\)/);
});

test('profiles 5 and 6 split on how far activity is limited', () => {
  assert.match(intermacsProfile({ profile: '5' }).band, /exertion intolerant \(housebound\)/);
  assert.match(intermacsProfile({ profile: '6' }).band, /exertion limited \(walking wounded\)/);
});

test('profile 7: advanced NYHA class III', () => {
  const r = intermacsProfile({ profile: '7' });
  assert.equal(r.profile, '7');
  assert.match(r.band, /advanced NYHA class III \(placeholder\)/);
});

test('numeric input maps to the profiles', () => {
  assert.equal(intermacsProfile({ profile: 1 }).profile, '1');
  assert.equal(intermacsProfile({ profile: 7 }).profile, '7');
});

test('a missing or out-of-range profile is invalid', () => {
  assert.equal(intermacsProfile({}).valid, false);
  assert.equal(intermacsProfile({ profile: '0' }).valid, false);
  assert.equal(intermacsProfile({ profile: '8' }).valid, false);
});
