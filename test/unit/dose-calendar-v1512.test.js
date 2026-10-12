// spec-v1512 tool 2: loading and maintenance dose calendar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doseCalendar as d, doseCalendar, toIcs } from '../../lib/dose-calendar-v1512.js';

const base = { startDate: '2026-10-05', loadWeek2: '2', loadWeek3: '6', everyWeeks: '8' };

test('weeks 0, 2 and 6, then every 8 weeks (the Remicade label schedule)', () => {
  const r = d({ ...base, maintenanceDoses: '2' });
  assert.deepEqual(r.dates, ['2026-10-05', '2026-10-19', '2026-11-16', '2027-01-11', '2027-03-08']);
});

test('a late dose re-anchors the ones after it', () => {
  const r = d({ ...base, maintenanceDoses: '2', actualDate: '2026-11-20', actualDose: '3' });
  assert.deepEqual(r.dates, ['2026-10-05', '2026-10-19', '2026-11-20', '2027-01-15', '2027-03-12']);
});

test('weekend and federal-holiday dates are flagged', () => {
  const r = d({ startDate: '2026-11-12', loadWeek2: '2', everyWeeks: '4', maintenanceDoses: '1' });
  assert.match(r.notes.join(' '), /November 26, 2026 \(federal holiday\)/);
  assert.match(d({ startDate: '2026-10-03', everyWeeks: '2', maintenanceDoses: '1' }).notes[0], /Saturday/);
});

test('blank or out-of-order inputs ask', () => {
  assert.equal(d({}).valid, false);
  assert.equal(d({ startDate: '2026-10-05' }).valid, false);
  assert.equal(d({ ...base, loadWeek3: '1' }).valid, false);
  assert.equal(d({ ...base, actualDate: '2026-11-20' }).valid, false);
});

test('the dates download as an iCalendar file: one all-day event per dose, named only by its place, the same file every time', () => {
  const r = doseCalendar({ startDate: '2026-10-05', loadWeek2: '2', loadWeek3: '6', everyWeeks: '8', maintenanceDoses: '2' });
  const ics = toIcs(r.doses);
  assert.equal(ics, toIcs(r.doses));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, r.doses.length);
  assert.match(ics, /DTSTART;VALUE=DATE:20261116\r\nDTEND;VALUE=DATE:20261117\r\nSUMMARY:Loading dose 3\r\n/);
  assert.deepEqual(r.doses.map((d) => d.label), ['Loading dose 1', 'Loading dose 2', 'Loading dose 3', 'Maintenance dose 1', 'Maintenance dose 2']);
});

// spec-v1635 backfill: the cycle calendar.
const cyc = { startDate: '2026-10-05', cycleLength: '28', treatmentDays: '1, 8, 15', cycles: '3' };

test('cycle calendar: days 1, 8 and 15 of 28, three cycles back to back', () => {
  const r = d(cyc);
  assert.equal(r.mode, 'cycle');
  assert.deepEqual(r.cycleStarts, ['2026-10-05', '2026-11-02', '2026-11-30']);
  assert.deepEqual(r.dates, ['2026-10-05', '2026-10-12', '2026-10-19', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-30', '2026-12-07', '2026-12-14']);
  assert.deepEqual(r.doses.slice(3, 5).map((x) => x.label), ['Cycle 2 day 1', 'Cycle 2 day 8']);
  // October 12, 2026 is Columbus Day.
  assert.match(r.notes[1], /Cycle 1 day 8: October 12, 2026 \(federal holiday\)/);
  assert.match(toIcs(r.doses), /SUMMARY:Cycle 3 day 15/);
});

test('cycle calendar: what cycle and day is this date', () => {
  assert.equal(d({ ...cyc, checkDate: '2026-11-09' }).bandLabel, 'Cycle 2 day 8');
  assert.match(d({ ...cyc, checkDate: '2026-11-09' }).band, /is cycle 2 day 8, a treatment day/);
  assert.match(d({ ...cyc, checkDate: '2026-11-10' }).band, /is cycle 2 day 9, not a treatment day/);
  assert.match(d({ ...cyc, checkDate: '2026-11-01' }).band, /is cycle 1 day 28/);
  assert.match(d({ ...cyc, checkDate: '2026-10-04' }).band, /before cycle 1 day 1/);
  assert.match(d({ ...cyc, checkDate: '2026-12-28' }).band, /after the last day of cycle 3/);
});

test('cycle calendar: a delayed cycle moves itself and every later cycle, and the gap belongs to no cycle', () => {
  const r = d({ ...cyc, delayedCycle: '2', actualDate: '2026-11-09', checkDate: '2026-11-05' });
  assert.deepEqual(r.cycleStarts, ['2026-10-05', '2026-11-09', '2026-12-07']);
  assert.match(r.notes.join(' '), /Cycle 2 started November 9, 2026, 7 days later than the planned November 2, 2026/);
  assert.match(r.band, /falls after day 28 of cycle 1 and before cycle 2 started/);
  assert.equal(r.bandLabel, 'Not a day of any cycle');
  assert.match(d({ ...cyc, delayedCycle: '2' }).message, /^Enter the date cycle 2 actually started/);
  assert.equal(d({ ...cyc, delayedCycle: '1', actualDate: '2026-11-09' }).valid, false);
  assert.match(d({ ...cyc, delayedCycle: '2', actualDate: '2026-10-05' }).message, /cannot start on or before day 1 of cycle 1/);
});

test('cycle calendar: the two calendars do not mix, and nothing is defaulted', () => {
  assert.match(d({ ...cyc, everyWeeks: '8' }).message, /clear the maintenance interval/);
  assert.match(d({ startDate: '2026-10-05', everyWeeks: '8', cycles: '3' }).message, /^Enter the cycle length in days to use the number of cycles/);
  assert.match(d({ startDate: '2026-10-05', cycleLength: '28', cycles: '3' }).message, /^Enter the treatment days within a cycle/);
  assert.match(d({ startDate: '2026-10-05', cycleLength: '28', treatmentDays: '1' }).message, /^Enter the number of cycles/);
  assert.match(d({ ...cyc, treatmentDays: '1, 29' }).message, /not a whole day from 1 to 28/);
  assert.match(d({ ...cyc, treatmentDays: '1, 8, 8' }).message, /entered twice/);
  // The loading and maintenance calendar is unchanged.
  assert.deepEqual(d({ ...base, maintenanceDoses: '2' }).dates, ['2026-10-05', '2026-10-19', '2026-11-16', '2027-01-11', '2027-03-08']);
});
