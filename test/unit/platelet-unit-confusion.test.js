// spec-v1174: the x1000 unit confusion, where it turns into a rule-out.
//
// A US lab report prints a platelet count as "150,000/uL". Every platelet field
// in this catalog wants it as 150 -- x10^9/L, which IS x10^3/uL, the same
// number. That is not a transposed digit or a typo: it is the figure the reader
// is copying, in the form the report gives it.
//
// In the five fibrosis scores below platelets sit in the DENOMINATOR (or carry a
// negative coefficient), so the wrong-unit figure drives the score toward zero
// -- which is toward the REASSURING band. Entered as the report reads it, each
// of these answered:
//
//   fib4            "FIB-4 <1.45: rules out advanced fibrosis (NPV 90%)"
//   apri            "APRI <=0.7: below the Wai 2003 significant-fibrosis cutoff"
//   nafld-fibrosis  "NFS -2596.66: excludes advanced fibrosis (F0-F2)"
//   forns-index     "significant fibrosis is ruled out (NPV about 96%)"
//   lok-index       "cirrhosis is ruled out"
//
// The ceiling is BOUNDS.platelets, which lib/bounds.js has carried since
// spec-v53 with its own source note; no clinical number is invented here.
import test from 'node:test';
import assert from 'node:assert/strict';

import { BOUNDS } from '../../lib/bounds.js';
import { fib4, apri } from '../../lib/clinical-v4.js';
import { fornsIndex, lokIndex } from '../../lib/hep-v124.js';
import { nafldFibrosis } from '../../lib/hepgi-v93.js';

const REPORT = 150_000; // what the lab report says
const FIELD = 150; // what the field wants

test('the ceiling is the one lib/bounds.js already declared', () => {
  assert.equal(BOUNDS.platelets.max, 2000);
  assert.match(BOUNDS.platelets.note, /beyond recorded extremes/);
});

test('fib4 and apri refuse the report figure and name the conversion', () => {
  assert.throws(() => fib4({ ageYears: 55, ast: 60, alt: 40, plateletsK: REPORT }),
    /above ~2000.*entered as 150\./s);
  assert.throws(() => apri({ ast: 60, astUln: 40, plateletsK: REPORT }),
    /entered as 150\./);
  // and still answer the figure the field asks for
  assert.equal(typeof fib4({ ageYears: 55, ast: 60, alt: 40, plateletsK: FIELD }).score, 'number');
  assert.equal(typeof apri({ ast: 60, astUln: 40, plateletsK: FIELD }).score, 'number');
});

test('forns and lok refuse it rather than ruling fibrosis out', () => {
  const f = fornsIndex({ age: 30, ggt: 20, platelets: 280_000, cholesterol: 220 });
  assert.equal(f.valid, false);
  assert.match(f.message, /entered as 280\./);
  assert.equal(fornsIndex({ age: 30, ggt: 20, platelets: 280, cholesterol: 220 }).valid, true);

  const l = lokIndex({ platelets: 120_000, ast: 50, alt: 50, inr: 1.1 });
  assert.equal(l.valid, false);
  assert.match(l.message, /entered as 120\./);
  assert.equal(lokIndex({ platelets: 120, ast: 50, alt: 50, inr: 1.1 }).valid, true);
});

test('nafld-fibrosis refuses instead of printing NFS -2596.66', () => {
  const base = { age: 55, bmi: 30, ifgDm: true, ast: 50, alt: 40, albumin: 4 };
  const bad = nafldFibrosis({ ...base, platelets: 200_000 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /entered as 200\./);
  const ok = nafldFibrosis({ ...base, platelets: 200 });
  assert.equal(ok.valid, true);
});

test('a real thrombocytosis is still inside the envelope', () => {
  // 1200 x10^9/L is extreme reactive thrombocytosis and a real reading; the
  // bound is for the frankly impossible, not the unusual.
  assert.equal(lokIndex({ platelets: 1200, ast: 50, alt: 50, inr: 1.1 }).valid, true);
  assert.equal(typeof fib4({ ageYears: 55, ast: 60, alt: 40, plateletsK: 1200 }).score, 'number');
});
