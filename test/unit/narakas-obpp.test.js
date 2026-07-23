// spec-v498: Narakas classification of obstetric brachial plexus palsy (groups I-IV).
// Worked-example tests: each group and its root involvement, the III/IV Horner split, alias input,
// invalid-group guard. Groups transcribed from Narakas 1987 (The Paralysed Hand) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { narakasObpp } from '../../lib/narakas-obpp-v498.js';

test('group II: C5-C7 (the META example)', () => {
  const r = narakasObpp({ group: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'II');
  assert.match(r.band, /the group I deficits plus affected wrist and finger extension/);
});

test('group I: C5-C6, the upper trunk (Erb palsy)', () => {
  assert.match(narakasObpp({ group: 'I' }).band, /the upper trunk \(Erb palsy\)/);
});

test('the III/IV split turns on Horner syndrome', () => {
  assert.match(narakasObpp({ group: 'III' }).band, /without Horner syndrome/);
  assert.match(narakasObpp({ group: 'IV' }).band, /with Horner syndrome/);
});

test('groups III and IV are both whole-plexus (C5-T1)', () => {
  assert.match(narakasObpp({ group: 'III' }).band, /C5-T1/);
  assert.match(narakasObpp({ group: 'IV' }).band, /C5-T1/);
});

test('lowercase and numeric aliases map to the canonical groups', () => {
  assert.equal(narakasObpp({ group: 'iv' }).group, 'IV');
  assert.equal(narakasObpp({ group: 1 }).group, 'I');
});

test('a missing or out-of-range group is invalid', () => {
  assert.equal(narakasObpp({}).valid, false);
  assert.equal(narakasObpp({ group: '0' }).valid, false);
  assert.equal(narakasObpp({ group: 'V' }).valid, false);
});
