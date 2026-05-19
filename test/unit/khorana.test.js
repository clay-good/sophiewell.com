import { test } from 'node:test';
import assert from 'node:assert/strict';
import { khorana } from '../../lib/scoring-v4.js';

test('khorana 0 of 6 (tile example) -> low band 0.3%', () => {
  const r = khorana({ cancerSiteRisk: 'other' });
  assert.equal(r.score, 0);
  assert.match(r.band, /low 2\.5-month VTE risk 0\.3%/);
});

test('khorana 1 of 6 (high-risk cancer alone) -> intermediate band 2.0%', () => {
  const r = khorana({ cancerSiteRisk: 'high' });
  assert.equal(r.score, 1);
  assert.match(r.band, /intermediate 2\.5-month VTE risk 2\.0%/);
});

test('khorana 2 of 6 (very-high cancer alone) -> intermediate band', () => {
  const r = khorana({ cancerSiteRisk: 'very-high' });
  assert.equal(r.score, 2);
  assert.match(r.band, /intermediate/);
});

test('khorana 3 of 6 boundary (very-high + platelet) -> high band 6.7%', () => {
  const r = khorana({ cancerSiteRisk: 'very-high', plateletGte350: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /high 2\.5-month VTE risk 6\.7%/);
});

test('khorana 6 of 6 (all max) -> high band', () => {
  const r = khorana({
    cancerSiteRisk: 'very-high', plateletGte350: true, hbLt10OrEsa: true,
    wbcGt11: true, bmiGte35: true,
  });
  assert.equal(r.score, 6);
  assert.match(r.band, /high/);
});

test('khorana unknown cancer-site string contributes 0', () => {
  const r = khorana({ cancerSiteRisk: 'unknown', plateletGte350: true });
  assert.equal(r.score, 1);
});
