import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dashVte } from '../../lib/scoring-v4.js';

test('dash-vte 0 (tile example) -> low band 3.1%/yr', () => {
  const r = dashVte({});
  assert.equal(r.score, 0);
  assert.match(r.band, /low annual VTE-recurrence risk 3\.1%/);
});

test('dash-vte 1 (age <50 alone) -> low band (upper edge of <=1)', () => {
  const r = dashVte({ ageLt50: true });
  assert.equal(r.score, 1);
  assert.match(r.band, /low annual VTE-recurrence risk 3\.1%/);
});

test('dash-vte 2 (D-dimer abnormal alone) -> intermediate band 6.4%/yr', () => {
  const r = dashVte({ dDimerAbnormal: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /intermediate annual VTE-recurrence risk 6\.4%/);
});

test('dash-vte 3 (D-dimer + male) -> high band 12.3%/yr', () => {
  const r = dashVte({ dDimerAbnormal: true, male: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /high annual VTE-recurrence risk 12\.3%/);
});

test('dash-vte -2 (woman with hormone use only) -> low band (negative score)', () => {
  const r = dashVte({ hormoneUseAtInitialVteInWoman: true });
  assert.equal(r.score, -2);
  assert.match(r.band, /low annual VTE-recurrence risk 3\.1%/);
});

test('dash-vte 4 (every positive factor, no hormone) -> high band', () => {
  const r = dashVte({ dDimerAbnormal: true, ageLt50: true, male: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /high/);
});
