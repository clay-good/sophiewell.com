import test from 'node:test';
import assert from 'node:assert/strict';
import { clabsiLcbi as c, ADULT_SIGNS, INFANT_SIGNS, ORGANISM_TYPES, DEVICE_DAY_MINIMUM } from '../../lib/clabsi-lcbi-v874.js';

const device = { lineDays: 4, linePresentOnOrDayBefore: true };

test('clabsi-lcbi: the published vocabularies', () => {
  assert.deepEqual(ADULT_SIGNS.map((s) => s.key), ['fever', 'chills', 'hypotension']);
  assert.deepEqual(INFANT_SIGNS.map((s) => s.key), ['fever', 'hypothermia', 'apnea', 'bradycardia']);
  assert.deepEqual(ORGANISM_TYPES.map((o) => o.value), ['none', 'recognized-pathogen', 'common-commensal']);
  assert.equal(DEVICE_DAY_MINIMUM, 2);
});

test('clabsi-lcbi: LCBI 1 needs one culture and no signs', () => {
  const r = c({ organism: 'recognized-pathogen', ...device });
  assert.equal(r.lcbi, 1);
  assert.equal(r.classification, 'clabsi');
  assert.equal(r.signsPresent.length, 0);
  assert.match(r.cultureCountNote, /One culture is enough for a recognized pathogen/);
});

test('clabsi-lcbi: LCBI 2 needs two cultures AND a sign', () => {
  const base = { organism: 'common-commensal', ...device };
  assert.equal(c({ ...base, fever: true }).lcbi, null);
  assert.equal(c({ ...base, commensalTwoCultures: true }).lcbi, null);
  assert.equal(c({ ...base, commensalTwoCultures: true, fever: true }).lcbi, 2);
  assert.match(c(base).cultureCountNote, /single commensal culture is a contaminant/);
});

test('clabsi-lcbi: the accepted sign list changes with age', () => {
  const base = { organism: 'common-commensal', commensalTwoCultures: true, ...device };
  // Chills counts for an adult and not for an infant; apnea the other way round.
  assert.equal(c({ ...base, age: 'adult', chills: true }).lcbi, 2);
  assert.equal(c({ ...base, age: 'infant', chills: true }).lcbi, null);
  assert.equal(c({ ...base, age: 'infant', apnea: true }).lcbi, 2);
  assert.equal(c({ ...base, age: 'adult', apnea: true }).lcbi, null);
  assert.match(c({ ...base, age: 'infant' }).signsNote, /one year old or younger/);
  assert.match(c({ ...base, age: 'adult' }).signsNote, /adult list/);
});

test('clabsi-lcbi: the device rule has two halves, and the tile names the failing one', () => {
  const lab = { organism: 'recognized-pathogen' };
  // More than two consecutive calendar days: day 2 is not enough, day 3 is.
  assert.equal(c({ ...lab, lineDays: 2, linePresentOnOrDayBefore: true }).classification, 'lcbi-not-device-associated');
  assert.equal(c({ ...lab, lineDays: 3, linePresentOnOrDayBefore: true }).classification, 'clabsi');
  assert.match(c({ ...lab, lineDays: 2, linePresentOnOrDayBefore: true }).band, /asks for more than 2/);
  // The presence half.
  assert.match(c({ ...lab, lineDays: 9 }).band, /not in place on the day of the event or the day before/);
  // Days not entered at all.
  assert.match(c({ ...lab, linePresentOnOrDayBefore: true }).band, /not entered/);
});

test('clabsi-lcbi: an organism from another site is not an LCBI at all', () => {
  const r = c({ organism: 'recognized-pathogen', secondarySite: true, ...device });
  assert.equal(r.classification, 'secondary');
  assert.equal(r.lcbi, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /secondary bloodstream infection/);
});

test('clabsi-lcbi: it is a surveillance definition, said on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { organism: 'recognized-pathogen', ...device }, { organism: 'common-commensal' }]) {
    assert.match(c(input).surveillanceNote, /not a clinical diagnosis/);
    assert.match(c(input).surveillanceNote, /not a statement that the line caused the infection/);
    assert.match(c(input).deviceRuleNote, /counts the day of insertion as day 1/);
  }
});

test('clabsi-lcbi: unknown values fall back, and the day range is checked', () => {
  assert.equal(c({ organism: 'maybe' }).organism, 'none');
  assert.equal(c({ lineDays: -1 }).valid, false);
  assert.equal(c({ lineDays: 3651 }).valid, false);
  assert.equal(c({ lineDays: 'abc' }).lineDays, null);
});

test('clabsi-lcbi: the documented example', () => {
  const r = c({ age: 'adult', organism: 'recognized-pathogen', lineDays: '4', linePresentOnOrDayBefore: true });
  assert.equal(r.classification, 'clabsi');
  assert.equal(r.lcbi, 1);
  assert.equal(r.recordedNote, 'Recorded: a recognized pathogen, 0 accepted signs, and a line in place 4 calendar days.');
});
