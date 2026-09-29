import test from 'node:test';
import assert from 'node:assert/strict';
import { parse835 } from '../../lib/x12-835-v1515.js';
import { appealCandidates, denialPatternReport, underpaymentCheck } from '../../lib/remittance-analysis-v1516.js';

function era({ date, payer, claim, service }) {
  const body = [`BPR*I*${claim.paid}*C*CHK************${date}`, `N1*PR*${payer}`, `CLP*${claim.id}*1*${claim.billed}*${claim.paid}*${claim.pr || 0}**P-${claim.id}`, `NM1*82*1*CLINICIAN*SAM****XX*${claim.npi || '1234567890'}`, `SVC*HC:${service.code}${service.modifier ? `:${service.modifier}` : ''}*${service.billed}*${service.paid}`, `CAS*${service.group}*${service.reason}*${service.adjustment}`];
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = ['ST*835*0001', ...body]; set.push(`SE*${set.length + 1}*0001`);
  return parse835([isa, 'GS*HP*SENDER*RECEIVER*20260928*1200*1*X*005010X221A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~');
}

test('denial pattern groups net adjustment dollars and reports month-over-month change', () => {
  const august = era({ date: '20260831', payer: 'Alpha Plan', claim: { id: 'A', billed: 200, paid: 150 }, service: { code: '99213', billed: 200, paid: 150, group: 'CO', reason: '45', adjustment: 50 } });
  const september = era({ date: '20260930', payer: 'Beta Plan', claim: { id: 'B', billed: 220, paid: 120 }, service: { code: '99214', billed: 220, paid: 120, group: 'CO', reason: '50', adjustment: 100 } });
  const result = denialPatternReport([{ name: 'aug.835', result: august }, { name: 'sep.835', result: september }]);
  assert.equal(result.totalCents, 15000);
  assert.deepEqual(result.byCategory.map((row) => [row.label, row.amountCents]), [['Medical necessity or coverage', 10000], ['Contractual adjustment', 5000]]);
  assert.equal(result.byReason[0].label, 'CO-50');
  assert.equal(result.byBillingCode[0].label, '99214');
  assert.equal(result.byProvider[0].label, '1234567890');
  assert.deepEqual(result.monthChange, { previousMonth: '2026-08', currentMonth: '2026-09', previousCents: 5000, currentCents: 10000, changeCents: 5000, changePercent: 100 });
  assert.equal(result.topCategoryShare, 66.7);
});

test('denial pattern keeps unmapped codes visible and signed reversals reduce their bucket', () => {
  const result = denialPatternReport([{ name: 'x.835', result: era({ date: '20260930', payer: 'Plan', claim: { id: 'A', billed: 90, paid: 100, pr: -10 }, service: { code: '1', billed: 90, paid: 100, group: 'PR', reason: '999', adjustment: -10 } }) }]);
  assert.equal(result.totalCents, -1000);
  assert.equal(result.byCategory[0].label, 'Unmapped reason code');
  assert.equal(result.byCategory[0].amountCents, -1000);
});

test('appeal candidates include positive appeal adjustments and preserve payer names', () => {
  const appeal = era({ date: '20260930', payer: 'Appeal Plan', claim: { id: 'APPEAL', billed: 200, paid: 100 }, service: { code: '99214', billed: 200, paid: 100, group: 'CO', reason: '50', adjustment: 100 } });
  const writeoff = era({ date: '20260930', payer: 'Writeoff Plan', claim: { id: 'WRITE-OFF', billed: 200, paid: 100 }, service: { code: '99213', billed: 200, paid: 100, group: 'CO', reason: '45', adjustment: 100 } });
  const result = appealCandidates([{ name: 'appeal.835', result: appeal }, { name: 'writeoff.835', result: writeoff }]);
  assert.deepEqual(result.payers, ['Appeal Plan']);
  assert.deepEqual(result.candidates, [{ sourceFile: 'appeal.835', reference: 'APPEAL', payer: 'Appeal Plan', denialDate: '2026-09-30', amountCents: 10000 }]);
});

test('underpayment check ignores an exact contract payment and flags one cent under', () => {
  const exact = era({ date: '20260930', payer: 'Plan', claim: { id: 'A', billed: 200, paid: 150 }, service: { code: '99213', modifier: '25', billed: 200, paid: 150, group: 'CO', reason: '45', adjustment: 50 } });
  const low = era({ date: '20260930', payer: 'Plan', claim: { id: 'B', billed: 200, paid: 149.99 }, service: { code: '99213', modifier: '25', billed: 200, paid: 149.99, group: 'CO', reason: '45', adjustment: 50.01 } });
  const fees = [{ billing_code: '99213', modifier: '25', contracted_amount: '150.00' }];
  const result = underpaymentCheck([{ name: 'a.835', result: exact }, { name: 'b.835', result: low }], fees);
  assert.equal(result.matchedLines, 2);
  assert.equal(result.underpaidLines, 1);
  assert.equal(result.varianceCents, 1);
  assert.equal(result.underpaid[0].patientAccount, 'B');
});

test('underpayment check computes a reader-supplied percent of reference and tracks unmatched lines', () => {
  const parsed = era({ date: '20260930', payer: 'Plan', claim: { id: 'A', billed: 200, paid: 120 }, service: { code: '99214', billed: 200, paid: 120, group: 'CO', reason: '45', adjustment: 80 } });
  const percentResult = underpaymentCheck([{ name: 'x.835', result: parsed }], [{ billing_code: '99214', reference_amount: '100', contract_percent: '120' }]);
  assert.equal(percentResult.underpaidLines, 0);
  assert.equal(percentResult.lines[0].expectedCents, 12000);
  const unmatched = underpaymentCheck([{ name: 'x.835', result: parsed }], [{ billing_code: '99999', contracted_amount: '1' }]);
  assert.equal(unmatched.unmatchedLines, 1);
});
