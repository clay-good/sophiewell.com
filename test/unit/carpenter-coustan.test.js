import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carpenterCoustan } from '../../lib/scoring-v4.js';

test('carpenter-coustan 0 abnormal (tile example) -> not diagnostic', () => {
  const r = carpenterCoustan({ fasting: 85, oneHour: 160, twoHour: 140, threeHour: 120 });
  assert.equal(r.exceeded, 0);
  assert.equal(r.gdm, false);
  assert.equal(r.igt, false);
  assert.match(r.band, /not diagnostic of GDM/);
});

test('carpenter-coustan 1 abnormal -> impaired glucose tolerance', () => {
  const r = carpenterCoustan({ fasting: 100, oneHour: 160, twoHour: 140, threeHour: 120 });
  assert.equal(r.exceeded, 1);
  assert.equal(r.gdm, false);
  assert.equal(r.igt, true);
  assert.match(r.band, /impaired glucose tolerance/);
});

test('carpenter-coustan 2 abnormal -> GDM', () => {
  const r = carpenterCoustan({ fasting: 100, oneHour: 200, twoHour: 140, threeHour: 120 });
  assert.equal(r.exceeded, 2);
  assert.equal(r.gdm, true);
  assert.match(r.band, /GDM diagnosed/);
});

test('carpenter-coustan 4 abnormal -> GDM', () => {
  const r = carpenterCoustan({ fasting: 100, oneHour: 200, twoHour: 160, threeHour: 150 });
  assert.equal(r.exceeded, 4);
  assert.equal(r.gdm, true);
});

test('carpenter-coustan exactly at cutoff is abnormal (>=)', () => {
  const r = carpenterCoustan({ fasting: 95, oneHour: 160, twoHour: 140, threeHour: 120 });
  assert.equal(r.flags.fasting, true);
  assert.equal(r.exceeded, 1);
});

test('carpenter-coustan one below cutoff -> not flagged', () => {
  const r = carpenterCoustan({ fasting: 94, oneHour: 160, twoHour: 140, threeHour: 120 });
  assert.equal(r.flags.fasting, false);
  assert.equal(r.exceeded, 0);
});

test('carpenter-coustan blank inputs -> not diagnostic (NaN comparisons false)', () => {
  const r = carpenterCoustan({});
  assert.equal(r.exceeded, 0);
  assert.equal(r.gdm, false);
});
