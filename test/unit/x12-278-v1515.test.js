// The X12 278 prior authorization response reader (spec-v1501 §3), on the esMD guide's layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { read278 } from '../../lib/x12-278-v1515.js';

const ISA = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
function response(body, bht = '11') {
  const set = ['ST*278*0001*005010X217', `BHT*0007*${bht}*000121797*20260930*1358*18`, 'HL*1**20*1', 'NM1*X3*2*NORIDIAN*****PI*12302', 'HL*2*1*21*1', 'NM1*1P*1*GUERRIERO*LIAM****XX*1111111112', 'HL*3*2*22*1', 'NM1*IL*1*SMITH*BELINDA****MI*384256185A', ...body];
  set.push(`SE*${set.length + 1}*0001`);
  return [ISA, 'GS*HI*S*R*20260930*1358*1*X*005010X217', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('278: each event and service HCR is grouped, with its review number, reason, dates, code and message; denials sort first', () => {
  const r = read278(response(['HL*4*3*EV*1', 'TRN*2*TRACE-1*1311235567', 'UM*HS*I*1*11:B', 'HCR*A1*UTN12345', 'DTP*AAH*RD8*20261001-20261229', 'HL*5*4*SS*0', 'SV1*HC:64483', 'HCR*A3**0B', 'MSG*Not medically necessary']));
  assert.deepEqual(r.decisions.map((d) => [d.level, d.decision, d.actionCode, d.reviewNumber, d.reasonCode, d.code]), [['service', 'denied', 'A3', '', '0B', '64483'], ['patient event', 'approved', 'A1', 'UTN12345', '', '']]);
  assert.equal(r.decisions[1].certified, '2026-10-01 to 2026-12-29');
  assert.equal(r.decisions[1].patientName, 'BELINDA SMITH');
  assert.equal(r.decisions[0].message, 'Not medically necessary');
  assert.deepEqual([r.summary.approved, r.summary.denied, r.summary.decisions], [1, 1, 2]);
});

test('278: the esMD pending response (HCR*A4**0U) reads as pended; an AAA rejection marks its level rejected', () => {
  const pended = read278(response(['HL*4*3*EV*1', 'TRN*2*201507221235*1311235567', 'UM*HS*I*1*11:B**U', 'HCR*A4**0U', 'MSG*Request accepted; awaiting supporting documentation']));
  assert.equal(pended.decisions[0].decision, 'pended');
  assert.equal(pended.decisions[0].reasonCode, '0U');
  const rejected = read278(response(['HL*4*3*EV*1', 'AAA*N**15*C']));
  assert.equal(rejected.decisions[0].decision, 'rejected');
  assert.deepEqual(rejected.decisions[0].rejections.map((x) => [x.reason, x.followUp]), [['15', 'C']]);
});

test('278: a request (BHT02 13), another transaction and a broken envelope are refused', () => {
  assert.throws(() => read278(response(['HL*4*3*EV*1', 'UM*HS*I*1*11:B'], '13')), /278 request \(BHT02 13\), not a response/);
  assert.throws(() => read278(response(['HL*4*3*EV*1']).replace('IEA*1*', 'IEA*2*')), /IEA01 does not match/);
  assert.throws(() => read278('hello'), /ISA interchange header/);
});
