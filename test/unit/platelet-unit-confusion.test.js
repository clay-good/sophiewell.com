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

// spec-v1178: the same report, the other analyte. An SI lab prints serum albumin
// in g/L: 40 g/L IS 4.0 g/dL. And the direction is fixed, which makes it worse
// than the platelet case -- higher albumin reads as healthier everywhere, so the
// wrong unit always lands on the favourable side:
//
//   albi-grade       "grade 1: the best preserved liver function"
//   nafld-fibrosis   "NFS < -1.455: excludes advanced fibrosis (F0-F2)"
//   stewart-sid-sig  "no excess unmeasured strong anions"
//
// albi-grade is the sharpest: it converts g/dL to g/L itself, one line after the
// guard, so the g/L figure was being multiplied by ten a second time.
test('an albumin in g/L is refused, and the conversion is named', async () => {
  const { albiGrade } = await import('../../lib/hep-v124.js');
  const { stewartSidSig } = await import('../../lib/acidbase-v129.js');
  const { nafldFibrosis } = await import('../../lib/hepgi-v93.js');

  const a = albiGrade({ albumin: 40, bilirubin: 1 });
  assert.equal(a.valid, false);
  assert.match(a.message, /40 g\/L is entered as 4\b/);
  assert.equal(albiGrade({ albumin: 4, bilirubin: 1 }).valid, true);

  const n = nafldFibrosis({ age: 55, bmi: 30, ifgDm: true, ast: 50, alt: 40, platelets: 200, albumin: 40 });
  assert.equal(n.valid, false);
  assert.match(n.band, /40 g\/L is entered as 4\b/);

  const base = {
    sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1.6, chloride: 100,
    lactate: 2, bicarbonate: 14, phosphate: 4,
  };
  const s = stewartSidSig({ ...base, albumin: 40 });
  assert.equal(s.valid, false);
  assert.match(s.message, /beyond recorded extremes/);
  assert.equal(stewartSidSig({ ...base, albumin: 4 }).valid, true);
});

test('a real hyperalbuminaemia is still inside the envelope', () => {
  // 5.5 g/dL is high and real (haemoconcentration); the bound is for the
  // impossible, not the unusual.
  assert.equal(BOUNDS.albumin.max, 7);
  assert.match(BOUNDS.albumin.note, /unit or entry error/);
});
