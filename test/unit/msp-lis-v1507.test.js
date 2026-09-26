// spec-v1507 tool 5: Extra Help and Medicare Savings Program screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extraHelpMspScreen as x, countableIncome } from '../../lib/msp-lis-v1507.js';

const b = { marital: 'single', region: 'us', resources: '5000', burial: 'no', year: '2026' };

test('reproduces the 2026 limits SSA publishes (POMS HI 00815.023) at each edge', () => {
  const at = (u, extra = {}) => x({ ...b, ...extra, unearned: u }).bandLabel;
  assert.equal(at('1350'), 'QMB + Extra Help');
  assert.equal(at('1351'), 'SLMB + Extra Help');
  assert.equal(at('1616'), 'SLMB + Extra Help');
  assert.equal(at('1617'), 'QI + Extra Help');
  assert.equal(at('1816'), 'QI + Extra Help');
  assert.equal(at('1817'), 'Extra Help');
  assert.equal(at('2015'), 'Extra Help');
  assert.equal(at('2016'), 'Above federal limits');
  assert.equal(at('1824', { marital: 'married' }), 'QMB + Extra Help');
  assert.equal(at('1825', { marital: 'married' }), 'SLMB + Extra Help');
});

test('income is counted the SSI way: $20, then $65 and half of earnings', () => {
  assert.equal(countableIncome(1000, 500), 1197.5);
  assert.equal(countableIncome(10, 500), 212.5);
});

test('resources over the MSP limit but within Extra Help\'s', () => {
  const r = x({ ...b, unearned: '1200', resources: '12000' });
  assert.equal(r.bandLabel, 'Extra Help');
  assert.equal(r.msp, null);
});

test('burial funds raise the Extra Help resource limit', () => {
  assert.equal(x({ ...b, unearned: '1900', resources: '17000' }).extraHelp, false);
  assert.equal(x({ ...b, unearned: '1900', resources: '17000', burial: 'yes' }).extraHelp, true);
});

test('blank required inputs ask; a year with no limits on file asks', () => {
  assert.equal(x({ ...b }).valid, false);
  assert.equal(x({ ...b, unearned: '1000', resources: '' }).valid, false);
  assert.equal(x({ ...b, unearned: '1000', marital: '' }).valid, false);
  assert.match(x({ ...b, unearned: '1000', year: '2031' }).message, /not on file/);
});
