import test from 'node:test';
import assert from 'node:assert/strict';
import { cautiNhsn as u, SYMPTOMS, CULTURE_RESULTS, CATHETER_OUT_ONLY, DEVICE_DAY_MINIMUM } from '../../lib/cauti-nhsn-v875.js';

const met = { catheterDays: 4, catheterStillInPlace: true, fever: true, culture: 'bacterium-threshold' };

test('cauti-nhsn: the published vocabularies', () => {
  assert.deepEqual(SYMPTOMS.map((s) => s.key), ['fever', 'suprapubicTenderness', 'cvaTenderness', 'urgency', 'frequency', 'dysuria']);
  assert.deepEqual(CATHETER_OUT_ONLY, ['urgency', 'frequency', 'dysuria']);
  assert.deepEqual(CULTURE_RESULTS.map((c) => c.value), ['none', 'bacterium-threshold', 'yeast-only', 'below-threshold', 'more-than-two-species']);
  assert.equal(DEVICE_DAY_MINIMUM, 2);
});

test('cauti-nhsn: all three criteria are needed', () => {
  assert.equal(u(met).classification, 'cauti');
  assert.equal(u({ ...met, catheterDays: 2 }).classification, 'not-met');
  assert.equal(u({ ...met, fever: false }).classification, 'not-met');
  assert.equal(u({ ...met, culture: 'none' }).classification, 'not-met');
});

test('cauti-nhsn: urgency, frequency and dysuria are discounted while the catheter is in', () => {
  // The reason the tile exists.
  for (const key of CATHETER_OUT_ONLY) {
    const inPlace = u({ catheterDays: 4, catheterStillInPlace: true, [key]: true, culture: 'bacterium-threshold' });
    assert.equal(inPlace.classification, 'not-met', key);
    assert.equal(inPlace.discounted.length, 1, key);
    assert.match(inPlace.catheterOutNote, /set aside/);
    // Out, the same symptom counts.
    const out = u({ catheterDays: 4, catheterRemovedDayBefore: true, [key]: true, culture: 'bacterium-threshold' });
    assert.equal(out.classification, 'cauti', key);
    assert.equal(out.discounted.length, 0, key);
  }
  // The other three count either way.
  for (const key of ['fever', 'suprapubicTenderness', 'cvaTenderness']) {
    assert.equal(u({ catheterDays: 4, catheterStillInPlace: true, [key]: true, culture: 'bacterium-threshold' }).classification, 'cauti', key);
  }
  assert.match(u(met).catheterOutNote, /counted only once the catheter is out/);
});

test('cauti-nhsn: the device rule has two halves', () => {
  const lab = { fever: true, culture: 'bacterium-threshold' };
  assert.equal(u({ ...lab, catheterDays: 2, catheterStillInPlace: true }).classification, 'not-met');
  assert.equal(u({ ...lab, catheterDays: 3, catheterStillInPlace: true }).classification, 'cauti');
  // Neither still in place nor removed the day before.
  const neither = u({ ...lab, catheterDays: 9 });
  assert.equal(neither.classification, 'not-met');
  assert.match(neither.band, /neither in place on the date of event nor removed the day before/);
  assert.match(u({ ...lab, catheterStillInPlace: true }).band, /not entered/);
});

test('cauti-nhsn: the two culture exclusions', () => {
  const three = u({ ...met, culture: 'more-than-two-species' });
  assert.equal(three.classification, 'not-met');
  assert.match(three.speciesNote, /excludes the event/);
  const yeast = u({ ...met, culture: 'yeast-only' });
  assert.equal(yeast.classification, 'not-met');
  assert.match(yeast.yeastNote, /Yeast is not a bacterium/);
  assert.equal(u({ ...met, culture: 'below-threshold' }).classification, 'not-met');
  assert.match(u({ ...met, culture: 'below-threshold' }).band, /below 100,000 CFU\/mL/);
  assert.equal(u(met).speciesNote, null);
  assert.equal(u(met).yeastNote, null);
});

test('cauti-nhsn: it is a surveillance definition, said on every result', () => {
  for (const input of [{}, met, { ...met, culture: 'yeast-only' }]) {
    assert.match(u(input).surveillanceNote, /not a clinical diagnosis/);
    assert.match(u(input).surveillanceNote, /asymptomatic bacteriuria/);
    assert.match(u(input).deviceRuleNote, /counts the day of insertion as day 1/);
  }
});

test('cauti-nhsn: unknown values fall back, and the day range is checked', () => {
  assert.equal(u({ culture: 'maybe' }).culture, 'none');
  assert.equal(u({ catheterDays: -1 }).valid, false);
  assert.equal(u({ catheterDays: 3651 }).valid, false);
  assert.equal(u({ catheterDays: 'abc' }).catheterDays, null);
});

test('cauti-nhsn: the documented example', () => {
  const r = u({ catheterDays: '4', catheterStillInPlace: true, fever: true, culture: 'bacterium-threshold' });
  assert.equal(r.classification, 'cauti');
  assert.equal(r.recordedNote, 'Recorded: 1 accepted symptom, and a catheter in place 4 calendar days.');
});
