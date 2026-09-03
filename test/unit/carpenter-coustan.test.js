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

test('carpenter-coustan blank inputs do not read as a normal test', () => {
  // spec-v1006: this test used to assert `exceeded: 0, gdm: false` on an empty
  // form -- which is the defect written down as an expectation. A missing draw is
  // not a normal draw, and "not diagnostic of GDM" from no values at all is the
  // unsafe direction to fail in. Two values over cutoff still diagnose, so an
  // incomplete OGTT can rule GDM in; it cannot rule it out.
  const r = carpenterCoustan({});
  assert.equal(r.gdm, null);
  assert.equal(r.exceeded, null);
  assert.match(r.band, /Enter all four Carpenter-Coustan draws/);
  assert.doesNotMatch(r.band, /not diagnostic/);
});

test('carpenter-coustan: two values over cutoff diagnose before the test is finished', () => {
  const r = carpenterCoustan({ fasting: 100, oneHour: 200 });
  assert.equal(r.gdm, true);
  assert.equal(r.exceeded, 2);
  assert.match(r.band, /GDM diagnosed/);
  assert.match(r.band, /Read from 2 of 4 draws/);
});

test('carpenter-coustan: one normal value is not a negative test', () => {
  const r = carpenterCoustan({ fasting: 80 });
  assert.equal(r.gdm, null);
  assert.match(r.band, /Missing: 1-hour, 2-hour, 3-hour/);
});
