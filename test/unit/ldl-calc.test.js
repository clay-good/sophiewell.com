// spec-v55 §2.5: calculated LDL (Friedewald + NIH/Sampson 2020).
// Note: NIH/Sampson is shipped as the second method in place of Martin/Hopkins
// (whose 180-cell strata table is not source-verifiable here); see
// docs/audits/v11/ldl-calc.md for the deliberate substitution.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ldlCalc } from '../../lib/clinical-v6.js';

test('ldl normal TG: TC 200, HDL 50, TG 150 -> Friedewald 120, NIH 123', () => {
  const r = ldlCalc({ totalChol: 200, hdl: 50, tg: 150 });
  assert.equal(r.nonHdl, 150);
  assert.equal(r.friedewald, 120);
  assert.equal(r.nih, 123);
  assert.match(r.note, /Friedewald valid/);
});

test('ldl high TG >=400: Friedewald is invalid (null), NIH still computes', () => {
  const r = ldlCalc({ totalChol: 250, hdl: 40, tg: 500 });
  assert.equal(r.friedewald, null);
  assert.equal(r.nih, 121);
  assert.match(r.note, /Friedewald is invalid/);
});

test('ldl low TG: TC 180, HDL 60, TG 100 -> Friedewald 100, NIH 102', () => {
  const r = ldlCalc({ totalChol: 180, hdl: 60, tg: 100 });
  assert.equal(r.friedewald, 100);
  assert.equal(r.nih, 102);
});

test('ldl boundary TG exactly 400: Friedewald null', () => {
  const r = ldlCalc({ totalChol: 220, hdl: 45, tg: 400 });
  assert.equal(r.friedewald, null);
  assert.ok(typeof r.nih === 'number');
});

test('ldl rejects impossible input', () => {
  assert.throws(() => ldlCalc({ totalChol: 200, hdl: 50, tg: 0 }), /tg/);
});
