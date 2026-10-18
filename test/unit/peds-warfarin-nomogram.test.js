// spec-v1634 tool 15: CHEST 2012 Table 6 with the 2024 ASH/ISTH guideline's Table 9 (re-read October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsWarfarinNomogram as pw } from '../../lib/peds-warfarin-nomogram-v1634.js';

test('day 1: 0.2 mg/kg for a baseline INR of 1.0 to 1.3, 0.1 mg/kg after a Fontan or with liver dysfunction, at most 10 mg', () => {
  assert.equal(pw({ phase: 'day1', start: 'standard', weightKg: '20', inr: '1.1' }).doseMg, 4);
  assert.equal(pw({ phase: 'day1', start: 'fontan', weightKg: '20', inr: '1.2' }).doseMg, 2);
  assert.equal(pw({ phase: 'day1', start: 'liver', weightKg: '30', inr: '1.0' }).doseMg, 3);
  assert.equal(pw({ phase: 'day1', start: 'standard', weightKg: '60', inr: '1.0' }).doseMg, 10);
  assert.equal(pw({ phase: 'day1', start: 'standard', weightKg: '20', inr: '1.5' }).flag, 'no-recommendation-given');
});

test('loading days 2 to 4', () => {
  const l = (inr) => pw({ phase: 'loading', doseMg: '4', inr });
  assert.equal(l('1.2').doseMg, 4);
  assert.equal(l('1.6').doseMg, 2);
  assert.equal(l('2.5').doseMg, 2);
  assert.equal(l('3.3').doseMg, 1);
  assert.equal(l('4').flag, 'hold');
  assert.match(l('4').band, /50% less: 2 mg/);
});

test('maintenance, with the 1.5-1.9 band the 2024 guideline prints', () => {
  const m = (inr) => pw({ phase: 'maintenance', doseMg: '5', inr });
  assert.equal(m('1.4').doseMg, 6);
  assert.equal(m('1.5').doseMg, 5.5);
  assert.equal(m('1.9').doseMg, 5.5);
  assert.ok(m('1.7').notes.some((n) => /1\.15-1\.9/.test(n)));
  assert.equal(m('2.0').doseMg, 5);
  assert.equal(m('3.5').doseMg, 4.5);
  assert.match(m('3.6').band, /20% less: 4 mg/);
});

test('an INR between bands is asked for in tenths; below the tables is no figure', () => {
  assert.equal(pw({ phase: 'maintenance', doseMg: '5', inr: '1.45' }).valid, false);
  assert.equal(pw({ phase: 'maintenance', doseMg: '5', inr: '1.0' }).flag, 'no-recommendation-given');
  assert.equal(pw({ phase: 'maintenance', inr: '2' }).valid, false, 'a dose is required');
  assert.equal(pw({ inr: '2' }).valid, false, 'a phase is required');
});
