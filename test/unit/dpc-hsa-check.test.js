// spec-v1604 tool 5: dpc-hsa-check, against IRC 223(c)(1)(E) and Notice 2026-5.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dpcHsaCheck as d, DATED_DPC } from '../../lib/dpc-hsa-check.js';

const ok = { year: '2026', covers: 'one', period: '1', fee: '120', practitioners: 'yes', fixedFee: 'yes', anesthesia: 'no', drugs: 'no', labs: 'no', payer: 'member' };

test('within the limit with qualifying terms keeps HSA eligibility', () => {
  const r = d(ok);
  assert.equal(r.verdict, 'compatible');
  assert.match(r.band, /\$120\.00 a month against the 2026 limit of \$150\.00 for one person/);
  assert.ok(r.notes.some((n) => /pay the fees from your HSA/.test(n)));
});

test('the limit is monthly, annualized for longer billing periods (A-13)', () => {
  assert.equal(d({ ...ok, period: '12', fee: '1800' }).verdict, 'compatible');
  assert.equal(d({ ...ok, period: '12', fee: '1800.12' }).verdict, 'over-limit');
  assert.equal(d({ ...ok, period: '6', fee: '900' }).verdict, 'compatible');
  assert.equal(d({ ...ok, covers: 'more', fee: '300' }).verdict, 'compatible');
  assert.equal(d({ ...ok, covers: 'more', fee: '300.01' }).verdict, 'over-limit');
});

test('over the limit: contributions stop, the fees stay reimbursable (A-20); employer-paid fees are not (A-18)', () => {
  const r = d({ ...ok, fee: '175' });
  assert.equal(r.verdict, 'over-limit');
  assert.match(r.band, /cannot contribute to an HSA for the months you are enrolled/);
  assert.match(r.notes[0], /pay them from your HSA \(Notice 2026-5 A-20\)/);
  assert.ok(d({ ...ok, payer: 'employer' }).notes.some((n) => /A-18/.test(n)));
});

test('each excluded term takes it out of the safe harbor, with the reason', () => {
  assert.match(d({ ...ok, drugs: 'yes' }).band, /prescription drugs other than vaccines/);
  assert.match(d({ ...ok, anesthesia: 'yes' }).band, /general anesthesia/);
  assert.match(d({ ...ok, labs: 'yes' }).band, /lab services/);
  assert.match(d({ ...ok, fixedFee: 'no' }).band, /A-11/);
  assert.match(d({ ...ok, practitioners: 'no' }).band, /primary care practitioners/);
  assert.equal(d({ ...ok, drugs: 'yes' }).verdict, 'not-dpcsa');
});

test('unanswered terms are not read as yes or no', () => {
  const r = d({ ...ok, drugs: '', labs: '' });
  assert.equal(r.verdict, 'not-assessed');
  assert.match(r.band, /still depends on whether it includes prescription drugs other than vaccines; whether it includes lab services/);
});

test('a year with no published limit asks for it; an entered limit is used', () => {
  assert.match(d({ ...ok, year: '2027' }).message, /2027 monthly limit is indexed and not published here yet/);
  assert.equal(d({ ...ok, year: '2027', limit: '155', fee: '154' }).verdict, 'compatible');
  assert.match(d({ ...ok, year: '2027', limit: '155', fee: '154' }).band, /2027, as entered limit of \$155\.00/);
  assert.match(d({ ...ok, year: '2025' }).message, /2026 or later/);
  assert.deepEqual(DATED_DPC['dpc-limit-2026'].values, { one: 150, more: 300 });
});

test('refusals', () => {
  assert.match(d({}).message, /year/);
  assert.match(d({ year: '2026' }).message, /one person or more/);
  assert.match(d({ year: '2026', covers: 'one' }).message, /billed/);
  assert.match(d({ year: '2026', covers: 'one', period: '1' }).message, /total fee/);
});

test('the spec cases: $149 is compatible; two $100 arrangements together are not; a drug benefit is not', () => {
  assert.equal(d({ ...ok, fee: '149' }).verdict, 'compatible');
  assert.equal(d({ ...ok, fee: '200' }).verdict, 'over-limit');
  assert.equal(d({ ...ok, drugs: 'yes' }).verdict, 'not-dpcsa');
});

test('over the limit with terms unanswered says they were not assessed', () => {
  const r = d({ year: '2026', covers: 'one', period: '1', fee: '180' });
  assert.equal(r.verdict, 'over-limit');
  assert.match(r.band, /terms were not assessed/);
  assert.doesNotMatch(d({ ...ok, fee: '180' }).band, /not assessed/);
});
