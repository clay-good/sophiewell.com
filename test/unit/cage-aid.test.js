// spec-v738: CAGE-AID (CAGE Adapted to Include Drugs).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cageAid } from '../../lib/cage-aid-v738.js';

const ITEMS = ['q1', 'q2', 'q3', 'q4'];
const all = (v) => Object.fromEntries(ITEMS.map((k) => [k, v]));

test('all yes -> 4, positive', () => {
  const r = cageAid(all('yes'));
  assert.equal(r.valid, true);
  assert.equal(r.score, 4);
  assert.equal(r.tier, 'positive');
  assert.equal(r.abnormal, true);
});

test('all no -> 0, negative', () => {
  const r = cageAid(all('no'));
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'negative');
  assert.equal(r.abnormal, false);
});

test('the 2 cut: 1 negative, 2 positive', () => {
  const one = cageAid({ ...all('no'), q1: 'yes' }); // 1
  assert.equal(one.score, 1);
  assert.equal(one.tier, 'negative');
  assert.equal(one.abnormal, false);
  assert.match(one.detail, /single affirmative/);
  const two = cageAid({ ...all('no'), q1: 'yes', q3: 'yes' }); // 2
  assert.equal(two.score, 2);
  assert.equal(two.tier, 'positive');
  assert.equal(two.abnormal, true);
  assert.match(two.band, /CAGE-AID 2 of 4 /);
});

test('items require yes/no; all required', () => {
  assert.equal(cageAid({}).valid, false);
  assert.equal(cageAid({}).code, 'MISSING_INPUT');
  assert.equal(cageAid({ ...all('no'), q4: 'maybe' }).valid, false);
  assert.equal(cageAid({ ...all('no'), q4: '' }).field, 'q4');
});
