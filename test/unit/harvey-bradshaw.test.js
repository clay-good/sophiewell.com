// spec-v93 §2.4: Harvey-Bradshaw Index (Crohn's disease activity).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { harveyBradshaw } from '../../lib/hepgi-v93.js';

test('worked example: 2 + 2 + 4 + 1 + 1 = 10 (moderate)', () => {
  const r = harveyBradshaw({ wellbeing: 2, pain: 2, stools: 4, mass: 1, complications: 1 });
  assert.equal(r.total, 10);
  assert.equal(r.bandKey, 'moderate');
});

test('band edges: < 5 remission, 5 mild, 8 moderate, 17 severe', () => {
  assert.equal(harveyBradshaw({ wellbeing: 1, pain: 1, stools: 2 }).bandKey, 'remission'); // 4
  assert.equal(harveyBradshaw({ wellbeing: 1, pain: 1, stools: 3 }).bandKey, 'mild');       // 5
  assert.equal(harveyBradshaw({ wellbeing: 2, pain: 2, stools: 4 }).bandKey, 'moderate');   // 8
  assert.equal(harveyBradshaw({ wellbeing: 4, pain: 3, stools: 10 }).bandKey, 'severe');    // 17
});

test('7 is mild, 8 is moderate; 16 is moderate, 17 is severe', () => {
  assert.equal(harveyBradshaw({ wellbeing: 4, pain: 3, stools: 0 }).bandKey, 'mild');       // 7
  assert.equal(harveyBradshaw({ wellbeing: 4, pain: 3, stools: 9 }).bandKey, 'moderate');   // 16
});

test('out-of-range subscore is clamped and surfaced', () => {
  const r = harveyBradshaw({ wellbeing: 9, pain: 2, stools: 1 });
  assert.equal(r.components.wellbeing, 4);
  assert.equal(r.clamped, true);
});
