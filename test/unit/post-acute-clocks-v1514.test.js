// spec-v1514 tools 1, 3, 5, 6: MOON, NOMNC, the SNF qualifying stay, and hospice periods.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { moonDeadline as mo, nomncDeadline as nm, snfQualifyingStay as sq, hospicePeriodClock as hp } from '../../lib/post-acute-clocks-v1514.js';

test('MOON: 36 hours, sooner at release, none at 24 hours or less', () => {
  assert.equal(mo({ observationStart: '2026-10-05T14:00' }).deadline, '2026-10-07T02:00');
  assert.equal(mo({ observationStart: '2026-10-05T14:00', endTime: '2026-10-06T20:00' }).deadline, '2026-10-06T20:00');
  assert.equal(mo({ observationStart: '2026-10-05T14:00', endTime: '2026-10-06T14:00' }).bandLabel, 'Not required');
});

test('NOMNC: 2 days, not 48 hours; a late notice extends coverage', () => {
  assert.equal(nm({ setting: 'snf', lastCovered: '2026-10-09' }).deadline, '2026-10-07');
  assert.equal(nm({ setting: 'snf', lastCovered: '2026-10-09', delivered: '2026-10-07' }).bandLabel, 'On time');
  assert.match(nm({ setting: 'snf', lastCovered: '2026-10-09', delivered: '2026-10-08' }).band, /October 10, 2026/);
});

test('SNF: 3 inpatient days not counting discharge, and the 30-day window', () => {
  assert.equal(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04' }).qualifies, true);
  assert.equal(sq({ inpatientAdmit: '2026-10-02', inpatientDischarge: '2026-10-04' }).qualifies, false);
  assert.equal(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04', snfAdmit: '2026-11-04' }).bandLabel, 'SNF admission too late');
  assert.match(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04', daysUsed: '25' }).notes.join(' '), /0 fully covered days and 75 coinsurance days/);
});

test('hospice: 90, 90, then 60-day periods, and the recertification window', () => {
  const r = hp({ electionDate: '2026-01-10', asOf: '2026-07-20' });
  assert.equal(r.bandLabel, 'Period 3');
  assert.match(r.band, /ends September 6, 2026/);
  assert.match(r.band, /between August 23, 2026 and September 9, 2026/);
});

test('blanks are asked for', () => {
  for (const r of [mo({}), nm({}), nm({ setting: 'snf' }), sq({}), sq({ inpatientAdmit: '2026-10-01' }), hp({})]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
