import test from 'node:test';
import assert from 'node:assert/strict';
import { read277 } from '../../lib/x12-277-v1515.js';

function envelope(body, { separator = '*', terminator = '~', version = '005010X214', seCount = null } = {}) {
  const isa = ['ISA', '00', '          ', '00', '          ', 'ZZ', 'SENDER         ', 'ZZ', 'RECEIVER       ', '260928', '1200', '^', '00501', '000000001', '0', 'P', ':'].join(separator);
  const set = [`ST${separator}277${separator}0001${separator}${version}`, ...body.map((segment) => segment.replaceAll('*', separator))];
  set.push(`SE${separator}${seCount ?? set.length + 1}${separator}0001`);
  return [isa, `GS${separator}HN${separator}SENDER${separator}RECEIVER${separator}20260928${separator}1200${separator}1${separator}X${separator}${version}`, ...set, `GE${separator}1${separator}1`, `IEA${separator}1${separator}000000001`].join(terminator) + terminator;
}

test('277CA lists rejected claims first and preserves raw status values', () => {
  const result = read277(envelope([
    'BHT*0085*08*BATCH*20260928*1200*TH',
    'HL*1**20*1', 'HL*2*1*21*1', 'HL*3*2*19*1', 'NM1*85*2*CLINIC',
    'HL*4*3*PT*0', 'NM1*QC*1*DOE*JANE****MI*MEMBER-1', 'TRN*2*TRACE-ACCEPT', 'STC*A2:20:PR*20260928*WQ*100', 'REF*D9*ACCEPT-1',
    'HL*5*3*PT*0', 'NM1*QC*1*ROE*JOHN****MI*MEMBER-2', 'TRN*2*TRACE-REJECT', 'STC*A8:496:85*20260928*U*200*****A7:178', 'REF*D9*REJECT-2',
  ]));
  assert.deepEqual(result.summary, { transactionCount: 1, claimCount: 2, accepted: 1, rejected: 1, pending: 0, statusCount: 2 });
  assert.equal(result.claims[0].reference, 'REJECT-2');
  assert.equal(result.claims[0].outcome, 'rejected');
  assert.equal(result.claims[0].patientName, 'JOHN ROE');
  assert.equal(result.claims[0].statuses[0].category, 'A8');
  assert.equal(result.claims[0].statuses[0].status, '496');
  assert.equal(result.claims[0].statuses[0].entity, '85');
  assert.equal(result.claims[0].statuses[0].additional[0].raw, 'A7:178');
  assert.equal(result.claims[1].outcome, 'accepted');
});

test('277 status response reads effective date, payer claim id and service code', () => {
  const result = read277(envelope([
    'BHT*0010*08*TRACK*20260928*1200', 'HL*1**20*1', 'HL*2*1*21*1', 'HL*3*2*19*1', 'NM1*85*2*CLINIC',
    'HL*4*3*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER-1', 'TRN*2*TRACE-1', 'REF*1K*PAYER-CLAIM-9',
    'SVC*HC:99213*125*100', 'STC*F1:65:PR*20260927**125',
  ], { version: '005010X212' }));
  assert.equal(result.claims[0].responseType, '277');
  assert.equal(result.claims[0].reference, 'PAYER-CLAIM-9');
  assert.deepEqual(result.claims[0].serviceCodes, ['99213']);
  assert.equal(result.claims[0].statuses[0].effectiveDate, '2026-09-27');
  assert.equal(result.claims[0].outcome, 'accepted');
});

test('277 accepts declared separators and rejects bad envelopes or versions', () => {
  const body = ['BHT*0085*08*BATCH*20260928*1200*TH', 'HL*1**20*1', 'HL*2*1*21*1', 'HL*3*2*19*1', 'HL*4*3*PT*0', 'TRN*2*TRACE', 'STC*A2:20:PR*20260928*WQ*100'];
  const newline = envelope(body, { separator: '|', terminator: '\n' });
  assert.equal(read277(newline).summary.claimCount, 1);
  assert.throws(() => read277(newline.replace(/IEA[^\n]+\n$/, '')), /IEA trailer/);
  assert.throws(() => read277(envelope(body, { version: '004010X093A1' })), /Unsupported 277 version/);
  assert.throws(() => read277(envelope(body, { seCount: 99 })), /SE01/);
});

