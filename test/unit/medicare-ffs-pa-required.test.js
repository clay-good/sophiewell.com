// spec-v1502 §6 and the spec-v1603 WISeR backfill: medicare-ffs-pa-required, and the re-verified OPD list.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medicareFfsPaRequired as m } from '../../lib/medicare-ffs-pa-required.js';
import { opdPaOn, CMS_OPD_PA_CODES, opdPaCategoryFor } from '../../lib/pa/cms-opd-pa-list.js';

test('WISeR: a Texas date in 2026 for a listed code is required; the same code in Kansas is not', () => {
  const tx = m({ code: '64483', setting: 'office', state: 'TX', serviceDate: '2026-05-04' });
  assert.equal(tx.bandLabel, 'Prior authorization or prepayment review');
  assert.match(tx.band, /^WISeR prior authorization required, or prepayment review: 64483 \(epidural steroid injections/);
  const ks = m({ code: '64483', setting: 'office', state: 'KS', serviceDate: '2026-05-04' });
  assert.equal(ks.bandLabel, 'Not required');
  assert.match(ks.band, /WISeR does not include KS/);
});

test('WISeR: a postponed service says postponed; dated codes and conditions are kept', () => {
  const dbs = m({ code: '61867', setting: 'opd', state: 'TX', serviceDate: '2026-05-04' });
  assert.equal(dbs.programs[0].status, 'postponed');
  assert.match(dbs.band, /Postponed: WISeR delayed deep brain stimulation/);
  assert.equal(m({ code: 'C8007', setting: 'opd', state: 'OH', serviceDate: '2026-04-05' }).bandLabel, 'Not required');
  assert.equal(m({ code: 'C8007', setting: 'opd', state: 'OH', serviceDate: '2026-04-06' }).bandLabel, 'Prior authorization or prepayment review');
  assert.match(m({ code: '64561', setting: 'opd', state: 'WA', serviceDate: '2026-06-01' }).band, /only when billed with 64590/);
  assert.equal(m({ code: '29877', setting: 'opd', state: 'NJ', serviceDate: '2025-12-31' }).bandLabel, 'Not required');
  assert.equal(m({ code: '29877', setting: 'inpatient', state: 'NJ', serviceDate: '2026-06-01' }).bandLabel, 'Not required');
});

test('OPD: required in the hospital outpatient department, by the date it joined or left the list', () => {
  const r = m({ code: '64490', setting: 'opd', state: 'KS', serviceDate: '2026-03-02' });
  assert.equal(r.bandLabel, 'Prior authorization required');
  assert.match(r.band, /facet joint interventions, from Jul 1, 2023\).*Unique Tracking Number/);
  assert.equal(m({ code: '64490', setting: 'opd', serviceDate: '2023-06-30' }).bandLabel, 'Not required');
  assert.equal(m({ code: '64490', setting: 'office', serviceDate: '2026-03-02', state: 'KS' }).bandLabel, 'Not required');
  assert.equal(m({ code: '64492', setting: 'opd', serviceDate: '2024-08-15' }).bandLabel, 'Prior authorization required');
  assert.match(m({ code: '64492', setting: 'opd', serviceDate: '2024-08-16' }).band, /no longer on the hospital outpatient list: removed August 16, 2024/);
  assert.equal(m({ code: 'J0585', setting: 'opd', serviceDate: '2026-03-02' }).bandLabel, 'Prior authorization required');
});

test('the re-verified OPD list matches the CMS final list', () => {
  assert.equal(CMS_OPD_PA_CODES.size, 51, "11 + 6 + 3 + 12 + 8 + 2 + 1 + 8, as the PDF lists them");
  for (const gone of ['67911', '63685', '63688', '64492', '64495', '64616', '64642']) assert.equal(CMS_OPD_PA_CODES.has(gone), false, gone);
  for (const on of ['J0588', '20912', '21210', '30465', '30520', '63650']) assert.equal(CMS_OPD_PA_CODES.has(on), true, on);
  assert.equal(opdPaCategoryFor('J0586'), 'botulinum toxin injection');
  assert.equal(opdPaOn('67911', '2021-06-01').listed, true);
  assert.equal(opdPaOn('67911', '2022-01-07').listed, false);
  assert.equal(opdPaOn('63685', '2026-01-01').listed, false);
});

test('DMEPOS: phased start dates by state; a blank state is disclosed', () => {
  assert.equal(m({ code: 'L3761', setting: 'dmepos', state: 'NY', serviceDate: '2026-11-02' }).bandLabel, 'Prior authorization required');
  assert.match(m({ code: 'L3761', setting: 'dmepos', state: 'TX', serviceDate: '2026-11-02' }).band, /not until Jan 26, 2027 in TX/);
  assert.match(m({ code: 'L3761', setting: 'dmepos', state: 'KS', serviceDate: '2027-03-01' }).band, /not until Apr 26, 2027 in KS/);
  assert.equal(m({ code: 'K0856', setting: 'dmepos', state: 'KS', serviceDate: '2026-01-05' }).bandLabel, 'Prior authorization required');
  const blank = m({ code: 'L0648', setting: 'dmepos', serviceDate: '2022-05-01' });
  assert.ok(blank.notes.some((n) => /No state was entered/.test(n)));
});

test('ambulance and surgical center programs are prior authorization or prepayment review, by state', () => {
  assert.match(m({ code: 'A0428', setting: 'ambulance', state: 'KS', serviceDate: '2022-04-01' }).band, /in KS from Apr 1, 2022.*first three round trips are exempt/);
  assert.equal(m({ code: 'A0428', setting: 'ambulance', state: 'KS', serviceDate: '2022-03-31' }).bandLabel, 'Not required');
  assert.equal(m({ code: 'A0425', setting: 'ambulance', state: 'KS', serviceDate: '2026-01-05' }).bandLabel, 'Not required');
  assert.equal(m({ code: '30520', setting: 'asc', state: 'TX', serviceDate: '2026-02-16' }).bandLabel, 'Prior authorization or prepayment review');
  assert.equal(m({ code: '30520', setting: 'asc', state: 'TX', serviceDate: '2026-02-15' }).bandLabel, 'Not required');
  assert.match(m({ code: '30520', setting: 'asc', state: 'KS', serviceDate: '2026-03-01' }).band, /does not include KS/);
  assert.match(m({ code: '36474', setting: 'asc', state: 'NY', serviceDate: '2026-03-01' }).band, /taken off .* January 1, 2026/);
});

test('blanks are asked for; an unlisted code is said plainly; Medicare Advantage is out of scope', () => {
  assert.match(m({}).message, /^Enter the HCPCS or CPT code/);
  assert.match(m({ code: '99213' }).message, /^Choose the setting/);
  assert.match(m({ code: '99213', setting: 'office' }).message, /^Enter the date of service/);
  const r = m({ code: '99213', setting: 'office', state: 'TX', serviceDate: '2026-03-02' });
  assert.match(r.band, /^Not on a CMS prior authorization list/);
  assert.ok(r.notes.some((n) => /Medicare Advantage plan keeps its own list/.test(n)));
});
