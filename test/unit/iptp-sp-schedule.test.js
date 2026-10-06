// spec-v1552 tool 3: IPTp-SP due today? Week 12+6 vs 13+0, the 4-week spacing, each contraindication, folic
// acid, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iptpSpSchedule as i } from '../../lib/iptp-sp-schedule-v1552.js';

const B = { contra: 'none', previous: 'none', folic: 'low' };

test('not before week 13: 12+6 waits a day, 13+0 is due', () => {
  const early = i({ ...B, weeks: '12', days: '6' });
  assert.equal(early.bandLabel, 'Not yet');
  assert.match(early.band, /in 1 day/);
  const due = i({ ...B, weeks: '13', days: '0' });
  assert.equal(due.bandLabel, 'Due today');
  assert.match(due.band, /3 tablets of sulfadoxine-pyrimethamine 500\/25 mg \(1,500\/75 mg\)/);
});

test('doses at least 4 weeks apart', () => {
  assert.equal(i({ ...B, weeks: '24', previous: 'yes', since: '3' }).bandLabel, 'Not yet');
  assert.match(i({ ...B, weeks: '24', previous: 'yes', since: '3' }).band, /due in 7 days/);
  assert.equal(i({ ...B, weeks: '24', previous: 'yes', since: '4' }).bandLabel, 'Due today');
  assert.equal(i({ ...B, weeks: '24', previous: 'yes' }).valid, false, 'a previous dose needs the weeks since');
});

test('contraindications, with no IPTp alternative on cotrimoxazole', () => {
  for (const c of ['ctx', 'allergy', 'ill', 'recent']) assert.equal(i({ ...B, weeks: '24', contra: c }).bandLabel, 'Not to be given', c);
  assert.match(i({ ...B, weeks: '24', contra: 'ctx' }).notes.join(' '), /no IPTp alternative/);
});

test('high-dose folic acid is flagged', () => {
  assert.match(i({ ...B, weeks: '24', folic: 'high' }).notes.join(' '), /switch her to the 0\.4 mg formulation/);
});

test('refusals', () => {
  assert.equal(i({ ...B }).valid, false);
  assert.equal(i({ ...B, weeks: '24', contra: '' }).valid, false);
  assert.equal(i({ ...B, weeks: '24', previous: '' }).valid, false);
  assert.equal(i({ ...B, weeks: '24', days: '7' }).valid, false);
});
