// spec-v93 §2.2: modified Glasgow (Imrie) pancreatitis severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glasgowImrie } from '../../lib/hepgi-v93.js';

test('worked example: 4 of 8 met -> 4 (severe, >= 3)', () => {
  const r = glasgowImrie({ pao2: 55, age: 60, wbc: 12, calcium: 2.2, urea: 20, ldh: 500, albumin: 35, glucose: 12 });
  assert.equal(r.total, 4);
  assert.equal(r.scored, 8);
  assert.equal(r.severe, true);
});

test('threshold: 2 = not severe, 3 = severe', () => {
  const two = glasgowImrie({ age: 60, urea: 20 });
  assert.equal(two.total, 2);
  assert.equal(two.severe, false);
  const three = glasgowImrie({ age: 60, urea: 20, glucose: 12 });
  assert.equal(three.total, 3);
  assert.equal(three.severe, true);
});

test('blank item is not assessed, not scored as zero', () => {
  // Only two items entered; partial panel reports 2 of 8 assessed.
  const r = glasgowImrie({ age: 60, glucose: 12 });
  assert.equal(r.scored, 2);
  assert.equal(r.total, 2);
  assert.match(r.band, /2 of 8 items assessed \(partial 48-hour panel\)/);
});

test('all eight items met -> 8', () => {
  const r = glasgowImrie({ pao2: 55, age: 60, wbc: 18, calcium: 1.8, urea: 20, ldh: 700, albumin: 30, glucose: 12 });
  assert.equal(r.total, 8);
  assert.equal(r.scored, 8);
});

test('no items entered returns a surfaced guard', () => {
  assert.equal(glasgowImrie({}).valid, false);
});
