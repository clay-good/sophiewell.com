// spec-v1633 tool 16: levothyroxine starting dose from the Synthroid label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levothyroxineStartDose as d, LABEL, GROUPS, TABLETS, tabletsAround } from '../../lib/levothyroxine-start-dose-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);

test('the label answers, and its rows and tablets are the label\'s', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  assert.deepEqual(GROUPS.filter((g) => g.range).map((g) => g.range), [[10, 15], [8, 10], [6, 8], [5, 6], [4, 5], [2, 3], [1.6, 1.6]]);
  assert.deepEqual(TABLETS, [25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200, 300]);
  assert.deepEqual([tabletsAround(112), tabletsAround(120), tabletsAround(20), tabletsAround(320)], [[112], [112, 125], [25], [300]]);
});

test('adults: 1.6 mcg/kg/day, the tablets either side, and the titration step', () => {
  const r = run({ group: 'adult', weightKg: 70 });
  assert.deepEqual([r.fullReplacementMcg, r.tabletsAround, r.flag], [112, [112], 'dose']);
  assert.match(r.notes.join(' '), /12\.5 to 25 mcg increments every 4 to 6 weeks/);
  assert.deepEqual(run({ group: 'adult', weightKg: 75 }).tabletsAround, [112, 125]); // 120 mcg
  const big = run({ group: 'adult', weightKg: 140 }); // 224 mcg
  assert.equal(big.abnormal, true);
  assert.match(big.notes.join(' '), /greater than 200 mcg a day are seldom required/);
  assert.match(run({ group: 'adult', weightKg: 200 }).notes.join(' '), /more than 300 mcg a day is rare/);
  assert.match(r.notes.join(' '), /without naming actual or ideal weight/);
});

test('cardiac risk and geriatric: the label gives a lower start and no number, and the tool says so', () => {
  const c = run({ group: 'adult-cardiac', weightKg: 80 });
  assert.deepEqual([c.flag, c.abnormal, c.fullReplacementMcg], ['no-number-given', true, 128]);
  assert.match(c.band, /less than 1\.6 mcg\/kg\/day, and no number/);
  assert.match(c.notes.join(' '), /every 6 to 8 weeks/);
  const g = run({ group: 'adult-geriatric', weightKg: 60 });
  assert.equal(g.flag, 'no-number-given');
  assert.doesNotMatch(g.notes.join(' '), /every 6 to 8 weeks/);
});

test('children: the mcg/kg/day range for the age row, titrated every 2 weeks', () => {
  const r = run({ group: 'ped-0-3m', weightKg: 4, hyperactivityRisk: 'no' });
  assert.deepEqual([r.lowMcg, r.highMcg], [40, 60]);
  assert.match(r.notes.join(' '), /every 2 weeks/);
  assert.match(r.notes.join(' '), /cardiac failure/);
  assert.deepEqual([run({ group: 'ped-6-12y', weightKg: 30, hyperactivityRisk: 'no' }).lowMcg, run({ group: 'ped-6-12y', weightKg: 30, hyperactivityRisk: 'no' }).highMcg], [120, 150]);
  const done = run({ group: 'ped-growth-complete', weightKg: 62.5, hyperactivityRisk: 'no' });
  assert.deepEqual([done.lowMcg, done.highMcg], [100, 100]);
  assert.match(run({ group: 'ped-1-5y', weightKg: 15 }).message, /at risk for hyperactivity/);
});

test('a child at risk for hyperactivity starts at one-fourth and adds one-fourth a week', () => {
  const r = run({ group: 'ped-6-12y', weightKg: 30, hyperactivityRisk: 'yes' });
  assert.deepEqual([r.startLowMcg, r.startHighMcg, r.lowMcg, r.highMcg], [30, 37.5, 120, 150]);
  assert.match(r.notes[0], /adds one-fourth each week/);
});

test('nothing is defaulted, and a superseded label withholds the dose', () => {
  assert.match(d({}, now).message, /^Choose the patient group/);
  assert.match(run({ group: 'adult' }).message, /^Enter the weight/);
  const T = { [LABEL.setId]: { label: 'Synthroid', splVersion: 1537, publishedOn: '2024-02-29', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const w = d({ group: 'adult', weightKg: 70 }, now, T);
  assert.deepEqual([w.withheld, w.fullReplacementMcg], [true, undefined]);
});
