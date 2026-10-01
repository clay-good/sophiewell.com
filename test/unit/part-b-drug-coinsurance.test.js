// spec-v1506 tool 4: part-b-drug-coinsurance.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partBDrugCoinsurance as p } from '../../lib/part-b-drug-coinsurance.js';

const period = { effectiveFrom: '2026-10-01', effectiveTo: '2026-12-31' };
const at = (row) => ({ status: 'found', period, row });

test('the file\'s coinsurance percentage, and whether an inflation reduction lowered it', () => {
  const r = p({ code: 'J0897', units: '120', serviceDate: '2026-10-15', lookup: at({ code: 'J0897', dosage: '1 MG', limit: 29.856, coinsurance: 17.885, notes: 'Inflation-adjusted coinsurance' }) });
  assert.equal(r.allowedCents, 358272);
  assert.equal(r.patientCents, 64077);
  assert.equal(r.inflationReduced, true);
  assert.match(r.band, /^Medicare allows \$3,582\.72 for J0897\. You pay \$640\.77 coinsurance, 17\.885% of the allowed amount: an inflation reduction lowered it from 20%/);
  const plain = p({ code: 'J9035', units: '10', serviceDate: '2026-10-15', lookup: at({ code: 'J9035', dosage: '10 MG', limit: 75.492, coinsurance: 20, notes: null }) });
  assert.equal(plain.inflationReduced, false);
  assert.ok(plain.notes.some((n) => /after the Part B deductible/.test(n)));
});

test('insulin through a pump is capped at $35 a month, with no deductible, from July 1, 2023', () => {
  const pump = at({ code: 'J1817', dosage: '50 UNITS', limit: 3.116, coinsurance: 20, notes: null });
  const big = p({ code: 'J1817', units: '100', months: '1', serviceDate: '2026-10-15', lookup: pump });
  assert.equal(big.patientCents, 3500);
  assert.equal(big.capped, true);
  assert.match(big.band, /the \$35-a-month cap for insulin through a pump \(1 month\), instead of 20% \(\$62\.32\)/);
  assert.ok(big.notes.some((n) => /no Part B deductible/.test(n)));
  assert.equal(p({ code: 'J1817', units: '100', months: '3', serviceDate: '2026-10-15', lookup: pump }).capped, false, '$62.32 is under 3 months of caps');
  assert.match(p({ code: 'J1817', units: '100', serviceDate: '2026-10-15', lookup: pump }).message, /^Enter the months of insulin this supply covers.*\$35 for each month/);
  assert.equal(p({ code: 'J1817', units: '100', limit: '3.116', coinsurance: '20', serviceDate: '2023-06-30' }).capped, false, 'before the cap took effect');
});

test('refusals are asp-payment\'s', () => {
  assert.match(p({}).message, /^Enter the HCPCS code/);
  assert.match(p({ code: 'J9035', units: '1', serviceDate: '2026-09-30', lookup: at({ code: 'J9035', limit: 1, coinsurance: 20 }) }).message, /not for Sep 30, 2026/);
});
