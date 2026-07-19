// spec-v443: Kadish staging of esthesioneuroblastoma (stages A-D).
// Worked-example tests: each stage and its anatomic-extent description, alias input, and the invalid-stage guard.
// Stages transcribed from Kadish 1976 / Morita 1993 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kadish } from '../../lib/kadish-v443.js';

test('stage C: beyond the sinuses (the META example)', () => {
  const r = kadish({ stage: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'C');
  assert.match(r.band, /extending beyond the nasal cavity and paranasal sinuses/);
});

test('stage A: confined to the nasal cavity', () => {
  const r = kadish({ stage: 'A' });
  assert.equal(r.stage, 'A');
  assert.match(r.band, /confined to the nasal cavity/);
});

test('stage B: nasal cavity plus paranasal sinuses', () => {
  assert.match(kadish({ stage: 'B' }).band, /one or more paranasal sinuses/);
});

test('stage D: metastasis (Morita modification)', () => {
  const r = kadish({ stage: 'D' });
  assert.equal(r.stage, 'D');
  assert.match(r.band, /metastasis to cervical lymph nodes or distant sites/);
});

test('case-insensitive input works', () => {
  assert.equal(kadish({ stage: 'c' }).stage, 'C');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(kadish({}).valid, false);
  assert.equal(kadish({ stage: 'E' }).valid, false);
  assert.equal(kadish({ stage: '1' }).valid, false);
});
