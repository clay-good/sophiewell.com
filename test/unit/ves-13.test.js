// spec-v143 2.4: Vulnerable Elders Survey-13 (Saliba 2001). Total 0-10, >= 3 vulnerable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ves13 } from '../../lib/frailty-v143.js';

test('young, healthy, no limitations -> 0, not vulnerable', () => {
  const r = ves13({ age: 'under75', health: 'good' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('the >= 3 vulnerable flip: age 75-84 + fair health + one "a lot" task = 3', () => {
  const r = ves13({ age: '75to84', health: 'fair', walking: 'alot' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /vulnerable/);
});

test('just below: "some difficulty" does not count (age + fair + some + some = 2)', () => {
  const r = ves13({ age: '75to84', health: 'fair', walking: 'some', housework: 'some' });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('disability is all-or-nothing 4 points; any single ADL crosses the threshold', () => {
  const r = ves13({ age: 'under75', health: 'good', bathing: 1 });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
  // five disabilities still scores exactly 4, never additive
  const r5 = ves13({ shopping: 1, money: 1, walkRoom: 1, lightHousework: 1, bathing: 1 });
  assert.equal(r5.score, 4);
});

test('physical-function points cap at 2, max total is 10', () => {
  assert.equal(ves13({ stooping: 'alot', lifting: 'alot', reaching: 'unable' }).score, 2);
  const max = ves13({ age: '85plus', health: 'poor', stooping: 'alot', lifting: 'unable', reaching: 'alot', bathing: 1 });
  assert.equal(max.score, 10);
});
