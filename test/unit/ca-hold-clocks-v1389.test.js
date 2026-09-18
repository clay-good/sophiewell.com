// spec-v1389: the California hold clocks (WIC 5150/5250/5256/5260/5270.15, HSC 1799.111, WIC 5585.50).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ca5150HoldTimeline as t5150 } from '../../lib/ca-5150-hold-timeline-v1389.js';
import { caEdPsychDetention1799 as t1799 } from '../../lib/ca-ed-psych-detention-1799-v1389.js';
import { ca5585MinorHold as tMinor } from '../../lib/ca-5585-minor-hold-v1389.js';

test('5150: 72 hours from first detention, and the 7-day hearing if still held uncertified', () => {
  const r = t5150({ detained: '2026-09-18T20:00', criterion: 'danger-self' });
  assert.deepEqual(r.deadlines.map((d) => d.at), ['2026-09-21T20:00', '2026-09-25']);
  assert.equal(r.stage, '5150');
});

test('5250: a new 14-day clock with a review hearing within 4 days of certification', () => {
  const r = t5150({ detained: '2026-09-18T20:00', criterion: 'danger-self', certified: '2026-09-21T15:00', suicideThreat: 'yes' });
  assert.equal(r.stage, '5250');
  const at = r.deadlines.map((d) => d.at);
  assert.ok(at.includes('2026-09-25'));
  assert.ok(at.includes('2026-10-05T15:00'));
  assert.ok(r.next.some((n) => /^5260: up to 14 more days/.test(n)));
});

test('5270.15 is offered only for grave disability in a county that adopted it; unassessed says so', () => {
  const base = { detained: '2026-09-18T20:00', certified: '2026-09-21T15:00', suicideThreat: 'no' };
  assert.ok(t5150({ ...base, criterion: 'grave-disability', county30: 'yes' }).next.some((n) => /^5270\.15: up to 30 more days/.test(n)));
  assert.ok(t5150({ ...base, criterion: 'grave-disability', county30: 'no' }).next.some((n) => /not available/.test(n)));
  assert.ok(t5150({ ...base, criterion: 'grave-disability' }).next.some((n) => /^5270\.15 not assessed/.test(n)));
  assert.equal(t5150({ ...base, criterion: 'danger-others', county30: 'yes' }).next.some((n) => /5270\.15/.test(n)), false);
});

test('1799.111: 8 and 24 hours, and the ED hours credited against a later 5150', () => {
  const r = t1799({ detained: '2026-09-18T14:00', hold5150: '2026-09-19T02:00' });
  assert.equal(r.deadlines[0].at, '2026-09-18T22:00');
  assert.equal(r.deadlines[1].at, '2026-09-19T14:00');
  assert.equal(r.creditHours, 12);
  assert.equal(r.fiveOneFiftyEnd, '2026-09-21T14:00');
});

test('1799.111: the credit is capped at 24 hours, and a 5150 written past 24 hours is flagged', () => {
  const r = t1799({ detained: '2026-09-18T14:00', hold5150: '2026-09-19T20:00' });
  assert.equal(r.creditHours, 24);
  assert.equal(r.fiveOneFiftyEnd, '2026-09-21T20:00');
  assert.ok(r.checks.some((c) => /past the 24 hours/.test(c)));
  assert.equal(r.abnormal, true);
});

test('1799.111: placement contacts after medical stability are flagged; missing times are not a pass', () => {
  const late = t1799({ detained: '2026-09-18T14:00', stable: '2026-09-18T16:00', firstContact: '2026-09-18T18:00' });
  assert.ok(late.checks.some((c) => /shall not begin after/.test(c)));
  const blank = t1799({ detained: '2026-09-18T14:00' });
  assert.ok(blank.checks.some((c) => /^Not assessed/.test(c)));
});

test('5585.50: 72 hours for a minor; 18 and over is refused; no parent notice is flagged', () => {
  const r = tMinor({ age: '15', criterion: 'danger-self', detained: '2026-09-18T20:00' });
  assert.equal(r.deadlines[0].at, '2026-09-21T20:00');
  assert.equal(r.abnormal, true);
  assert.match(r.parent, /not yet recorded/);
  assert.equal(tMinor({ age: '15', criterion: 'danger-self', detained: '2026-09-18T20:00', parentNotified: '2026-09-18T21:30' }).abnormal, false);
  const adult = tMinor({ age: '18', criterion: 'danger-self', detained: '2026-09-18T20:00' });
  assert.equal(adult.valid, false);
  assert.match(adult.message, /5150/);
});

test('blank start times print no deadline', () => {
  assert.equal(t5150({ criterion: 'danger-self' }).valid, false);
  assert.equal(t1799({}).valid, false);
  assert.equal(tMinor({ age: '15', criterion: 'danger-self' }).valid, false);
});
