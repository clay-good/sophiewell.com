// spec-v1516 tool 1: denial next step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { denialNextStep as d, CARC_CATEGORY } from '../../lib/denial-next-step-v1516.js';

const base = { group: 'CO', payer: 'medicare', remitDate: '2026-09-01' };

test('medical necessity under Original Medicare: appeal within 120 days of presumed receipt', () => {
  const r = d({ ...base, carc: '50' });
  assert.equal(r.category, 'Medical necessity or coverage');
  assert.equal(r.deadline, '2027-01-04');
});

test('missing authorization under Medicare Advantage: 60 days from presumed receipt', () => {
  assert.equal(d({ ...base, carc: '197', payer: 'ma' }).deadline, '2026-11-05');
});

test('a corrected Medicare claim is due one calendar year after the date of service, as timely-filing counts it', () => {
  assert.equal(d({ ...base, carc: '16', serviceDate: '2026-03-15' }).deadline, '2027-03-15');
});

test('patient responsibility and duplicates have nothing to appeal', () => {
  assert.equal(d({ ...base, group: 'PR', carc: '1' }).deadline, null);
  assert.match(d({ ...base, carc: '18' }).band, /do not rebill/);
});

test('PR on a non-patient category explains the assignment to the patient', () => {
  assert.match(d({ ...base, group: 'PR', carc: '204' }).band, /advance beneficiary notice/);
});

test('Medicaid asks for the window; an unmapped code is never guessed', () => {
  assert.match(d({ ...base, carc: '50', payer: 'medicaid' }).band, /Enter the appeal window/);
  assert.equal(d({ ...base, carc: '50', payer: 'medicaid', windowDays: '90' }).deadline, '2026-11-30');
  assert.equal(d({ ...base, carc: '999' }).bandLabel, 'No mapping');
  assert.equal(d({ ...base, carc: 'CO-45' }).category, 'Contractual adjustment');
});

test('every mapped code resolves; blanks ask', () => {
  for (const c of Object.keys(CARC_CATEGORY)) assert.equal(d({ ...base, carc: c }).valid, true, c);
  assert.equal(d({}).valid, false);
  assert.equal(d({ group: 'CO', carc: '50', payer: 'medicare' }).valid, false);
});

// spec-v1829: the ceiling the tool already enforced as a format rule.
//
// A claim adjustment reason code is one to three digits -- `/^\d{1,3}$/`, one line below the guard -- so 999
// is the top of the format and 999999 is not a code at all. That is arithmetic about the format rather than
// a clinical judgement, so it needed no source; the reader who typed 999999 was told to "enter the code as
// its number" instead of being told the range. A value that is not a number at all still gets the ask,
// because there is no range to state about "abc".
test('spec-v1829: a reason code past three digits is refused by its range, not asked for again', () => {
  const ok = { group: 'CO', carc: '50', payer: 'medicare', remitDate: '2026-09-01' };
  assert.equal(d(ok).valid, true);
  assert.equal(d({ ...ok, carc: '999' }).valid, true, '999 is the top of the format');
  for (const carc of ['1000', '999999']) {
    const r = d({ ...ok, carc });
    assert.equal(r.valid, false, carc);
    assert.match(r.message, /must be between 0 and 999/, carc);
    assert.doesNotMatch(r.message, /^Enter the claim adjustment reason code/, carc);
  }
  assert.match(d({ ...ok, carc: '50.5' }).message, /whole number/);
  // Not a number at all: the ask is the right answer, because no range describes it.
  assert.match(d({ ...ok, carc: 'abc' }).message, /^Enter the claim adjustment reason code/);
  // The group prefix is still stripped before the code is read.
  assert.equal(d({ ...ok, carc: 'CO-50' }).valid, true);
});
