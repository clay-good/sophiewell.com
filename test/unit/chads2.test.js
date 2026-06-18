// spec-v101 2.1: CHADS2 stroke-risk score (Gage 2001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chads2 } from '../../lib/cardio-v101.js';

test('no factors -> 0, 1.9%/yr', () => {
  const r = chads2({});
  assert.equal(r.total, 0);
  assert.equal(r.rate, '1.9');
});

test('hypertension alone -> 1, 2.8%/yr (band below score 2)', () => {
  const r = chads2({ hypertension: true });
  assert.equal(r.total, 1);
  assert.equal(r.rate, '2.8');
});

test('prior stroke counts 2 -> 4.0%/yr (band flip vs score 1)', () => {
  const r = chads2({ stroke: true });
  assert.equal(r.total, 2);
  assert.equal(r.rate, '4.0');
});

test('all factors -> max 6, 18.2%/yr', () => {
  const r = chads2({ chf: true, hypertension: true, age75: true, diabetes: true, stroke: true });
  assert.equal(r.total, 6);
  assert.equal(r.rate, '18.2');
});
