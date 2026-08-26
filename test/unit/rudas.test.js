// spec-v792: RUDAS (Rowland Universal Dementia Assessment Scale).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { rudas, MAX_TOTAL } from '../../lib/rudas-v792.js';

const MAXIMA = { memory: 8, bodyOrientation: 5, praxis: 2, drawing: 3, judgement: 4, language: 8 };
function fillMax() { return { ...MAXIMA }; }
function fillZero() {
  const o = {};
  for (const k of Object.keys(MAXIMA)) o[k] = 0;
  return o;
}

test('the six item maxima add to exactly 30', () => {
  assert.equal(MAX_TOTAL, 30);
  assert.equal(rudas(fillMax()).score, 30);
});

test('a perfect score is above the cut point and a zero score is below it', () => {
  assert.equal(rudas(fillMax()).abnormal, false);
  const zero = rudas(fillZero());
  assert.equal(zero.score, 0);
  assert.equal(zero.abnormal, true);
});

test('higher is better here, unlike the 6CIT: 22 is impaired and 23 is not', () => {
  const at22 = rudas({ memory: 6, bodyOrientation: 4, praxis: 2, drawing: 2, judgement: 3, language: 5 });
  assert.equal(at22.score, 22);
  assert.equal(at22.tier, 'possible-impairment');

  const at23 = rudas({ memory: 7, bodyOrientation: 4, praxis: 2, drawing: 2, judgement: 3, language: 5 });
  assert.equal(at23.score, 23);
  assert.equal(at23.tier, 'above-cutoff');
});

test('each item is capped at its OWN maximum, and they differ', () => {
  for (const [k, max] of Object.entries(MAXIMA)) {
    const over = rudas({ ...fillZero(), [k]: max + 1 });
    assert.equal(over.valid, false, k);
    assert.equal(over.field, k, k);
    assert.equal(rudas({ ...fillZero(), [k]: max }).valid, true, k);
  }
});

test('every item is required', () => {
  for (const k of Object.keys(MAXIMA)) {
    const o = fillMax();
    delete o[k];
    assert.equal(rudas(o).field, k, k);
  }
});
