// spec-v101 2.3: CHADS-65 Canadian anticoagulation pathway (CCS 2020).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chads65 } from '../../lib/cardio-v101.js';

test('blank age -> invalid', () => {
  assert.equal(chads65({}).valid, false);
});

test('age >= 65 -> OAC via the age gate', () => {
  const r = chads65({ age: 70 });
  assert.equal(r.verdict, 'oac');
  assert.match(r.gate, /Age >= 65/);
});

test('age < 65 with a CHADS2 factor -> OAC via the factor gate (gate flip)', () => {
  const r = chads65({ age: 50, hypertension: true });
  assert.equal(r.verdict, 'oac');
  assert.match(r.gate, /CHADS2 risk factor/);
});

test('age < 65, no CHADS2 factor, vascular disease -> antiplatelet', () => {
  const r = chads65({ age: 50, vascularDisease: true });
  assert.equal(r.verdict, 'antiplatelet');
});

test('age < 65, no factors -> no antithrombotic', () => {
  const r = chads65({ age: 50 });
  assert.equal(r.verdict, 'none');
});
