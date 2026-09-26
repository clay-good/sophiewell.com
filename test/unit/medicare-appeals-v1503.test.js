// spec-v1503 tools 1-4: Part D and Medicare Advantage clocks, one case per table row and a boundary per clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { partdCoverageClock as pdc, partdAppealLadder as pda, aicFor } from '../../lib/partd-appeals-v1503.js';
import { maOrgDeterminationClock as mao, maAppealLadder as maa } from '../../lib/ma-appeals-v1503.js';
import { parseIsoStrict } from '../../lib/deadline.js';

const R = '2026-10-05T14:00';

test('Part D: each request type', () => {
  assert.equal(pdc({ requestType: 'standard', received: R }).deadline, '2026-10-08T14:00');
  assert.equal(pdc({ requestType: 'expedited', received: R }).deadline, '2026-10-06T14:00');
  assert.equal(pdc({ requestType: 'payment', received: R }).deadline, '2026-10-19');
  assert.equal(pdc({ requestType: 'expedite-refused', received: R }).deadline, '2026-10-08T14:00');
  assert.match(pdc({ requestType: 'expedite-refused', received: R }).notes.join(' '), /within 3 calendar days/);
});

test('Part D exceptions: the statement starts the clock; none by day 14 moves it to 72 hours after day 14', () => {
  assert.equal(pdc({ requestType: 'exception', received: R, statement: '2026-10-07T09:00' }).deadline, '2026-10-10T09:00');
  assert.equal(pdc({ requestType: 'exception', received: R }).deadline, '2026-10-22T14:00');
  assert.equal(pdc({ requestType: 'exception', received: R, statement: '2026-10-25T09:00' }).deadline, '2026-10-22T14:00');
  assert.equal(pdc({ requestType: 'expedited-exception', received: R }).deadline, '2026-10-20T14:00');
  assert.equal(pdc({ requestType: 'exception', received: R, statement: '2026-10-01T09:00' }).valid, false);
});

test('Part D: a clock across the daylight-saving change keeps real hours', () => {
  assert.equal(pdc({ requestType: 'standard', received: '2026-10-31T09:30' }).deadline, '2026-11-03T08:30');
});

test('Part D ladder: the spec example, the 5-day presumption, and the amount in controversy', () => {
  assert.equal(pda({ level: 'coverage', noticeDate: '2026-03-03' }).band, '42 CFR 423.582: request redetermination by the plan within 60 calendar days of receiving the notice, so by May 7, 2026.');
  assert.equal(pda({ level: 'coverage', noticeDate: '2026-03-03', receivedDate: '2026-03-20' }).deadline, '2026-05-19');
  assert.equal(pda({ level: 'reconsideration', noticeDate: '2026-11-20', amount: '150' }).bandLabel, 'Below the $200 ALJ threshold');
  assert.equal(pda({ level: 'reconsideration', noticeDate: '2026-11-20', amount: '200' }).bandLabel, 'File by 2027-01-24');
  assert.equal(pda({ level: 'coverage', noticeDate: '2026-03-03', receivedDate: '2026-03-01' }).valid, false);
});

test('the amount in controversy follows the year the request is filed, and asks past the last published year', () => {
  assert.equal(aicFor(parseIsoStrict('2026-12-31')).edition, 'CY2026');
  assert.equal(aicFor(parseIsoStrict('2027-01-01')).edition, 'CY2027');
  assert.equal(aicFor(parseIsoStrict('2028-01-01')).expired, true);
});

test('Medicare Advantage: each row, extension, and the non-extendable Part B windows', () => {
  assert.equal(mao({ requestType: 'standard-service', received: R, extended: 'no' }).deadline, '2026-10-19');
  assert.equal(mao({ requestType: 'standard-service', received: R, extended: 'yes' }).deadline, '2026-11-02');
  assert.equal(mao({ requestType: 'standard-pa', received: R, extended: 'no' }).deadline, '2026-10-12');
  assert.equal(mao({ requestType: 'standard-pa', received: '2025-12-20T10:00', extended: 'no' }).deadline, '2026-01-03');
  assert.equal(mao({ requestType: 'standard-partb', received: R, extended: 'yes' }).deadline, '2026-10-08T14:00');
  assert.equal(mao({ requestType: 'expedited-partb', received: R }).deadline, '2026-10-06T14:00');
  assert.match(mao({ requestType: 'standard-pa', received: R }).notes.join(' '), /422\.570\(d\)/);
  assert.match(mao({ requestType: 'standard-service', received: R }).bandLabel, /if extended/);
});

test('Medicare Advantage ladder', () => {
  assert.equal(maa({ level: 'organization', noticeDate: '2026-10-01' }).deadline, '2026-12-05');
  assert.match(maa({ level: 'organization', noticeDate: '2026-10-01' }).notes.join(' '), /independent review entity itself/);
  assert.equal(maa({ level: 'reconsideration', noticeDate: '2026-10-01', amount: '199.99' }).bandLabel, 'Below the $200 ALJ threshold');
});

test('blanks are asked for', () => {
  for (const r of [pdc({}), pdc({ requestType: 'standard' }), pda({}), pda({ level: 'coverage' }), mao({}), mao({ requestType: 'standard-pa' }), maa({}), maa({ level: 'organization' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
