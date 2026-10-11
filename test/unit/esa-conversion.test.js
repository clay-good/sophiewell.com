// spec-v1633 tool 9: ESA conversion tables from the Aranesp and Mircera labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esaConversion as d, TARGETS, ARANESP_ROWS, MIRCERA_PEDIATRIC } from '../../lib/esa-conversion-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const ara = (weeklyDose, population = 'adult', epoetinFrequency = 'two-to-three-weekly') => d({ target: 'aranesp', current: 'epoetin', population, weeklyDose, epoetinFrequency }, now);
const mir = (current, weeklyDose, population = 'adult', mirceraInterval = 'monthly') => d({ target: 'mircera', current, population, weeklyDose, mirceraInterval }, now);

test('the two labels answer, and the tables are the labels\'', () => {
  for (const t of TARGETS) assert.equal(labelRow(t.setId, now).answers, true, t.brand);
  assert.deepEqual(ARANESP_ROWS.map((r) => [r[2], r[3]]), [[6.25, null], [6.25, 6.25], [12.5, 10], [25, 20], [40, 40], [60, 60], [100, 100], [200, 200]]);
  assert.deepEqual(MIRCERA_PEDIATRIC.map((r) => r[2]), [30, 50, 75, 100, 120, 150, 200, 250, 360]);
});

test('Aranesp Table 1: adult and pediatric figures by weekly epoetin dose', () => {
  assert.deepEqual([1499, 1500, 2499, 2500, 4999, 5000, 10999, 11000, 17999, 18000, 33999, 34000, 89999, 90000].map((u) => ara(u).mcgPerWeek), [6.25, 6.25, 6.25, 12.5, 12.5, 25, 25, 40, 40, 60, 60, 100, 100, 200]);
  assert.deepEqual([1500, 2500, 5000, 11000].map((u) => ara(u, 'pediatric').mcgPerWeek), [6.25, 10, 20, 40]);
  const none = ara(1499, 'pediatric');
  assert.deepEqual([none.flag, none.mcgPerWeek, none.abnormal], ['no-recommendation-given', undefined, true]);
  assert.equal(ara(2499.5).flag, 'between-bands');
});

test('Aranesp interval follows the epoetin frequency, and the weekly figure is not doubled', () => {
  assert.equal(ara(9000).interval, 'once weekly');
  const r = ara(9000, 'adult', 'weekly');
  assert.deepEqual([r.interval, r.mcgPerWeek], ['once every 2 weeks', 25]);
  assert.match(r.notes.join(' '), /not doubled/);
  assert.doesNotMatch(ara(9000).notes.join(' '), /not doubled/);
  assert.match(ara(9000).notes.join(' '), /does not accurately estimate the once monthly dose/);
  assert.match(d({ target: 'aranesp', current: 'epoetin', population: 'adult', weeklyDose: 9000 }, now).message, /how often the epoetin alfa is given/);
  assert.match(d({ target: 'aranesp', current: 'darbepoetin', population: 'adult', weeklyDose: 40 }, now).message, /Aranesp is darbepoetin alfa/);
});

test('Mircera adults: three rows, from epoetin or darbepoetin, monthly or every two weeks', () => {
  assert.deepEqual([7999, 8000, 16000, 16001].map((u) => mir('epoetin', u).mcg), [120, 200, 200, 360]);
  assert.deepEqual([39, 40, 80, 81].map((m) => mir('darbepoetin', m).mcg), [120, 200, 200, 360]);
  assert.deepEqual([7999, 8000, 16001].map((u) => mir('epoetin', u, 'adult', 'every-two-weeks').mcg), [60, 100, 180]);
  assert.match(d({ target: 'mircera', current: 'epoetin', population: 'adult', weeklyDose: 8000 }, now).message, /Mircera interval/);
});

test('Mircera children: nine bands, each "to less than", once every 4 weeks', () => {
  const p = (current, dose) => mir(current, dose, 'pediatric').mcg;
  assert.deepEqual([1299, 1300, 1999, 2000, 2700, 3500, 4200, 5500, 7000, 9499, 9500].map((u) => p('epoetin', u)), [30, 50, 50, 75, 100, 120, 150, 200, 250, 250, 360]);
  assert.deepEqual([5.9, 6, 9, 12, 15, 19, 24, 31, 41.9, 42].map((m) => p('darbepoetin', m)), [30, 50, 75, 100, 120, 150, 200, 250, 250, 360]);
  const r = mir('epoetin', 2000, 'pediatric');
  assert.equal(r.interval, 'every-four-weeks');
  assert.match(r.notes.join(' '), /less than 30 mcg should not be treated with Mircera/);
  assert.equal(d({ target: 'mircera', current: 'epoetin', population: 'pediatric', weeklyDose: 2000 }, now).valid, true); // no adult interval asked
});

test('nothing is defaulted, one way is said, and a superseded label withholds', () => {
  assert.match(d({}, now).message, /^Choose the product being started/);
  assert.match(d({ target: 'mircera' }, now).message, /current ESA/);
  assert.match(d({ target: 'mircera', current: 'epoetin' }, now).message, /adult or pediatric/);
  assert.match(d({ target: 'mircera', current: 'epoetin', population: 'adult' }, now).message, /^Enter the total weekly epoetin alfa dose/);
  assert.match(mir('epoetin', 9000).note, /neither label gives a table back to epoetin alfa/);
  const t = TARGETS[1];
  const T = { [t.setId]: { label: t.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const w = d({ target: 'mircera', current: 'epoetin', population: 'adult', weeklyDose: 9000, mirceraInterval: 'monthly' }, now, T);
  assert.deepEqual([w.withheld, w.mcg], [true, undefined]);
});
