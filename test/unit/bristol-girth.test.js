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

// spec-v1213: the half-filled form, which the all-blank test above cannot see.
test('One girth entered and the other left blank is not a change from zero', () => {
  const stamps = { t0Timestamp: '2026-05-19T08:00', t1Timestamp: '2026-05-19T12:00' };
  for (const absent of [null, undefined, '']) {
    const r = bristolGirth({ bristolType: 4, girthT0Cm: absent, girthT1Cm: 95, ...stamps });
    assert.equal(r.girthDeltaCm, null, `T0 ${String(absent)} must not read as 0 cm`);
    assert.equal(r.deltaPerHourCm, null);
    assert.deepEqual(r.banners, [], 'no ACS escalation off an unmeasured girth');
  }
  // ... and the mirror, so the guard is not simply switched off.
  const r = bristolGirth({ bristolType: 4, girthT0Cm: 100, girthT1Cm: 95, ...stamps });
  assert.equal(r.girthDeltaCm, -5);
});

test('A girth typed as 0 is still a measurement', () => {
  const r = bristolGirth({
    bristolType: 4, girthT0Cm: 0, girthT1Cm: 95,
    t0Timestamp: '2026-05-19T08:00', t1Timestamp: '2026-05-19T12:00',
  });
  assert.equal(r.girthDeltaCm, 95);
});
