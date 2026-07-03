// spec-v211 2.2: ELN 2022 AML risk classification worked examples. Structured
// categorical (favorable/intermediate/adverse) with adverse-overrides precedence
// and FLT3-ITD reclassification of NPM1. Membership spec-v97 cross-verified
// (Döhner 2022 ELN recommendations).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eln2022Aml as eln } from '../../lib/heme-onc-risk-v211.js';

test('mutated NPM1 without FLT3-ITD -> Favorable (worked example)', () => {
  const r = eln({ npm1: true });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'Favorable');
  assert.equal(r.abnormal, false);
});

test('CBF-AML -> Favorable', () => {
  assert.equal(eln({ cbf: true }).category, 'Favorable');
  assert.equal(eln({ cebpa: true }).category, 'Favorable');
});

test('mutated NPM1 with FLT3-ITD -> Intermediate', () => {
  const r = eln({ npm1: true, flt3itd: true });
  assert.equal(r.category, 'Intermediate');
  assert.match(r.band, /NPM1 with FLT3-ITD/);
});

test('an adverse lesion overrides an otherwise-favorable NPM1', () => {
  const r = eln({ npm1: true, adverse: true });
  assert.equal(r.category, 'Adverse');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /overrides/);
});

test('no favorable or adverse lesion -> Intermediate', () => {
  assert.equal(eln({}).category, 'Intermediate');
  assert.equal(eln({ flt3itd: true }).category, 'Intermediate');
});

test('adverse always wins even with CBF', () => {
  assert.equal(eln({ cbf: true, adverse: true }).category, 'Adverse');
});
