// spec-v103 2.1: SCORE2 (ESC 2021, age 40-69). Fixtures reproduce the two ESC
// published worked examples (50yo smoker, SBP 140, TC 5.5, HDL 1.3 mmol/L).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score2 } from '../../lib/cvrisk-v103.js';

const base = { age: 50, smoker: true, sbp: 140, totalChol: 5.5, hdl: 1.3 };

test('missing inputs -> invalid', () => {
  assert.equal(score2({ age: 50, region: 'low' }).valid, false);
});

test('unrecognized region -> surfaced fallback, no undefined read', () => {
  const r = score2({ ...base, male: true, region: 'bogus' });
  assert.equal(r.valid, false);
  assert.match(r.band, /risk region/);
});

test('ESC worked example, men: low region 5.9% .. very-high 14.0%', () => {
  assert.equal(score2({ ...base, male: true, region: 'low' }).risk, 5.9);
  assert.equal(score2({ ...base, male: true, region: 'very-high' }).risk, 14);
});

test('ESC worked example, women: low region 4.2% .. very-high 13.7%', () => {
  assert.equal(score2({ ...base, male: false, region: 'low' }).risk, 4.2);
  assert.equal(score2({ ...base, male: false, region: 'very-high' }).risk, 13.7);
});

test('region drives the ESC category flip at a fixed profile', () => {
  // age 50 (50-69 band): low < 5, high < 10, very-high >= 10.
  assert.equal(score2({ ...base, male: true, region: 'low' }).category, 'high'); // 5.9%
  assert.equal(score2({ ...base, male: true, region: 'very-high' }).category, 'very-high'); // 14%
});

test('extreme fuzzed inputs clamp to a probability in [0,100]', () => {
  const r = score2({ age: 1e9, male: true, smoker: true, sbp: 1e9, totalChol: 1e9, hdl: 0, region: 'very-high' });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
});
