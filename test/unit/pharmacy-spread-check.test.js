// spec-v1604 tool 4: pharmacy-spread-check.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pharmacySpreadCheck as p } from '../../lib/pharmacy-spread-check.js';

const A = { ndc: '00002143380', description: 'TRULICITY 0.75 MG/0.5 ML PEN', perUnit: 487.57264, effectiveDate: '2026-09-23', pricingUnit: 'ML' };
const B = { ndc: '00093505698', description: 'ATORVASTATIN 40 MG TABLET', perUnit: 0.03411, effectiveDate: '2026-08-20', pricingUnit: 'EA' };
const nadac = { status: 'ok', asOfDate: '2026-09-30', labelers: { '00002': 'listed', '00093': 'listed', '11111': 'not-listed' }, rows: [A, B] };
const claims = [
  '00002-1433-80, 2, 2026-09-24, 1000, 25, 950',
  '00093-5056-98, 30, 2026-09-01, 9.99, 5',
  '00093-5056-98, 90, 2026-09-28, 20.01, 0',
  '00002-1433-80, 2, 2026-09-10, 1000, 25',
  '11111-2222-33, 1, 2026-09-25, 50, 0',
].join('\n');

test('without NADAC it names only the labelers it needs', () => {
  const r = p({ claims });
  assert.equal(r.valid, false);
  assert.deepEqual(r.needLabelers, ['00002', '00093', '11111']);
});

test('a fill on a date without NADAC says "no benchmark" and is left out, not priced at zero', () => {
  const r = p({ claims, nadac });
  const early = r.rows[3];
  assert.equal(early.status, 'no-benchmark');
  assert.match(early.reason, /took effect Sep 23, 2026, after the fill date/);
  assert.equal(r.rows[4].status, 'no-benchmark');
  assert.match(r.rows[4].reason, /not in the NADAC week of Sep 30, 2026/);
  assert.match(r.notes[0], /^2 claims had no NADAC for the fill date .* not priced at zero\. Each one is listed with its reason/);
  assert.equal(r.total.paid, 102500 + 1499 + 2001);
});

test('totals by drug and by month match the row sums to the cent', () => {
  const r = p({ claims, nadac });
  const priced = r.rows.filter((x) => x.status === 'priced');
  assert.equal(priced.length, 3);
  for (const key of ['paid', 'nadacCost', 'gap']) {
    const rowSum = priced.reduce((s, x) => s + x[key], 0);
    assert.equal(r.byDrug.reduce((s, d) => s + d[key], 0), rowSum);
    assert.equal(r.byMonth.reduce((s, m) => s + m[key], 0), rowSum);
    assert.equal(r.total[key], rowSum);
  }
  const statin = r.byDrug.find((d) => d.ndc === '00093-5056-98');
  assert.deepEqual([statin.claims, statin.nadacCost, statin.paid], [2, 102 + 307, 1499 + 2001]);
  assert.equal(r.byDrug[0].ndc, '00002-1433-80', 'largest gap first');
  assert.match(r.band, /^3 of 5 claims priced against NADAC: \$1,060\.00 paid .* NADAC totals \$979\.24, \$80\.76 above it \(8\.2%\)\.$/);
});

test('the spread is shown only where the pharmacy payment is disclosed', () => {
  const r = p({ claims, nadac });
  assert.equal(r.spread, 7500);
  assert.ok(r.notes.some((n) => /disclosed \(1 claim\), the plan and members paid \$75\.00 more than the pharmacies received/.test(n)));
  const none = p({ claims: '00002-1433-80, 2, 2026-09-24, 1000, 25', nadac });
  assert.equal(none.spread, null);
  assert.ok(none.notes.some((n) => /No pharmacy payment was disclosed/.test(n)));
});

test('unreadable claims are counted with the first reason; blanks are never zero', () => {
  const r = p({ claims: '0002143380, 1, 2026-09-24, 1, 1\n00002-1433-80, , 2026-09-24, 1, 1\n00002-1433-80, 1, 2026-09-24, 1000, 25', nadac });
  assert.equal(r.rows.filter((x) => x.status === 'invalid').length, 2);
  assert.ok(r.notes.some((n) => /^2 claims could not be read \(first: line 1, A 10-digit NDC/.test(n)));
  assert.match(r.rows[1].reason, /Enter the quantity/);
  assert.match(p({ claims: '' }).message, /^Enter the claims/);
});

test('lapsed or unloaded NADAC prices nothing', () => {
  for (const status of ['expired', 'unavailable']) {
    const r = p({ claims, nadac: { ...nadac, status } });
    assert.equal(r.rows.filter((x) => x.status === 'priced').length, 0);
    assert.match(r.band, /^None of the 5 claims could be priced/);
  }
  const partial = p({ claims, nadac: { ...nadac, labelers: { ...nadac.labelers, '00093': 'unavailable' } } });
  assert.match(partial.rows[1].reason, /could not be loaded/);
});

test('mapped file rows compute the same as typed lines', () => {
  const claimRows = [{ ndc: '00002-1433-80', quantity: '2', fill_date: '2026-09-24', plan_paid: '1000', member_paid: '25', pharmacy_paid: '950' }];
  assert.equal(p({ claimRows, nadac }).band, p({ claims: '00002-1433-80, 2, 2026-09-24, 1000, 25, 950', nadac }).band);
});
