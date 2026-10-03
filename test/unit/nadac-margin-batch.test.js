// spec-v1510 tool 2, batch: margin by drug, by payer and in total.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nadacMarginBatch as b } from '../../lib/nadac-margin.js';

const A = { ndc: '00002143380', description: 'TRULICITY 0.75 MG/0.5 ML PEN', perUnit: 487.57264, effectiveDate: '2026-09-23', pricingUnit: 'ML' };
const nadac = { status: 'ok', asOfDate: '2026-09-30', labelers: { '00002': 'listed', '11111': 'not-listed' }, rows: [A] };
const claims = [
  { ndc: '00002-1433-80', quantity: '2', fill_date: '2026-09-24', reimbursed: '975.14', payer: 'Plan X' },
  { ndc: '00002-1433-80', quantity: '2', fill_date: '2026-09-25', reimbursed: '1000', payer: 'Plan Y' },
  { ndc: '11111-2222-33', quantity: '30', fill_date: '2026-09-25', reimbursed: '130', payer: 'Plan X', cost: '4.20' },
  { ndc: '11111-2222-33', quantity: '1', fill_date: '2026-09-25', reimbursed: '5', payer: 'Plan Y' },
];

test('without NADAC it names only the labelers whose rows need it (invoice rows do not)', () => {
  assert.deepEqual(b({ claimRows: claims }).needLabelers, ['00002', '11111']);
  assert.equal(b({ claimRows: [claims[2]] }).valid, true, 'an all-invoice file needs no NADAC');
});

test('margin by payer and by drug sums to the total, losers first', () => {
  const r = b({ claimRows: claims, nadac });
  assert.equal(r.rows[3].status, 'no-benchmark');
  assert.equal(r.total.margin, -1 + 2485 + 400);
  for (const k of ['paid', 'cost', 'margin']) {
    assert.equal(r.byPayer.reduce((s, p) => s + p[k], 0), r.total[k]);
    assert.equal(r.byDrug.reduce((s, d) => s + d[k], 0), r.total[k]);
  }
  assert.deepEqual(r.byPayer.map((p) => p.payer), ['Plan X', 'Plan Y'], 'lowest margin first');
  assert.equal(r.byPayer[0].below, 1);
  assert.match(r.band, /^3 of 4 claims priced: reimbursed \$2,105\.14 against a cost of \$2,076\.30, a margin of \$28\.84\.$/);
  assert.ok(r.notes.some((n) => /left out of the totals, not priced at zero/.test(n)));
});

test('a payer paid below cost overall is named', () => {
  const r = b({ claimRows: [claims[0]], nadac });
  assert.ok(r.notes.some((n) => /Paid below cost overall: Plan X \(-\$0\.01 on 1 claim\)/.test(n)));
  assert.equal(r.abnormal, true);
});

test('blanks are asked for, never read as zero', () => {
  assert.match(b({}).message, /^Load a CSV/);
  const r = b({ claimRows: [{ ndc: '00002-1433-80', quantity: '', fill_date: '2026-09-24', reimbursed: '1' }], nadac });
  assert.equal(r.rows[0].status, 'invalid');
  assert.match(r.band, /^None of the 1 claim could be priced/);
});
