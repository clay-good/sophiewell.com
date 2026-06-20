// spec-v123 2.1: AIMS (Guy 1976, NIMH public domain). Seven movement items 0-4 ->
// movement total 0-28; probable-TD threshold = >= 2 in two or more areas, or >= 3
// in one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aimsTardive } from '../../lib/psych-v123.js';

test('no movements -> 0/28, below threshold', () => {
  const r = aimsTardive({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});

test('one mild item -> not the probable-TD threshold', () => {
  const r = aimsTardive({ face: '1' });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
});

test('>= 2 in two areas meets the probable-TD threshold', () => {
  const r = aimsTardive({ face: '2', jaw: '2', global: '2' });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /probable tardive dyskinesia/);
});

test('>= 3 in a single area meets the threshold', () => {
  const r = aimsTardive({ tongue: '3' });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
});

test('all seven items at max -> 28/28', () => {
  const r = aimsTardive({ face: '4', lips: '4', jaw: '4', tongue: '4', upper: '4', lower: '4', trunk: '4' });
  assert.equal(r.total, 28);
});

test('scalar / non-object fuzz arg yields a valid 0/28, never NaN', () => {
  const r = aimsTardive(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.total), true);
});
