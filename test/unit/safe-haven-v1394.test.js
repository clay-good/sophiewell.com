// spec-v1394: safe-haven infant surrender -- New York, New Jersey, Texas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeHavenInfantCheck as sh } from '../../lib/safe-haven-infant-check-v1394.js';

const T = '2026-09-18T22:00'; // a Friday night

test('safe haven: Texas takes 60 days; DFPS by the close of the next business day', () => {
  const r = sh({ state: 'TX', ageDays: '20', intentToReturn: 'no', abuse: 'no', received: T });
  assert.equal(r.eligible, true);
  assert.equal(r.noticeBy, '2026-09-21');
  assert.match(r.band, /Monday, September 21, 2026/);
  assert.match(r.steps.join(' '), /may stay anonymous/);
  assert.equal(sh({ state: 'TX', ageDays: '61', intentToReturn: 'no', received: T }).eligible, false);
  assert.match(sh({ state: 'TX', ageDays: '20', intentToReturn: 'no', abuse: 'yes', received: T }).steps.join(' '), /may detain or pursue/);
  assert.match(sh({ state: 'TX', ageDays: '20', intentToReturn: 'no', received: T }).steps.join(' '), /unless the child appears abused/);
});

test('safe haven: New Jersey takes 30 days; 31 is out; an intent to return takes it out of the law', () => {
  assert.equal(sh({ state: 'NJ', ageDays: '30', intentToReturn: 'no', received: T }).eligible, true);
  assert.equal(sh({ state: 'NJ', ageDays: '31', intentToReturn: 'no', received: T }).eligible, false);
  const back = sh({ state: 'NJ', ageDays: '5', intentToReturn: 'yes', received: T });
  assert.equal(back.bandLabel, 'Not a safe-haven delivery');
  assert.match(sh({ state: 'NJ', ageDays: '5', intentToReturn: 'no', received: T }).steps.join(' '), /hospital emergency department/);
});

test('safe haven: New York is a 30-day defense and sets no receiving deadline', () => {
  const r = sh({ state: 'NY', ageDays: '10' });
  assert.equal(r.eligible, true);
  assert.match(r.steps.join(' '), /no steps or deadline/);
  assert.equal(sh({ state: 'NY', ageDays: '31' }).eligible, false);
});

test('safe haven: blanks are asked, never assumed; California is pointed elsewhere', () => {
  assert.equal(sh({ state: 'TX', ageDays: '20', received: T }).valid, false);
  assert.equal(sh({ state: 'TX', ageDays: '20', intentToReturn: 'no' }).valid, false);
  assert.equal(sh({ state: 'TX', intentToReturn: 'no', received: T }).valid, false);
  assert.match(sh({ state: 'CA', ageDays: '1' }).message, /California Safely Surrendered Baby Checklist/);
});
