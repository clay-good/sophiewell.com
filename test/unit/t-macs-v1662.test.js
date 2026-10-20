// spec-v1662: T-MACS against its published equation and risk-group edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tMacs, ITEMS } from '../../lib/t-macs-v1662.js';

const none = Object.fromEntries(ITEMS.map(([k]) => [k, 'no']));

test('the equation: troponin alone, and every item present', () => {
  // logit = -4.766 + 0.089 x 5 = -4.321 -> 1.31%
  const r = tMacs({ ...none, troponinT: '5' });
  assert.equal(r.probability, Number((1 / (1 + Math.exp(4.321))).toFixed(4)));
  assert.equal(r.group, 'Very low risk');
  const all = Object.fromEntries(ITEMS.map(([k]) => [k, 'yes']));
  const lp = -4.766 + 1.713 + 0.847 + 0.607 + 1.417 + 2.058 + 1.208 + 0.089 * 20;
  assert.equal(tMacs({ ...all, troponinT: '20' }).probability, Number((1 / (1 + Math.exp(-lp))).toFixed(4)));
});

test('group edges: 2%, 5% and 95%', () => {
  // Solve troponin for a target probability with no items: T = (logit(p) + 4.766) / 0.089.
  const at = (p) => ((Math.log(p / (1 - p)) + 4.766) / 0.089);
  assert.equal(tMacs({ ...none, troponinT: String(at(0.0199)) }).group, 'Very low risk');
  assert.equal(tMacs({ ...none, troponinT: String(at(0.0201)) }).group, 'Low risk');
  assert.equal(tMacs({ ...none, troponinT: String(at(0.0501)) }).group, 'Moderate risk');
  assert.equal(tMacs({ ...none, troponinT: String(at(0.9501)) }).group, 'High risk');
});

test('every item must be answered; troponin required', () => {
  const { sweating, ...rest } = none;
  assert.match(tMacs({ ...rest, troponinT: '5' }).message, /sweating observed/);
  assert.equal(tMacs({ ...none }).valid, false);
  assert.equal(tMacs({ ...none, troponinT: '100000' }).group, 'High risk');
});
