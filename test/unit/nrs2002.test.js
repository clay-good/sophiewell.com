import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nrs2002 } from '../../lib/scoring-v4.js';

test('nrs2002 low: 1 + 1 + age<70 -> 2 (not at risk)', () => {
  const r = nrs2002({ severityOfDisease: 1, nutritionalStatus: 1, ageGe70: false });
  assert.equal(r.score, 2);
  assert.equal(r.atRisk, false);
});

test('nrs2002 threshold 3 -> at risk', () => {
  const r = nrs2002({ severityOfDisease: 1, nutritionalStatus: 1, ageGe70: true });
  assert.equal(r.score, 3);
  assert.equal(r.atRisk, true);
});

test('nrs2002 high 7 (maximum)', () => {
  const r = nrs2002({ severityOfDisease: 3, nutritionalStatus: 3, ageGe70: true });
  assert.equal(r.score, 7);
});

test('nrs2002 clamps severity / nutritional inputs to 0-3', () => {
  const r = nrs2002({ severityOfDisease: 99, nutritionalStatus: -1, ageGe70: false });
  assert.equal(r.parts.severity, 3);
  assert.equal(r.parts.nutritionalStatus, 0);
});
