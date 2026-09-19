// spec-v1392: end of life -- aid in dying, ethics-committee review, death declaration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyMaidTimeline as ny } from '../../lib/ny-maid-timeline-v1392.js';
import { njMaidTimeline as nj } from '../../lib/nj-maid-timeline-v1392.js';
import { caEoloaTimeline as ca } from '../../lib/ca-eoloa-timeline-v1392.js';
import { txEthicsReviewTimeline as te } from '../../lib/tx-ethics-review-timeline-v1392.js';
import { njDeathReligiousExemption as nd } from '../../lib/nj-death-religious-exemption-v1392.js';
import { txDeathCertDeadline as dc } from '../../lib/tx-death-cert-deadline-v1392.js';

test('nj: written on day 2 -- the 15 days bind (day 15)', () => {
  const r = nj({ firstOral: '2026-09-01T10:00', written: '2026-09-03T10:00', secondOral: '2026-09-16T10:00' });
  assert.equal(r.binding, '15 days after the first oral request');
  assert.match(r.band, /Wednesday, September 16, 2026, 10:00 am/);
});

test('nj: written on day 14 -- the 48 hours bind (day 16)', () => {
  const r = nj({ firstOral: '2026-09-01T10:00', written: '2026-09-15T10:00', secondOral: '2026-09-16T10:00' });
  assert.equal(r.binding, '48 hours after the written request was received');
  assert.match(r.band, /Thursday, September 17, 2026, 10:00 am/);
});

test('nj: a second oral request under 15 days does not count', () => {
  const r = nj({ firstOral: '2026-09-01T10:00', written: '2026-09-03T10:00', secondOral: '2026-09-10T10:00' });
  assert.match(r.secondNote, /does not count/);
  assert.match(r.bandLabel, /second oral request is still needed/);
});

test('ca: rejects oral requests 47 hours apart', () => {
  const r = ca({ oral1: '2026-09-01T10:00', oral2: '2026-09-03T09:00' });
  assert.equal(r.bandLabel, 'Does not meet 443.3');
  assert.match(r.band, /47 hours apart/);
});

test('ca: rejects two heirs as witnesses; accepts one relative and one outsider', () => {
  const base = { oral1: '2026-09-01T10:00', oral2: '2026-09-03T10:00' };
  assert.match(ca({ ...base, witness1: 'relative', witness2: 'relative' }).band, /only one of the two may be \(443\.3\(c\)\(1\)\)/);
  const all = { adult: 'met', capacity: 'met', terminal: 'met', resident: 'met', selfAdminister: 'met' };
  assert.equal(ca({ ...base, ...all, witness1: 'none', witness2: 'relative' }).bandLabel, 'Requests and findings documented');
  assert.equal(ca({ ...base, witness1: 'none', witness2: 'relative' }).bandLabel, 'Incomplete');
});

test('ny: no prescription date until the oral, written, and three evaluations are in', () => {
  const partial = ny({ oral: '2026-09-01', written: '2026-09-02', attending: '2026-09-02', consulting: '2026-09-05', witness1: 'ok', witness2: 'ok', prescribed: '2026-09-08T14:00' });
  assert.equal(partial.fillAt, undefined);
  assert.match(partial.band, /mental health professional/);
  const full = ny({ oral: '2026-09-01', written: '2026-09-02', attending: '2026-09-02', consulting: '2026-09-05', mentalHealth: '2026-09-06', witness1: 'ok', witness2: 'ok', prescribed: '2026-09-08T14:00' });
  assert.equal(full.fillAt, '2026-09-13T14:00');
});

test('ny: a disqualified witness is named', () => {
  assert.match(ny({ oral: '2026-09-01', witness1: 'ok', witness2: 'proxy' }).band, /health care proxy agent/);
});

test('tx ethics: never earlier than day 25', () => {
  const r = te({ noticeGiven: '2026-09-01', meeting: '2026-09-08T10:00', startNotice: '2026-09-10' });
  assert.equal(r.lastDay, '2026-10-05');
  assert.match(te({ noticeGiven: '2026-09-01', meeting: '2026-09-05T10:00' }).band, /less than seven calendar days/);
  assert.equal(te({ noticeGiven: '2026-09-01' }).lastDay, null);
});

test('nj death: a religious objection means cardiorespiratory criteria only', () => {
  assert.equal(nd({ belief: 'yes' }).exempt, true);
  assert.equal(nd({ belief: 'no' }).exempt, false);
  assert.equal(nd({}).valid, false);
});

test('tx death certificate: five days from receipt', () => {
  assert.equal(dc({ received: '2026-09-18' }).dueDate, '2026-09-23');
  assert.match(dc({ received: '2026-09-18', attendingAvailable: 'no' }).who, /chief medical officer/);
});
