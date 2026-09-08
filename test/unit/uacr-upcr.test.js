// spec-v92 §2.2: spot urine albumin/protein-to-creatinine ratios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uacrUpcr } from '../../lib/nephro-v92.js';

test('worked example: albumin 30 mg/dL, urine Cr 100 mg/dL -> UACR 300 (A2)', () => {
  const r = uacrUpcr({ albumin: 30, urineCr: 100 });
  assert.equal(r.uacr, 300);
  assert.equal(r.aStage, 'A2');
  assert.equal(r.albuminExcretion, 300);
  assert.match(r.band, /UACR 300 mg\/g \(A2\)/);
});

test('urine creatinine 0 or blank is a surfaced fallback, never NaN/Infinity', () => {
  assert.equal(uacrUpcr({ albumin: 30, urineCr: 0 }).valid, false);
  assert.equal(uacrUpcr({ albumin: 30 }).valid, false);
});

test('mg/L unit toggle agrees with mg/dL (1 mg/dL = 10 mg/L)', () => {
  // 300 mg/L = 30 mg/dL -> same UACR as the worked example
  assert.equal(uacrUpcr({ albumin: 300, albuminUnit: 'mg/L', urineCr: 100 }).uacr, 300);
});

test('A-stage band edge agrees with ckd-staging (< 30 = A1)', () => {
  assert.equal(uacrUpcr({ albumin: 2.99, urineCr: 100 }).aStage, 'A1'); // 29.9 mg/g
  assert.equal(uacrUpcr({ albumin: 3.001, urineCr: 100 }).aStage, 'A2'); // 30.01 mg/g
});

test('protein yields UPCR independently of albumin', () => {
  const r = uacrUpcr({ protein: 50, urineCr: 100 });
  assert.equal(r.upcr, 500);
  assert.equal(r.uacr, undefined);
  assert.equal(r.valid, true);
});

test('spec-v1133: the reading names the albumin unit it used', () => {
  // The two urine albumin units are a factor of ten apart, so the same number
  // was reported as A3 (severely increased albuminuria) or A2 depending on a
  // parameter the answer never named. mg/dL stays the default; it is no longer
  // silent.
  const assumed = uacrUpcr({ albumin: 300, urineCr: 100 });
  assert.equal(assumed.albuminUnitStated, false);
  assert.equal(assumed.albuminUnit, 'mg/dL');
  assert.match(assumed.band, /reading the albumin as mg\/dL/);
  assert.match(assumed.band, /no unit given; mg\/L would be a tenth of this/);

  // Stated, the tile says which unit and drops the caveat.
  const stated = uacrUpcr({ albumin: 300, urineCr: 100, albuminUnit: 'mg/dL' });
  assert.equal(stated.albuminUnitStated, true);
  assert.match(stated.band, /reading the albumin as mg\/dL/);
  assert.doesNotMatch(stated.band, /no unit given/);

  // And the unit still does what it always did: a tenth of the ratio.
  const mgl = uacrUpcr({ albumin: 300, urineCr: 100, albuminUnit: 'mg/L' });
  assert.equal(mgl.uacr, 300);
  assert.equal(mgl.aStage, 'A2');
  assert.equal(assumed.uacr, 3000);
  assert.equal(assumed.aStage, 'A3');
});

test('spec-v1133: only a unit the tile knows is echoed back', () => {
  // The first version printed the caller's string, so `albuminUnit: NaN` reached
  // the reader as "reading the albumin as NaN". The spec-v53 fuzz harness caught
  // it. An unrecognised unit is treated exactly as an absent one.
  for (const junk of [NaN, {}, '<script>', 42, 'mg/decilitre']) {
    const r = uacrUpcr({ albumin: 300, urineCr: 100, albuminUnit: junk });
    assert.equal(r.albuminUnitStated, false, `${String(junk)} counted as stated`);
    assert.match(r.band, /reading the albumin as mg\/dL \(no unit given/);
    assert.equal(r.uacr, 3000);
  }
  // Case is not what makes a unit unknown.
  assert.equal(uacrUpcr({ albumin: 300, urineCr: 100, albuminUnit: 'MG/L' }).uacr, 300);
});
