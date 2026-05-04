// Unit tests for lib/decoder.js (bill / EOB / GFE).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeBillText, decodeEobText, gfeDisputeCheck } from '../../lib/decoder.js';

const BILL = `
HOSPITAL EXAMPLE - STATEMENT
Visit date 2026-04-15  POS: 11
Provider NPI 1234567893
Dx I10  E11.65
99213  Office visit  $250.00
36415  Venipuncture  $25.00
J2270  Morphine 10mg  $45.00
0250 Pharmacy total  $70.00
TOTAL CHARGES                  $390.00
`;

test('decodeBillText: extracts ICD-10', () => {
  const r = decodeBillText(BILL);
  assert.deepEqual(r.codes.icd10.sort(), ['E11.65', 'I10']);
});

test('decodeBillText: extracts HCPCS J code', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.codes.hcpcs.includes('J2270'));
});

test('decodeBillText: extracts five-digit possible CPT (excluding HCPCS)', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.codes.cpt.includes('99213'));
  assert.ok(r.codes.cpt.includes('36415'));
});

test('decodeBillText: extracts revenue codes', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.codes.revenue.includes('0250'));
});

test('decodeBillText: extracts POS', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.codes.pos.includes('11'));
});

test('decodeBillText: validates NPI by Luhn', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.codes.npi.includes('1234567893'));
});

test('decodeBillText: ignores invalid 10-digit candidates', () => {
  const r = decodeBillText('NPI 0000000000');
  assert.equal(r.codes.npi.length, 0);
  assert.ok(r.npiCandidates.includes('0000000000'));
});

test('decodeBillText: extracts dollar amounts', () => {
  const r = decodeBillText(BILL);
  assert.ok(r.dollars.includes(250.00));
  assert.ok(r.dollars.includes(390.00));
});

test('decodeBillText: associates dollar amounts with adjacent codes', () => {
  const r = decodeBillText(BILL);
  const a = r.associations.find((x) => x.code === '99213');
  assert.equal(a && a.amount, 250.00);
});

test('decodeBillText: empty input returns empty results', () => {
  const r = decodeBillText('');
  assert.equal(r.codes.icd10.length, 0);
  assert.equal(r.dollars.length, 0);
});

test('decodeEobText: extracts EOB monetary fields', () => {
  const eob = `
Allowed amount: $400.00
Plan paid: $320.00
Patient responsibility: $80.00
CARC 45  Charge exceeds fee schedule
RARC N130 plan benefit limits
`;
  const r = decodeEobText(eob);
  assert.equal(r.fields.allowed, 400.00);
  assert.equal(r.fields.planPaid, 320.00);
  assert.equal(r.fields.patientResp, 80.00);
  assert.ok(r.codes.carc.includes('45'));
  assert.ok(r.codes.rarc.includes('N130'));
});

test('gfeDisputeCheck: under threshold not eligible', () => {
  const r = gfeDisputeCheck({ gfeTotal: 1000, actualBillTotal: 1200, status: 'uninsured' });
  assert.equal(r.eligible, false);
  assert.equal(r.overage, 200);
});

test('gfeDisputeCheck: over threshold eligible if uninsured', () => {
  const r = gfeDisputeCheck({ gfeTotal: 1000, actualBillTotal: 1500, status: 'uninsured' });
  assert.equal(r.eligible, true);
  assert.equal(r.overage, 500);
});

test('gfeDisputeCheck: insured patient never eligible (federal threshold is uninsured/self-pay only)', () => {
  const r = gfeDisputeCheck({ gfeTotal: 1000, actualBillTotal: 9000, status: 'insured' });
  assert.equal(r.eligible, false);
});

test('gfeDisputeCheck: rejects negative input', () => {
  assert.throws(() => gfeDisputeCheck({ gfeTotal: -1, actualBillTotal: 0, status: 'uninsured' }), /non-negative/);
});
