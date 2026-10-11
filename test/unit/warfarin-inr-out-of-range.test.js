// spec-v1634 tool 16: out-of-range INR on warfarin (Holbrook 2012).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { warfarinInrOutOfRange as d } from '../../lib/warfarin-inr-out-of-range-v1634.js';

const base = { targetLow: 2, targetHigh: 3, bleeding: 'none' };
const recs = (extra) => d({ ...base, ...extra }).recommendations;

test('3.2: previously stable and no more than 0.5 outside the range', () => {
  assert.deepEqual(recs({ inr: 3.4, stable: 'yes' }), ['3.2']);
  assert.deepEqual(recs({ inr: 3.5, stable: 'yes' }), ['3.2']);
  assert.deepEqual(recs({ inr: 1.5, stable: 'yes' }), ['3.2']);
  assert.deepEqual(recs({ inr: 3.6, stable: 'yes' }), []);
  assert.deepEqual(recs({ inr: 3.4, stable: 'no' }), []);
});

test('9.1: 4.5 to 10 without bleeding is against routine vitamin K; above 10 is oral vitamin K with no dose', () => {
  assert.deepEqual(recs({ inr: 4.4, stable: 'no' }), []);
  assert.deepEqual(recs({ inr: 4.5, stable: 'no' }), ['9.1a']);
  assert.deepEqual(recs({ inr: 10, stable: 'no' }), ['9.1a']);
  const high = d({ ...base, inr: 10.1, stable: 'no' });
  assert.deepEqual(high.recommendations, ['9.1b']);
  assert.match(high.band, /states no dose, and none is given/);
  assert.doesNotMatch(JSON.stringify(high), /\d(\.\d)? ?mg/);
});

test('9.3: major bleeding, whatever the INR', () => {
  const r = d({ inr: 2.5, targetLow: 2, targetHigh: 3, bleeding: 'major' });
  assert.deepEqual(r.recommendations, ['9.3']);
  assert.match(r.band, /four-factor prothrombin complex concentrate rather than plasma.*vitamin K 5 to 10 mg by slow IV injection/);
});

test('3.1 in range and stable; otherwise no numbered recommendation is invented', () => {
  assert.deepEqual(recs({ inr: 2.5, stable: 'yes' }), ['3.1']);
  const none = d({ ...base, inr: 3.8, stable: 'yes' });
  assert.equal(none.flag, 'no-recommendation');
  assert.match(none.band, /no numbered recommendation/);
  assert.equal(d({ ...base, inr: 2.5, stable: 'no' }).flag, 'no-recommendation');
});

test('two recommendations can both apply', () => {
  assert.deepEqual(d({ inr: 4.8, targetLow: 3.5, targetHigh: 4.5, bleeding: 'none', stable: 'yes' }).recommendations, ['9.1a', '3.2']);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the INR/);
  assert.match(d({ inr: 3 }).message, /^Enter the lower end/);
  assert.match(d({ inr: 3, targetLow: 3, targetHigh: 2 }).message, /must be above/);
  assert.match(d({ inr: 3, targetLow: 2, targetHigh: 3 }).message, /^Choose whether there is bleeding/);
  assert.match(d({ inr: 3, targetLow: 2, targetHigh: 3, bleeding: 'none' }).message, /^Choose whether the INRs were previously stable/);
  assert.equal(d({ inr: 0, targetLow: 2, targetHigh: 3, bleeding: 'none', stable: 'yes' }).valid, false);
  assert.equal(d(null).valid, false);
});
