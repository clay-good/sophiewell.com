// spec-v1563 tool 1: HAT stage and drug. The no-LP fexinidazole path, CSF cut-offs 5 and 100, small
// children, rhodesiense, and the fexinidazole and NECT doses.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hatTreatment as r } from '../../lib/hat-treatment-v1563.js';

const g = { form: 'gambiense', age: '30', weight: '60' };
const lp = (w, tryp = 'no') => ({ lp: 'done', csfWbc: w, trypCsf: tryp });

test('gambiense, 6 years and 20 kg or more', () => {
  assert.equal(r({ ...g, severe: 'no', followUp: 'yes' }).bandLabel, 'Fexinidazole, no LP');
  assert.equal(r({ ...g, severe: 'yes' }).bandLabel, 'Lumbar puncture needed');
  assert.equal(r({ ...g, severe: 'yes', lp: 'notdone' }).bandLabel, 'NECT');
  assert.equal(r({ ...g, ...lp('99') }).bandLabel, 'Fexinidazole');
  assert.equal(r({ ...g, ...lp('100') }).bandLabel, 'NECT');
  assert.equal(r(g).valid, false);
});

test('small children and the 5-cell cut-off', () => {
  const c = { form: 'gambiense', age: '4', weight: '15' };
  assert.equal(r({ ...c, ...lp('5') }).bandLabel, 'Pentamidine');
  assert.equal(r({ ...c, ...lp('6') }).bandLabel, 'NECT');
  assert.equal(r({ ...c, ...lp('3', 'yes') }).bandLabel, 'NECT');
  assert.equal(r({ ...c, lp: 'notdone' }).bandLabel, 'NECT');
});

test('rhodesiense', () => {
  const rh = { form: 'rhodesiense', age: '30', weight: '60' };
  assert.equal(r({ ...rh, ...lp('3') }).bandLabel, 'Fexinidazole');
  assert.equal(r({ ...rh, ...lp('50'), swallow: 'no' }).bandLabel, 'Melarsoprol');
  assert.equal(r({ form: 'rhodesiense', age: '4', weight: '15', ...lp('3') }).bandLabel, 'Suramin');
  assert.equal(r(rh).valid, false);
});

test('doses', () => {
  assert.ok(r({ ...g, severe: 'no', followUp: 'yes' }).notes.some((n) => /3 tablets \(1,800 mg\) on days 1-4, then 2 tablets/.test(n)));
  assert.ok(r({ ...g, weight: '30', severe: 'no', followUp: 'yes' }).notes.some((n) => /2 tablets \(1,200 mg\) on days 1-4/.test(n)));
  assert.ok(r({ ...g, ...lp('150') }).notes.some((n) => /nifurtimox 300 mg .* eflornithine 12,000 mg .* for 7 days/.test(n)));
  assert.equal(r({ ...g, pregnant: 'first', severe: 'no', followUp: 'yes' }).bandLabel, 'First trimester: specialist');
});
