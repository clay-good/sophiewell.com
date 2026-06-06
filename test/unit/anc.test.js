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
