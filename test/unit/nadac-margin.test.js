// spec-v1510 tool 2: nadac-margin.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nadacMargin as m, normalizeNdc, lookupFrom, shardName } from '../../lib/nadac-margin.js';

const row = { ndc: '00002143380', description: 'TRULICITY 0.75 MG/0.5 ML PEN', perUnit: 487.57264, effectiveDate: '2026-09-23', pricingUnit: 'ML' };
const found = { status: 'found', row, asOfDate: '2026-09-30' };
const claim = { ndc: '00002-1433-80', quantity: '2', serviceDate: '2026-09-25', lookup: found };

test('NDC layouts normalize to 11 digits; 10 bare digits are refused, not guessed', () => {
  assert.equal(normalizeNdc('0002-1433-80').ndc, '00002143380');
  assert.equal(normalizeNdc('00002-143-80').ndc, '00002014380');
  assert.equal(normalizeNdc('00002-1433-8').ndc, '00002143308');
  assert.equal(normalizeNdc('00002-1433-80').ndc, '00002143380');
  assert.equal(normalizeNdc('00002143380').ndc, '00002143380');
  assert.match(normalizeNdc('0002143380').error, /could be 4-4-2, 5-3-2 or 5-4-1/);
  // spec-v1641 row 22: the 12-digit form reaches the same 11 digits; a six-digit labeler has none.
  assert.equal(normalizeNdc('000002-1433-80').ndc, '00002143380');
  assert.equal(normalizeNdc('000002143380').ndc, '00002143380');
  assert.match(normalizeNdc('123456-1433-80').error, /six-digit labeler code/);
  assert.match(normalizeNdc('000-21433-80').error, /none of them/);
  assert.match(normalizeNdc('00002-1433-8x').error, /digits/);
});

test('a claim reimbursed one cent below NADAC is flagged', () => {
  const r = m({ ...claim, reimbursed: '975.14' });
  assert.equal(r.cost, 975.15);
  assert.equal(r.margin, -0.01);
  assert.equal(r.belowCost, true);
  assert.match(r.band, /\$0\.01 below NADAC/);
  assert.match(r.band, /effective Sep 23, 2026/);
  const even = m({ ...claim, reimbursed: '975.15' });
  assert.equal(even.belowCost, false);
  assert.equal(even.margin, 0);
});

test('margin in dollars and percent of the reimbursement', () => {
  const r = m({ ...claim, reimbursed: '1000' });
  assert.equal(r.margin, 24.85);
  assert.equal(r.percent, 2.5);
  assert.match(r.band, /per mL/);
});

test('a date outside the week on file has no benchmark', () => {
  assert.match(m({ ...claim, reimbursed: '1000', serviceDate: '2026-09-22' }).message, /No benchmark: .*took effect Sep 23, 2026/);
  assert.match(m({ ...claim, reimbursed: '1000', serviceDate: '2026-10-01' }).message, /No benchmark yet/);
  assert.equal(m({ ...claim, reimbursed: '1000', serviceDate: '2026-09-30' }).valid, true);
});

test('an unlisted NDC, a failed load and lapsed data ask for the invoice cost', () => {
  assert.match(m({ ...claim, reimbursed: '1', lookup: { status: 'not-listed', asOfDate: '2026-09-30' } }).message, /not in the NADAC week of Sep 30, 2026.*invoice cost/);
  assert.match(m({ ...claim, reimbursed: '1', lookup: { status: 'unavailable' } }).message, /could not be loaded.*invoice cost/);
  assert.match(m({ ...claim, reimbursed: '1', lookup: undefined }).message, /could not be loaded/);
  assert.match(m({ ...claim, reimbursed: '1', lookup: { status: 'expired' } }).message, /passed its review date.*invoice cost/);
});

test('the invoice cost replaces NADAC and needs no NDC or date', () => {
  const r = m({ quantity: '30', reimbursed: '130', cost: '4.20' });
  assert.equal(r.basis, 'invoice');
  assert.equal(r.margin, 4);
  assert.equal(r.percent, 3.1);
  assert.ok(r.notes.includes('Your invoice cost is used in place of NADAC.'));
  assert.match(m({ ...claim, reimbursed: '100', cost: '60' }).band, /^NDC 00002-1433-80: invoice cost \$60\.00 per unit times 2 = \$120\.00\. .*\$20\.00 below your invoice cost/);
  assert.match(m({ ndc: '0002143380', quantity: '1', reimbursed: '1', cost: '1' }).message, /could be 4-4-2/);
});

test('blank and out-of-range inputs are asked for, never read as zero', () => {
  assert.match(m({}).message, /^Enter the quantity dispensed/);
  assert.match(m({ quantity: '2' }).message, /^Enter the reimbursement/);
  assert.match(m({ quantity: '2', reimbursed: '5' }).message, /Enter the NDC.*or your invoice cost/);
  assert.match(m({ ...claim, reimbursed: '5', serviceDate: '' }).message, /Enter the date of service/);
  assert.match(m({ ...claim, quantity: '0', reimbursed: '5' }).message, /must be between/);
  const zero = m({ ...claim, reimbursed: '0' });
  assert.equal(zero.percent, null);
  assert.ok(zero.notes.some((n) => /no percentage/.test(n)));
});

test('lookupFrom reads the bundled week and never calls an unlisted labeler found', () => {
  const manifest = JSON.parse(readFileSync('data/nadac/manifest.json', 'utf8'));
  const week = JSON.parse(readFileSync('data/nadac/week.json', 'utf8'));
  const first = manifest.shards[0].name;
  const rows = JSON.parse(readFileSync(`data/nadac/shards/${first}`, 'utf8'));
  const now = new Date(`${manifest.fetchedAt}T12:00:00Z`);
  const hit = lookupFrom({ ndc: rows[0].ndc, manifest, week, rows, now });
  assert.equal(hit.status, 'found');
  assert.equal(hit.asOfDate, week.asOfDate);
  assert.equal(shardName(rows[0].ndc), first);
  assert.equal(lookupFrom({ ndc: '99999000001', manifest, week, rows: null, now }).status, 'not-listed');
  assert.equal(lookupFrom({ ndc: rows[0].ndc, manifest: { ...manifest, expiresOn: '2000-01-01' }, week, rows, now }).status, 'expired');
});

test('a loss too small to round to 0.1% says so rather than "0%"', () => {
  const r = m({ ...claim, reimbursed: '975.14' });
  assert.equal(Object.is(r.percent, -0), false);
  assert.match(r.band, /\(under 0\.1% of the reimbursement\)/);
  assert.match(m({ ...claim, reimbursed: '900' }).band, /\$75\.15 below NADAC \(8\.3% of the reimbursement\)/);
});
