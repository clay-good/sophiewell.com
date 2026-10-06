// spec-v1559 tool 1: WHO eight-contact ANC schedule. Contact weeks, the gaps between, missed contacts, 41 weeks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoAncSchedule as a } from '../../lib/who-anc-schedule-v1559.js';

test('contact 1 up to 12 weeks, then 20, 26, 30, 34, 36, 38, 40', () => {
  assert.equal(a({ weeks: '12' }).bandLabel, 'Contact 1 due');
  assert.equal(a({ weeks: '12', days: '1' }).bandLabel, 'Next: contact 2 at 20 weeks');
  assert.equal(a({ weeks: '26' }).bandLabel, 'Contact 3 due');
  assert.match(a({ weeks: '26' }).band, /The next is contact 4 at 30 weeks/);
  assert.match(a({ weeks: '22' }).band, /contact 3 at 26 weeks, in 28 days/);
  assert.equal(a({ weeks: '40' }).bandLabel, 'Contact 8 due');
});

test('earlier contacts are listed so a missed one is seen now', () => {
  assert.match(a({ weeks: '31' }).notes[0], /contact 2 \(20 weeks\), contact 3 \(26 weeks\), contact 4 \(30 weeks\)/);
});

test('after 40 weeks: return at 41, and past 41', () => {
  assert.match(a({ weeks: '40', days: '3' }).band, /in 4 days/);
  assert.equal(a({ weeks: '41' }).bandLabel, 'Past 41 weeks');
});

test('refusals', () => {
  assert.equal(a({}).valid, false);
  assert.equal(a({ weeks: '20', days: '9' }).valid, false);
});
