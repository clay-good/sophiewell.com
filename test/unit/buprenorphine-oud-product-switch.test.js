// spec-v1633 tool 6: buprenorphine product switch tables from three labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buprenorphineOudProductSwitch as d, LABELS, ZUBSOLV_ROWS, BRIXADI_ROWS } from '../../lib/buprenorphine-oud-product-switch-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (sw, dose, firstInjection) => d({ switch: sw, dose, firstInjection }, now);

test('the three labels answer, and the tables are the labels\'', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.deepEqual(ZUBSOLV_ROWS, [[2, 0.5, 1.4, 0.36], [4, 1, 2.9, 0.71], [8, 2, 5.7, 1.4], [12, 3, 8.6, 2.1], [16, 4, 11.4, 2.9]]);
  assert.deepEqual(BRIXADI_ROWS, [[null, 6, 8, null], [8, 10, 16, 64], [12, 16, 24, 96], [18, 24, 32, 128]]);
});

test('Suboxone tablets and Zubsolv correspond in both directions; an unlisted dose is not in the table', () => {
  assert.deepEqual([2, 4, 8, 12, 16].map((v) => at('suboxone-to-zubsolv', v).buprenorphineMg), [1.4, 2.9, 5.7, 8.6, 11.4]);
  assert.deepEqual([1.4, 2.9, 5.7, 8.6, 11.4].map((v) => at('zubsolv-to-suboxone', v).buprenorphineMg), [2, 4, 8, 12, 16]);
  assert.equal(at('suboxone-to-zubsolv', 8).naloxoneMg, 1.4);
  const r = at('suboxone-to-zubsolv', 7);
  assert.deepEqual([r.flag, r.buprenorphineMg, r.abnormal], ['not-in-table', undefined, true]);
  assert.match(r.band, /nearest are 4 and 8 mg/);
  assert.match(at('suboxone-to-zubsolv', 8).notes.join(' '), /monitor for over-medication as well as withdrawal/);
});

test('sublingual buprenorphine to Brixadi: Table 1, with no monthly dose at 6 mg or less', () => {
  const w = (v) => [at('sublingual-to-brixadi', v).weeklyMg, at('sublingual-to-brixadi', v).monthlyMg];
  assert.deepEqual([w(4), w(6), w(8), w(10), w(12), w(16), w(18), w(24)], [[8, null], [8, null], [16, 64], [16, 64], [24, 96], [24, 96], [32, 128], [32, 128]]);
  for (const v of [7, 11, 17, 26]) assert.equal(at('sublingual-to-brixadi', v).flag, 'not-in-table', String(v));
  assert.match(at('sublingual-to-brixadi', 6).band, /no monthly dose/);
  assert.match(at('sublingual-to-brixadi', 16, '2026-10-12').notes[0], /next weekly dose is due 2026-10-19, or the next monthly dose 2026-11-09/);
  assert.doesNotMatch(at('sublingual-to-brixadi', 6, '2026-10-12').notes[0], /monthly/);
});

test('Brixadi weekly and monthly: Table 2 both ways; 8 mg weekly has no monthly dose', () => {
  assert.deepEqual([16, 24, 32].map((v) => at('brixadi-weekly-to-monthly', v).monthlyMg), [64, 96, 128]);
  assert.deepEqual([64, 96, 128].map((v) => at('brixadi-monthly-to-weekly', v).weeklyMg), [16, 24, 32]);
  assert.match(at('brixadi-weekly-to-monthly', 8).band, /no monthly dose for 8 mg weekly/);
  assert.equal(at('brixadi-monthly-to-weekly', 100).flag, 'not-in-table');
});

test('transmucosal buprenorphine to Sublocade: 8 to 24 mg a day, and the second-injection window', () => {
  const r = at('transmucosal-to-sublocade', 16, '2026-01-31');
  assert.deepEqual([r.firstMg, r.secondMg, r.maintenanceMg], [300, 300, 100]);
  assert.match(r.notes[0], /from 2026-02-07 \(1 week\) to 2026-02-28 \(1 month\)/); // a month from January 31 ends in February
  assert.match(r.notes.join(' '), /8 mg to 18 mg a day, the label says 100 mg may be given as the second dose/);
  assert.doesNotMatch(at('transmucosal-to-sublocade', 20).notes.join(' '), /8 mg to 18 mg/);
  assert.match(r.notes.join(' '), /at least 26 days between injections/);
  for (const v of [7.9, 24.1]) assert.equal(at('transmucosal-to-sublocade', v).flag, 'not-in-table');
  assert.equal(at('transmucosal-to-sublocade', 8).flag, 'dose');
  assert.equal(at('transmucosal-to-sublocade', 24).flag, 'dose');
});

test('nothing is defaulted, and a superseded label withholds its table', () => {
  assert.match(d({}, now).message, /^Choose the switch/);
  assert.match(d({ switch: 'suboxone-to-zubsolv' }, now).message, /^Enter the daily buprenorphine dose as Suboxone tablets/);
  assert.match(at('sublingual-to-brixadi', 16, 'next week').message, /first injection as YYYY-MM-DD/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.brixadi.setId].supersededOn = '2026-10-12';
  const w = d({ switch: 'sublingual-to-brixadi', dose: 16 }, now, T);
  assert.deepEqual([w.withheld, w.weeklyMg], [true, undefined]);
  assert.equal(d({ switch: 'suboxone-to-zubsolv', dose: 8 }, now, T).buprenorphineMg, 5.7);
});
