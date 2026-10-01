// spec-v1512 tool 4: chair-day-planner.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chairDayPlanner as p } from '../../lib/chair-day-planner.js';

const day = { chairs: '2', open: '08:00', close: '12:00' };

test('first-fit by preferred start; a chair holds premed, infusion and observation end to end', () => {
  const r = p({ ...day, appointments: 'A, 120, 15, 15, 08:00\nB, 60, 0, 30, 08:00\nC, 60, 0, 0, 09:00' });
  assert.deepEqual(r.placed.map((x) => [x.reference, x.chair, x.start, x.end]), [['A', 1, '08:00', '10:30'], ['B', 2, '08:00', '09:30'], ['C', 2, '09:30', '10:30']]);
  assert.ok(r.notes.some((n) => /C at 09:30 instead of 09:00/.test(n)));
  assert.deepEqual(r.utilization.map((u) => u.pct), [62.5, 62.5]);
  assert.match(r.band, /^3 of 3 appointments scheduled in 2 chairs from 08:00 to 12:00: 62\.5% of chair time booked\.$/);
});

test('an appointment that does not fit after its preferred time is listed with its earliest slot', () => {
  const r = p({ chairs: '1', open: '08:00', close: '12:00', appointments: 'A, 60, 0, 0, 09:00\nB, 120, 0, 0, 11:00' });
  assert.equal(r.placed.length, 1);
  assert.equal(r.unplaced[0].reference, 'B');
  assert.equal(r.unplaced[0].earliest, '10:00, chair 1');
  assert.ok(r.notes.some((n) => /B \(120 minutes\) does not fit from 11:00 before closing; the earliest slot it could take is 10:00 in chair 1/.test(n)));
  assert.match(r.band, /1 does not fit/);
  const none = p({ chairs: '1', open: '08:00', close: '09:00', appointments: 'A, 60, 0, 0\nB, 30, 0, 0' });
  assert.match(none.notes.join(' '), /no chair has that much time free today/);
});

test('the same input always gives the same schedule; ties go to the earlier line and lower chair', () => {
  const text = 'A, 60, 0, 0\nB, 60, 0, 0\nC, 60, 0, 0';
  assert.deepEqual(p({ ...day, appointments: text }), p({ ...day, appointments: text }));
  assert.deepEqual(p({ ...day, appointments: text }).placed.map((x) => [x.reference, x.chair, x.start]), [['A', 1, '08:00'], ['C', 1, '09:00'], ['B', 2, '08:00']]);
});

test('mapped file rows compute as typed lines; blanks are asked for, never zero', () => {
  const apptRows = [{ reference: 'A', chair_minutes: '120', premed_minutes: '15', observation_minutes: '15', preferred_start: '08:00' }];
  assert.equal(p({ ...day, apptRows }).band, p({ ...day, appointments: 'A, 120, 15, 15, 08:00' }).band);
  assert.match(p({ ...day, appointments: 'A, , 0, 0' }).notes.join(' '), /line 1, Enter the chair minutes for A/);
  assert.match(p({ ...day, appointments: 'A, 60, 0, 0, 25:00' }).notes.join(' '), /preferred start for A as HH:MM/);
  assert.match(p({ chairs: '', open: '08:00', close: '12:00', appointments: 'A, 1, 0, 0' }).message, /^Enter the number of chairs/);
  assert.match(p({ ...day, open: '12:00', close: '08:00', appointments: 'A, 1, 0, 0' }).message, /closing must be after opening/);
  assert.match(p(day).message, /^Enter the appointments/);
});
