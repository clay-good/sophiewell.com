import { test } from 'node:test';
import assert from 'node:assert/strict';
import { herdoo2 } from '../../lib/scoring-v4.js';

test('herdoo2 0 of 4 (tile example) -> safe to discontinue', () => {
  const r = herdoo2({});
  assert.equal(r.score, 0);
  assert.equal(r.canDiscontinue, true);
  assert.match(r.band, /safe to discontinue anticoagulation per Rodger 2017/);
});

test('herdoo2 1 of 4 (leg signs alone) -> safe to discontinue (upper edge of 0-1)', () => {
  const r = herdoo2({ legSignsPostThrombotic: true });
  assert.equal(r.score, 1);
  assert.equal(r.canDiscontinue, true);
});

test('herdoo2 2 of 4 (legs + D-dimer) -> continue anticoagulation', () => {
  const r = herdoo2({ legSignsPostThrombotic: true, dDimerGte250OnAnticoag: true });
  assert.equal(r.score, 2);
  assert.equal(r.canDiscontinue, false);
  assert.match(r.band, /continue anticoagulation per Rodger 2017/);
});

test('herdoo2 4 of 4 (all) -> continue', () => {
  const r = herdoo2({
    legSignsPostThrombotic: true, dDimerGte250OnAnticoag: true,
    bmiGte30: true, ageGte65: true,
  });
  assert.equal(r.score, 4);
  assert.equal(r.canDiscontinue, false);
});
