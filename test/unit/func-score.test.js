// spec-v206 2.3: FUNC score worked examples. ICH volume 0/2/4 + age 0/1/2 +
// location 0/1/2 + GCS 0/2 + cognitive 0/1; total 0-11. Weights spec-v97
// cross-verified (Rost 2008 + MDCalc/Medscape/QxMD implementations).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { funcScore as func } from '../../lib/tbi-stroke-v206.js';

test('maximum score 11 -> high probability of independence (worked example)', () => {
  const r = func({ ichVolume: 20, age: 60, location: 'lobar', gcs: 14, cognitiveImpairment: false });
  assert.equal(r.valid, true);
  assert.equal(r.score, 11); // 4 + 2 + 2 + 2 + 1
  assert.equal(r.abnormal, false);
  assert.match(r.band, />\s*80%/);
});

test('minimum score 0 -> ~0% independence (very poor)', () => {
  const r = func({ ichVolume: 70, age: 82, location: 'infratentorial', gcs: 6, cognitiveImpairment: true });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /0%/);
});

test('ICH volume bands: <30 -> 4, 30-60 -> 2, >60 -> 0', () => {
  const base = { age: 60, location: 'lobar', gcs: 14, cognitiveImpairment: false }; // 2+2+2+1 = 7 baseline
  assert.equal(func({ ...base, ichVolume: 29 }).score, 11);
  assert.equal(func({ ...base, ichVolume: 45 }).score, 9);
  assert.equal(func({ ...base, ichVolume: 61 }).score, 7);
});

test('GCS threshold at 9', () => {
  const base = { ichVolume: 20, age: 60, location: 'lobar', cognitiveImpairment: false };
  assert.equal(func({ ...base, gcs: 9 }).score, 11);
  assert.equal(func({ ...base, gcs: 8 }).score, 9);
});

test('cognitive impairment removes the +1', () => {
  const base = { ichVolume: 20, age: 60, location: 'lobar', gcs: 14 };
  assert.equal(func({ ...base, cognitiveImpairment: false }).score, 11);
  assert.equal(func({ ...base, cognitiveImpairment: true }).score, 10);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = func({ ichVolume: 20, age: 60 });
  assert.equal(r.valid, false);
});
