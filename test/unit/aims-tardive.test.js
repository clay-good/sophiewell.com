// spec-v123 2.1: AIMS (Guy 1976, NIMH public domain). Seven movement items 0-4 ->
// movement total 0-28; probable-TD threshold = >= 2 in two or more areas, or >= 3
// in one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aimsTardive } from '../../lib/psych-v123.js';

// spec-v1110: a completed examination, with the areas under test overridden.
// The two below-threshold assertions used to rate nothing or one area and read
// the rest as findings of "none", which is the defect that wave fixed.
const examined = (o = {}) => ({
  face: '0', lips: '0', jaw: '0', tongue: '0', upper: '0', lower: '0', trunk: '0', global: '0', ...o,
});

test('no movements -> 0/28, below threshold', () => {
  const r = aimsTardive(examined());
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});

test('one mild item -> not the probable-TD threshold', () => {
  const r = aimsTardive(examined({ face: '1' }));
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
  assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
});

// --- spec-v1110: an unrated body area is not an area found still ---

test('spec-v1110: an unperformed examination is not below the threshold', () => {
  const r = aimsTardive({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.unrated.length, 7);
  assert.equal(r.floorOnly, true);
  assert.equal(r.global, null);
  assert.match(r.band, /at least 0\/28/);
  assert.match(r.band, /global severity not rated/);
  assert.match(r.band, /scored from 0 of the 7 body areas/);
  assert.doesNotMatch(r.band, /below the commonly cited/);
  // The counted line used to assert the examination.
  assert.doesNotMatch(r.counted, /no abnormal movements/);
  assert.match(r.counted, /Not rated: /);
});

test('spec-v1110: probable TD rules in from a subset', () => {
  // Rule 13: the threshold is monotone in the ratings, so an unrated area can
  // only bring it closer -- a tongue at 3 already meets it.
  const r = aimsTardive({ tongue: '3' });
  assert.equal(r.abnormal, true);
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /probable tardive dyskinesia/);
});

test('spec-v1110: one unrated area is enough to hold back the reassuring reading', () => {
  const partial = examined();
  delete partial.trunk;
  const r = aimsTardive(partial);
  assert.deepEqual(r.unrated, ['neck, shoulders, hips']);
  assert.equal(r.floorOnly, true);
  assert.doesNotMatch(r.band, /below the commonly cited/);
});
