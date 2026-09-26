// spec-v1508: hospital financial assistance and self-pay estimates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../../lib/hospital-fap-v1508.js';

test('agb-percentage: allowed $4.2M over gross $10M is 42%, and a $12,000 bill caps at $5,040', () => {
  const r = H.agbPercentage({ allowed: '4200000', gross: '10000000', bill: '12000', periodEnd: '2026-06-30' });
  assert.equal(r.percent, 42);
  assert.match(r.band, /\$5,040\.00/);
  assert.match(r.notes.join(' '), /October 28, 2026, the 120th day/);
});

test('fap-collection-clock: a notice on day 100 makes day 130 the earliest action', () => {
  const r = H.fapCollectionClock({ firstBill: '2026-01-05', notice: '2026-04-15' });
  assert.equal(r.earliest, '2026-05-15');
  assert.equal(H.fapCollectionClock({ firstBill: '2026-01-05', notice: '2026-02-01' }).earliest, '2026-05-05');
  assert.match(H.fapCollectionClock({ firstBill: '2026-01-05', application: '2026-08-01' }).band, /suspended/);
  assert.match(H.fapCollectionClock({ firstBill: '2026-01-05', application: '2026-09-15' }).band, /after the application period/);
});

test('fap-discount: the tier, and the AGB cap when it binds', () => {
  const base = { size: '3', region: 'us', year: '2026', gross: '20000', tier1Limit: '200', tier1Discount: '100', tier2Limit: '300', tier2Discount: '75' };
  assert.equal(H.fapDiscount({ ...base, income: '45000' }).owed, 0);
  assert.equal(H.fapDiscount({ ...base, income: '70000', agb: '42' }).owed, 5000);
  assert.equal(H.fapDiscount({ ...base, income: '70000', agb: '20' }).owed, 4000);
  assert.equal(H.fapDiscount({ ...base, income: '200000' }).bandLabel, 'No tier');
  assert.equal(H.fapDiscount({ ...base, income: '70000', tier1Limit: '', tier1Discount: '', tier2Limit: '', tier2Discount: '' }).valid, false);
});

test('gfe-deadline: federal business days, across Thanksgiving', () => {
  assert.equal(H.gfeDeadline({ scheduled: '2026-11-23', serviceDate: '2026-12-10' }).deadline, '2026-11-27');
  assert.equal(H.gfeDeadline({ scheduled: '2026-11-24', serviceDate: '2026-11-30' }).deadline, '2026-11-25');
  assert.equal(H.gfeDeadline({ scheduled: '2026-11-24', serviceDate: '2026-11-27' }).deadline, null);
  assert.equal(H.gfeDeadline({ requested: '2026-11-25' }).deadline, '2026-12-01');
  assert.equal(H.gfeDeadline({}).valid, false);
});

test('ppdr-eligibility: $399.99 over is not eligible, $400.00 is; amounts are not added across providers', () => {
  assert.deepEqual(H.ppdrEligibility({ est1: '1000', billed1: '1399.99' }).eligible, []);
  assert.deepEqual(H.ppdrEligibility({ est1: '1000', billed1: '1400' }).eligible, [1]);
  assert.deepEqual(H.ppdrEligibility({ est1: '1000', billed1: '1300', est2: '500', billed2: '800' }).eligible, []);
  assert.match(H.ppdrEligibility({ est1: '1000', billed1: '1400', firstBill: '2026-09-01' }).band, /December 30, 2026/);
});
