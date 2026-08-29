import test from 'node:test';
import assert from 'node:assert/strict';
import { methemoglobin as mb } from '../../lib/methemoglobin-v864.js';

test('methb: the six bands and their boundaries', () => {
  assert.match(mb({ level: 2.9 }).bandLabel, /Within the range seen normally/);
  assert.match(mb({ level: 3 }).bandLabel, /A low level/);
  assert.match(mb({ level: 15 }).bandLabel, /cyanosis/);
  assert.match(mb({ level: 20 }).bandLabel, /symptomatic/);
  assert.match(mb({ level: 50 }).bandLabel, /severe/);
  assert.match(mb({ level: 70 }).bandLabel, /often fatal/);
  assert.equal(mb({ level: 2.9 }).abnormal, false);
  assert.equal(mb({ level: 3 }).abnormal, true);
});

test('methb: methylene blue is indicated on symptoms at any level, or at 30 without', () => {
  assert.equal(mb({ level: 5, symptoms: true }).treatmentIndicated, true);
  assert.equal(mb({ level: 29.9 }).treatmentIndicated, false);
  assert.equal(mb({ level: 30 }).treatmentIndicated, true);
  assert.match(mb({ level: 5, symptoms: true }).treatmentNote, /whatever the level/);
  assert.match(mb({ level: 10 }).treatmentNote, /Removing the oxidizing agent/);
});

test('methb: the pulse oximeter is refused as a measurement on every result', () => {
  // The reassurance this tile exists to remove.
  for (const level of [1, 18, 40, 80]) {
    assert.match(mb({ level }).oximeterNote, /does not measure this/);
    assert.match(mb({ level }).oximeterNote, /85 percent/);
  }
  assert.match(mb({ level: 18, spo2: 85 }).oximeterNote, /reading of 85 percent/);
});

test('methb: the arterial oxygen tension is refused too', () => {
  for (const level of [1, 40]) assert.match(mb({ level }).gasNote, /Only co-oximetry measures methemoglobin/);
  assert.match(mb({ level: 40, pao2: 98 }).gasNote, /tension of 98 mmHg says nothing/);
});

test('methb: the oximeter over-reads, and by more as the level climbs', () => {
  // The oximeter stops near 85 while the fraction that can carry oxygen keeps falling,
  // so the gap runs in the reassuring direction and widens with severity.
  assert.equal(mb({ level: 18, spo2: 85 }).oxygenCarrying, 82);
  assert.equal(mb({ level: 18, spo2: 85 }).gap, 3);
  assert.equal(mb({ level: 40, spo2: 85 }).gap, 25);
  assert.equal(mb({ level: 60, spo2: 85 }).gap, 45);
  assert.match(mb({ level: 40, spo2: 85 }).gapNote, /over-reading by 25 percentage points/);
  assert.match(mb({ level: 40, spo2: 85 }).gapNote, /widens as the level climbs/);
  // An oximeter reading at or below the true fraction is still not a measurement.
  assert.equal(mb({ level: 18, spo2: 80 }).gap, -2);
  assert.match(mb({ level: 18, spo2: 80 }).gapNote, /still cannot measure the level/);
  // No oximeter reading, or a normal level, means no gap to report.
  assert.equal(mb({ level: 18 }).gapNote, null);
  assert.equal(mb({ level: 1, spo2: 98 }).gapNote, null);
});

test('methb: G6PD deficiency is raised wherever treatment is in play', () => {
  assert.match(mb({ level: 40, g6pd: true }).g6pdNote, /can cause hemolysis/);
  assert.match(mb({ level: 40, g6pd: true }).g6pdNote, /contraindication that matters most/);
  // Raised on a low level too, because it decides the antidote before it is reached for.
  assert.match(mb({ level: 5, g6pd: true }).g6pdNote, /would not work here/);
  // And raised as an unknown when treatment is indicated and it was not entered.
  assert.match(mb({ level: 40 }).g6pdNote, /was not entered/);
  assert.equal(mb({ level: 5 }).g6pdNote, null);
});

test('methb: methylene blue as an MAO inhibitor is raised only when it is in play', () => {
  assert.match(mb({ level: 40, serotonergic: true }).serotonergicNote, /monoamine oxidase inhibitor/);
  assert.equal(mb({ level: 5, serotonergic: true }).serotonergicNote, null);
  assert.equal(mb({ level: 40 }).serotonergicNote, null);
});

test('methb: a missing or implausible level is refused', () => {
  assert.equal(mb({}).valid, false);
  assert.match(mb({}).message, /co-oximetry/);
  assert.equal(mb({ level: -1 }).valid, false);
  assert.equal(mb({ level: 101 }).valid, false);
  assert.equal(mb({ level: 20, spo2: 120 }).valid, false);
  assert.equal(mb({ level: 20, pao2: 900 }).valid, false);
});

test('methb: string input from the DOM behaves like numbers and checkboxes', () => {
  assert.equal(mb({ level: '30' }).treatmentIndicated, true);
  assert.equal(mb({ level: '5', symptoms: 'true' }).treatmentIndicated, true);
  assert.equal(mb({ level: '5', symptoms: 'false' }).treatmentIndicated, false);
});
