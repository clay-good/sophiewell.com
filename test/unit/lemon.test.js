import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lemon } from '../../lib/scoring-v4.js';

test('lemon 0 of 7 (tile example; max 7 with 3-3-2 contributing up to 3) -> no predictors band', () => {
  const r = lemon({});
  assert.equal(r.score, 0);
  assert.equal(r.threeThreeTwo, 0);
  assert.match(r.band, /no predictors of difficult intubation per Reed 2005/);
});

test('lemon Mallampati alone -> 1 of 7', () => {
  const r = lemon({ mallampatiGte3: true });
  assert.equal(r.score, 1);
  assert.equal(r.threeThreeTwo, 0);
  assert.match(r.band, /1 predictor/);
});

test('lemon all 3-3-2 sub-failures -> 3-3-2 subtotal 3', () => {
  const r = lemon({ incisorLt3fb: true, hyoidMentalLt3fb: true, thyroidFloorLt2fb: true });
  assert.equal(r.score, 3);
  assert.equal(r.threeThreeTwo, 3);
});

test('lemon mixed 3-3-2 partial -> subtotal 2', () => {
  const r = lemon({ incisorLt3fb: true, hyoidMentalLt3fb: true });
  assert.equal(r.threeThreeTwo, 2);
  assert.equal(r.score, 2);
});

test('lemon 7 of 7 (all predictors) -> 7 predictors band', () => {
  const r = lemon({
    lookExternal: true, incisorLt3fb: true, hyoidMentalLt3fb: true,
    thyroidFloorLt2fb: true, mallampatiGte3: true, obstruction: true,
    neckMobilityLimited: true,
  });
  assert.equal(r.score, 7);
  assert.equal(r.threeThreeTwo, 3);
  assert.match(r.band, /7 predictors/);
});

test('lemon look + incisor + Mallampati + obstruction -> 4 of 7', () => {
  const r = lemon({ lookExternal: true, incisorLt3fb: true, mallampatiGte3: true, obstruction: true });
  assert.equal(r.score, 4);
  assert.equal(r.threeThreeTwo, 1);
});
