// spec-v460: Enneking (MSTS) surgical staging of malignant musculoskeletal tumors (stages IA-III).
// Worked-example tests: each stage and its G/T/M combination, alias input, and the invalid-stage guard.
// Stages transcribed from Enneking 1980 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enneking } from '../../lib/enneking-v460.js';

test('stage IIB: high-grade, extracompartmental (the META example)', () => {
  const r = enneking({ stage: 'IIB' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'IIB');
  assert.match(r.band, /high-grade \(G2\), extracompartmental \(T2\), no metastasis \(M0\)/);
});

test('stage IA: low-grade, intracompartmental', () => {
  assert.match(enneking({ stage: 'IA' }).band, /low-grade \(G1\), intracompartmental \(T1\)/);
});

test('stage IB: low-grade, extracompartmental', () => {
  assert.match(enneking({ stage: 'IB' }).band, /low-grade \(G1\), extracompartmental \(T2\)/);
});

test('stage IIA: high-grade, intracompartmental', () => {
  assert.match(enneking({ stage: 'IIA' }).band, /high-grade \(G2\), intracompartmental \(T1\)/);
});

test('stage III: any metastasis', () => {
  const r = enneking({ stage: 'III' });
  assert.equal(r.stage, 'III');
  assert.match(r.band, /any regional or distant metastasis \(M1\)/);
});

test('alias input (1A / 2B / 3) maps to the stages', () => {
  assert.equal(enneking({ stage: '1A' }).stage, 'IA');
  assert.equal(enneking({ stage: '2b' }).stage, 'IIB');
  assert.equal(enneking({ stage: '3' }).stage, 'III');
});

test('a missing or unknown stage is invalid', () => {
  assert.equal(enneking({}).valid, false);
  assert.equal(enneking({ stage: 'IV' }).valid, false);
  assert.equal(enneking({ stage: 'IIIA' }).valid, false);
});
