// spec-v55 §2.1: Absolute Neutrophil Count + CTCAE neutropenia grade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anc } from '../../lib/clinical-v6.js';

test('anc normal: WBC 5, 60% segs, 5% bands -> 3250/uL', () => {
  const r = anc({ wbc: 5, segs: 60, bands: 5 });
  assert.equal(r.anc, 3250);
  assert.match(r.grade, /Normal/);
  assert.equal(r.precautions, false);
});

test('anc moderate: WBC 2, 40% segs, 5% bands -> 900/uL', () => {
  const r = anc({ wbc: 2, segs: 40, bands: 5 });
  assert.equal(r.anc, 900);
  assert.match(r.grade, /Moderate/);
});

test('anc severe: WBC 1, 30% segs, 0% bands -> 300/uL, precautions flagged', () => {
  const r = anc({ wbc: 1, segs: 30, bands: 0 });
  assert.equal(r.anc, 300);
  assert.match(r.grade, /Severe/);
  assert.equal(r.precautions, true);
});

test('anc boundary: exactly 500/uL is moderate (not severe)', () => {
  // WBC 1, 50% -> 1*50*10 = 500
  const r = anc({ wbc: 1, segs: 50, bands: 0 });
  assert.equal(r.anc, 500);
  assert.match(r.grade, /Moderate/);
  assert.equal(r.precautions, false);
});

test('anc rejects impossible input', () => {
  assert.throws(() => anc({ wbc: NaN, segs: 60, bands: 5 }), /wbc/);
  assert.throws(() => anc({ wbc: 5, segs: 80, bands: 30 }), /segs \+ bands/);
});

test('anc grades follow both CTCAE versions (spec-v1641 row 5)', () => {
  const g = (wbc, segs) => { const r = anc({ wbc, segs, bands: 0 }); return [r.anc, r.ctcaeV6, r.ctcaeV5]; };
  assert.deepEqual(g(2, 60), [1200, 1, 2]);
  assert.deepEqual(g(2, 40), [800, 2, 3]);
  assert.deepEqual(g(1, 30), [300, 3, 4]);
  assert.deepEqual(g(1, 5), [50, 4, 4]);
  assert.deepEqual(g(5, 60), [3000, null, null]);
  assert.doesNotMatch(anc({ wbc: 2, segs: 40, bands: 0 }).grade, /grade 2-3/);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: a white cell count past the 2000 envelope is refused', () => {
  // spec-v1763: bound widened (source in lib/bounds.js)
  // spec-v1764: lib/clinical-v6.js caps wbc at the envelope itself now, so 2000 is the top value it answers.
  assert.throws(() => anc({ wbc: 2001, segs: 60, bands: 5 }), /white blood cell count|wbc must be between/);
  assert.equal(anc({ wbc: 2000, segs: 60, bands: 5 }).anc, 1300000);
  assert.equal(anc({ wbc: 200, segs: 60, bands: 5 }).anc, 130000);
  assert.equal(anc({ wbc: 5, segs: 60, bands: 5 }).anc, 3250);
});
