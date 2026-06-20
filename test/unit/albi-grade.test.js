// spec-v124 2.1: ALBI grade (Johnson 2015). ALBI = log10(bili umol/L)*0.66 +
// albumin g/L*-0.085; grade 1 <=-2.60, 2 (-2.60,-1.39], 3 >-1.39. Inputs g/dL, mg/dL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { albiGrade } from '../../lib/hep-v124.js';

test('worked example -> grade 2', () => {
  const r = albiGrade({ albumin: 3.5, bilirubin: 1.0 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 2);
  assert.equal(r.score, -2.16);
});

test('preserved function -> grade 1 (not flagged)', () => {
  const r = albiGrade({ albumin: 4.5, bilirubin: 0.6 });
  assert.equal(r.grade, 1);
  assert.equal(r.abnormal, false);
});

test('poor function -> grade 3 (flagged)', () => {
  const r = albiGrade({ albumin: 2.0, bilirubin: 5.0 });
  assert.equal(r.grade, 3);
  assert.equal(r.abnormal, true);
});

test('non-positive / missing inputs -> valid:false', () => {
  assert.equal(albiGrade({ albumin: 0, bilirubin: 1 }).valid, false);
  assert.equal(albiGrade({ albumin: 3.5 }).valid, false);
  assert.equal(albiGrade(9).valid, false);
});
