// spec-v205 2.2: ADO index worked examples. Age band 0-5, mMRC 0-3, FEV1 0-2;
// total 0-10. Point map spec-v97 cross-verified (PMC8999166 reproduction of the
// Puhan 2009 table).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adoIndex as ado } from '../../lib/pulm-copd-v205.js';

test('high-risk worked example (ADO 7)', () => {
  const r = ado({ age: 72, mmrc: '3', fev1: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 7); // age 70-79 (3) + mMRC 3 (2) + FEV1<=35 (2)
  assert.equal(r.abnormal, true);
  assert.match(r.band, /highest-risk/);
});

test('low-risk case (ADO 1)', () => {
  const r = ado({ age: 55, mmrc: '1', fev1: 70 });
  assert.equal(r.score, 1); // age 50-59 (1) + mMRC 0-1 (0) + FEV1>=65 (0)
  assert.equal(r.abnormal, false);
});

test('mid case (ADO 4)', () => {
  const r = ado({ age: 65, mmrc: '2', fev1: 50 });
  assert.equal(r.score, 4); // 2 + 1 + 1
});

test('age bands step every decade', () => {
  const base = { mmrc: '0', fev1: 70 };
  assert.equal(ado({ ...base, age: 49 }).score, 0);
  assert.equal(ado({ ...base, age: 50 }).score, 1);
  assert.equal(ado({ ...base, age: 90 }).score, 5);
});

test('FEV1 bands: >=65 -> 0, 36-64 -> 1, <=35 -> 2', () => {
  const base = { age: 45, mmrc: '0' };
  assert.equal(ado({ ...base, fev1: 65 }).score, 0);
  assert.equal(ado({ ...base, fev1: 50 }).score, 1);
  assert.equal(ado({ ...base, fev1: 35 }).score, 2);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = ado({ age: 70 });
  assert.equal(r.valid, false);
});
