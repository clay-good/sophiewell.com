import test from 'node:test';
import assert from 'node:assert/strict';
import { parse835 } from '../../lib/x12-835-v1515.js';

function envelope(body, { terminator = '~', seCount = null } = {}) {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = ['ST*835*0001', ...body];
  set.push(`SE*${seCount ?? set.length + 1}*0001`);
  return [isa, 'GS*HP*SENDER*RECEIVER*20260928*1200*1*X*005010X221A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join(terminator) + terminator;
}

test('835 parses a balanced claim, line and payment with declared separators', () => {
  const result = parse835(envelope([
    'BPR*I*120*C*CHK************20260928', 'TRN*1*TRACE-1*12345', 'LX*1',
    'CLP*ACCT-1*1*200*120*30**PCN-1', 'NM1*QC*1*DOE*JANE****MI*MEMBER-1',
    'SVC*HC:99213*200*120', 'DTM*472*20260901', 'CAS*CO*45*50', 'CAS*PR*1*30',
  ]));
  assert.equal(result.summary.claimCount, 1);
  assert.equal(result.summary.serviceLineCount, 1);
  assert.equal(result.summary.balancedClaims, 1);
  assert.equal(result.summary.balancedServiceLines, 1);
  assert.equal(result.summary.balancedPayments, 1);
  assert.equal(result.claims[0].patientName, 'JANE DOE');
  assert.equal(result.claims[0].memberId, 'MEMBER-1');
  assert.equal(result.claims[0].balance.patientResponsibilityCents, 3000);
});

test('835 includes signed reversals and PLB adjustments in balance proofs', () => {
  const result = parse835(envelope([
    'BPR*I*105*C*CHK************20260928', 'TRN*1*TRACE-2*12345',
    'CLP*A*1*100*110*-10**PCA', 'CAS*PR*1*-10',
    'CLP*B*1*20*10*0**PCB', 'CAS*CO*45*10', 'PLB*12345*20260930*WO:REF*15',
  ]));
  assert.equal(result.claims[0].balance.balanced, true);
  assert.equal(result.claims[0].balance.patientResponsibilityCents, -1000);
  assert.equal(result.transactions[0].claimPaidCents, 12000);
  assert.equal(result.transactions[0].providerAdjustmentCents, 1500);
  assert.equal(result.transactions[0].paymentResidualCents, 0);
});

test('835 reports exact residuals at line, claim and payment levels', () => {
  const result = parse835(envelope([
    'BPR*I*119*C*CHK************20260928', 'TRN*1*TRACE-3*12345',
    'CLP*A*1*200*120*20**PCA', 'SVC*HC:99213*200*120', 'CAS*CO*45*50', 'CAS*PR*1*20',
  ]));
  assert.equal(result.claims[0].serviceLines[0].balance.residualCents, 1000);
  assert.equal(result.claims[0].balance.residualCents, 1000);
  assert.equal(result.transactions[0].paymentResidualCents, 100);
});

test('835 flags a CLP05 patient responsibility that disagrees with PR adjustments', () => {
  const result = parse835(envelope([
    'BPR*I*70*C*CHK************20260928', 'CLP*A*1*100*70*20**PCA', 'CAS*PR*1*30',
  ]));
  assert.equal(result.claims[0].balance.residualCents, 0);
  assert.equal(result.claims[0].patientResponsibilityMatches, false);
  assert.equal(result.claims[0].balance.balanced, false);
});

test('835 accepts newline terminators and rejects mismatched or truncated trailers', () => {
  const newline = envelope(['BPR*I*0*C*NON************20260928', 'CLP*A*1*0*0*0**PCA'], { terminator: '\n' });
  assert.equal(parse835(newline).summary.claimCount, 1);
  assert.throws(() => parse835(newline.replace('SE*4*0001', 'SE*5*0001')), /SE01/);
  assert.throws(() => parse835(newline.replace(/IEA[^\n]+\n$/, '')), /IEA trailer/);
  assert.throws(() => parse835(newline.replace('IEA*1*000000001', 'IEA*1*000000002')), /control numbers/);
});
