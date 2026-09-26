// spec-v1512 tool 2: loading and maintenance dose calendar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doseCalendar as d } from '../../lib/dose-calendar-v1512.js';

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
