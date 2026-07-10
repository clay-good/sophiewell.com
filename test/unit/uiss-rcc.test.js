// spec-v279: worked examples for the UCLA Integrated Staging System (UISS),
// localized (N0M0) branch. spec-v97 cross-verified against the Zisman 2001/2002
// derivation and the Patard 2004 international multicenter validation:
//   low:          T1, grade 1-2, ECOG 0            (~92% 5-year OS)
//   high:         T4, or T3 grade 2-4 with ECOG >= 1 (~44% 5-year OS)
//   intermediate: every other localized combination  (~67% 5-year OS)
// The node-positive / metastatic branch is out of scope (parked, spec-v279 §7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uissRcc } from '../../lib/rcc-prognosis-v279.js';

test('uiss-rcc: localized low tier (T1, grade 1-2, ECOG 0)', () => {
  const r = uissRcc({ tStage: 't1', grade: '1', ecog: 'ecog0' });
  assert.equal(r.valid, true);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
  assert.ok(r.detail.includes('~92%'));
  // A grade-2 ECOG-0 T1 is still low; ECOG >= 1 pushes it to intermediate.
  assert.equal(uissRcc({ tStage: 't1', grade: '2', ecog: 'ecog0' }).tier, 'low');
  assert.equal(uissRcc({ tStage: 't1', grade: '2', ecog: 'ecog1plus' }).tier, 'intermediate');
});

test('uiss-rcc: localized high tier (T4, or T3 grade 2-4 with ECOG >= 1)', () => {
  assert.equal(uissRcc({ tStage: 't4', grade: '1', ecog: 'ecog0' }).tier, 'high');
  assert.equal(uissRcc({ tStage: 't3', grade: '3', ecog: 'ecog1plus' }).tier, 'high');
  const r = uissRcc({ tStage: 't4', grade: '2', ecog: 'ecog0' });
  assert.equal(r.tier, 'high');
  assert.ok(r.detail.includes('UISS tier: high risk'));
  assert.ok(r.detail.includes('~44%'));
});

test('uiss-rcc: intermediate covers the middle combinations', () => {
  assert.equal(uissRcc({ tStage: 't1', grade: '3', ecog: 'ecog0' }).tier, 'intermediate'); // T1 grade 3
  assert.equal(uissRcc({ tStage: 't2', grade: '1', ecog: 'ecog0' }).tier, 'intermediate'); // T2
  assert.equal(uissRcc({ tStage: 't3', grade: '3', ecog: 'ecog0' }).tier, 'intermediate'); // T3 G3 but ECOG 0
  assert.equal(uissRcc({ tStage: 't3', grade: '1', ecog: 'ecog1plus' }).tier, 'intermediate'); // T3 G1
});

test('uiss-rcc: node-positive / metastatic disease is out of scope', () => {
  assert.equal(uissRcc({ tStage: 't1', grade: '1', ecog: 'ecog0', metastatic: true }).valid, false);
  assert.equal(uissRcc({ tStage: 't1', grade: '1', ecog: 'ecog0', nodePositive: true }).valid, false);
});

test('uiss-rcc: missing selections are invalid (no NaN)', () => {
  assert.equal(uissRcc({ tStage: 't1' }).valid, false);
  assert.equal(uissRcc({}).valid, false);
  assert.equal(uissRcc().valid, false);
});
