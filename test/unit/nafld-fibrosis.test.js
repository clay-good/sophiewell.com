// spec-v93 §2.1: NAFLD Fibrosis Score (Angulo 2007).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nafldFibrosis } from '../../lib/hepgi-v93.js';

test('worked example: age 60, BMI 30, IFG/DM, AST 60, ALT 40, plt 200, alb 4.0 -> 0.74 (advanced)', () => {
  const r = nafldFibrosis({ age: 60, bmi: 30, ifgDm: 'yes', ast: 60, alt: 40, platelets: 200, albumin: 4.0 });
  assert.equal(r.score, 0.74);
  assert.equal(r.bandKey, 'high');
  assert.match(r.band, /advanced fibrosis/);
});

test('below -1.455 excludes advanced fibrosis (F0-F2)', () => {
  const r = nafldFibrosis({ age: 40, bmi: 25, ifgDm: 'no', ast: 30, alt: 40, platelets: 280, albumin: 4.5 });
  assert.ok(r.score < -1.455);
  assert.equal(r.bandKey, 'low');
});

test('between cutoffs is indeterminate', () => {
  const r = nafldFibrosis({ age: 55, bmi: 28, ifgDm: 'no', ast: 45, alt: 40, platelets: 200, albumin: 4.0 });
  assert.ok(r.score > -1.455 && r.score < 0.676);
  assert.equal(r.bandKey, 'indeterminate');
});

test('zero/blank ALT returns a surfaced guard, not a non-finite score', () => {
  const zero = nafldFibrosis({ age: 55, bmi: 28, ifgDm: 'no', ast: 45, alt: 0, platelets: 200, albumin: 4.0 });
  assert.equal(zero.valid, false);
  assert.match(zero.band, /ALT/);
  const blank = nafldFibrosis({ age: 55, bmi: 28, ifgDm: 'no', ast: 45, platelets: 200, albumin: 4.0 });
  assert.equal(blank.valid, false);
});
