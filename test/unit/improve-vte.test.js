import { test } from 'node:test';
import assert from 'node:assert/strict';
import { improveVte } from '../../lib/scoring-v4.js';

test('improve-vte 0 (tile example) -> low VTE risk, no prophylaxis routinely indicated', () => {
  const r = improveVte({});
  assert.equal(r.score, 0);
  assert.match(r.band, /low VTE risk per Spyropoulos 2011/);
});

test('improve-vte 1 (age >60 alone) -> low (below cutoff 2)', () => {
  const r = improveVte({ ageGt60: true });
  assert.equal(r.score, 1);
  assert.match(r.band, /low VTE risk/);
});

test('improve-vte 2 (active cancer alone) -> inpatient prophylaxis band', () => {
  const r = improveVte({ currentCancer: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /inpatient VTE prophylaxis per Spyropoulos 2011/);
});

test('improve-vte 4 (prior VTE + age >60) -> extended-duration band', () => {
  const r = improveVte({ priorVte: true, ageGt60: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /extended-duration post-discharge VTE prophylaxis/);
});

test('improve-vte 12 (all criteria) -> extended-duration band', () => {
  const r = improveVte({
    priorVte: true, thrombophilia: true, lowerLimbParalysis: true,
    currentCancer: true, immobilized7d: true, icuCcuStay: true, ageGt60: true,
  });
  assert.equal(r.score, 12);
  assert.match(r.band, /extended-duration/);
});
