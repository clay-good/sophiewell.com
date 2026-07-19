// spec-v431: modified Bell staging of NEC (stages IA/IB/IIA/IIB/IIIA/IIIB).
// Worked-example tests: each stage and its findings, alias input, and the invalid-stage guard.
// Stages transcribed from Walsh & Kliegman 1986 (Pediatr Clin North Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bellNec } from '../../lib/bell-nec-v431.js';

test('stage IIA: proven, pneumatosis (the META example)', () => {
  const r = bellNec({ stage: 'IIA' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'IIA');
  assert.match(r.band, /pneumatosis intestinalis/);
});

test('stage IA: suspected', () => {
  const r = bellNec({ stage: 'IA' });
  assert.equal(r.stage, 'IA');
  assert.match(r.band, /suspected/);
});

test('stage IB: grossly bloody stool', () => {
  assert.match(bellNec({ stage: 'IB' }).band, /grossly bloody stool/);
});

test('stage IIB: portal venous gas', () => {
  assert.match(bellNec({ stage: 'IIB' }).band, /portal venous gas/);
});

test('stage IIIB: perforated, pneumoperitoneum', () => {
  const r = bellNec({ stage: 'IIIB' });
  assert.equal(r.stage, 'IIIB');
  assert.match(r.band, /pneumoperitoneum/);
});

test('aliases: numeric-letter forms map to the stages', () => {
  assert.equal(bellNec({ stage: '2a' }).stage, 'IIA');
  assert.equal(bellNec({ stage: '3b' }).stage, 'IIIB');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(bellNec({}).valid, false);
  assert.equal(bellNec({ stage: 'IV' }).valid, false);
  assert.equal(bellNec({ stage: 'IIC' }).valid, false);
});
