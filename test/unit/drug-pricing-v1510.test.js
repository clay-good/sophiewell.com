// spec-v1510 tools 3, 4 and 5: negotiated-price refund, Medicaid URA, PBM reimbursement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mfpRefundCheck as m } from '../../lib/mfp-refund-v1510.js';
import { medicaidUra as u, computeUra } from '../../lib/medicaid-ura-v1510.js';
import { pbmReimbursementCheck as p } from '../../lib/pbm-reimbursement-v1510.js';

const now = new Date(Date.UTC(2026, 8, 26));

test('mfp-refund-check: the standard default refund is (WAC - MFP) x quantity', () => {
  const r = m({ drug: 'eliquis', serviceDate: '2026-09-01', quantity: '60', wac: '10.10', mfpUnit: '4.145072' }, now);
  assert.equal(r.refund, 357.3);
  assert.equal(r.expected, '2026-09-29');
});

test('mfp-refund-check: late after the expected date unless received; no refund without a negotiated price', () => {
  const base = { drug: 'eliquis', serviceDate: '2026-08-01', quantity: '60', wac: '10', mfpUnit: '4' };
  assert.equal(m(base, now).bandLabel, 'Refund late');
  assert.notEqual(m({ ...base, received: 'yes' }, now).bandLabel, 'Refund late');
  assert.equal(m({ drug: 'ozempic', serviceDate: '2026-09-01' }, now).refund, 0);
});

test('medicaid-ura: basic plus inflation; generics 13%; the pre-2024 cap', () => {
  assert.equal(u({ category: 'brand', amp: '10', bestPrice: '6', baselineAmp: '4', baselineCpi: '200', currentCpi: '300' }).ura, 8);
  assert.equal(u({ category: 'generic', amp: '2' }).ura, 0.26);
  assert.equal(u({ category: 'brand-171', amp: '10' }).ura, 1.71);
  assert.equal(computeUra({ category: 'brand', amp: '10', bestPrice: '0.5', baselineAmp: '4', baselineCpi: '200', currentCpi: '300', year: '2023' }).ura, 10);
  assert.equal(u({ category: 'brand', amp: '10', baselineAmp: '4' }).valid, false);
});

test('pbm-reimbursement-check: AWP - 18% + $1.50, underpaid and underwater', () => {
  const r = p({ benchmark: 'awp', benchmarkPrice: '5', percent: '-18', fee: '1.50', quantity: '30', paid: '120', cost: '4.2' });
  assert.equal(r.expected, 124.5);
  assert.equal(r.difference, -4.5);
  assert.match(r.band, /underwater by \$6\.00/);
  assert.equal(p({ benchmark: 'wac', benchmarkPrice: '10', percent: '2', quantity: '10', paid: '102' }).difference, 0);
});

test('blank inputs ask', () => {
  assert.equal(p({}).valid, false);
  assert.equal(u({}).valid, false);
  assert.equal(m({ drug: 'eliquis' }, now).valid, false);
});
