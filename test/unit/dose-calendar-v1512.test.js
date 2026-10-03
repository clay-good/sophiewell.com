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
