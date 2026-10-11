// spec-v1630 tool 5: lipid emulsion dose and rate against the label, on fail-closed label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lipidEmulsionDoseCheck as l, PRODUCTS } from '../../lib/lipid-emulsion-dose-check-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';
import { LIPID_PRODUCTS } from '../../lib/medication-v4.js';

const now = new Date('2026-10-11T12:00:00Z');
const base = { product: 'intralipid-20', ageBand: '2-11', weight: 20, weightUnit: 'kg', order: 3, orderUnit: 'g-kg-day', hours: 12, route: 'y-site' };

test('the label maximums, by product and age band, as read on the five labels', () => {
  assert.deepEqual(PRODUCTS['intralipid-20'].max, [3, 2.5, 2, 2.5]);
  assert.deepEqual(PRODUCTS.smoflipid.max, [3, 3, 2.5, 2.5]);
  assert.deepEqual(PRODUCTS.clinolipid.max, [3, 3, 3, 2.5]);
  assert.deepEqual(PRODUCTS.omegaven.max, [1, 1, 1, null]);
  assert.deepEqual(PRODUCTS['intralipid-30'].max, [3, 2.5, 2, 2.5]);
  assert.deepEqual([PRODUCTS['intralipid-20'].rate, PRODUCTS.omegaven.rate, PRODUCTS['intralipid-30'].infantGPerKgHour], [[0.75, 0.5], [1.5, null], 0.125]);
  for (const p of Object.values(PRODUCTS)) assert.equal(labelRow(p.setId, now).answers, true, p.name);
});

test('a generic 3 g/kg/day would be wrong: the same order passes on one label and not another', () => {
  const intralipid = l(base, now);
  assert.deepEqual([intralipid.gPerKgDay, intralipid.mLPerDay, intralipid.doseAgainst, intralipid.labelMaximum], [3, 300, 'above', 2.5]);
  assert.equal(l({ ...base, product: 'smoflipid' }, now).doseAgainst, 'at or under');
  assert.equal(l({ ...base, product: 'clinolipid' }, now).doseAgainst, 'at or under');
  // 12 to 17 years: 2, 2.5 and 3.
  const teen = { ...base, ageBand: '12-17', order: 2.5 };
  assert.deepEqual(['intralipid-20', 'smoflipid', 'clinolipid'].map((product) => l({ ...teen, product }, now).doseAgainst), ['above', 'at or under', 'at or under']);
  assert.equal(l({ ...base, order: 2.5 }, now).doseAgainst, 'at or under');
});

test('the rate is mL/kg/hour against 0.75 (pediatric) or 0.5 (adult), and the order unit only changes the entry', () => {
  // 2 g/kg/day in 20 kg is 40 g, 200 mL; over 20 hours that is 0.5 mL/kg/hour.
  const r = l({ ...base, order: 2, hours: 20, route: 'admixture' }, now);
  assert.deepEqual([r.mLPerKgHour, r.gPerKgHour, r.rateAgainst, r.hangAgainst, r.abnormal], [0.5, 0.1, 'at or under', 'at or under', false]);
  assert.equal(l({ ...base, order: 40, orderUnit: 'g', hours: 20, route: 'admixture' }, now).mLPerKgHour, 0.5);
  assert.equal(l({ ...base, order: 200, orderUnit: 'mL', hours: 20, route: 'admixture' }, now).gPerKgDay, 2);
  const adult = l({ ...base, ageBand: 'adult', weight: 70, order: 1, hours: 8 }, now);
  assert.deepEqual([adult.mLPerKgHour, adult.rateAgainst, adult.labelMaximumRate], [0.625, 'above', 0.5]);
  assert.match(adult.notes.join(' '), /not more than 500 mL of Intralipid on the first day/);
});

test('duration: 12 hours by Y-connector and 24 inside an admixture; Clinolipid prints no such limit', () => {
  assert.equal(l({ ...base, order: 2, hours: 13 }, now).hangAgainst, 'above');
  assert.equal(l({ ...base, order: 2, hours: 13, route: 'admixture' }, now).hangAgainst, 'at or under');
  const clino = l({ ...base, product: 'clinolipid', order: 2, hours: 30, route: 'admixture' }, now);
  assert.equal(clino.hangAgainst, undefined);
  assert.match(clino.notes.join(' '), /prints no time limit by route.*20 to 24 hours for preterm and term neonates/);
});

test('Omegaven: 1 g/kg/day is the maximum, 1.5 mL/kg/hour the rate, and there is no adult row', () => {
  const child = l({ ...base, product: 'omegaven', order: 1.2, hours: 12 }, now);
  assert.deepEqual([child.doseAgainst, child.labelMaximum, child.mLPerKgHour, child.rateAgainst], ['above', 1, 1, 'at or under']);
  const adult = l({ ...base, product: 'omegaven', ageBand: 'adult', weight: 70, order: 1, hours: 10 }, now);
  assert.deepEqual([adult.doseAgainst, adult.rateAgainst], [undefined, undefined]);
  assert.match(adult.notes.join(' '), /pediatric dosage only/);
  // 1.12 kcal/mL, and no share-of-energy sentence on this label.
  const energy = l({ ...base, product: 'omegaven', order: 1, totalKcal: 1000 }, now);
  assert.deepEqual([energy.lipidKcal, energy.energySharePercent], [224, 22.4]);
  assert.match(energy.notes.join(' '), /states no share-of-energy limit/);
});

test('Intralipid 30% is for admixing only, with 0.125 g/kg/hour for neonates and infants', () => {
  assert.match(l({ ...base, product: 'intralipid-30' }, now).message, /not intended for direct intravenous infusion/);
  const infant = { ...base, product: 'intralipid-30', route: 'admixture', ageBand: 'birth-2', weight: 3, order: 3 };
  assert.deepEqual([l({ ...infant, hours: 24 }, now).gPerKgHour, l({ ...infant, hours: 24 }, now).rateAgainst], [0.125, 'at or under']);
  assert.equal(l({ ...infant, hours: 20 }, now).rateAgainst, 'above');
  assert.equal(l({ ...infant, hours: 20 }, now).mLPerDay, 30);
  assert.equal(l({ ...base, product: 'intralipid-30', route: 'admixture', order: 2 }, now).rateAgainst, undefined);
});

test('the 60% of energy sentence is applied only where the label prints it', () => {
  // 500 mL at 2 kcal/mL is 1,000 kcal.
  const adult = { product: 'clinolipid', ageBand: 'adult', weight: 70, weightUnit: 'kg', order: 500, orderUnit: 'mL', hours: 24, route: 'admixture' };
  const over = l({ ...adult, totalKcal: 1500 }, now);
  assert.deepEqual([over.lipidKcal, over.energySharePercent, over.abnormal], [1000, 66.67, true]);
  assert.match(over.band, /more than 60% of energy/);
  assert.equal(l({ ...adult, totalKcal: 2000 }, now).abnormal, false);
  assert.equal(l(adult, now).energySharePercent, undefined);
});

test('energy and strength agree with the figures tpn-macro already reads from the same labels', () => {
  const same = (mine, theirs) => assert.deepEqual([PRODUCTS[mine].gPerMl, PRODUCTS[mine].kcalPerMl], [LIPID_PRODUCTS[theirs].gPerMl, LIPID_PRODUCTS[theirs].kcalPerMl], mine);
  for (const k of ['intralipid-20', 'smoflipid', 'clinolipid']) same(k, 'lipid-20');
  same('intralipid-30', 'intralipid-30');
  same('omegaven', 'omegaven');
});

test('fail closed: a lapsed or superseded label gives the arithmetic and no label figure', () => {
  const id = PRODUCTS['intralipid-20'].setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = l(base, when, table);
    assert.deepEqual([r.valid, r.withheld, r.gPerKgDay, r.doseAgainst, r.labelMaximum], [true, true, 3, undefined, undefined]);
    assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /2\.5 g\/kg\/day|0\.75 mL\/kg\/hour/);
    assert.match(r.band, /label comparison is withheld/);
    const own = l({ ...base, ownMax: 2.5 }, when, table);
    assert.deepEqual([own.doseAgainst, own.abnormal], ['above', true]);
    assert.match(own.band, /you entered from the label in hand/);
  }
  // Another product keeps answering while one is superseded.
  assert.equal(l({ ...base, product: 'smoflipid' }, now, superseded).doseAgainst, 'at or under');
});

test('every choice is required; nothing is defaulted', () => {
  for (const k of Object.keys(base)) {
    const r = l({ ...base, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.match(l({ ...base, weight: 20000, weightUnit: 'g', order: 2 }, now).band, /^2 g\/kg\/day/);
});
