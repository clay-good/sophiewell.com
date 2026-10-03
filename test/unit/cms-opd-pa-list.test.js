// spec-v1502 §6: the CMS hospital outpatient prior authorization list, re-verified on September 30, 2026
// against the CMS "Final List of Outpatient Department Services That Require Prior Authorization".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { opdPaOn, CMS_OPD_PA_CODES, opdPaCategoryFor } from '../../lib/pa/cms-opd-pa-list.js';

test('the list holds the 51 codes the CMS final list names, and none it does not', () => {
  assert.equal(CMS_OPD_PA_CODES.size, 51, '11 + 6 + 3 + 12 + 8 + 2 + 1 + 8, as the PDF lists them');
  for (const gone of ['67911', '63685', '63688', '64492', '64495', '64616', '64617', '64642', '64647', '21235']) assert.equal(CMS_OPD_PA_CODES.has(gone), false, gone);
  for (const on of ['J0585', 'J0588', '20912', '21210', '30465', '30520', '63650', '64636']) assert.equal(CMS_OPD_PA_CODES.has(on), true, on);
  assert.equal(opdPaCategoryFor('J0586'), 'botulinum toxin injection');
});

test('a service date answers for its day: joined, removed, temporarily removed', () => {
  assert.equal(opdPaOn('64490', '2023-06-30').listed, false);
  assert.equal(opdPaOn('64490', '2023-07-01').listed, true);
  assert.equal(opdPaOn('67911', '2021-06-01').listed, true);
  assert.equal(opdPaOn('67911', '2022-01-07').listed, false);
  assert.equal(opdPaOn('64492', '2024-08-15').listed, true);
  assert.equal(opdPaOn('64492', '2024-08-16').listed, false);
  assert.equal(opdPaOn('63685', '2026-01-01').listed, false);
  assert.match(opdPaOn('63685', '2026-01-01').removed, /temporarily removed/);
  assert.deepEqual(opdPaOn('99213', '2026-01-01'), { listed: false });
});
