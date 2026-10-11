// spec-v1634 tool 9: BADRI (Tangiisuran 2014).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badriAdrRisk as d, ITEMS } from '../../lib/badri-adr-risk-v1634.js';

const all = (a, extra = {}) => ({ ...Object.fromEntries(ITEMS.map((i) => [i.arg, a])), ...extra });

test('one point each, 0 to 5', () => {
  assert.equal(ITEMS.length, 5);
  assert.equal(d(all('no')).score, 0);
  assert.equal(d(all('yes')).score, 5);
  for (const it of ITEMS) assert.equal(d(all('no', { [it.arg]: 'yes' })).score, 1);
});

test('the cutoff is more than 1', () => {
  const one = d(all('no', { hyperlipidemia: 'yes' }));
  assert.deepEqual([one.abnormal, one.flag], [false, 'at-or-below-cutoff']);
  const two = d(all('no', { hyperlipidemia: 'yes', longStay: 'yes' }));
  assert.deepEqual([two.abnormal, two.flag], [true, 'above-cutoff']);
  assert.match(two.band, /^BADRI score 2 of 5: above the paper's cutoff/);
});

test('both sets of validation figures are printed, and a low score is not reassurance', () => {
  const r = d(all('no'));
  const t = r.notes.join(' ');
  assert.match(t, /sensitivity 80% and specificity 55%/);
  assert.match(t, /84% and specificity 43%.*80% and 46%.*do not agree/);
  assert.match(r.note, /does not rule one out/);
  assert.match(r.note, /no number for a high white cell count/);
});

test('every item is needed', () => {
  assert.match(d({}).message, /^Choose yes or no: hyperlipidemia/);
  const p = all('no'); delete p.highWhiteCells;
  assert.match(d(p).message, /^Choose yes or no: high white cell count/);
  assert.equal(d(all('no', { longStay: 'maybe' })).valid, false);
  assert.equal(d(null).valid, false);
});
