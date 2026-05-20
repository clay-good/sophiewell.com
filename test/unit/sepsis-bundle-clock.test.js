import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sepsisBundleClock } from '../../lib/scoring-v4.js';

const T0 = '2026-05-19T12:00:00Z';

test('All hour-1 elements within 60 min -> on-time', () => {
  const r = sepsisBundleClock({
    t0: T0,
    lactateTime:    '2026-05-19T12:30:00Z',
    cultureTime:    '2026-05-19T12:30:00Z',
    antibioticTime: '2026-05-19T12:45:00Z',
    fluidStartTime: '2026-05-19T12:45:00Z',
  });
  for (const i of r.items.slice(0, 4)) assert.equal(i.status, 'on-time');
});

test('Antibiotic at 90 min -> late', () => {
  const r = sepsisBundleClock({
    t0: T0,
    antibioticTime: '2026-05-19T13:30:00Z',
  });
  const abx = r.items.find((i) => i.label.startsWith('broad-spectrum antibiotics'));
  assert.equal(abx.status, 'late');
});

test('Lactate clearance computed when both values present', () => {
  const r = sepsisBundleClock({
    t0: T0,
    lactateValue: 4, repeatLactateValue: 2,
  });
  assert.equal(r.lactateClearancePct, 50);
});

test('Initial lactate >=4 adds 30 mL/kg banner', () => {
  const r = sepsisBundleClock({ t0: T0, lactateValue: 4.2 });
  assert.ok(r.banners.some((b) => b.includes('30 mL/kg crystalloid')));
});

test('Lactate clearance <10% flags sub-target banner', () => {
  const r = sepsisBundleClock({ t0: T0, lactateValue: 4, repeatLactateValue: 3.8 });
  assert.equal(r.lactateClearancePct, 5);
  assert.ok(r.banners.some((b) => b.includes('sub-target')));
});

test('Missing T0 throws', () => {
  assert.throws(() => sepsisBundleClock({}));
});

test('All elements pending without inputs', () => {
  const r = sepsisBundleClock({ t0: T0 });
  for (const i of r.items) assert.equal(i.status, 'pending');
});
