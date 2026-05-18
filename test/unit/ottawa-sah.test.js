// spec-v12 §3.5.5 wave 12-5: Ottawa SAH Rule boundary examples per
// Perry JJ, et al. JAMA. 2013;310(12):1248-1255 Figure 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ottawaSah } from '../../lib/scoring-v4.js';

test('ottawaSah rule out: all six negative -> rule out SAH', () => {
  const r = ottawaSah({ exclusionCriteriaPresent: false,
    ageGe40: false, neckPainOrStiffness: false, witnessedLoc: false,
    onsetDuringExertion: false, thunderclapHeadache: false,
    limitedNeckFlexion: false });
  assert.equal(r.applicable, true);
  assert.equal(r.cannotRuleOut, false);
  assert.match(r.band, /Rule out SAH/);
});

test('ottawaSah any positive (age >= 40) -> cannot rule out', () => {
  const r = ottawaSah({ exclusionCriteriaPresent: false,
    ageGe40: true, neckPainOrStiffness: false, witnessedLoc: false,
    onsetDuringExertion: false, thunderclapHeadache: false,
    limitedNeckFlexion: false });
  assert.equal(r.applicable, true);
  assert.equal(r.cannotRuleOut, true);
  assert.match(r.band, /Cannot rule out/);
});

test('ottawaSah thunderclap alone -> cannot rule out', () => {
  const r = ottawaSah({ exclusionCriteriaPresent: false,
    ageGe40: false, neckPainOrStiffness: false, witnessedLoc: false,
    onsetDuringExertion: false, thunderclapHeadache: true,
    limitedNeckFlexion: false });
  assert.equal(r.cannotRuleOut, true);
});

test('ottawaSah exclusion present -> rule does not apply', () => {
  const r = ottawaSah({ exclusionCriteriaPresent: true,
    ageGe40: false, neckPainOrStiffness: false, witnessedLoc: false,
    onsetDuringExertion: false, thunderclapHeadache: false,
    limitedNeckFlexion: false });
  assert.equal(r.applicable, false);
  assert.equal(r.cannotRuleOut, null);
  assert.match(r.band, /does not apply/);
});
