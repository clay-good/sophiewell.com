// spec-v1633 tool 7: a dated taper schedule, beside the published range for its class.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taperCalendar as calc, RANGES, MODES, MAX_STEPS, LABEL } from '../../lib/taper-calendar-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const d = (i, table) => calc(i, now, table);

const base = { drugClass: 'opioid', duration: 'year-or-more', unit: 'mg', startDose: 100, intervalDays: 28, startDate: '2026-10-12', smallestDose: 0.1 };
const run = (i) => d({ ...base, ...i });
const doses = (r, n) => r.rows.slice(1, n + 1).map((x) => x.dose);
const all = (r) => `${r.band} ${r.notes.join(' ')}`;

test('percent of the remaining dose and percent of the original dose are different schedules', () => {
  const rem = run({ mode: 'percent-remaining', reduction: 10 });
  assert.deepEqual(doses(rem, 3), [90, 81, 72.9]);
  const orig = run({ mode: 'percent-original', reduction: 10 });
  assert.deepEqual(doses(orig, 3), [90, 80, 70]);
  assert.deepEqual([orig.steps, orig.rows.at(-1).dose, orig.ended], [10, 0, 'zero']); // reaches zero at step 10
  assert.match(all(rem), /10% of the remaining dose/);
  assert.match(all(orig), /10% of the original dose/);
  assert.deepEqual(doses(run({ mode: 'fixed', reduction: 15 }), 3), [85, 70, 55]);
  assert.equal(MODES.length, 4);
});

test('the CDC shorter-use shape: 10% of the original to 30%, then 10% of what remains', () => {
  const r = run({ mode: 'percent-original-then-remaining', reduction: 10, intervalDays: 7, duration: 'less' });
  assert.deepEqual(doses(r, 9), [90, 80, 70, 60, 50, 40, 30, 27, 24.3]);
  assert.equal(r.paceFaster, false);
  assert.match(all(r), /10% of the original dose per week or slower until about 30%/);
});

test('dates step by the interval, and a pause moves every later date without changing a dose', () => {
  const plain = run({ mode: 'percent-remaining', reduction: 10, smallestDose: 5 });
  assert.deepEqual(plain.rows.slice(0, 4).map((x) => x.date), ['2026-10-12', '2026-11-09', '2026-12-07', '2027-01-04']);
  const paused = run({ mode: 'percent-remaining', reduction: 10, smallestDose: 5, pauses: '2026-12-10, 14' });
  assert.deepEqual(paused.rows.slice(0, 5).map((x) => x.date), ['2026-10-12', '2026-11-09', '2026-12-07', '2027-01-18', '2027-02-15']);
  assert.deepEqual(paused.rows.map((x) => x.dose), plain.rows.map((x) => x.dose));
  assert.equal(new Date(paused.endDate) - new Date(plain.endDate), 14 * 86400000);
  assert.match(all(paused), /1 pause applied/);
  assert.match(run({ mode: 'percent-remaining', reduction: 10, pauses: 'in December, two weeks' }).message, /^Pause line 1/);
});

test('steps round down to the smallest dose, never back up, and the schedule ends there', () => {
  const r = run({ mode: 'percent-remaining', reduction: 10, smallestDose: 5 });
  assert.deepEqual(doses(r, 5), [90, 80, 70, 65, 55]); // 81 -> 80, 72.9 -> 70, 65.61 -> 65, 59.05 -> 55
  for (let i = 1; i < r.rows.length; i += 1) assert.ok(r.rows[i].dose <= r.rows[i - 1].dose, `step ${i}`);
  for (const x of r.rows) assert.equal(x.dose % 5, 0);
  assert.deepEqual([r.rows.at(-1).dose, r.ended], [5, 'smallest']);
  assert.match(all(r), /does not invent a dose below it/);
  assert.match(all(r), /interval between doses can be extended/);
  assert.match(all(r), /rounded down to the same dispensable dose/);
});

test('a pace faster than the published range for the class is said to be faster', () => {
  const o = run({ mode: 'percent-original', reduction: 20, intervalDays: 7 });
  assert.equal(o.paceFaster, true);
  assert.match(all(o), /faster than the CDC range of about 10% per month or slower/);
  assert.equal(run({ mode: 'percent-original', reduction: 10, intervalDays: 28 }).paceFaster, false);
  assert.equal(run({ mode: 'percent-original', reduction: 10, intervalDays: 7, duration: 'less' }).paceFaster, false);
  assert.equal(run({ mode: 'percent-original', reduction: 15, intervalDays: 7, duration: 'less' }).paceFaster, true);
  const b = run({ drugClass: 'benzodiazepine', startDose: 10, smallestDose: 0.5, mode: 'percent-original', reduction: 30, intervalDays: 7 });
  assert.match(all(b), /faster than the ASAM ceiling of 25% every 2 weeks/);
  assert.equal(run({ drugClass: 'benzodiazepine', startDose: 10, smallestDose: 0.5, mode: 'percent-original', reduction: 10, intervalDays: 14 }).paceFaster, false);
  const m = run({ drugClass: 'methadone-oud', mode: 'percent-original', reduction: 10, intervalDays: 14, smallestDose: 5 });
  assert.match(all(m), /faster than the methadone label's range of less than 10%/);
  assert.equal(run({ drugClass: 'methadone-oud', mode: 'percent-original', reduction: 5, intervalDays: 14, smallestDose: 5 }).paceFaster, false);
  const other = run({ drugClass: 'other', mode: 'percent-original', reduction: 50, intervalDays: 1 });
  assert.equal(other.paceFaster, false);
  assert.match(all(other), /no primary source gives a general corticosteroid taper rate/);
});

test('every range is shown as a published range, and opioids carry the CDC sentences', () => {
  for (const text of Object.values(RANGES)) assert.match(text, /^A published range/);
  const r = run({ mode: 'percent-original', reduction: 10 });
  assert.match(all(r), /should be individualized/);
  assert.match(all(r), /paused and restarted/);
  assert.match(all(r), /10% to 25% of the total daily dose/);
  assert.match(r.note, /does not choose the pace/);
  assert.doesNotMatch(all(run({ drugClass: 'benzodiazepine', startDose: 10, smallestDose: 0.5, mode: 'percent-original', reduction: 10, intervalDays: 14 })), /CDC/);
});

test('a stop target ends the schedule, and a morphine-equivalent factor adds a column for opioids only', () => {
  const r = run({ mode: 'percent-remaining', reduction: 10, stopTarget: 60 });
  assert.deepEqual([r.ended, r.rows.at(-1).dose], ['target', 59]);
  const m = run({ mode: 'percent-original', reduction: 10, mmeFactor: 1.5 });
  assert.deepEqual(m.rows.slice(0, 3).map((x) => x.mme), [150, 135, 120]);
  assert.equal(run({ mode: 'percent-original', reduction: 10 }).rows[0].mme, undefined);
  assert.match(run({ drugClass: 'other', mode: 'percent-original', reduction: 10, mmeFactor: 1.5 }).message, /opioids only/);
});

test('refusals: nothing is defaulted, and zero or 100% is not a taper', () => {
  assert.match(d({}).message, /^Choose the drug class/);
  assert.match(d({ drugClass: 'opioid' }).message, /how long the opioid has been taken/);
  assert.match(d({ drugClass: 'other' }).message, /dose unit/);
  assert.match(d({ drugClass: 'other', unit: 'mg' }).message, /how each step is taken/);
  assert.match(run({ mode: 'percent-original', reduction: 100 }).message, /100% is a stop/);
  assert.match(run({ mode: 'percent-original', reduction: 0 }).message, /greater than 0/);
  assert.match(run({ mode: 'fixed', reduction: 100 }).message, /a stop, not a taper/);
  assert.match(run({ mode: 'percent-original', reduction: 10, startDate: 'Monday' }).message, /start date as YYYY-MM-DD/);
  assert.match(run({ mode: 'percent-original', reduction: 10, intervalDays: 3.5 }).message, /whole number/);
  assert.match(run({ mode: 'percent-original', reduction: 10, smallestDose: 200 }).message, /above the starting dose/);
  assert.match(run({ mode: 'percent-original', reduction: 10, smallestDose: '' }).message, /smallest dose that can be dispensed/);
  assert.match(run({ mode: 'percent-remaining', reduction: 0.01, smallestDose: 0.0001 }).message, new RegExp(`more than ${MAX_STEPS} steps`));
});

test('the label ranges stand only while the label edition does', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  const T = { [LABEL.setId]: { label: 'Methadone tablets, Hikma', splVersion: 9, publishedOn: '2026-01-30', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const m = d({ ...base, drugClass: 'methadone-oud', duration: undefined, mode: 'percent-original', reduction: 20, intervalDays: 7, smallestDose: 5 }, T);
  assert.equal(m.paceFaster, false); // nothing to compare with
  assert.match(all(m), /is withheld/);
  assert.equal(m.rows.length > 1, true); // the arithmetic still answers
  const o = d({ ...base, mode: 'percent-original', reduction: 30, intervalDays: 28 }, T);
  assert.match(all(o), /faster than the CDC range/); // CDC is not a label
  assert.doesNotMatch(all(o), /FDA labeling range/);
});
