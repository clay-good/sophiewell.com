// spec-v1633 tool 11: the Lamictal and Lamictal XR escalation tables as a dated calendar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lamotrigineTitrationCalendar as d, LABELS, TABLE3, wholeTablets } from '../../lib/lamotrigine-titration-calendar-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ startDate: '2026-10-12', ...i }, now);
const doses = (r) => r.rows.map((x) => x.dose);
const all = (r) => `${r.band} ${r.notes.join(' ')}`;

test('the two labels answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
});

test('epilepsy, older than 12: Table 1 for weeks 1 to 4, then the rule, not invented dates', () => {
  assert.deepEqual(doses(run({ regimen: 'ir-epilepsy', comed: 'valproate' })), ['25 mg every other day', '25 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'ir-epilepsy', comed: 'neither' })), ['25 mg every day', '50 mg a day']);
  assert.deepEqual(doses(run({ regimen: 'ir-epilepsy', comed: 'inducer' })), ['50 mg a day', '100 mg a day, in 2 divided doses']);
  const r = run({ regimen: 'ir-epilepsy', comed: 'valproate' });
  assert.deepEqual(r.rows.map((x) => [x.from, x.to]), [['2026-10-12', '2026-10-25'], ['2026-10-26', '2026-11-08']]);
  assert.match(r.notes[0], /^Week 5 onward \(from 2026-11-09\): increase by 25 to 50 mg a day every 1 to 2 weeks/);
  assert.match(run({ regimen: 'ir-epilepsy', comed: 'neither' }).notes[0], /increase by 50 mg a day every 1 to 2 weeks.*225 to 375 mg a day/);
  assert.match(run({ regimen: 'ir-epilepsy', comed: 'inducer' }).notes[0], /increase by 100 mg a day.*300 to 500 mg a day/);
});

test('bipolar disorder: Table 5 through week 7, with the target dose and Table 6', () => {
  assert.deepEqual(doses(run({ regimen: 'ir-bipolar', comed: 'valproate' })), ['25 mg every other day', '25 mg daily', '50 mg daily', '100 mg daily', '100 mg daily']);
  assert.deepEqual(doses(run({ regimen: 'ir-bipolar', comed: 'neither' })), ['25 mg daily', '50 mg daily', '100 mg daily', '200 mg daily', '200 mg daily']);
  assert.deepEqual(doses(run({ regimen: 'ir-bipolar', comed: 'inducer' })), ['50 mg daily', '100 mg daily, in divided doses', '200 mg daily, in divided doses', '300 mg daily, in divided doses', 'up to 400 mg daily, in divided doses']);
  const r = run({ regimen: 'ir-bipolar', comed: 'neither' });
  assert.deepEqual([r.rows[2].from, r.rows[4].from, r.lastFixedDate], ['2026-11-09', '2026-11-23', '2026-11-29']);
  assert.match(all(r), /Target dose for bipolar disorder: 200 mg a day/);
  assert.match(all(r), /after valproate, from 100 mg a day go to 150 mg in week 1 and 200 mg from week 2/);
});

test('Lamictal XR: Table 1 through week 8 onward, and the 100 mg weekly ceiling', () => {
  assert.deepEqual(doses(run({ regimen: 'xr', comed: 'valproate' })), ['25 mg every other day', '25 mg every day', '50 mg every day', '100 mg every day', '150 mg every day', '200 to 250 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'xr', comed: 'neither' })), ['25 mg every day', '50 mg every day', '100 mg every day', '150 mg every day', '200 mg every day', '300 to 400 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'xr', comed: 'inducer' })), ['50 mg every day', '100 mg every day', '200 mg every day', '300 mg every day', '400 mg every day', '400 to 600 mg every day']);
  const r = run({ regimen: 'xr', comed: 'neither' });
  assert.deepEqual([r.rows[5].from, r.rows[5].to], ['2026-11-30', null]);
  assert.match(all(r), /should not exceed 100 mg daily at weekly intervals/);
  assert.match(all(r), /same total daily dose/);
});

test('ages 2 to 12: Table 3 by weight on valproate, Table 2 by mg/kg otherwise, whole tablets only', () => {
  assert.deepEqual(TABLE3.map((r) => [r[2], r[3]]), [['2 mg every other day', '2 mg every day'], ['2 mg every day', '4 mg every day'], ['4 mg every day', '8 mg every day'], ['5 mg every day', '10 mg every day']]);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'valproate', weightKg: 10 })), ['2 mg every other day', '2 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'valproate', weightKg: 20 })), ['2 mg every day', '4 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'valproate', weightKg: 30 })), ['4 mg every day', '8 mg every day']);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'valproate', weightKg: 39 })), ['5 mg every day', '10 mg every day']);
  // Between two Table 3 rows (14 to 14.1 kg) the tool falls back to Table 2 and says so.
  const gap = run({ regimen: 'ir-pediatric', comed: 'valproate', weightKg: 14.05 });
  assert.match(gap.rows[0].dose, /^2 mg a day \(2\.11 mg by weight/);
  assert.match(all(gap), /outside the label's weight-based guide/);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'neither', weightKg: 20 })), ['6 mg a day', '12 mg a day']);
  assert.deepEqual(doses(run({ regimen: 'ir-pediatric', comed: 'inducer', weightKg: 25 })), ['15 mg a day', '30 mg a day']);
  assert.match(run({ regimen: 'ir-pediatric', comed: 'neither', weightKg: 20 }).notes[0], /add 0\.6 mg\/kg a day, rounded down to whole tablets \(12 mg\).*maximum 300 mg a day/);
  const small = run({ regimen: 'ir-pediatric', comed: 'neither', weightKg: 5 });
  assert.equal(small.abnormal, true);
  assert.match(small.rows[0].dose, /below one 2 mg tablet/);
  assert.match(all(small), /cannot be given as whole tablets/);
  assert.deepEqual([1.9, 2, 3.9, 4, 5.99, 7.3].map(wholeTablets), [0, 2, 2, 4, 5, 7]);
  assert.match(run({ regimen: 'ir-pediatric', comed: 'neither' }).message, /^Enter the weight/);
});

test('every calendar carries the restart, stopping and interaction notes for its column', () => {
  const v = run({ regimen: 'ir-epilepsy', comed: 'valproate' });
  assert.match(all(v), /more than 5 half-lives/);
  assert.match(all(v), /58\.8 hours/);
  assert.match(all(v), /at least 2 weeks \(about 50% a week\)/);
  assert.match(all(run({ regimen: 'ir-epilepsy', comed: 'neither' })), /32\.8 hours.*25\.4 hours/);
  const i = run({ regimen: 'ir-epilepsy', comed: 'inducer' });
  assert.match(all(i), /14\.4 hours/);
  assert.match(all(i), /rifampin or lopinavir\/ritonavir follow this inducer column/);
  assert.match(v.note, /serious rash/);
});

test('nothing is defaulted, and a superseded label withholds its calendar', () => {
  assert.match(d({}, now).message, /^Choose the formulation and indication/);
  assert.match(d({ regimen: 'xr' }, now).message, /^Choose the co-medication/);
  assert.match(d({ regimen: 'xr', comed: 'neither' }, now).message, /first dose as YYYY-MM-DD/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.xr.setId].supersededOn = '2026-10-12';
  const w = d({ regimen: 'xr', comed: 'neither', startDate: '2026-10-12' }, now, T);
  assert.deepEqual([w.withheld, w.rows], [true, undefined]);
  assert.equal(d({ regimen: 'ir-bipolar', comed: 'neither', startDate: '2026-10-12' }, now, T).rows.length, 5);
});

// Lamictal Table 4 (version 45, re-read October 15, 2026): converting from valproate to monotherapy.
test('Table 4: valproate down 500 a week to 500, held a week, then 300/250, then lamotrigine to 500', async () => {
  const { lamotrigineTitrationCalendar: l } = await import('../../lib/lamotrigine-titration-calendar-v1633.js');
  const at = new Date('2026-10-15T12:00:00Z');
  const r = l({ regimen: 'ir-valproate-conversion', comed: 'valproate', startDate: '2026-11-02', valproateDose: 1500 }, at);
  assert.deepEqual(r.rows.map((x) => x.dose), ['Lamotrigine 200 mg/day; valproate 1,000 mg/day', 'Lamotrigine 200 mg/day; valproate 500 mg/day', 'Lamotrigine 200 mg/day; valproate 500 mg/day', 'Lamotrigine 300 mg/day; valproate 250 mg/day', 'Lamotrigine 400 mg/day; valproate discontinued', 'Lamotrigine 500 mg/day; valproate discontinued']);
  assert.equal(r.rows[5].from, '2026-12-07');
  assert.equal(l({ regimen: 'ir-valproate-conversion', comed: 'valproate', startDate: '2026-11-02', valproateDose: 500 }, at).rows.length, 4);
  assert.match(l({ regimen: 'ir-valproate-conversion', comed: 'neither', startDate: '2026-11-02', valproateDose: 1500 }, at).message, /converts from valproate/);
  assert.match(l({ regimen: 'ir-valproate-conversion', comed: 'valproate', startDate: '2026-11-02', valproateDose: 250 }, at).message, /current valproate dose/);
});
