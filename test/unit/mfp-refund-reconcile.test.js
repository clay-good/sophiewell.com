// spec-v1510 tool 7: mfp-refund-reconcile. A refund one day after its expected latest date is flagged late; a
// duplicate refund is flagged; a short refund names the 835's remark code; a reversal cancels its payment.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse835 } from '../../lib/x12-835-v1515.js';
import { mfpRefundReconcile, remitsFrom, splitClp01, expectedBy } from '../../lib/mfp-refund-reconcile.js';
import { mtf835 } from '../lib/mtf-835.js';

const remits = (claims, payDate) => remitsFrom([parse835(mtf835(claims, payDate))]);
const run = (claims, rs, extra = {}) => mfpRefundReconcile({ claims, remits: rs, ...extra });

test('CLP01 splits into the prescription and fill numbers; the expected date is 21 days plus 5 business days', () => {
  assert.deepEqual(splitClp01('1234567FILL02'), { rx: '1234567', fill: '02' });
  assert.equal(expectedBy('2026-03-02'), '2026-03-30');
});

test('parse835 keeps the remark code an LQ segment carries', () => {
  const p = parse835(mtf835([{ rx: '1', fill: '0', sdra: 300, paid: 0, mtf: 'M1', dos: '20260302', rarc: 'N908' }]));
  assert.deepEqual(p.claims[0].serviceLines[0].remarks, ['N908']);
});

test('a refund paid one day after its expected date is late; one on the date is not', () => {
  const claim = '1234567, 0, 2026-03-02, 00169413212, 30';
  const onTime = run(claim, remits([{ rx: '1234567', fill: '0', sdra: 300, paid: 300, mtf: 'M1', dos: '20260302' }], '20260330'));
  assert.equal(onTime.rows[0].status, 'refunded');
  const late = run(claim, remits([{ rx: '1234567', fill: '0', sdra: 300, paid: 300, mtf: 'M1', dos: '20260302' }], '20260331'));
  assert.equal(late.rows[0].status, 'late');
  assert.equal(late.rows[0].reason, 'paid 2026-03-31, after the expected 2026-03-30');
});

test('a duplicate refund is flagged; a reversal cancels the payment it names', () => {
  const claim = '1234569, 0, 2026-03-04, 00169413212, 30';
  const dup = run(claim, remits([
    { rx: '1234569', fill: '0', sdra: 300, paid: 300, mtf: 'M3', dos: '20260304' },
    { rx: '1234569', fill: '0', sdra: 300, paid: 300, mtf: 'M4', dos: '20260304' },
  ]));
  assert.equal(dup.rows[0].status, 'duplicate');
  const reversed = run(claim, remits([
    { rx: '1234569', fill: '0', sdra: 300, paid: 300, mtf: 'M3', dos: '20260304' },
    { rx: '1234569', fill: '0', sdra: 300, paid: 300, mtf: 'M4', dos: '20260304' },
    { rx: '1234569', fill: '0', sdra: 300, paid: 300, mtf: 'M5', dos: '20260304', status: '22', original: 'M4' },
  ]));
  assert.equal(reversed.rows[0].status, 'refunded');
});

test('a short refund names the remark code; without one it counts toward what is open', () => {
  const r = run('1234568, 1, 2026-03-03, 00169413212, 30\n1234570, 0, 2026-03-03, 00169413212, 30', remits([
    { rx: '1234568', fill: '1', sdra: 300, paid: 0, mtf: 'M2', dos: '20260303', rarc: 'N908' },
    { rx: '1234570', fill: '0', sdra: 300, paid: 250, mtf: 'M6', dos: '20260303' },
  ]));
  assert.match(r.rows[0].reason, /^paid \$0\.00 of \$300\.00 \(N908: no refund: the manufacturer says the drug was bought at the MFP up front\)$/);
  assert.match(r.rows[1].reason, /with no reason code$/);
  assert.equal(r.owedOpen, 5000);
});

test('missing refunds are measured against the as-of date, which defaults to the latest 835 payment date', () => {
  const rs = remits([{ rx: '9', fill: '0', sdra: 300, paid: 300, mtf: 'M9', dos: '20260302' }], '20260330');
  const r = run('1234570, 0, 2026-02-01, 00169413212, 30\n1234571, 0, 2026-03-28, 00169413212, 30', rs);
  assert.deepEqual(r.rows.map((x) => x.status), ['missing', 'not yet due']);
  assert.equal(r.asOf, '2026-03-30');
  assert.match(r.notes.join(' '), /1 refund in the 835 files matched no claim entered\./);
  assert.equal(run('1234571, 0, 2026-03-28, 00169413212, 30', rs, { asOf: '2026-06-01' }).rows[0].status, 'missing');
});

test('with WAC and MFP per unit, the 835\'s standard default refund is checked too', () => {
  const r = run('1234567, 0, 2026-03-02, 00169413212, 30, 12.00, 3.00', remits([{ rx: '1234567', fill: '0', sdra: 250, paid: 250, mtf: 'M1', dos: '20260302' }]));
  assert.equal(r.rows[0].status, 'short');
  assert.match(r.rows[0].reason, /differs from \(WAC - MFP\) x quantity, \$270\.00/);
});

test('an 835 reversal (negative amounts, CLP02 22) reads and balances', () => {
  const p = parse835(mtf835([{ rx: '1', fill: '0', sdra: 300, paid: 300, mtf: 'M5', dos: '20260304', status: '22', original: 'M4' }]));
  assert.deepEqual([p.claims[0].statusCode, p.claims[0].billedCents, p.claims[0].paidCents, p.claims[0].balance.balanced], ['22', -30000, -30000, true]);
});

test('nothing is reconciled without both sides', () => {
  assert.match(mfpRefundReconcile({}).message, /^Enter the claims/);
  assert.match(mfpRefundReconcile({ claims: '1, 0, 2026-03-02' }).message, /835 remittance files/);
});
