// spec-v1029: five scores that reassured from a measurement nobody entered.
//
// Each of these tiles sat on the empty-form ledger, which exempts a tile from
// the whole-catalog sweep. The exemption was written for checklists, where an
// unticked box is a real "no" -- but each of these five also reads a NUMBER, and
// a blank one arrived as zero: an age of 0, a pulse of 0, a count of 0 prior
// admissions. Every one of them made the reading more reassuring than the form
// supported.
//
// The rule is the program's: these scores are monotone, so what has been
// entered is a lower bound. Where the missing points cannot change the band, the
// answer stands. Where they can, the tile asks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pesi, charlson, hospitalScore, geneva, pecarnHead } from '../../lib/scoring-v4.js';

test('pesi: no class until the age is entered', () => {
  const r = pesi({ sex: 'F' });
  assert.equal(r.score, null);
  assert.equal(r.class, null);
  assert.equal(r.incomplete, true);
  assert.doesNotMatch(r.band, /Class I \(very low risk/);
  assert.match(r.band, /Enter the age/);
});

test('pesi: the criteria alone still name the floor they reach', () => {
  const r = pesi({ sex: 'M', cancer: true, alteredMental: true, sbp100: true, rr30: true });
  assert.equal(r.incomplete, true);
  assert.match(r.band, /already reach Class V/);
});

test('pesi: with the age it answers exactly as before', () => {
  const r = pesi({ age: 70, sex: 'M', cancer: true });
  assert.equal(r.score, 110);
  assert.equal(r.class, 'IV');
});

test('charlson: no survival estimate from an unentered age', () => {
  const r = charlson({ items: {} });
  assert.equal(r.score, null);
  assert.equal(r.incomplete, true);
  assert.doesNotMatch(r.band, /98%/);
});

test('charlson: four points cannot move the worst band, so it answers', () => {
  const r = charlson({ items: { aids: true } });
  assert.equal(r.score, 6);
  assert.match(r.band, /~85%/);
});

test('hospitalScore: no low-risk reading without the admission count', () => {
  const r = hospitalScore({});
  assert.equal(r.score, null);
  assert.equal(r.incomplete, true);
  assert.doesNotMatch(r.band, /low risk/);
  assert.match(r.band, /admissions in the past 12 months/);
});

test('hospitalScore: already high risk, so the missing count changes nothing', () => {
  const r = hospitalScore({
    hgbLt12: true, oncologyDischarge: true, sodiumLt135: true,
    anyProcedure: true, urgentAdmission: true, losGe5: true,
  });
  assert.equal(r.score, 8);
  assert.match(r.band, /high risk/);
});

test('geneva: no probability group without a heart rate', () => {
  const r = geneva({});
  assert.equal(r.score, null);
  assert.equal(r.incomplete, true);
  assert.doesNotMatch(r.band, /Low/);
  assert.match(r.band, /Enter the heart rate/);
});

test('geneva: five more points cannot leave the high band, so it answers', () => {
  const r = geneva({
    priorVte: true, unilateralLegPain: true, activeMalignancy: true,
    recentSurgery: true, lowerLimbExam: true,
  });
  assert.equal(r.score, 14);
  assert.match(r.band, /High/);
});

test('pecarnHead: the age picks the rule, and there is no tier while the rules disagree', () => {
  const r = pecarnHead({ gcs15: true, vomiting: true });
  assert.equal(r.tier, null);
  assert.equal(r.incomplete, true);
  assert.match(r.band, /under 2 this is very low risk, at 2 and over it is intermediate risk/);
});

test('pecarnHead: where both rules agree it answers, minus the age-specific rate', () => {
  const r = pecarnHead({ gcs15: true });
  assert.equal(r.tier, 'very-low');
  assert.equal(r.ciTbiRiskPct, null);
  assert.match(r.band, /CT not recommended/);
});

test('pecarnHead: a high-risk finding rules in whatever the age', () => {
  const r = pecarnHead({ gcs15: false });
  assert.equal(r.tier, 'high');
  assert.match(r.band, /CT recommended/);
});
