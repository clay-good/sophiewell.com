import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atriaBleeding } from '../../lib/scoring-v4.js';

test('atria-bleeding 0 of 10 (tile example) -> low risk 0.8%/yr', () => {
  const r = atriaBleeding({});
  assert.equal(r.score, 0);
  assert.match(r.band, /low annual major-bleed risk 0\.8% per Fang 2011/);
});

test('atria-bleeding 4 of 10 -> intermediate band 2.6%/yr', () => {
  const r = atriaBleeding({ severeRenalDisease: true, hypertension: true });
  // severeRenalDisease (3) + hypertension (1) = 4
  assert.equal(r.score, 4);
  assert.match(r.band, /intermediate annual major-bleed risk 2\.6%/);
});

test('atria-bleeding 5 of 10 boundary -> high band', () => {
  const r = atriaBleeding({ anemia: true, ageGte75: true });
  // anemia (3) + ageGte75 (2) = 5
  assert.equal(r.score, 5);
  assert.match(r.band, /high annual major-bleed risk 5\.8%/);
});

test('atria-bleeding 10 of 10 (all criteria) -> high band', () => {
  const r = atriaBleeding({
    anemia: true, severeRenalDisease: true, ageGte75: true,
    priorBleeding: true, hypertension: true,
  });
  assert.equal(r.score, 10);
  assert.match(r.band, /high annual major-bleed risk 5\.8%/);
});

test('atria-bleeding 3 of 10 upper edge of low band -> low band', () => {
  const r = atriaBleeding({ anemia: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /low annual major-bleed risk 0\.8%/);
});
