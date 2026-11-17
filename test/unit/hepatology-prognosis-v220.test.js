// spec-v220: worked examples for the hepatology prognosis & fibrosis instruments.
// Formulas spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fips, albiPlt, damicoStage, amap, nacseldAclf, fibroq,
} from '../../lib/hepatology-prognosis-v220.js';

test('fips: high-risk example', () => {
  const r = fips({ bilirubin: 3.0, creatinine: 1.2, age: 60, albumin: 3.0 });
  assert.equal(r.value, 1.2);
  assert.equal(r.abnormal, true);
});
test('fips: invalid on zero creatinine', () => { assert.equal(fips({ bilirubin: 2, creatinine: 0, age: 60, albumin: 3 }).valid, false); });

test('albi-plt: elevated score', () => {
  const r = albiPlt({ bilirubin: 20, albumin: 40, platelets: 120 });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
});
test('albi-plt: score of 2 is very low risk', () => {
  const r = albiPlt({ bilirubin: 15, albumin: 45, platelets: 200 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('damico: staging by findings', () => {
  assert.equal(damicoStage({}).stage, 1);
  assert.equal(damicoStage({ varices: true }).stage, 2);
  assert.equal(damicoStage({ ascites: true }).stage, 3);
  assert.equal(damicoStage({ bleeding: true, varices: true }).stage, 4);
});

test('amap: high band', () => {
  const r = amap({ age: 60, bilirubin: 20, albumin: 40, platelets: 150, male: true });
  assert.equal(r.value, 62.1);
  assert.match(r.band, /high/);
});
test('amap: low band for younger female with high platelets', () => {
  const r = amap({ age: 30, bilirubin: 10, albumin: 45, platelets: 300, male: false });
  assert.ok(r.value < 50);
  assert.equal(r.abnormal, false);
});

test('nacseld: >= 2 is ACLF', () => {
  const r = nacseldAclf({ circulatory: true, renal: true });
  assert.equal(r.count, 2);
  assert.equal(r.aclf, true);
});
test('nacseld: 0 failures not ACLF', () => {
  const r = nacseldAclf({});
  assert.equal(r.count, 0);
  assert.equal(r.abnormal, false);
});

test('fibroq: formula and cutoff', () => {
  const r = fibroq({ age: 50, ast: 80, inr: 1.2, alt: 40, platelets: 150 });
  assert.equal(r.value, 8);
  assert.equal(r.abnormal, true);
});
test('fibroq: below cutoff', () => {
  const r = fibroq({ age: 30, ast: 20, inr: 1.0, alt: 40, platelets: 250 });
  assert.ok(r.value <= 1.6);
  assert.equal(r.abnormal, false);
});
test('fibroq: invalid on zero platelets', () => { assert.equal(fibroq({ age: 50, ast: 80, inr: 1.2, alt: 40, platelets: 0 }).valid, false); });

// spec-v1753: an envelope lib/bounds.js already declares; each tool refused ten times the ceiling but answered just past it.
test('spec-v1753: albiPlt refuses platelets past the 2000 x10^9/L envelope', () => {
  const r = albiPlt({ bilirubin: 20, albumin: 40, platelets: 3000 });
  assert.equal(r.valid, false);
  assert.match(r.message, /platelet count/);
  assert.equal(albiPlt({ bilirubin: 20, albumin: 40, platelets: 2000 }).valid, true);
  assert.equal(albiPlt({ bilirubin: 20, albumin: 40, platelets: 120 }).score, 4);
});
test('spec-v1753: fibroq refuses AST, ALT, or platelets past their envelopes', () => {
  const base = { age: 50, ast: 80, inr: 1.2, alt: 40, platelets: 150 };
  for (const over of [{ ast: 45000 }, { alt: 45000 }, { platelets: 3000 }]) {
    assert.equal(fibroq({ ...base, ...over }).valid, false, JSON.stringify(over));
  }
  assert.equal(fibroq({ ...base, ast: 30000, alt: 30000, platelets: 2000 }).valid, true);
  assert.equal(fibroq(base).value, 8);
});
test('spec-v1753: fips refuses bilirubin past 60 or creatinine past 25 mg/dL', () => {
  const base = { bilirubin: 3.0, creatinine: 1.2, age: 60, albumin: 3.0 };
  assert.match(fips({ ...base, bilirubin: 90 }).message, /total bilirubin/);
  assert.match(fips({ ...base, creatinine: 37.5 }).message, /serum creatinine/);
  assert.equal(fips({ ...base, bilirubin: 60, creatinine: 25 }).valid, true);
  assert.equal(fips(base).value, 1.2);
});
