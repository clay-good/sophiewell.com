// spec-v104 2.1: Brugada Criteria (VT vs SVT), 4 sequential steps (Brugada 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brugadaVt } from '../../lib/cardio-v104.js';

test('all steps negative -> SVT with aberrancy (defined verdict)', () => {
  const r = brugadaVt({});
  assert.equal(r.vt, false);
  assert.equal(r.verdict, 'SVT with aberrancy');
  assert.equal(r.firedStep, null);
});

test('step 1 positive -> VT, names step 1', () => {
  const r = brugadaVt({ absentRs: true });
  assert.equal(r.vt, true);
  assert.match(r.firedStep, /Step 1/);
});

test('first positive step wins: step 3 positive but step 1-2 negative names step 3', () => {
  const r = brugadaVt({ avDissociation: true });
  assert.equal(r.vt, true);
  assert.match(r.firedStep, /Step 3/);
});

test('step 4 alone positive -> VT', () => {
  const r = brugadaVt({ morphology: true });
  assert.equal(r.vt, true);
  assert.match(r.firedStep, /Step 4/);
});
