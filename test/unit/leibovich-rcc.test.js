// spec-v279: worked examples for the Leibovich progression score (2003, clear-cell
// RCC). Point table spec-v97 cross-verified: pT1a 0 / pT1b +2 / pT2 +3 / pT3-pT4 +4;
// pN1/pN2 +2 (the only value consistent with the documented 0-11 maximum, corroborated
// by the SORCE external validation); size >= 10 cm +1; grade 3 +1 / grade 4 +3;
// necrosis +1. Bands: low 0-2, intermediate 3-5, high >= 6.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leibovichRcc } from '../../lib/rcc-prognosis-v279.js';

test('leibovich-rcc: low-risk pT1a case (score 0)', () => {
  const r = leibovichRcc({ ptStage: 'pt1a', nodes: 'n0', size: 'lt10', grade: 'g1-2' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.band, 'low');
  assert.equal(r.abnormal, false);
  assert.ok(r.detail.includes('~97%'));
});

test('leibovich-rcc: 3/6 band edges are exact', () => {
  // 2 -> low (pT1b); 3 -> intermediate (pT2); 5 -> intermediate; 6 -> high.
  assert.equal(leibovichRcc({ ptStage: 'pt1b', nodes: 'n0', size: 'lt10', grade: 'g1-2' }).band, 'low'); // 2
  assert.equal(leibovichRcc({ ptStage: 'pt2', nodes: 'n0', size: 'lt10', grade: 'g1-2' }).band, 'intermediate'); // 3
  assert.equal(leibovichRcc({ ptStage: 'pt2', nodes: 'n0', size: 'lt10', grade: 'g3', necrosis: true }).band, 'intermediate'); // 5
  assert.equal(leibovichRcc({ ptStage: 'pt3-4', nodes: 'n0', size: 'lt10', grade: 'g3', necrosis: true }).band, 'high'); // 6
});

test('leibovich-rcc: high-risk grade-4 + necrosis case (tile example, score 8)', () => {
  const r = leibovichRcc({ ptStage: 'pt3-4', nodes: 'n0', size: 'lt10', grade: 'g4', necrosis: true });
  assert.equal(r.score, 8);
  assert.equal(r.band, 'high');
  assert.ok(r.detail.includes('Leibovich progression score 8/11'));
  assert.ok(r.detail.includes('~31%'));
});

test('leibovich-rcc: maximum score is 11 (pN1/pN2 = 2 closes the range)', () => {
  const r = leibovichRcc({ ptStage: 'pt3-4', nodes: 'n1-2', size: 'ge10', grade: 'g4', necrosis: true });
  assert.equal(r.score, 11);
  assert.equal(r.band, 'high');
});

test('leibovich-rcc: missing selections are invalid (no NaN)', () => {
  assert.equal(leibovichRcc({ ptStage: 'pt1a' }).valid, false);
  assert.equal(leibovichRcc({}).valid, false);
  assert.equal(leibovichRcc().valid, false);
});
