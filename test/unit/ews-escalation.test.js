import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ewsEscalation } from '../../lib/scoring-v4.js';

test('NEWS2 0 -> 12-hourly', () => {
  const r = ewsEscalation({ news2Total: 0 });
  assert.equal(r.nextHours, 12);
});

test('NEWS2 1-4 -> 4-6 hourly (banner says 4-6; we encode 6 h)', () => {
  const r = ewsEscalation({ news2Total: 3 });
  assert.equal(r.nextHours, 6);
});

test('NEWS2 single-parameter 3 -> 1 hourly with urgent review', () => {
  const r = ewsEscalation({ news2Total: 3, singleParam3: true });
  assert.equal(r.nextHours, 1);
  assert.ok(r.banner.includes('urgent'));
});

test('NEWS2 5-6 -> 1 hourly with critical-care outreach', () => {
  const r = ewsEscalation({ news2Total: 5 });
  assert.equal(r.nextHours, 1);
});

test('NEWS2 >=7 -> continuous monitoring (0 h)', () => {
  const r = ewsEscalation({ news2Total: 8 });
  assert.equal(r.nextHours, 0);
  assert.ok(r.banner.includes('critical-care'));
});

test('NEWS2 vitalsTimestamp produces nextDueIso', () => {
  const r = ewsEscalation({ news2Total: 0, vitalsTimestamp: '2026-05-19T12:00:00Z' });
  assert.equal(r.nextDueIso, '2026-05-20T00:00:00.000Z');
});

test('NEWS2 missing news2Total throws', () => {
  assert.throws(() => ewsEscalation({}));
});
