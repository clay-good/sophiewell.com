// spec-v1636 tool 13: botulism antitoxin (BAT) and BabyBIG dose and rate, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { botulismAntitoxinDose, LABELS } from '../../lib/botulism-antitoxin-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const b = (i, t) => botulismAntitoxinDose(i, now, t);
const bat = (age, weight) => b({ product: 'bat', age, weight });
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('both label rows answer; a product withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(b({ product: 'bat', age: 30 }, dead(LABELS.bat.setId)).flag, 'withheld');
  assert.equal(b({ product: 'bat', age: 30 }, dead(LABELS.babybig.setId)).flag, 'dose');
});

test('BAT adults: one vial, 0.5 mL/min doubling to 2 mL/min; 17 is adult', () => {
  const r = bat(17);
  assert.deepEqual([r.percentOfVial, r.startRateMlPerMin, r.maxRateMlPerMin], [100, 0.5, 2]);
  assert.match(bat(16.9).message, /^Enter the weight/);
});

test('BAT, 1 to under 17 years: every row of the label table', () => {
  const rows = [[10, 20], [14, 20], [15, 30], [19, 30], [20, 40], [26, 50], [30, 60], [35, 65], [40, 70], [45, 75], [50, 80], [54, 80], [55, 100], [90, 100]];
  for (const [kg, pct] of rows) assert.equal(bat(8, kg).percentOfVial, pct, `${kg} kg`);
});

test('BAT: the table is used where the footnote rule differs, and the rule is shown', () => {
  const r = bat(3, 12);
  assert.deepEqual([r.percentOfVial, r.salisburyPercent], [20, 24]);
  assert.match(r.notes.join(' '), /gives 24% at 12 kg.*differ; the label says to dose "according to Table 2"/);
  assert.deepEqual((({ percentOfVial, salisburyPercent }) => [percentOfVial, salisburyPercent])(bat(14, 55)), [100, 85]);
  // Where they agree, no disagreement is announced.
  assert.doesNotMatch(bat(8, 10).notes.join(' '), /differ/);
});

test('BAT: a weight between rows returns both; under 10 kg at 1 year or more has no row', () => {
  const gap = bat(5, 14.5);
  assert.deepEqual([gap.flag, gap.percentOfVial, gap.abnormal], ['between-rows', null, true]);
  assert.match(gap.band, /10 to 14 kg: 20% and 15 to 19 kg: 30%/);
  const small = bat(1.5, 9);
  assert.deepEqual([small.flag, small.percentOfVial], ['weight-not-in-table', null]);
  assert.match(small.band, /minimum pediatric dose of 20%/);
});

test('BAT pediatric and infant rates: per kilogram, never above the adult rate', () => {
  const r = bat(8, 26);
  assert.deepEqual([r.startRateMlPerMin, r.maxRateMlPerMin], [0.26, 0.78]);
  assert.deepEqual((({ startRateMlPerMin, maxRateMlPerMin }) => [startRateMlPerMin, maxRateMlPerMin])(bat(16, 90)), [0.5, 2]);
  const infant = bat(0.5, 7);
  assert.deepEqual([infant.percentOfVial, infant.startRateMlPerMin, infant.maxRateMlPerMin, infant.salisburyPercent], [10, 0.07, 0.21, null]);
});

test('BabyBIG: 1.0 mL/kg, 0.5 then 1.0 mL/kg/hour, below one year of age only', () => {
  const r = b({ product: 'babybig', age: 0.3, weight: 6.2 });
  assert.deepEqual([r.volumeMl, r.doseMg, r.startRateMlPerHour, r.maxRateMlPerHour], [6.2, 310, 3.1, 6.2]);
  assert.equal(b({ product: 'babybig', age: 1, weight: 10 }).flag, 'not-in-label');
});

test('nothing is defaulted', () => {
  assert.match(b({}).message, /^Choose the product/);
  assert.match(b({ product: 'bat' }).message, /^Enter the age/);
  assert.match(b({ product: 'babybig', age: 0.3 }).message, /^Enter the weight/);
  assert.equal(botulismAntitoxinDose(null, now).valid, false);
});
