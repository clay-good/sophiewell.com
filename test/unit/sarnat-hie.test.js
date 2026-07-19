// spec-v429: Sarnat staging of neonatal HIE (stages 1/2/3).
// Worked-example tests: each stage and its features, alias input, and the invalid-stage guard.
// Stages transcribed from Sarnat & Sarnat 1976 (Arch Neurol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sarnatHie } from '../../lib/sarnat-hie-v429.js';

test('stage 2: moderate (the META example)', () => {
  const r = sarnatHie({ stage: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, '2');
  assert.match(r.band, /lethargic or obtunded/);
});

test('stage 1: mild', () => {
  const r = sarnatHie({ stage: '1' });
  assert.equal(r.stage, '1');
  assert.match(r.band, /hyperalert/);
  assert.match(r.bandLabel, /mild/);
});

test('stage 3: severe, stupor or coma', () => {
  const r = sarnatHie({ stage: '3' });
  assert.equal(r.stage, '3');
  assert.match(r.band, /stupor or coma/);
});

test('aliases: roman numerals and severity words map to the stages', () => {
  assert.equal(sarnatHie({ stage: 'II' }).stage, '2');
  assert.equal(sarnatHie({ stage: 'severe' }).stage, '3');
  assert.equal(sarnatHie({ stage: 'mild' }).stage, '1');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(sarnatHie({}).valid, false);
  assert.equal(sarnatHie({ stage: '4' }).valid, false);
  assert.equal(sarnatHie({ stage: '0' }).valid, false);
});
