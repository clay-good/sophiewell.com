// spec-v1635 tool 3: RDI by both published time bases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeDoseIntensity as rdi } from '../../lib/relative-dose-intensity-v1635.js';

const base = { plannedDose: '75', cycleDays: '21', plannedCycles: '4' };

test('Pak 2024 worked example: stopped after 3 of 4 full on-time cycles is 75% over the planned course, 100% over the cycles given', () => {
  const r = rdi({ ...base, delivered: '2026-01-05 75\n2026-01-26 75\n2026-02-16 75' });
  assert.equal(r.valid, true);
  assert.equal(r.rdiCyclesGiven, 100);
  assert.equal(r.rdiPlannedCourse, 75);
});

test('a full on-time course is 100% both ways', () => {
  const r = rdi({ ...base, delivered: '2026-01-05 75\n2026-01-26 75\n2026-02-16 75\n2026-03-09 75' });
  assert.equal(r.rdiCyclesGiven, 100);
  assert.equal(r.rdiPlannedCourse, 100);
});

test('reduction and delay multiply: 80% dose and a 7-day delay', () => {
  // 2 cycles of 60 (planned 75), second given at day 28: elapsed 28 + 21 = 49; dose ratio 0.8, time ratio 42/49
  const r = rdi({ plannedDose: '75', cycleDays: '21', plannedCycles: '2', delivered: '2026-01-05 60\n2026-02-02 60' });
  assert.equal(r.doseRatio, 80);
  assert.equal(r.timeRatio, 85.7);
  assert.equal(r.rdiCyclesGiven, 68.6);
  assert.equal(r.rdiPlannedCourse, 68.6);
});

test('blank, undated, out-of-order and fractional inputs refuse', () => {
  assert.equal(rdi({ ...base, delivered: '' }).valid, false);
  assert.equal(rdi({ ...base, plannedDose: '', delivered: '2026-01-05 75' }).valid, false);
  assert.equal(rdi({ ...base, delivered: '75' }).valid, false);
  assert.equal(rdi({ ...base, delivered: '2026-02-30 75' }).valid, false);
  assert.equal(rdi({ ...base, delivered: '2026-01-26 75\n2026-01-05 75' }).valid, false);
  assert.equal(rdi({ ...base, cycleDays: '21.5', delivered: '2026-01-05 75' }).valid, false);
});
