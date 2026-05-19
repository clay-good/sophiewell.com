import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hemorr2hages } from '../../lib/scoring-v4.js';

test('hemorr2hages 0 of 12 (tile example) -> 1.9 bleeds per 100 patient-years', () => {
  const r = hemorr2hages({});
  assert.equal(r.score, 0);
  assert.match(r.band, /1\.9 bleeds per 100 patient-years per Gage 2006/);
});

test('hemorr2hages rebleeding alone (2) -> score 2, 5.3 per 100 PY', () => {
  const r = hemorr2hages({ rebleeding: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /5\.3 bleeds per 100 patient-years/);
});

test('hemorr2hages 3 of 12 -> 8.4 per 100 PY', () => {
  const r = hemorr2hages({ olderGt75: true, reducedPlatelets: true, uncontrolledHtn: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /8\.4 bleeds per 100 patient-years/);
});

test('hemorr2hages 4 of 12 (rebleeding + age + anemia) -> 10.4 per 100 PY', () => {
  const r = hemorr2hages({ rebleeding: true, olderGt75: true, anemia: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /10\.4 bleeds per 100 patient-years/);
});

test('hemorr2hages >=5 score caps at 12.3 per 100 PY', () => {
  const r = hemorr2hages({
    rebleeding: true, olderGt75: true, anemia: true,
    hepaticOrRenal: true, stroke: true,
  });
  assert.equal(r.score, 6);
  assert.match(r.band, /12\.3 bleeds per 100 patient-years/);
});

test('hemorr2hages 12 of 12 (all criteria) -> 12.3 per 100 PY', () => {
  const r = hemorr2hages({
    hepaticOrRenal: true, ethanolAbuse: true, malignancy: true,
    olderGt75: true, reducedPlatelets: true, rebleeding: true,
    uncontrolledHtn: true, anemia: true, geneticFactors: true,
    fallRisk: true, stroke: true,
  });
  assert.equal(r.score, 12);
  assert.match(r.band, /12\.3 bleeds per 100 patient-years/);
});
