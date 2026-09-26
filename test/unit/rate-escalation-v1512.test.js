// spec-v1512 tool 3: infusion rate escalation schedule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateEscalation as r } from '../../lib/rate-escalation-v1512.js';

test('Rituxan first-infusion protocol, 700 mg: 3 h 30 min, never reaching 400 mg/hr', () => {
  const x = r({ unit: 'mg', total: '700', startRate: '50', increment: '50', interval: '30', maxRate: '400', startTime: '2026-10-05T09:00' });
  assert.equal(x.minutes, 210);
  assert.match(x.band, /finishing at 12:30 pm/);
});

test('subsequent-infusion protocol, 1000 mg: holds at the maximum after three steps', () => {
  const x = r({ unit: 'mg', total: '1000', startRate: '100', increment: '100', interval: '30', maxRate: '400' });
  assert.equal(x.minutes, 195);
  assert.match(x.band, /reaching the maximum 400 mg\/hr/);
});

test('a zero increment is a constant rate', () => {
  assert.equal(r({ unit: 'mL', total: '250', startRate: '125', increment: '0', interval: '30', maxRate: '125' }).minutes, 120);
});

test('blank or inconsistent inputs ask', () => {
  assert.equal(r({}).valid, false);
  assert.equal(r({ unit: 'mg', total: '700', startRate: '500', increment: '50', interval: '30', maxRate: '400' }).valid, false);
  assert.equal(r({ unit: 'mg', total: '', startRate: '50', increment: '50', interval: '30', maxRate: '400' }).valid, false);
});
