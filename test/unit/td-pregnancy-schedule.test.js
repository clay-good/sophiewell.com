// spec-v1559 tool 2: Td in pregnancy (WHO 2017). Each history, the 38-week reach of the second dose, the adult
// course, full protection, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tdPregnancySchedule as t } from '../../lib/td-pregnancy-schedule-v1559.js';

test('no reliable record and 3 childhood doses: 2 doses, the second by 38 weeks', () => {
  const n = t({ history: 'none', weeks: '20' });
  assert.equal(n.bandLabel, '2 doses');
  assert.match(n.notes.join(' '), /second dose is due at 24 weeks or later, and by 38 weeks/);
  assert.match(n.notes.join(' '), /third dose at least 6 months later/);
  assert.match(t({ history: 'dtp3', weeks: '35' }).notes.join(' '), /falls after 38 weeks/);
  assert.match(t({ history: 'dtp3', weeks: '34' }).notes.join(' '), /due at 38 weeks or later, and by 38 weeks/);
});

test('4 childhood doses: one booster; fully protected: none', () => {
  assert.equal(t({ history: 'dtp4', weeks: '20' }).bandLabel, '1 dose now');
  assert.equal(t({ history: 'full', weeks: '20' }).bandLabel, 'None needed');
});

test('adult course: the next dose of 5, and 5 doses is full', () => {
  assert.equal(t({ history: 'adult', adultDoses: '2', weeks: '20' }).bandLabel, 'Dose 3 of 5');
  assert.match(t({ history: 'adult', adultDoses: '2', weeks: '20' }).notes.join(' '), /at least 6 months after dose 2/);
  assert.equal(t({ history: 'adult', adultDoses: '5', weeks: '20' }).bandLabel, 'None needed');
  assert.equal(t({ history: 'adult', weeks: '20' }).valid, false);
});

test('refusals', () => {
  assert.equal(t({ weeks: '20' }).valid, false);
  assert.equal(t({ history: 'none' }).valid, false);
});
