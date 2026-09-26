// spec-v1514 tool 7: hospice aggregate cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hospiceAggregateCap as h } from '../../lib/hospice-cap-v1514.js';

test('FY2026 cap amount times the count, over the cap', () => {
  const r = h({ capYear: '2026', beneficiaries: '100', payments: '3700000' });
  assert.equal(r.cap, 3536144);
  assert.equal(r.over, 163856);
  assert.match(r.notes.join(' '), /must refund/);
});

test('FY2027 amount with a fractional proportional count, under the cap', () => {
  const r = h({ capYear: '2027', beneficiaries: '42.5', payments: '1000000', method: 'proportional' });
  assert.equal(r.cap, 1537426.88);
  assert.equal(r.over, 0);
  assert.match(r.bandLabel, /under/);
});

test('the filing deadline is 5 months after the cap year (leap February)', () => {
  const r = h({ capYear: '2027', beneficiaries: '1', payments: '0' });
  assert.match(r.notes.join(' '), /February 29, 2028/);
});

test('a blank cap year uses the fiscal year in progress', () => {
  assert.match(h({ beneficiaries: '1', payments: '0' }, new Date(Date.UTC(2026, 9, 2))).band, /FY2027/);
  assert.match(h({ beneficiaries: '1', payments: '0' }, new Date(Date.UTC(2026, 8, 30))).band, /FY2026/);
});

test('blank count or payments ask; a year with no cap on file asks', () => {
  assert.equal(h({ capYear: '2026', payments: '1' }).valid, false);
  assert.equal(h({ capYear: '2026', beneficiaries: '1' }).valid, false);
  assert.match(h({ capYear: '2028', beneficiaries: '1', payments: '1' }).message, /FY2028/);
});
