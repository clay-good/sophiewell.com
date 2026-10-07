// The X12 999 implementation acknowledgment reader (spec-v1501 §3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { read999 } from '../../lib/x12-999-v1515.js';

const ISA = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
function ack(body) {
  const set = ['ST*999*0001*005010X231A1', ...body];
  set.push(`SE*${set.length + 1}*0001`);
  return [ISA, 'GS*FA*S*R*20260928*1200*1*X*005010X231A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('999: each AK2 set is classified from IK5, with its IK3 segment and IK4 element errors; rejected sets are counted', () => {
  const r = read999(ack(['AK1*HC*17*005010X222A1', 'AK2*837*0001*005010X222A1', 'IK5*A', 'AK2*837*0002*005010X222A1', 'IK3*NM1*12*2010BA*8', 'IK4*9*67*7*123', 'IK5*R*5', 'AK2*837*0003*005010X222A1', 'IK3*DTP*20**8', 'IK5*E', 'AK9*P*3*3*2']));
  assert.deepEqual(r.acks.map((a) => [a.control, a.code, a.outcome]), [['0001', 'A', 'accepted'], ['0002', 'R', 'rejected'], ['0003', 'E', 'accepted with errors']]);
  assert.deepEqual(r.acks[1].errors[0], { segment: 'NM1', position: '12', loop: '2010BA', code: '8', elements: [{ element: '9', component: '', reference: '67', code: '7', badValue: '123', segmentPosition: 9 }], segmentPosition: 8 });
  assert.equal(r.transactions[0].groupOutcome, 'partially accepted');
  assert.deepEqual(r.summary.findings, []);
  assert.equal(r.summary.rejected, 1);
});

test('999: AK9 counts that disagree with the AK2 loops are reported, as is a set with no IK5', () => {
  const r = read999(ack(['AK1*HC*17*005010X222A1', 'AK2*837*0001*005010X222A1', 'IK5*A', 'AK2*837*0002*005010X222A1', 'AK9*A*3*3*3']));
  assert.deepEqual(r.summary.findings, [
    '1 transaction set (AK2) has no IK5 acknowledgment code.',
    'AK9 says 3 transaction sets were received, but the 999 acknowledges 2.',
    'AK9 says 3 transaction sets were accepted, but 1 of the AK2 loops carries an accepting IK5 code.',
  ]);
});

test('999: a group-only acknowledgment (no AK2) still reports the group code; broken envelopes and other files are refused', () => {
  const r = read999(ack(['AK1*HC*17*005010X222A1', 'AK9*R*1*1*0*5']));
  assert.equal(r.transactions[0].groupOutcome, 'rejected');
  assert.deepEqual(r.transactions[0].groupErrorCodes, ['5']);
  assert.equal(r.summary.sets, 0);
  assert.throws(() => read999(ack(['AK9*A*1*1*1'])), /no AK1/);
  assert.throws(() => read999(ack(['AK1*HC*17*005010X222A1'])), /no AK9/);
  assert.throws(() => read999(ack(['AK1*HC*17*005010X222A1', 'AK9*A*1*1*1']).replace('IEA*1*', 'IEA*2*')), /IEA01 does not match/);
  assert.throws(() => read999('hello'), /ISA interchange header/);
});
