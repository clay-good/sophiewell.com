// spec-v1638 backfill to opioid-mme: at 90 MME/day or more the result names the three Part D thresholds
// (care coordination edit at 90 or more, optional hard edit at 200 or more, drug management program above
// 90 on average with prescriber and pharmacy counts), which differ from each other and from CDC's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import adapters from '../../mcp/adapters/medication-v4.js';
import { PARTD_MME_THRESHOLDS } from '../../lib/partd-opioid-safety-edit-v1638.js';

const mme = adapters.find((a) => a.id === 'opioid-mme');

test('opioid-mme: the Part D thresholds appear at 90 MME/day and not below', () => {
  const at90 = mme.compute({ drug: 'Morphine', mgPerDose: 30, dosesPerDay: 3 });
  assert.equal(at90.totalMme, 90);
  assert.equal(at90.partDThresholds, PARTD_MME_THRESHOLDS);
  assert.equal(mme.compute({ drug: 'Morphine', mgPerDose: 29, dosesPerDay: 3 }).partDThresholds, undefined);
  assert.match(PARTD_MME_THRESHOLDS, /90 MME\/day or more.*200 MME\/day or more.*above 90 MME\/day over the last 6 months/);
});
