// spec-v1558 tool 1: WHO 2025 postpartum hemorrhage criteria and tranexamic acid. The 299/300 and 499/500
// mL edges, each sign's threshold, blank signs, the 24-hour and 3-hour windows, and the second TXA dose.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pphWho2025 as p } from '../../lib/pph-who-2025-v1558.js';

const NORMAL = { pulse: '88', sbp: '118', dbp: '72' };
const B = { loss: '350', hours: '1', ...NORMAL };

test('500 mL or more meets the criteria on its own, signs or not', () => {
  assert.equal(p({ loss: '499', hours: '1', ...NORMAL }).bandLabel, 'Criteria not met yet');
  const at = p({ loss: '500', hours: '1' });
  assert.equal(at.bandLabel, 'PPH: start the bundle');
  assert.match(at.band, /500 mL measured, 500 mL or more\): start the first-response bundle now: uterine massage, an oxytocic, tranexamic acid, IV fluids, examine the genital tract, and escalate\./);
});

test('300 mL or more with any abnormal sign; each threshold is strict', () => {
  assert.equal(p({ ...B, loss: '299', pulse: '130' }).bandLabel, 'Criteria not met yet');
  assert.equal(p({ ...B, pulse: '100' }).bandLabel, 'Criteria not met yet');
  assert.equal(p({ ...B, pulse: '101' }).bandLabel, 'PPH: start the bundle');
  assert.equal(p({ ...B, sbp: '100' }).bandLabel, 'Criteria not met yet');
  assert.equal(p({ ...B, sbp: '99' }).bandLabel, 'PPH: start the bundle');
  assert.equal(p({ ...B, dbp: '60' }).bandLabel, 'Criteria not met yet');
  assert.equal(p({ ...B, dbp: '59' }).bandLabel, 'PPH: start the bundle');
  // Shock index exactly 1 is not above 1.
  assert.equal(p({ ...B, pulse: '100', sbp: '100' }).bandLabel, 'Criteria not met yet');
  const si = p({ ...B, pulse: '98', sbp: '97' });
  assert.equal(si.bandLabel, 'PPH: start the bundle');
  assert.match(si.band, /shock index above 1/);
  assert.match(si.notes[0], /shock index 1\.01 \(abnormal above 1\)/);
});

test('a blank vital sign is not normal between 300 and 499 mL', () => {
  const ask = p({ loss: '350', hours: '1', pulse: '88' });
  assert.equal(ask.valid, false);
  assert.match(ask.message, /Enter the systolic pressure, the diastolic pressure: with 350 mL measured/);
  assert.equal(p({ loss: '200', hours: '1' }).bandLabel, 'Criteria not met yet', 'below 300 mL the signs cannot change it');
  // When a blank sign cannot change the answer, it is still named.
  const held = p({ loss: '350', hours: '1', pulse: '108', dbp: '66' });
  assert.equal(held.bandLabel, 'PPH: start the bundle');
  assert.match(held.notes.join(' '), /Not entered: the systolic pressure\. The answer holds whatever it shows\./);
  assert.match(p({ loss: '600', hours: '1' }).notes.join(' '), /Not entered: the pulse, the systolic pressure, the diastolic pressure\./);
});

test('beyond 24 hours the criteria do not answer, and the answer is not "no"', () => {
  assert.equal(p({ ...B, hours: '24' }).bandLabel, 'Criteria not met yet');
  const late = p({ ...B, loss: '800', hours: '24.5' });
  assert.equal(late.bandLabel, 'Outside the 24-hour window');
  assert.match(late.band, /not a "no"/);
});

test('tranexamic acid: within 3 hours of birth (3:00 within), closed after', () => {
  const PPH = { loss: '600', hours: '1', txa: 'no' };
  assert.match(p(PPH).notes.join(' '), /Tranexamic acid: 1 g IV at 1 mL a minute \(over 10 minutes\), now\. The window closes 3 hours after birth, 2 h 0 min from now/);
  assert.match(p({ ...PPH, hours: '3' }).notes.join(' '), /exactly 3 hours is read as within/);
  assert.match(p({ ...PPH, hours: '3.1' }).notes.join(' '), /3-hour window from birth has closed/);
  assert.match(p({ loss: '600', hours: '1' }).notes.join(' '), /Tranexamic acid, if not yet given/);
  assert.match(p(PPH).notes.join(' '), /IV only/);
});

test('the second tranexamic acid dose: still bleeding at 30 minutes, or restarted within 24 hours', () => {
  const G = { loss: '600', hours: '2', txa: 'yes' };
  assert.match(p({ ...G, bleeding: 'continues', txaMinutes: '30' }).notes.join(' '), /the second dose is due/);
  assert.match(p({ ...G, bleeding: 'continues', txaMinutes: '20' }).notes.join(' '), /10 minutes from now/);
  assert.match(p({ ...G, bleeding: 'restarted', txaMinutes: '600' }).notes.join(' '), /the second dose is due \(bleeding restarted within 24 hours/);
  assert.match(p({ ...G, bleeding: 'restarted', txaMinutes: '1500' }).notes.join(' '), /outside the second-dose rule/);
  assert.match(p({ ...G, bleeding: 'stopped' }).notes.join(' '), /no second dose while the bleeding has stopped/);
  assert.match(p(G).notes.join(' '), /The bleeding now was not entered/);
});

test('refusals', () => {
  assert.equal(p({ hours: '1' }).valid, false);
  assert.equal(p({ loss: '400' }).valid, false);
  assert.equal(p({ ...B, loss: '6000' }).valid, false);
  assert.equal(p({ ...B, pulse: '5' }).valid, false);
  assert.equal(p({ ...B, txa: 'maybe' }).valid, false);
  assert.equal(p().valid, false);
});
