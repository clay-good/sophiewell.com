import test from 'node:test';
import assert from 'node:assert/strict';
import { bloodLead as bl, REFERENCE_VALUE } from '../../lib/lead-v863.js';

test('lead: the reference value is 3.5 and the boundary is inclusive', () => {
  assert.equal(REFERENCE_VALUE, 3.5);
  assert.equal(bl({ level: 3.4 }).atOrAbove, false);
  assert.equal(bl({ level: 3.5 }).atOrAbove, true);
  assert.equal(bl({ level: 3.5 }).abnormal, true);
  assert.equal(bl({ level: 3.4 }).abnormal, false);
});

test('lead: the band the old line of 5 hides is named', () => {
  // The reason the tile exists.
  const r = bl({ level: 4.2 });
  assert.equal(r.atOrAbove, true);
  assert.match(r.loweredNote, /below the old line of 5/);
  assert.match(r.loweredNote, /would have looked normal/);
  // Outside that band there is nothing to say about the old line.
  assert.equal(bl({ level: 5 }).loweredNote, null);
  assert.equal(bl({ level: 3.4 }).loweredNote, null);
});

test('lead: the reference value is never presented as safe or as a treatment line', () => {
  for (const level of [0, 2, 3.5, 12, 50, 90]) {
    assert.match(bl({ level }).notSafeNote, /not a safe level/);
    assert.match(bl({ level }).notSafeNote, /97.5th percentile/);
  }
  assert.match(bl({ level: 12 }).actionNote, /find and remove the source/);
  assert.match(bl({ level: 12 }).actionNote, /not a threshold for a drug/);
});

test('lead: the chelation and emergency thresholds', () => {
  assert.equal(bl({ level: 44.9 }).chelationRange, false);
  assert.equal(bl({ level: 45 }).chelationRange, true);
  assert.equal(bl({ level: 69.9 }).emergency, false);
  assert.equal(bl({ level: 70 }).emergency, true);
  assert.match(bl({ level: 70 }).actionNote, /medical emergency/);
  assert.match(bl({ level: 50 }).actionNote, /made with a specialist/);
});

test('lead: an elevated capillary result is sent for venous confirmation', () => {
  assert.match(bl({ level: 12, sample: 'capillary' }).capillaryNote, /confirmed on a venous sample/);
  // A venous result needs no confirmation, and a normal one needs nothing.
  assert.equal(bl({ level: 12, sample: 'venous' }).capillaryNote, null);
  assert.equal(bl({ level: 2, sample: 'capillary' }).capillaryNote, null);
  // An unstated sample type on an elevated result still gets the warning.
  assert.match(bl({ level: 12 }).capillaryNote, /sample type was not entered/);
});

test('lead: a result below the value is not read as no exposure', () => {
  assert.match(bl({ level: 1 }).actionNote, /does not mean there is no exposure/);
});

test('lead: the value has moved before, and the tool says so', () => {
  assert.match(bl({ level: 1 }).historyNote, /from 10 to 5 and then to 3.5/);
});

test('lead: a missing or implausible level is refused', () => {
  assert.equal(bl({}).valid, false);
  assert.match(bl({}).message, /micrograms per deciliter/);
  assert.equal(bl({ level: '' }).valid, false);
  assert.equal(bl({ level: -1 }).valid, false);
  assert.equal(bl({ level: 900 }).valid, false);
});

test('lead: string input from the DOM behaves like a number', () => {
  assert.equal(bl({ level: '4.2', sample: 'capillary' }).atOrAbove, true);
  assert.equal(bl({ level: '3.4' }).atOrAbove, false);
});

// spec-v1401 Part B: the California line appears only when California is chosen.
test('blood-lead: CA capillary 12 is confirmed venous within 1 month; no state changes nothing', () => {
  const ca = bl({ level: '12', sample: 'capillary', state: 'CA' });
  assert.match(ca.caNote, /venous test within 1 month/);
  const none = bl({ level: '12', sample: 'capillary' });
  assert.equal(none.caNote, null);
  assert.equal(none.band, ca.band);
  assert.match(bl({ level: '60', sample: 'capillary', state: 'CA' }).caNote, /within 24 hours/);
  assert.match(bl({ level: '70', sample: 'capillary', state: 'CA' }).caNote, /immediately/);
  assert.match(bl({ level: '4', sample: 'capillary', state: 'CA' }).caNote, /within 3 months/);
});

// spec-v1401 Part B: the New York line uses New York's own line of 5 and sets no confirmation deadline.
test('blood-lead: NY line -- 5 is elevated, capillary confirmed venous with no deadline; no state changes nothing', () => {
  const cap = bl({ level: '6', sample: 'capillary', state: 'NY' });
  assert.match(cap.nyNote, /Confirm this capillary result on a venous sample/);
  assert.match(cap.nyNote, /no deadline/);
  assert.equal(cap.caNote, null);
  assert.equal(cap.band, bl({ level: '6', sample: 'capillary' }).band);
  assert.equal(bl({ level: '6', sample: 'capillary' }).nyNote, null);
  assert.match(bl({ level: '4', sample: 'venous', state: 'NY' }).nyNote, /not elevated under the state rule, although it is at or above/);
  assert.match(bl({ level: '8', sample: 'venous', state: 'NY' }).nyNote, /developmental screening/);
  assert.match(bl({ level: '2', state: 'NY' }).nyNote, /ages 1 and 2/);
});

// spec-v1401 Part B: the Texas line reads DSHS form Pb-109's windows.
test('blood-lead: TX line -- Pb-109 diagnostic venous windows by band', () => {
  assert.match(bl({ level: '12', sample: 'capillary', state: 'TX' }).txNote, /within 1 to 4 weeks/);
  assert.match(bl({ level: '50', sample: 'capillary', state: 'TX' }).txNote, /within 48 hours/);
  assert.match(bl({ level: '5', sample: 'capillary', state: 'TX' }).txNote, /within 1 to 12 weeks/);
  assert.match(bl({ level: '25', sample: 'venous', state: 'TX' }).txNote, /2 weeks to 1 month/);
  assert.match(bl({ level: '12', sample: 'venous', state: 'TX' }).txNote, /persists at least 12 weeks/);
  assert.match(bl({ level: '2', state: 'TX' }).txNote, /no diagnostic venous test/);
  assert.equal(bl({ level: '12', sample: 'capillary', state: 'TX' }).nyNote, null);
  assert.equal(bl({ level: '12', sample: 'capillary' }).txNote, null);
});

// spec-v1401 Part B: New York City reports at 3.5 within 24 hours.
test('blood-lead: NYC line -- report 3.5 or more within 24 hours; venous before the patient leaves', () => {
  const r = bl({ level: '4', sample: 'capillary', state: 'NYC' });
  assert.match(r.nyNote, /within 24 hours/);
  assert.match(r.nyNote, /before the patient leaves/);
  assert.match(r.nyNote, /ages 1 and 2/);
  assert.doesNotMatch(bl({ level: '4', sample: 'venous', state: 'NYC' }).nyNote, /before the patient leaves/);
  assert.match(bl({ level: '3', state: 'NYC' }).nyNote, /not reportable/);
  assert.equal(r.band, bl({ level: '4', sample: 'capillary' }).band);
});
