// spec-v1633 tool 12: label step-up schedules, and the reader's own steps, as dates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelTitrationCalendar as d, LABELS, PRESETS } from '../../lib/label-titration-calendar-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ startDate: '2026-10-12', ...i }, now);
const doses = (r) => r.rows.map((x) => x.dose);

test('the five labels answer, and there is no GLP-1 preset', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(PRESETS.some((p) => /glp|semaglutide|tirzepatide|liraglutide|dulaglutide/.test(p.value)), false);
  assert.equal(PRESETS.length, 9); // 7, then the Otezla and Entresto pediatric schedules (2026-10-15)
});

test('topiramate: the monotherapy and migraine tables, week by week', () => {
  const e = run({ preset: 'topiramate-epilepsy' });
  assert.deepEqual(doses(e).map((x) => x.match(/\d+/g).join('/')), ['25/25', '50/50', '75/75', '100/100', '150/150', '200/200']);
  assert.deepEqual([e.rows[0].from, e.rows[0].to, e.rows[5].from, e.rows[5].to], ['2026-10-12', '2026-10-18', '2026-11-16', null]);
  const m = run({ preset: 'topiramate-migraine' });
  assert.deepEqual(doses(m), ['none in the morning and 25 mg in the evening', '25 mg in the morning and 25 mg in the evening', '25 mg in the morning and 50 mg in the evening', '50 mg in the morning and 50 mg in the evening']);
  assert.equal(m.rows[3].from, '2026-11-02');
});

test('varenicline: days 1 to 3, 4 to 7, then to the end of week 12', () => {
  const r = run({ preset: 'varenicline' });
  assert.deepEqual(doses(r), ['0.5 mg once daily', '0.5 mg twice daily', '1 mg twice daily']);
  assert.deepEqual(r.rows.map((x) => [x.from, x.to]), [['2026-10-12', '2026-10-14'], ['2026-10-15', '2026-10-18'], ['2026-10-19', '2027-01-03']]);
  assert.equal(r.rows.reduce((a, x) => a + x.days, 0), 84); // 12 weeks
});

test('apremilast: five days of titration, then maintenance', () => {
  const r = run({ preset: 'apremilast' });
  assert.deepEqual(doses(r).slice(0, 5), ['10 mg in the morning', '10 mg in the morning and 10 mg in the evening', '10 mg in the morning and 20 mg in the evening', '20 mg in the morning and 20 mg in the evening', '20 mg in the morning and 30 mg in the evening']);
  assert.deepEqual([r.rows[5].from, r.rows[5].to], ['2026-10-17', null]);
  assert.match(r.rows[5].dose, /30 mg twice daily, or Otezla XR 75 mg once daily/);
});

test('memantine: four steps, and the weeks per step are asked for, never assumed', () => {
  assert.match(run({ preset: 'memantine' }).message, /does not assume it/);
  assert.match(run({ preset: 'memantine', weeksPerStep: 0.5 }).message, /at least 1|must be/);
  const r = run({ preset: 'memantine', weeksPerStep: 2 });
  assert.deepEqual(doses(r), ['5 mg once daily', '5 mg twice daily (10 mg a day)', '5 mg and 10 mg as separate doses (15 mg a day)', '10 mg twice daily (20 mg a day)']);
  assert.deepEqual(r.rows.map((x) => x.from), ['2026-10-12', '2026-10-26', '2026-11-09', '2026-11-23']);
});

test('sacubitril/valsartan: doubled after 2 to 4 weeks, with the 36-hour washout as a clock time', () => {
  assert.match(run({ preset: 'sacubitril-valsartan' }).message, /does not pick a point in that range/);
  assert.equal(run({ preset: 'sacubitril-valsartan', weeksToDouble: 5 }).valid, false);
  const r = run({ preset: 'sacubitril-valsartan', weeksToDouble: 2, lastAceDose: '2026-10-11T08:00' });
  assert.deepEqual([doses(r), r.rows[1].from, r.earliestFirstDose, r.washoutConflict, r.abnormal], [['49/51 mg twice daily', '97/103 mg twice daily'], '2026-10-26', '2026-10-12 20:00', false, false]);
  const late = run({ preset: 'sacubitril-valsartan', weeksToDouble: 4, lastAceDose: '2026-10-11T20:00' });
  assert.deepEqual([late.earliestFirstDose, late.washoutConflict, late.abnormal, late.rows[1].from], ['2026-10-13 08:00', true, true, '2026-11-09']);
  assert.match(run({ preset: 'sacubitril-valsartan', weeksToDouble: 2 }).notes.join(' '), /36-hour washout/);
  assert.match(run({ preset: 'sacubitril-valsartan', weeksToDouble: 2, lastAceDose: 'yesterday' }).message, /date and time/);
});

test('the reader\'s own steps: dates, doses and totals, with nothing checked against a label', () => {
  const r = run({ preset: 'custom', steps: '25, 2, 7\n50, 2, 7\n100, 2, 14' });
  assert.deepEqual(r.rows.map((x) => [x.from, x.to, x.doses, x.totalMg]), [['2026-10-12', '2026-10-18', 14, 350], ['2026-10-19', '2026-10-25', 14, 700], ['2026-10-26', '2026-11-08', 28, 2800]]);
  assert.deepEqual([r.totalMg, r.endDate, r.labelUrl], [3850, '2026-11-08', undefined]);
  assert.match(r.notes[0], /no label schedule is applied/);
  assert.match(run({ preset: 'custom' }).message, /^Enter your steps/);
  assert.match(run({ preset: 'custom', steps: '25 mg bid' }).message, /^Step line 1/);
  assert.match(run({ preset: 'custom', steps: '25, 2.5, 7' }).message, /whole numbers/);
});

test('refusals and fail closed', () => {
  assert.match(d({}, now).message, /^Choose a label schedule/);
  assert.match(d({ preset: 'varenicline' }, now).message, /start date as YYYY-MM-DD/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.chantix.setId].supersededOn = '2026-10-12';
  const w = d({ preset: 'varenicline', startDate: '2026-10-12' }, now, T);
  assert.deepEqual([w.withheld, w.rows], [true, undefined]);
  assert.equal(d({ preset: 'apremilast', startDate: '2026-10-12' }, now, T).rows.length, 6);
  assert.equal(d({ preset: 'custom', startDate: '2026-10-12', steps: '5, 1, 7' }, now, T).valid, true);
});

// spec-v1633 tool 12: whole tablets by the strengths stocked for your own steps.
test('own steps with strengths: tablets a dose, units a step, and a dose no combination makes', () => {
  const r = run({ preset: 'custom', steps: '25, 1, 7\n75, 2, 14\n30, 1, 7', strengths: '25, 50' });
  assert.deepEqual([r.rows[0].tablets, r.rows[1].tablets, r.rows[2].tablets], ['1 × 25 mg', '1 × 50 mg + 1 × 25 mg', undefined]);
  assert.deepEqual(r.dispenseByStrength, { '50 mg': 28, '25 mg': 35 });
  assert.match(r.notes.join(' '), /Step 3: no whole-tablet combination of 50, 25 mg makes 30 mg/);
  assert.match(run({ preset: 'custom', steps: '25, 1, 7', strengths: 'x' }).message, /tablet strength/);
});

// Otezla Table 2 and Entresto Table 1, the pediatric schedules (re-read October 15, 2026).
test('pediatric presets: Otezla by weight band, Entresto by weight band every 2 weeks', () => {
  const big = run({ preset: 'apremilast-pediatric', weightKg: 55 });
  assert.deepEqual(doses(big).slice(-2), ['20 mg in the morning and 30 mg in the evening', '30 mg twice daily (or Otezla XR 75 mg once daily)']);
  const mid = run({ preset: 'apremilast-pediatric', weightKg: 30 });
  assert.deepEqual(doses(mid).slice(-2), ['20 mg in the morning and 20 mg in the evening', '20 mg twice daily']);
  assert.match(run({ preset: 'apremilast-pediatric', weightKg: 18 }).message, /at least 20 kg/);
  const e = run({ preset: 'sacubitril-valsartan-pediatric', weightKg: 45 });
  assert.deepEqual(doses(e), ['24 mg/26 mg twice daily', '49 mg/51 mg twice daily', '72 mg/78 mg twice daily']);
  assert.deepEqual(e.rows.map((r) => r.from), ['2026-10-12', '2026-10-26', '2026-11-09']);
  const small = run({ preset: 'sacubitril-valsartan-pediatric', weightKg: 20 });
  assert.match(doses(small)[0], /^1\.6 mg\/kg \(32 mg of sacubitril and valsartan combined at 20 kg\) twice daily$/);
  assert.match(small.notes.join(' '), /oral suspension or oral pellets/);
  assert.match(run({ preset: 'sacubitril-valsartan-pediatric' }).message, /weight/);
});
