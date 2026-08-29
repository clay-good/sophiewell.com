import test from 'node:test';
import assert from 'node:assert/strict';
import { nhsnVae as v, FIO2_RISE_POINTS, PEEP_RISE_CMH2O, PEEP_FLOOR } from '../../lib/nhsn-vae-v876.js';

const stable = { stabilityPeriod: true, sustainedTwoDays: true };
const flat = { baselineFio2: 40, eventFio2: 40, baselinePeep: 5, eventPeep: 5 };

test('nhsn-vae: the published thresholds', () => {
  assert.equal(FIO2_RISE_POINTS, 20);
  assert.equal(PEEP_RISE_CMH2O, 3);
  assert.equal(PEEP_FLOOR, 5);
});

test('nhsn-vae: either oxygenation route opens a VAC', () => {
  assert.equal(v({ ...stable, ...flat, eventFio2: 60 }).tier, 'vac');
  assert.equal(v({ ...stable, ...flat, eventPeep: 8 }).tier, 'vac');
  // Just under each threshold.
  assert.equal(v({ ...stable, ...flat, eventFio2: 59 }).tier, 'none');
  assert.equal(v({ ...stable, ...flat, eventPeep: 7 }).tier, 'none');
});

test('nhsn-vae: a PEEP below 5 is floored to 5', () => {
  // The rule that stops 0 -> 3 reading as a qualifying rise.
  const zeroToThree = v({ ...stable, ...flat, baselinePeep: 0, eventPeep: 3 });
  assert.equal(zeroToThree.tier, 'none');
  assert.equal(zeroToThree.flooredBaselinePeep, 5);
  assert.equal(zeroToThree.flooredEventPeep, 5);
  assert.equal(zeroToThree.peepRise, 0);
  assert.match(zeroToThree.peepFloorNote, /treated as 5/);
  // And 2 -> 8 is a rise of 3, not 6.
  const twoToEight = v({ ...stable, ...flat, baselinePeep: 2, eventPeep: 8 });
  assert.equal(twoToEight.peepRise, 3);
  assert.equal(twoToEight.tier, 'vac');
  // Nothing to say when both values are at or above the floor.
  assert.equal(v({ ...stable, ...flat, eventPeep: 8 }).peepFloorNote, null);
});

test('nhsn-vae: no stability period means no event at all', () => {
  const r = v({ sustainedTwoDays: true, ...flat, eventFio2: 90 });
  assert.equal(r.tier, 'none');
  assert.match(r.missingNote, /no stability period/);
  assert.match(r.missingNote, /without one there is no baseline/);
  // Nor does an unsustained rise count.
  const unsustained = v({ stabilityPeriod: true, ...flat, eventFio2: 90 });
  assert.equal(unsustained.tier, 'none');
  assert.match(unsustained.missingNote, /not recorded as sustained/);
});

test('nhsn-vae: IVAC needs an inflammation criterion AND a new antimicrobial', () => {
  const vac = { ...stable, ...flat, eventFio2: 65 };
  assert.equal(v({ ...vac, temperatureAbnormal: true }).tier, 'vac');
  assert.equal(v({ ...vac, newAntimicrobialFourDays: true }).tier, 'vac');
  assert.equal(v({ ...vac, temperatureAbnormal: true, newAntimicrobialFourDays: true }).tier, 'ivac');
  assert.equal(v({ ...vac, whiteCountAbnormal: true, newAntimicrobialFourDays: true }).tier, 'ivac');
  assert.match(v(vac).nextTierNote, /Any antibiotic already running does not count/);
});

test('nhsn-vae: PVAP sits on top of IVAC, not on VAC', () => {
  const vac = { ...stable, ...flat, eventFio2: 65 };
  assert.equal(v({ ...vac, microbiologicalCriterion: true }).tier, 'vac');
  const pvap = v({ ...vac, temperatureAbnormal: true, newAntimicrobialFourDays: true, microbiologicalCriterion: true });
  assert.equal(pvap.tier, 'pvap');
  assert.match(pvap.pvapNote, /not a diagnosis of pneumonia/);
});

test('nhsn-vae: the no-radiograph and daily-minimum rules print on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { ...stable, ...flat, eventFio2: 65 }]) {
    assert.match(v(input).noRadiographNote, /no chest radiograph/);
    assert.match(v(input).dailyMinimumNote, /on the daily minimum/);
    assert.match(v(input).dailyMinimumNote, /transient rise/);
  }
});

test('nhsn-vae: out-of-range settings are rejected', () => {
  assert.equal(v({ baselineFio2: 20 }).valid, false);
  assert.equal(v({ eventFio2: 101 }).valid, false);
  assert.equal(v({ baselinePeep: -1 }).valid, false);
  assert.equal(v({ eventPeep: 41 }).valid, false);
  assert.equal(v({ baselineFio2: 'abc' }).fio2Rise, null);
});

test('nhsn-vae: the documented example', () => {
  const r = v({ stabilityPeriod: true, baselineFio2: '40', baselinePeep: '5', eventFio2: '65', eventPeep: '5', sustainedTwoDays: true, temperatureAbnormal: true, newAntimicrobialFourDays: true });
  assert.equal(r.tier, 'ivac');
  assert.equal(r.fio2Rise, 25);
  assert.match(r.band, /25 points/);
});
