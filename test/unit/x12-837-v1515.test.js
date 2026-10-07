import test from 'node:test';
import assert from 'node:assert/strict';
import { check837 } from '../../lib/x12-837-v1515.js';

function envelope(body, { version = '005010X222A1', separator = '*', terminator = '~', seCount = null } = {}) {
  const isa = ['ISA', '00', '          ', '00', '          ', 'ZZ', 'SENDER         ', 'ZZ', 'RECEIVER       ', '260928', '1200', '^', '00501', '000000001', '0', 'P', ':'].join(separator);
  const set = [`ST${separator}837${separator}0001${separator}${version}`, ...body.map((segment) => segment.replaceAll('*', separator))];
  set.push(`SE${separator}${seCount ?? set.length + 1}${separator}0001`);
  return [isa, `GS${separator}HC${separator}SENDER${separator}RECEIVER${separator}20260928${separator}1200${separator}1${separator}X${separator}${version}`, ...set, `GE${separator}1${separator}1`, `IEA${separator}1${separator}000000001`].join(terminator) + terminator;
}

test('837P validates identifiers, diagnosis structure, dates and line arithmetic', () => {
  const result = check837(envelope([
    'BHT*0019*00*BATCH*20260928*1200*CH',
    'HL*1**20*1', 'NM1*85*2*CLINIC*****XX*1234567893',
    'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*1EG4TE5MK73', 'NM1*PR*2*MEDICARE*****PI*00882',
    'CLM*CLAIM-1*125***11:B:1*Y*A*Y*I', 'HI*ABK:M5450',
    'LX*1', 'SV1*HC:99213*125*UN*1***1', 'DTP*472*RD8*20260920-20260921',
  ]), new Date('2026-09-28T12:00:00Z'));
  assert.deepEqual(result.summary, { transactionCount: 1, claimCount: 1, cleanClaims: 1, failingClaims: 0, findingCount: 0 });
  assert.equal(result.claims[0].type, '837P');
  assert.equal(result.claims[0].patientName, 'JANE DOE');
  assert.equal(result.claims[0].lineChargeCents, 12500);
  assert.equal(result.claims[0].lines[0].serviceDate, '2026-09-20 to 2026-09-21');
  assert.deepEqual(result.claims[0].diagnoses, ['M5450']);
});

test('837P reports each claim-level validation failure with a segment position', () => {
  const result = check837(envelope([
    'BHT*0019*00*BATCH*20260928*1200*CH',
    'HL*1**20*1', 'NM1*85*2*CLINIC*****XX*1234567893',
    'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*BAD-MBI', 'NM1*PR*2*MEDICARE*****PI*00882',
    'CLM*BAD-1*100***11:B:1*Y*A*Y*I', 'NM1*82*1*CLINICIAN*SAM****XX*1234567890', 'HI*ABK:123',
    'LX*1', 'SV1*HC:99213*90*UN*1***1', 'DTP*472*D8*20261001',
  ]), new Date('2026-09-28T12:00:00Z'));
  const checks = result.claims[0].findings.map((item) => item.check).sort();
  assert.deepEqual(checks, ['ICD-10-CM', 'MBI', 'NPI', 'charge total', 'service date']);
  assert.equal(result.summary.failingClaims, 1);
  assert.ok(result.claims[0].findings.every((item) => Number.isInteger(item.segmentPosition)));
});

test('837I reads SV2 charges and flags admission after discharge', () => {
  const result = check837(envelope([
    'BHT*0019*00*BATCH*20260928*1200*CH',
    'HL*1**20*1', 'NM1*85*2*HOSPITAL*****XX*1234567893',
    'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER1', 'NM1*PR*2*PLAN*****PI*12345',
    'CLM*I-1*300***11:A:1*Y*A*Y*I', 'HI*ABK:J189', 'DTP*435*D8*20260920', 'DTP*096*D8*20260919',
    'LX*1', 'SV2*0450*HC:99223*300*UN*1', 'DTP*472*D8*20260919',
  ], { version: '005010X223A2' }), new Date('2026-09-28T12:00:00Z'));
  assert.equal(result.claims[0].type, '837I');
  assert.equal(result.claims[0].lineChargeCents, 30000);
  assert.deepEqual(result.claims[0].findings.map((item) => item.check), ['date order']);
});

test('837 accepts declared separators and rejects mismatched or truncated envelopes', () => {
  const body = ['BHT*0019*00*BATCH*20260928*1200*CH', 'HL*1**20*1', 'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER1', 'NM1*PR*2*PLAN*****PI*12345', 'CLM*C-1*0***11:B:1*Y*A*Y*I'];
  const newline = envelope(body, { separator: '|', terminator: '\n' });
  assert.equal(check837(newline).summary.claimCount, 1);
  assert.throws(() => check837(newline.replace(/IEA[^\n]+\n$/, '')), /IEA trailer/);
  assert.throws(() => check837(newline.replace('SE|8|0001', 'SE|9|0001')), /SE01/);
});

test('837D (dental, 005010X224A2) sums SV302 line charges against the claim and checks the same identifiers and dates', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  const body = (lines) => [
    'BHT*0019*00*BATCH*20260928*1200*CH',
    'HL*1**20*1', 'NM1*85*2*DENTAL GROUP*****XX*1234567893',
    'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER1', 'NM1*PR*2*DELTA*****PI*12345',
    'CLM*D-1*120***11:B:1*Y*A*Y*I', ...lines,
  ];
  const clean = check837(envelope(body(['LX*1', 'SV3*AD:D0120*45***1', 'DTP*472*D8*20260920', 'LX*2', 'SV3*AD:D1110*75***1', 'DTP*472*D8*20260920']), { version: '005010X224A2' }), now);
  assert.equal(clean.claims[0].type, '837D');
  assert.equal(clean.claims[0].lineChargeCents, 12000);
  assert.equal(clean.claims[0].clean, true);
  const bad = check837(envelope(body(['LX*1', 'SV3*AD:D0120*45***1', 'DTP*472*D8*20261120']), { version: '005010X224A2' }), now);
  assert.deepEqual(bad.claims[0].findings.map((f) => f.check), ['charge total', 'service date']);
});
