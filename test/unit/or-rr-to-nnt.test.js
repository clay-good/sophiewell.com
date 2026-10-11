// spec-v1634 tool 18: NNT from an odds ratio or relative risk and a baseline risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orRrToNnt as d } from '../../lib/or-rr-to-nnt-v1634.js';

test('formula (1): a relative risk', () => {
  const r = d({ measure: 'rr', ratio: 0.75, baselineRisk: 20 });
  assert.deepEqual([r.nnt, r.direction, r.treatedRiskPercent], [20, 'fewer', 15]);
  const h = d({ measure: 'rr', ratio: 1.5, baselineRisk: 10 });
  assert.deepEqual([h.nnt, h.direction], [20, 'additional']);
  assert.match(h.band, /20 for one additional event/);
});

test('formula (2): an odds ratio, and it equals 1 / risk difference', () => {
  const r = d({ measure: 'or', ratio: 0.75, baselineRisk: 20 });
  assert.equal(r.nnt, 23.75);
  assert.match(r.band, /24 for one fewer event \(23\.75 before rounding up\)/);
  // The risk with treatment from the odds: 0.75 x 0.25 = 0.1875 -> 0.1875 / 1.1875.
  assert.ok(Math.abs(1 / (0.2 - 0.1875 / 1.1875) - 23.75) < 1e-9);
  const h = d({ measure: 'or', ratio: 2, baselineRisk: 5 });
  assert.ok(Math.abs(h.nnt - (1 / 0.05 + 2 / 0.95)) < 1e-3);
  assert.equal(h.direction, 'additional');
});

test('the odds ratio and the relative risk agree as the baseline risk goes to zero', () => {
  const a = d({ measure: 'or', ratio: 0.75, baselineRisk: 0.01 }).nnt;
  const b = d({ measure: 'rr', ratio: 0.75, baselineRisk: 0.01 }).nnt;
  assert.ok(Math.abs(a - b) / b < 1e-3);
  const c = d({ measure: 'or', ratio: 0.75, baselineRisk: 50 }).nnt;
  assert.ok(c > d({ measure: 'rr', ratio: 0.75, baselineRisk: 50 }).nnt);
});

test('confidence limits on one side of 1 give a range; an interval including 1 goes through infinity', () => {
  const r = d({ measure: 'or', ratio: 2, lower: 1.5, upper: 3, baselineRisk: 5 });
  assert.equal(r.intervalCrossesOne, false);
  assert.ok(r.nntLow < r.nnt && r.nnt < r.nntHigh);
  const x = d({ measure: 'rr', ratio: 0.8, lower: 0.6, upper: 1.1, baselineRisk: 10 });
  assert.equal(x.intervalCrossesOne, true);
  assert.equal(x.nntLow, undefined);
  assert.match(x.notes.join(' '), /25 for one fewer event, through infinity, to 100 for one additional event/);
  assert.match(d({ measure: 'rr', ratio: 0.8, lower: 0.6, upper: 1, baselineRisk: 10 }).notes.join(' '), /to infinity/);
});

test('a ratio of 1 is no difference, not a number', () => {
  const r = d({ measure: 'or', ratio: 1, baselineRisk: 10 });
  assert.equal(r.nnt, null);
  assert.match(r.band, /infinite/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose the effect measure/);
  assert.match(d({ measure: 'rr', baselineRisk: 10 }).message, /^Enter the relative risk/);
  assert.match(d({ measure: 'or', ratio: 0.5 }).message, /^Enter the baseline risk/);
  assert.equal(d({ measure: 'rr', ratio: 0, baselineRisk: 10 }).valid, false);
  assert.equal(d({ measure: 'rr', ratio: 0.5, baselineRisk: 0 }).valid, false);
  assert.equal(d({ measure: 'or', ratio: 0.5, baselineRisk: 100 }).valid, false);
  assert.match(d({ measure: 'rr', ratio: 6, baselineRisk: 20 }).message, /above 100%/);
  assert.match(d({ measure: 'rr', ratio: 2, lower: 1.5, upper: 6, baselineRisk: 20 }).message, /above 100%/);
  assert.match(d({ measure: 'rr', ratio: 0.8, lower: 0.6, baselineRisk: 10 }).message, /both confidence limits/);
  assert.match(d({ measure: 'rr', ratio: 0.8, lower: 0.9, upper: 1.1, baselineRisk: 10 }).message, /between its confidence limits/);
  assert.equal(d(null).valid, false);
});
