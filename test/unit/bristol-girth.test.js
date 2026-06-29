import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bristolGirth } from '../../lib/scoring-v4.js';

test('Bristol 1 -> constipation category', () => {
  const r = bristolGirth({ bristolType: 1 });
  assert.equal(r.category, 'constipation');
});

test('Bristol 4 -> normal (ideal)', () => {
  const r = bristolGirth({ bristolType: 4 });
  assert.equal(r.category, 'normal');
  assert.ok(r.bristolLabel.includes('Smooth'));
});

test('Bristol 5 -> soft', () => {
  const r = bristolGirth({ bristolType: 5 });
  assert.equal(r.category, 'soft');
});

test('Bristol 7 -> diarrhea', () => {
  const r = bristolGirth({ bristolType: 7 });
  assert.equal(r.category, 'diarrhea');
});

test('Girth trend computed when both measurements and timestamps present', () => {
  const r = bristolGirth({
    bristolType: 4,
    girthT0Cm: 100, girthT1Cm: 104,
    t0Timestamp: '2026-05-19T12:00:00Z',
    t1Timestamp: '2026-05-19T14:00:00Z',
  });
  assert.equal(r.girthDeltaCm, 4);
  assert.equal(r.intervalHours, 2);
  assert.equal(r.deltaPerHourCm, 2);
});

test('Δ girth >=2 cm/h -> ACS banner per SCCM 2013', () => {
  const r = bristolGirth({
    bristolType: 4,
    girthT0Cm: 100, girthT1Cm: 104,
    t0Timestamp: '2026-05-19T12:00:00Z',
    t1Timestamp: '2026-05-19T13:00:00Z',
  });
  assert.ok(r.banners.some((b) => b.includes('abdominal-compartment-syndrome')));
});

test('Out-of-range Bristol type throws', () => {
  assert.throws(() => bristolGirth({ bristolType: 0 }));
  assert.throws(() => bristolGirth({ bristolType: 8 }));
});

test('Without girth inputs, deltaPerHourCm is null', () => {
  const r = bristolGirth({ bristolType: 4 });
  assert.equal(r.deltaPerHourCm, null);
});
