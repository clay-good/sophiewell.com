// spec-v1636 tool 15: antimicrobial days and days present from rows (NHSN AUR protocol, July 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { antimicrobialDayCounter } from '../../lib/antimicrobial-day-counter-v1636.js';

const row = (r, month, location, agent) => r.table.find((t) => t.month === month && t.location === location && (agent ? t.agent === agent : t.daysPresent !== undefined));

test('the protocol\'s own sentence: twice a day for three days is three days, three IV', () => {
  const lines = ['2026-03-01 08:00', '2026-03-01 20:00', '2026-03-02 08:00', '2026-03-02 20:00', '2026-03-03 08:00', '2026-03-03 20:00'].map((d) => `P1, Vancomycin, IV, ${d}, Ward`);
  const r = antimicrobialDayCounter({ administrations: lines.join('\n') });
  const w = row(r, '2026-03', 'Ward', 'Vancomycin');
  assert.deepEqual([w.total, w.iv, w.im, w.digestive, w.respiratory], [3, 3, 0, 0, 0]);
  assert.equal(r.facilityAntimicrobialDays, 3);
});

test('Appendix C, Example 2: a transfer day is one day in each location and one facility-wide', () => {
  const r = antimicrobialDayCounter({ administrations: 'A, Vancomycin, IV, 2025-12-01 07:00, MICU\nA, Vancomycin, IV, 2025-12-01 15:00, Medical Ward\nA, Vancomycin, IV, 2025-12-01 23:00, Medical Ward' });
  for (const loc of ['MICU', 'Medical Ward', 'Facility-wide inpatient']) {
    const x = row(r, '2025-12', loc, 'Vancomycin');
    assert.deepEqual([x.total, x.iv], [1, 1], loc);
  }
});

test('two routes on one day: one total day and one day in each route', () => {
  const r = antimicrobialDayCounter({ administrations: 'B, Tobramycin, IV, 2025-12-02, MICU\nB, tobramycin, inhaled, 2025-12-02, MICU' });
  const x = row(r, '2025-12', 'MICU', 'Tobramycin');
  assert.deepEqual([x.total, x.iv, x.respiratory], [1, 1, 1]);
});

test('days present: admission, discharge and transfer days count; facility-wide is not the sum', () => {
  // Monday to Wednesday on one ward is three days (the protocol's example).
  const a = antimicrobialDayCounter({ stays: 'P, Medical Ward, 2026-03-02, 2026-03-04' });
  assert.equal(row(a, '2026-03', 'Medical Ward').daysPresent, 3);
  // A transfer day counts in both locations and once facility-wide.
  const b = antimicrobialDayCounter({ stays: 'P, MICU, 2026-03-01, 2026-03-02\nP, Medical Ward, 2026-03-02, 2026-03-03' });
  assert.deepEqual([row(b, '2026-03', 'MICU').daysPresent, row(b, '2026-03', 'Medical Ward').daysPresent, row(b, '2026-03', 'Facility-wide inpatient').daysPresent], [2, 2, 3]);
  // Out to the operating room and back the same day: one day on the ward, one in the operating room.
  const c = antimicrobialDayCounter({ stays: 'P, Surgical Ward, 2026-03-05, 2026-03-05\nP, OR, 2026-03-05, 2026-03-05\nP, Surgical Ward, 2026-03-05, 2026-03-05' });
  assert.deepEqual([row(c, '2026-03', 'Surgical Ward').daysPresent, row(c, '2026-03', 'OR').daysPresent], [1, 1]);
});

test('a stay across a month end is split by calendar month', () => {
  const r = antimicrobialDayCounter({ stays: 'P, Ward, 2026-01-30, 2026-02-02' });
  assert.deepEqual([row(r, '2026-01', 'Ward').daysPresent, row(r, '2026-02', 'Ward').daysPresent], [2, 2]);
  assert.deepEqual(r.months, ['2026-01', '2026-02']);
});

test('a location named as outpatient keeps its own counts and leaves the facility-wide ones', () => {
  const r = antimicrobialDayCounter({ administrations: 'A, Ceftriaxone, IV, 2026-03-01, ED\nA, Ceftriaxone, IV, 2026-03-02, Ward', stays: 'A, ED, 2026-03-01, 2026-03-01\nA, Ward, 2026-03-01, 2026-03-02', outpatientLocations: 'ed' });
  assert.equal(row(r, '2026-03', 'ED', 'Ceftriaxone').total, 1);
  assert.equal(row(r, '2026-03', 'Facility-wide inpatient', 'Ceftriaxone').total, 1);
  assert.equal(row(r, '2026-03', 'Facility-wide inpatient').daysPresent, 2);
});

test('rows it cannot place are listed, not dropped silently', () => {
  const r = antimicrobialDayCounter({ administrations: 'patient,agent,route,date,location\nA, Mupirocin, topical, 2026-03-01, Ward\nA, Cefazolin, IV, 03/01/2026, Ward\nA, Cefazolin, IV, 2026-02-30, Ward\nA, Cefazolin, IV, 2026-03-01, Ward', stays: 'A, Ward, 2026-03-01,\nA, Ward, 2026-03-05, 2026-03-01' });
  assert.equal(r.unplaced.length, 5);
  assert.equal(r.flag, 'some-rows-not-counted');
  assert.equal(r.administrationsCounted, 1);
  assert.match(r.note, /5 rows could not be counted/);
});

test('nothing entered, or nothing countable, is a refusal', () => {
  assert.match(antimicrobialDayCounter({}).message, /^Enter the administration rows/);
  assert.match(antimicrobialDayCounter({ administrations: 'x' }).message, /^Enter at least one row/);
  assert.equal(antimicrobialDayCounter(null).valid, false);
  assert.equal(antimicrobialDayCounter({ administrations: 12 }).valid, false);
});
