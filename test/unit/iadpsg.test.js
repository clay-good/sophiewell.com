import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iadpsg } from '../../lib/scoring-v4.js';

test('iadpsg 0 abnormal (tile example) -> not diagnostic', () => {
  const r = iadpsg({ fasting: 85, oneHour: 160, twoHour: 140 });
  assert.equal(r.exceeded, 0);
  assert.equal(r.gdm, false);
  assert.match(r.band, /not diagnostic of GDM/);
});

test('iadpsg 1 abnormal (fasting) -> GDM (single-value rule)', () => {
  const r = iadpsg({ fasting: 95, oneHour: 160, twoHour: 140 });
  assert.equal(r.exceeded, 1);
  assert.equal(r.gdm, true);
  assert.match(r.band, /GDM diagnosed per IADPSG 2010/);
});

test('iadpsg 3 abnormal -> GDM', () => {
  const r = iadpsg({ fasting: 100, oneHour: 200, twoHour: 160 });
  assert.equal(r.exceeded, 3);
  assert.equal(r.gdm, true);
});

test('iadpsg exactly at cutoff is abnormal (>=)', () => {
  const r = iadpsg({ fasting: 92, oneHour: 160, twoHour: 140 });
  assert.equal(r.flags.fasting, true);
  assert.equal(r.exceeded, 1);
  assert.equal(r.gdm, true);
});

test('iadpsg one below cutoff -> not flagged', () => {
  const r = iadpsg({ fasting: 91, oneHour: 160, twoHour: 140 });
  assert.equal(r.flags.fasting, false);
  assert.equal(r.exceeded, 0);
});
