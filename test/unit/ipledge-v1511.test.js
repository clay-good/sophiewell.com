// spec-v1511 tool 6: iPLEDGE dispense window.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipledgeWindow as w } from '../../lib/ipledge-v1511.js';

test('the guide\'s own example: a test on March 1 makes March 7 the last day', () => {
  const r = w({ canGetPregnant: 'yes', startDate: '2024-03-01', checkDate: '2024-03-05' });
  assert.equal(r.lastDay, '2024-03-07');
  assert.match(r.band, /11:59 pm Eastern Time/);
});

test('a patient who cannot get pregnant: 30 days from the office visit', () => {
  assert.equal(w({ canGetPregnant: 'no', startDate: '2026-10-01', checkDate: '2026-10-31' }).bandLabel, 'Open to 2026-10-31');
  assert.equal(w({ canGetPregnant: 'no', startDate: '2026-10-01', checkDate: '2026-11-01' }).bandLabel, 'Window closed');
});

test('a missed first window: a 19-day wait before November 15, 2026, none after', () => {
  assert.match(w({ canGetPregnant: 'yes', startDate: '2026-10-01', checkDate: '2026-10-08', firstPrescription: 'yes' }).notes[0], /19 days/);
  assert.match(w({ canGetPregnant: 'yes', startDate: '2026-11-20', checkDate: '2026-11-28', firstPrescription: 'yes' }).notes[0], /no waiting period/);
});

test('blank choices ask; a blank check date uses today and says so', () => {
  assert.equal(w({}).valid, false);
  assert.equal(w({ canGetPregnant: 'yes' }).valid, false);
  assert.match(w({ canGetPregnant: 'yes', startDate: '2026-09-25' }, new Date(Date.UTC(2026, 8, 26))).notes[0], /today/);
});
