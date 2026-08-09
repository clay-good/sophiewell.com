// spec-v674: Onychomycosis Severity Index (OSI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { osiOnychomycosis } from '../../lib/osi-onychomycosis-v674.js';

test('formula: area x proximity + bonus', () => {
  const r = osiOnychomycosis({ area: '3', proximity: '4', bonus: false });
  assert.equal(r.product, 12);
  assert.equal(r.total, 12);
  assert.equal(r.category, 'moderate');
});

test('bonus adds exactly 10, once', () => {
  const r = osiOnychomycosis({ area: '3', proximity: '4', bonus: true });
  assert.equal(r.total, 22);
  assert.equal(r.category, 'severe');
});

test('area 0 gives total 0 (none) regardless of proximity', () => {
  const r = osiOnychomycosis({ area: '0', proximity: '5', bonus: false });
  assert.equal(r.total, 0);
  assert.equal(r.category, 'none');
  assert.equal(r.abnormal, false);
});

test('bands: 1-5 mild, 6-15 moderate, 16-35 severe', () => {
  assert.equal(osiOnychomycosis({ area: '1', proximity: '1' }).category, 'mild');   // 1
  assert.equal(osiOnychomycosis({ area: '1', proximity: '5' }).category, 'mild');   // 5
  assert.equal(osiOnychomycosis({ area: '2', proximity: '3' }).category, 'moderate'); // 6
  assert.equal(osiOnychomycosis({ area: '3', proximity: '5' }).category, 'moderate'); // 15
  assert.equal(osiOnychomycosis({ area: '4', proximity: '4' }).category, 'severe');  // 16
  assert.equal(osiOnychomycosis({ area: '5', proximity: '5', bonus: true }).total, 35); // max
});

test('abnormal flag set at moderate/severe (>= 6)', () => {
  assert.equal(osiOnychomycosis({ area: '1', proximity: '5' }).abnormal, false); // 5 mild
  assert.equal(osiOnychomycosis({ area: '2', proximity: '3' }).abnormal, true);  // 6 moderate
});

test('META example: area 3, proximity 4, no bonus -> 12/35 moderate', () => {
  const r = osiOnychomycosis({ area: '3', proximity: '4', bonus: false });
  assert.equal(r.total, 12);
  assert.match(r.band, /OSI 12\/35/);
  assert.match(r.band, /moderate/);
  assert.match(r.detail, /26-50%/);
});

test('inputs validated: area 0-5, proximity 1-5, integers', () => {
  assert.equal(osiOnychomycosis({}).valid, false);
  assert.equal(osiOnychomycosis({}).code, 'MISSING_INPUT');
  assert.equal(osiOnychomycosis({ area: '6', proximity: '1' }).field, 'area');
  assert.equal(osiOnychomycosis({ area: '1', proximity: '0' }).field, 'proximity');
  assert.equal(osiOnychomycosis({ area: '2.5', proximity: '1' }).valid, false);
});
