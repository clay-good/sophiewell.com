import test from 'node:test';
import assert from 'node:assert/strict';
import { read271 } from '../../lib/x12-271-v1515.js';

function envelope(body, { separator = '*', terminator = '~', version = '005010X279A1', seCount = null } = {}) {
  const isa = ['ISA', '00', '          ', '00', '          ', 'ZZ', 'SENDER         ', 'ZZ', 'RECEIVER       ', '260928', '1200', '^', '00501', '000000001', '0', 'P', ':'].join(separator);
  const set = [`ST${separator}271${separator}0001${separator}${version}`, ...body.map((segment) => segment.replaceAll('*', separator))];
  set.push(`SE${separator}${seCount ?? set.length + 1}${separator}0001`);
  return [isa, `GS${separator}HB${separator}SENDER${separator}RECEIVER${separator}20260928${separator}1200${separator}1${separator}X${separator}${version}`, ...set, `GE${separator}1${separator}1`, `IEA${separator}1${separator}000000001`].join(terminator) + terminator;
}

test('271 reads coverage, identifiers and benefit details with raw codes', () => {
  const result = read271(envelope([
    'BHT*0022*11*TRACK*20260928*1200',
    'HL*1**20*1', 'NM1*PR*2*PLAN*****PI*842610001',
    'HL*2*1*21*1', 'NM1*1P*2*CLINIC*****XX*1234567893',
    'HL*3*2*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER-1', 'REF*6P*GROUP-7', 'REF*18*PLAN-4',
    'EB*1*IND*30***23*****Y', 'DTP*356*D8*20260101', 'DTP*357*D8*20261231',
    'EB*C*IND*30***23*1500*****Y', 'EB*C*IND*30***29*1112.40*****Y',
    'EB*A*IND*30***23**.2****N',
  ]));
  assert.deepEqual(result.summary, { transactionCount: 1, personCount: 1, benefitCount: 4, activePeople: 1, inactivePeople: 0, errorCount: 0 });
  const person = result.people[0];
  assert.equal(person.name, 'JANE DOE');
  assert.equal(person.memberId, 'MEMBER-1');
  assert.deepEqual(person.planIdentifiers.map(({ label, value }) => [label, value]), [['Group number', 'GROUP-7'], ['Plan number', 'PLAN-4']]);
  assert.equal(person.coverage[0].status, 'active');
  assert.equal(person.coverage[0].dates[0].value, '2026-01-01');
  assert.equal(person.benefits[1].informationLabel, 'Deductible');
  assert.equal(person.benefits[1].coverageLabel, 'Individual');
  assert.equal(person.benefits[1].networkLabel, 'In network');
  assert.equal(person.benefits[3].percent, 0.2);
  assert.equal(person.summary[1], 'Individual Deductible in network: $1,500.00 for the calendar year; $1,112.40 remaining.');
});

test('271 separates subscribers and dependents and preserves unknown codes', () => {
  const result = read271(envelope([
    'BHT*0022*11*TRACK*20260928*1200',
    'HL*1**20*1', 'HL*2*1*21*1',
    'HL*3*2*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER-1', 'EB*6*IND*30', 'DTP*307*RD8*20250101-20251231',
    'HL*4*3*23*0', 'NM1*03*1*DOE*JOHN****MI*DEPENDENT-2', 'EB*Z*ZZ*30^98***27*25*****U', 'AAA*N**72*C',
  ]));
  assert.equal(result.people.length, 2);
  assert.equal(result.people[0].coverage[0].status, 'inactive');
  assert.equal(result.people[1].relationship, 'dependent');
  assert.equal(result.people[1].benefits[0].informationLabel, 'Benefit code Z');
  assert.deepEqual(result.people[1].benefits[0].serviceTypeCodes, ['30', '98']);
  assert.equal(result.people[1].errors[0].rejectReasonCode, '72');
  assert.equal(result.summary.errorCount, 1);
});

test('271 accepts declared separators and rejects bad envelopes or versions', () => {
  const body = ['BHT*0022*11*TRACK*20260928*1200', 'HL*1**20*1', 'HL*2*1*21*1', 'HL*3*2*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER-1', 'EB*1*IND*30'];
  const newline = envelope(body, { separator: '|', terminator: '\n' });
  assert.equal(read271(newline).summary.personCount, 1);
  assert.throws(() => read271(newline.replace(/IEA[^\n]+\n$/, '')), /IEA trailer/);
  assert.throws(() => read271(envelope(body, { version: '004010X092A1' })), /Unsupported 271 version/);
  assert.throws(() => read271(envelope(body, { seCount: 99 })), /SE01/);
});

