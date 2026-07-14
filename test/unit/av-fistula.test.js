// spec-v300: AVF maturation "Rule of 6s". Worked-example tests: all three
// criteria met, each single criterion failing (low flow, small diameter, deep
// vein), the inclusive 6/600 boundaries, the negative / non-numeric guards, and
// the empty-input guard. Thresholds cross-verified against the 2006 KDOQI
// vascular-access guideline and the JVS 2022 validation (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avfRuleOf6s } from '../../lib/av-fistula-v300.js';

test('all three criteria met is highly predictive of maturation', () => {
  const r = avfRuleOf6s({ flow: '700', diameter: '7', depth: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.allMet, true);
  assert.equal(r.metCount, 3);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /All three Rule of 6s criteria met/);
});

test('a single failing criterion drops allMet and flags abnormal', () => {
  assert.equal(avfRuleOf6s({ flow: '500', diameter: '7', depth: '4' }).flowOk, false);
  assert.equal(avfRuleOf6s({ flow: '700', diameter: '5', depth: '4' }).diameterOk, false);
  assert.equal(avfRuleOf6s({ flow: '700', diameter: '7', depth: '8' }).depthOk, false);
  const r = avfRuleOf6s({ flow: '500', diameter: '7', depth: '4' });
  assert.equal(r.allMet, false);
  assert.equal(r.metCount, 2);
  assert.equal(r.abnormal, true);
});

test('the 6 mm / 600 mL/min / 6 mm boundaries are inclusive', () => {
  const r = avfRuleOf6s({ flow: '600', diameter: '6', depth: '6' });
  assert.equal(r.flowOk, true);
  assert.equal(r.diameterOk, true);
  assert.equal(r.depthOk, true);
  assert.equal(r.allMet, true);
});

test('a negative or non-numeric measurement throws; missing input is guarded', () => {
  assert.throws(() => avfRuleOf6s({ flow: '-1', diameter: '6', depth: '4' }), RangeError);
  assert.throws(() => avfRuleOf6s({ flow: 'abc', diameter: '6', depth: '4' }), RangeError);
  assert.equal(avfRuleOf6s({ flow: '700', diameter: '7' }).valid, false);
  assert.equal(avfRuleOf6s({}).valid, false);
});

test('the worked example (700 / 7 / 4) matches the documented META expected output', () => {
  const r = avfRuleOf6s({ flow: '700', diameter: '7', depth: '4' });
  assert.equal(r.allMet, true);
  assert.match(r.band, /flow 700 ≥ 600 mL\/min/);
  assert.match(r.band, /diameter 7 ≥ 6 mm/);
  assert.match(r.band, /depth 4 ≤ 6 mm/);
});
